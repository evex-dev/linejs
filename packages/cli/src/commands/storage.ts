import type { CommandSpec } from "../command.ts";
import { UsageError } from "../errors.ts";
import { writeBinaryFile } from "../files.ts";
import { ProfileStore } from "../profile-store.ts";
import { formatJson } from "../output.ts";
import { outOption } from "./shared.ts";

async function openStore(context: import("../context.ts").CommandContext): Promise<ProfileStore> {
	return await ProfileStore.open(context.settings.profile.path, {
		name: context.settings.profile.name,
	});
}

const listCommand: CommandSpec = {
	name: "storage list",
	summary: "List keys in the profile's LINEJS storage.",
	category: "Storage",
	options: [
		{ name: "values", type: "boolean", description: "Include values (may contain secrets)." },
	],
	examples: ["line storage list", "line storage list --values --json"],
	auth: false,
	async run(context) {
		const store = await openStore(context);
		const includeValues = context.getBool("values");
		const entries = Object.entries(store.data.storage).map(([key, value]) => ({
			key,
			type: typeof value,
			...(includeValues ? { value } : {}),
		}));
		return {
			profile: store.name,
			path: store.path,
			keys: entries,
		};
	},
	format(value) {
		const result = value as {
			profile: string;
			path: string;
			keys: Array<{ key: string; type: string; value?: unknown }>;
		};
		if (!result.keys.length) return `No storage keys in ${result.profile}.`;
		return result.keys
			.map((entry) =>
				entry.value === undefined
					? `${entry.key} (${entry.type})`
					: `${entry.key} (${entry.type}) = ${JSON.stringify(entry.value)}`,
			)
			.join("\n");
	},
};

const getCommand: CommandSpec = {
	name: "storage get",
	summary: "Read one value from the profile's LINEJS storage.",
	category: "Storage",
	args: [{ name: "key", description: "Storage key.", required: true }],
	examples: ["line storage get reqseq"],
	auth: false,
	async run(context) {
		const store = await openStore(context);
		const key = context.requireArg(0, "key");
		return { key, value: store.getStorage(key) ?? null };
	},
	format(value) {
		const result = value as { key: string; value: unknown };
		return formatJson(result.value);
	},
};

const setCommand: CommandSpec = {
	name: "storage set",
	summary: "Write one value to the profile's LINEJS storage.",
	category: "Storage",
	args: [
		{ name: "key", description: "Storage key.", required: true },
		{
			name: "value",
			description: "Value (JSON when parseable, otherwise a string).",
			required: true,
			variadic: true,
		},
	],
	examples: ["line storage set myKey 'hello'", "line storage set myJson '{\"a\":1}'"],
	auth: false,
	async run(context) {
		const store = await openStore(context);
		const key = context.requireArg(0, "key");
		const raw = context.rest(1);
		if (!raw) throw new UsageError("Missing value");
		let value: unknown;
		try {
			value = JSON.parse(raw);
		} catch {
			value = raw;
		}
		await store.setStorage(key, value as never);
		await store.flush();
		return { ok: true, key, value };
	},
	format(value) {
		const result = value as { key: string; value: unknown };
		return `Set ${result.key} = ${JSON.stringify(result.value)}`;
	},
};

const deleteCommand: CommandSpec = {
	name: "storage delete",
	summary: "Delete one key from the profile's LINEJS storage.",
	category: "Storage",
	args: [{ name: "key", description: "Storage key.", required: true }],
	options: [{ name: "yes", type: "boolean", description: "Confirm deletion." }],
	examples: ["line storage delete myKey --yes"],
	auth: false,
	async run(context) {
		const store = await openStore(context);
		const key = context.requireArg(0, "key");
		if (!context.getBool("yes")) throw new UsageError("Pass --yes to confirm deletion");
		await store.deleteStorage(key);
		await store.flush();
		return { ok: true, key };
	},
	format(value) {
		return `Deleted ${(value as { key: string }).key}`;
	},
};

const clearCommand: CommandSpec = {
	name: "storage clear",
	summary: "Delete every key from the profile's LINEJS storage.",
	category: "Storage",
	options: [{ name: "yes", type: "boolean", description: "Confirm clearing storage." }],
	examples: ["line storage clear --yes"],
	auth: false,
	async run(context) {
		const store = await openStore(context);
		if (!context.getBool("yes")) {
			throw new UsageError("Pass --yes to confirm clearing storage (this deletes E2EE keys)");
		}
		await store.clearStorage();
		await store.flush();
		return { ok: true };
	},
	format() {
		return "Cleared profile storage.";
	},
};

const exportCommand: CommandSpec = {
	name: "storage export",
	summary: "Export the profile's LINEJS storage to a JSON file.",
	category: "Storage",
	options: [outOption("Output file (required).")],
	examples: ["line storage export --out ./storage.json"],
	auth: false,
	async run(context) {
		const store = await openStore(context);
		const out = context.requireString("out", "Missing --out");
		const text = JSON.stringify(store.data.storage, null, 2);
		const written = await writeBinaryFile(
			out,
			new TextEncoder().encode(text),
			context.settings.cwd,
		);
		return { ok: true, ...written };
	},
	format(value) {
		return `Exported storage to ${(value as { path: string }).path}`;
	},
};

export const storageCommands: CommandSpec[] = [
	listCommand,
	getCommand,
	setCommand,
	deleteCommand,
	clearCommand,
	exportCommand,
];
