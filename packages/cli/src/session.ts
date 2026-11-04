import { rm } from "node:fs/promises";
import { Client } from "@evex-dev/linejs";
import { BaseClient, type Device } from "@evex-dev/linejs/base";
import { type BaseStorage, MemoryStorage } from "@evex-dev/linejs/storage";
import type { Profile } from "@evex-dev/linejs-types";
import type { CommandContext } from "./context.ts";
import { CliError, UsageError, errorMessage } from "./errors.ts";
import { printPin, printQr } from "./qr.ts";
import { ProfileStorage } from "./profile-storage.ts";
import { type ProfileAccount, ProfileStore } from "./profile-store.ts";

export const DEVICES: readonly Device[] = [
	"DESKTOPWIN",
	"DESKTOPMAC",
	"ANDROID",
	"ANDROIDSECONDARY",
	"IOS",
	"IOSIPAD",
	"WATCHOS",
	"WEAROS",
];

export interface ConnectedSession {
	client: Client;
	base: BaseClient;
	store: ProfileStore;
	/** True when connect() verified the token with getProfile(). */
	checkedSession: boolean;
}

export interface LoginSession {
	client: Client;
	base: BaseClient;
	store?: ProfileStore;
	authToken: string;
	saved: boolean;
	path: string;
	method: LoginOptions["method"];
	account: ProfileAccount;
}

export function validateDevice(value: string): Device {
	if (!DEVICES.includes(value as Device)) {
		throw new UsageError(`Unsupported device: ${value} (expected ${DEVICES.join(", ")})`);
	}
	return value as Device;
}

export function resolveDevice(context: CommandContext, fallback: string): Device {
	return validateDevice(context.settings.device ?? fallback);
}

function accountFromProfile(base: BaseClient): ProfileAccount {
	const profile = base.profile;
	if (!profile) return {};
	return {
		...(profile.mid ? { mid: profile.mid } : {}),
		...(profile.displayName ? { displayName: profile.displayName } : {}),
		...(profile.statusMessage ? { statusMessage: profile.statusMessage } : {}),
	};
}

function attachLogging(context: CommandContext, base: BaseClient): void {
	if (!context.settings.verbose) return;
	base.on("log", (entry) => {
		let data = "";
		try {
			data = JSON.stringify(entry.data, BaseClient.jsonReplacer);
		} catch {
			data = String(entry.data);
		}
		if (data.length > 4000) data = `${data.slice(0, 4000)}…`;
		context.output.writeErrLine(`[linejs] ${entry.type}: ${data}`);
	});
}

function createBase(
	context: CommandContext,
	store: ProfileStore | undefined,
	storage: BaseStorage,
	device: Device,
): BaseClient {
	const base = new BaseClient({
		device,
		storage,
		version: context.settings.appVersion ?? store?.data.appVersion,
		endpoint: context.settings.endpoint ?? store?.data.endpoint,
	});
	if (context.settings.timeout !== undefined) {
		if (context.settings.timeout <= 0) throw new UsageError("--timeout must be positive");
		base.config.timeout = context.settings.timeout;
		base.config.longTimeout = Math.max(base.config.longTimeout, context.settings.timeout);
	}
	attachLogging(context, base);
	return base;
}

/**
 * Restore the in-memory profile from the last successful getProfile() or the
 * cached account fields, so commands can run without the preflight request.
 */
function hydrateProfile(base: BaseClient, store: ProfileStore): void {
	const snapshot = store.data.profile;
	if (snapshot && typeof snapshot === "object") {
		base.profile = snapshot as unknown as Profile;
		return;
	}
	const account = store.data.account;
	if (account?.mid) {
		base.profile = {
			mid: account.mid,
			displayName: account.displayName ?? "",
			statusMessage: account.statusMessage ?? "",
		} as Profile;
	}
}

function authFailure(error: unknown): CliError {
	if (error instanceof CliError) return error;
	return new CliError("AUTH_FAILED", `LINE authentication failed: ${errorMessage(error)}`, {
		cause: error,
		details: {
			hint: "The auth token may have expired or been revoked. Run `line auth login --profile <name> --force` to sign in again.",
		},
	});
}

/** Load the active profile, restore the LINE session, and return a Client. */
export async function connect(context: CommandContext): Promise<ConnectedSession> {
	const store = await ProfileStore.open(context.settings.profile.path, {
		name: context.settings.profile.name,
	});
	if (!store.authToken) {
		throw new CliError("AUTH_REQUIRED", "This profile has no auth token", {
			details: {
				path: store.path,
				hint: `Run \`line auth login --profile ${store.path}\` first.`,
			},
		});
	}

	const device = resolveDevice(context, store.data.device);
	const storage = new ProfileStorage(store);
	const base = createBase(context, store, storage, device);
	hydrateProfile(base, store);

	let pending: Promise<void> = Promise.resolve();
	let saveError: unknown;
	base.on("update:authtoken", (token) => {
		base.authToken = token;
		if (store.authToken === token) return;
		pending = pending
			.then(() => store.setAuthToken(token))
			.catch((error) => {
				saveError = error;
			});
	});

	try {
		await base.loginProcess.login({
			authToken: store.authToken,
			skipCheck: !context.settings.checkSession,
		});
	} catch (error) {
		throw authFailure(error);
	}
	await pending;
	if (saveError) {
		throw new CliError("INTERNAL", `Could not save the refreshed auth token to ${store.path}`, {
			cause: saveError,
		});
	}

	if (context.settings.checkSession && base.profile) {
		await store.setCachedProfile(
			base.profile as unknown as Record<string, unknown>,
			accountFromProfile(base),
		);
	}
	await store.flush();

	return {
		client: new Client(base),
		base,
		store,
		checkedSession: context.settings.checkSession,
	};
}

export interface LoginOptions {
	method: "qr" | "password" | "token";
	email?: string;
	password?: string;
	pincode?: string;
	token?: string;
	save?: boolean;
	force?: boolean;
}

/** Run a fresh login and (unless save=false) persist it to the profile file. */
export async function login(context: CommandContext, options: LoginOptions): Promise<LoginSession> {
	const path = context.settings.profile.path;
	const save = options.save !== false;
	let existed = false;
	if (save) {
		try {
			await ProfileStore.open(path, { name: context.settings.profile.name });
			existed = true;
		} catch (error) {
			if (!(error instanceof CliError) || error.code !== "PROFILE_NOT_FOUND") {
				if (!options.force) throw error;
				// --force may replace a corrupt profile. Remove it so the store can
				// start from a clean file; a valid profile keeps its E2EE storage.
				await rm(path, { force: true });
			}
		}

		if (existed && !options.force) {
			throw new CliError("PROFILE_EXISTS", `Profile already exists: ${path}`, {
				details: {
					path,
					hint: "Pass --force to replace it, or choose another --profile.",
				},
			});
		}
	}

	const store = save
		? await ProfileStore.open(path, { create: true, name: context.settings.profile.name })
		: undefined;
	const storage: BaseStorage = store ? new ProfileStorage(store) : new MemoryStorage();
	const device = resolveDevice(context, store?.data.device ?? "ANDROIDSECONDARY");
	const base = createBase(context, store, storage, device);

	let pending: Promise<void> = Promise.resolve();
	let saveError: unknown;
	base.on("update:authtoken", (token) => {
		base.authToken = token;
		if (!store || store.authToken === token) return;
		pending = pending
			.then(() => store.setAuthToken(token))
			.catch((error) => {
				saveError = error;
			});
	});
	base.on("qrcall", (url) => {
		printQr(context, url);
	});
	base.on("pincall", (pin) => {
		printPin(context, pin);
	});

	try {
		if (options.method === "token") {
			const token = options.token?.trim();
			if (!token) throw new UsageError("Missing --token");
			await base.loginProcess.login({ authToken: token });
		} else if (options.method === "password") {
			if (!options.email) throw new UsageError("Password login requires --email");
			const password = options.password;
			if (!password) throw new UsageError("Password login requires --password or --password-stdin");
			await base.loginProcess.login({
				email: options.email,
				password,
				...(options.pincode ? { pincode: options.pincode } : {}),
			});
		} else {
			await base.loginProcess.login({ qr: true });
		}
	} catch (error) {
		if (store && !existed) await store.delete().catch(() => {});
		throw authFailure(error);
	}

	await pending;
	if (saveError) {
		throw new CliError("INTERNAL", `Could not save the auth token to ${path}`, {
			cause: saveError,
		});
	}

	const authToken = base.authToken;
	if (!authToken) {
		throw new CliError("AUTH_FAILED", "Login completed without an auth token");
	}
	const account = accountFromProfile(base);
	if (store) {
		await store.setDevice(device, context.settings.appVersion);
		if (context.settings.endpoint) {
			store.data.endpoint = context.settings.endpoint;
			await store.save();
		}
		if (base.profile) {
			await store.setCachedProfile(base.profile as unknown as Record<string, unknown>, account);
		} else {
			await store.setAccount(account);
		}
		await store.setLogin(options.method);
		await store.flush();
	}

	return {
		client: new Client(base),
		base,
		store,
		authToken,
		saved: Boolean(store),
		path,
		method: options.method,
		account,
	};
}

/** Run `fn` with a connected client and always flush profile writes. */
export async function withClient<T>(
	context: CommandContext,
	fn: (session: ConnectedSession) => Promise<T>,
): Promise<T> {
	const session = await connect(context);
	try {
		return await fn(session);
	} finally {
		await session.store.flush();
	}
}
