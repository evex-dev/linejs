import { rm } from "node:fs/promises";
import type { CommandSpec } from "../command.ts";
import type { CommandContext } from "../context.ts";
import { CliError, UsageError } from "../errors.ts";
import { readTextInput } from "../files.ts";
import { listProfiles, ProfileStore } from "../profile-store.ts";
import { QR_FORMATS } from "../qr.ts";
import { login, withClient } from "../session.ts";
import { YES_OPTION } from "./shared.ts";

function authLoginResult(session: Awaited<ReturnType<typeof login>>) {
	return {
		ok: true,
		saved: session.saved,
		profile: session.store?.name ?? "memory",
		path: session.path,
		method: session.method,
		account: session.account,
		...(session.saved ? {} : { authToken: session.authToken }),
	};
}

function formatLogin(value: unknown): string {
	const result = value as ReturnType<typeof authLoginResult>;
	const name = result.account.displayName ?? "(unknown)";
	const mid = result.account.mid ?? "(unknown mid)";
	const lines = [
		`Logged in as ${name} (${mid})`,
		`Method:  ${result.method ?? "unknown"}`,
		`Profile: ${result.saved ? result.path : "(not saved; --no-save)"}`,
	];
	if (!result.saved && result.authToken) {
		lines.push("", "Auth token:");
		lines.push(result.authToken);
	}
	return lines.join("\n");
}

async function readPassword(context: CommandContext): Promise<string | undefined> {
	const direct = context.getString("password");
	const useStdin = context.getBool("password-stdin");
	if (direct && useStdin) {
		throw new UsageError("Use either --password or --password-stdin, not both");
	}
	if (direct) return direct;
	if (useStdin) {
		const text = await readTextInput(undefined, context.settings.cwd);
		return text.replace(/\r?\n$/, "");
	}
	return undefined;
}

const loginCommand: CommandSpec = {
	name: "auth login",
	summary: "Sign in with a QR code, email/password, or an existing auth token.",
	description:
		"QR login is the default. Credentials are never written to disk; only the resulting auth token and LINEJS storage (E2EE keys, refresh token, reqseq) are saved to the profile file.",
	category: "Authentication",
	args: [],
	options: [
		{ name: "qr", type: "boolean", description: "Use QR login (the default)." },
		{
			name: "email",
			type: "string",
			valueName: "address",
			description: "Email address for password login.",
		},
		{
			name: "password",
			type: "string",
			valueName: "password",
			description: "Password for email login (visible in shell history; prefer --password-stdin).",
		},
		{
			name: "password-stdin",
			type: "boolean",
			description: "Read the password from stdin.",
		},
		{
			name: "token",
			type: "string",
			valueName: "token",
			description: "Reuse an existing LINE auth token instead of logging in.",
		},
		{
			name: "pincode",
			type: "string",
			valueName: "digits",
			description: "Constant 6-digit pincode for password login.",
		},
		{
			name: "qr-format",
			type: "string",
			valueName: "format",
			choices: QR_FORMATS,
			description: "QR rendering: compact (default), unicode, ansi, ascii, or none.",
		},
		{
			name: "save",
			type: "boolean",
			description: "Save the session to the profile file (use --no-save to disable).",
			default: true,
		},
		{
			name: "force",
			type: "boolean",
			description: "Overwrite an existing profile.",
		},
	],
	examples: [
		"line auth login",
		"line auth login --profile work --qr-format compact",
		"line auth login --email me@example.com --password-stdin --force",
		"line auth login --token 'TOKEN' --profile ./backup.json",
	],
	auth: false,
	async run(context) {
		const token = context.getString("token");
		const email = context.getString("email");
		const explicitQr = context.has("qr") && context.getBool("qr");
		if (token && (email || explicitQr)) {
			throw new UsageError("Use only one of --token, --email, or --qr");
		}
		if (explicitQr && email) {
			throw new UsageError("Use only one of --qr or --email");
		}
		const passwordRequested =
			context.has("password") || context.has("password-stdin") || context.has("pincode");
		if (!token && !email && passwordRequested) {
			throw new UsageError("--email is required for password login options");
		}

		let method: "qr" | "password" | "token" = "qr";
		let password: string | undefined;
		let pincode: string | undefined;
		if (token) {
			method = "token";
		} else if (email) {
			method = "password";
			password = await readPassword(context);
			if (!password) {
				const { promptSecret } = await import("../prompt.ts");
				password = await promptSecret("Password: ", context);
			}
			pincode = context.getString("pincode");
			if (pincode && !/^\d{6}$/.test(pincode)) {
				throw new UsageError("--pincode must be exactly 6 digits");
			}
		}

		const session = await login(context, {
			method,
			email,
			password,
			pincode,
			token,
			save: context.getBool("save", true),
			force: context.getBool("force"),
		});
		return authLoginResult(session);
	},
	format: formatLogin,
};

const statusCommand: CommandSpec = {
	name: "auth status",
	summary: "Show the active profile, account, and token expiry.",
	category: "Authentication",
	options: [
		{
			name: "verify",
			type: "boolean",
			description: "Call the LINE API to verify the token and refresh the cached profile.",
		},
	],
	examples: ["line auth status", "line auth status --verify --json"],
	auth: false,
	async run(context) {
		const store = await ProfileStore.open(context.settings.profile.path, {
			name: context.settings.profile.name,
		});
		const summary = store.summary();
		const expiry = store.tokenExpiry();
		const base = {
			...summary,
			authenticated: Boolean(store.authToken),
			...expiry,
		};
		if (!context.getBool("verify")) return base;
		if (!store.authToken) {
			throw new CliError("AUTH_REQUIRED", "This profile has no auth token", {
				details: { path: store.path, hint: "Run `line auth login` first." },
			});
		}
		return await withClient(context, async (session) => {
			// connect() restores the session with getProfile(), so reuse it.
			const profile = session.base.profile ?? (await session.client.getMyProfile());
			return {
				...base,
				verified: true,
				account: {
					mid: profile.mid,
					displayName: profile.displayName,
					statusMessage: profile.statusMessage,
				},
				profile,
			};
		});
	},
	format(value) {
		const result = value as Record<string, unknown> & {
			profile?: { displayName?: string; mid?: string; statusMessage?: string };
		};
		const lines = [
			`Profile:  ${String(result.name)} (${String(result.path)})`,
			`Device:   ${String(result.device ?? "unknown")}`,
		];
		if (result.endpoint) lines.push(`Endpoint: ${String(result.endpoint)}`);
		if (result.profile) {
			lines.push(`Account:  ${result.profile.displayName ?? "?"} (${result.profile.mid ?? "?"})`);
			if (result.profile.statusMessage) lines.push(`Status:   ${result.profile.statusMessage}`);
		} else if (result.displayName || result.mid) {
			lines.push(`Account:  ${String(result.displayName ?? "?")} (${String(result.mid ?? "?")})`);
		}
		lines.push(`Token:    ${result.authenticated ? "saved" : "missing"}`);
		if (result.expiresAt) {
			lines.push(`Expires:  ${String(result.expiresAt)}${result.expired ? " (expired)" : ""}`);
		}
		if (result.verified) lines.push("Verified: yes");
		return lines.join("\n");
	},
};

const tokenCommand: CommandSpec = {
	name: "auth token",
	summary: "Print the saved auth token.",
	description:
		"Treat the output as a secret. LINE auth tokens grant full account access until revoked.",
	category: "Authentication",
	examples: ["line auth token", "line auth token --json"],
	auth: false,
	async run(context) {
		const store = await ProfileStore.open(context.settings.profile.path, {
			name: context.settings.profile.name,
		});
		if (!store.authToken) {
			throw new CliError("AUTH_REQUIRED", "This profile has no auth token", {
				details: { path: store.path, hint: "Run `line auth login` first." },
			});
		}
		return {
			authToken: store.authToken,
			profile: store.name,
			path: store.path,
			...store.tokenExpiry(),
		};
	},
	format(value) {
		return (value as { authToken: string }).authToken;
	},
};

const logoutCommand: CommandSpec = {
	name: "auth logout",
	summary: "Delete the active profile (or every profile with --all).",
	category: "Authentication",
	options: [
		YES_OPTION,
		{
			name: "all",
			type: "boolean",
			description: "Delete every profile in the LINEJS home directory.",
		},
	],
	examples: ["line auth logout --yes", "line auth logout --all --yes"],
	auth: false,
	async run(context) {
		const yes = context.getBool("yes");
		if (context.getBool("all")) {
			const { profiles } = await listProfiles(context.settings.env);
			if (!profiles.length) return { removed: [] };
			if (!yes) {
				throw new CliError(
					"CONFIRMATION_REQUIRED",
					`This deletes ${profiles.length} profile(s). Re-run with --yes.`,
					{ details: { profiles: profiles.map((profile) => profile.path) } },
				);
			}
			for (const profile of profiles) {
				await rm(profile.path, { force: true });
			}
			return { removed: profiles.map((profile) => profile.path) };
		}
		const store = await ProfileStore.open(context.settings.profile.path, {
			name: context.settings.profile.name,
		});
		if (!yes) {
			throw new CliError(
				"CONFIRMATION_REQUIRED",
				`This deletes ${store.path}. Re-run with --yes.`,
				{ details: { path: store.path } },
			);
		}
		await store.delete();
		return { removed: [store.path] };
	},
	format(value) {
		const removed = (value as { removed: string[] }).removed;
		return removed.length
			? removed.map((path) => `Deleted ${path}`).join("\n")
			: "No profiles found.";
	},
};

const profilesCommand: CommandSpec = {
	name: "auth profiles",
	summary: "List saved profiles under ~/.linejs.",
	category: "Authentication",
	examples: ["line auth profiles", "line auth profiles --json"],
	auth: false,
	async run(context) {
		const { home, profiles } = await listProfiles(context.settings.env);
		return {
			home,
			active: context.settings.profile.path,
			profiles,
		};
	},
	format(value) {
		const result = value as {
			home: string;
			active: string;
			profiles: Array<Record<string, unknown>>;
		};
		if (!result.profiles.length) return `No profiles in ${result.home}`;
		const rows = result.profiles.map((profile) => ({
			name: profile.name,
			account: profile.displayName ? `${profile.displayName} (${profile.mid ?? "?"})` : profile.mid,
			device: profile.device,
			token: profile.authToken ? "yes" : "no",
			updated: profile.updatedAt,
			active: profile.path === result.active ? "*" : "",
			error: profile.error,
		}));
		const lines = [`Profiles in ${result.home}:`, ""];
		const header = ["", "NAME", "ACCOUNT", "DEVICE", "TOKEN"];
		const data = rows.map((row) => [
			String(row.active),
			String(row.name),
			String(row.account ?? ""),
			String(row.device ?? ""),
			String(row.token),
		]);
		const widths = header.map((label, index) =>
			Math.max(label.length, ...data.map((row) => row[index]!.length)),
		);
		lines.push(
			header
				.map((label, index) => label.padEnd(widths[index]!))
				.join("  ")
				.trimEnd(),
		);
		for (const row of data) {
			lines.push(
				row
					.map((cell, index) => cell.padEnd(widths[index]!))
					.join("  ")
					.trimEnd(),
			);
		}
		for (const row of rows) {
			if (row.error) lines.push(`  ! ${row.name}: ${row.error}`);
		}
		return lines.join("\n");
	},
};

export const authCommands: CommandSpec[] = [
	loginCommand,
	statusCommand,
	tokenCommand,
	logoutCommand,
	profilesCommand,
];
