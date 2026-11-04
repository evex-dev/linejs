import type { CommandSpec } from "../command.ts";
import { CliError, UsageError } from "../errors.ts";
import { readTextInput, writeBinaryFile } from "../files.ts";
import { formatJson } from "../output.ts";
import { withClient, type ConnectedSession } from "../session.ts";
import { outOption } from "./shared.ts";

type AnyFunction = (...args: unknown[]) => unknown;

function resolveTarget(session: ConnectedSession, name: string): Record<string, unknown> {
	if (name === "client") return session.client as unknown as Record<string, unknown>;
	if (name === "base") return session.base as unknown as Record<string, unknown>;
	const base = session.base as unknown as Record<string, unknown>;
	const target = base[name];
	if (target === undefined) {
		throw new CliError("NOT_FOUND", `Unknown service: ${name}`, {
			details: { hint: "Run `line api services` to list services." },
		});
	}
	if (!target || (typeof target !== "object" && typeof target !== "function")) {
		throw new CliError("NOT_FOUND", `Service is not an object: ${name}`);
	}
	return target as Record<string, unknown>;
}

function methodNames(target: Record<string, unknown>): string[] {
	const names = new Set<string>();
	let current: object | null = target;
	while (current && current !== Object.prototype) {
		for (const name of Object.getOwnPropertyNames(current)) {
			if (name === "constructor" || name.startsWith("_") || name.startsWith("#")) continue;
			const descriptor = Object.getOwnPropertyDescriptor(current, name);
			if (!descriptor) continue;
			if (typeof descriptor.value === "function") names.add(name);
			if (typeof descriptor.get === "function") {
				try {
					const value = (target as Record<string, unknown>)[name];
					if (typeof value === "function") names.add(name);
				} catch {
					// A getter can require login state; skip it.
				}
			}
		}
		current = Object.getPrototypeOf(current) as object | null;
	}
	return [...names].sort();
}

const servicesCommand: CommandSpec = {
	name: "api services",
	summary: "List LINEJS services exposed by the raw API bridge.",
	category: "Advanced",
	examples: ["line api services", "line api services --json"],
	auth: true,
	async run(context) {
		return await withClient(context, async ({ base, client }) => {
			const names = new Set<string>(["client", "base"]);
			for (const name of Object.keys(base)) {
				if (name.startsWith("_") || name.startsWith("#")) continue;
				const value = (base as unknown as Record<string, unknown>)[name];
				if (value && typeof value === "object") names.add(name);
			}
			const services = [...names].sort().map((name) => {
				let methods: string[] = [];
				try {
					const target =
						name === "client"
							? (client as unknown as Record<string, unknown>)
							: name === "base"
								? (base as unknown as Record<string, unknown>)
								: ((base as unknown as Record<string, unknown>)[name] as Record<string, unknown>);
					methods = methodNames(target);
				} catch {
					methods = [];
				}
				return { name, methodCount: methods.length };
			});
			return { services };
		});
	},
	format(value) {
		return (value as { services: Array<{ name: string; methodCount: number }> }).services
			.map((service) => `${service.name.padEnd(16)} ${service.methodCount} methods`)
			.join("\n");
	},
};

const methodsCommand: CommandSpec = {
	name: "api methods",
	summary: "List public methods on a service.",
	category: "Advanced",
	args: [
		{
			name: "service",
			description: "Service name (talk, square, relation, client, ...).",
			required: true,
		},
	],
	examples: ["line api methods talk", "line api methods obs"],
	auth: true,
	async run(context) {
		const service = context.requireArg(0, "service");
		return await withClient(context, async (session) => {
			const target = resolveTarget(session, service);
			return { service, methods: methodNames(target) };
		});
	},
	format(value) {
		return (value as { methods: string[] }).methods.join("\n");
	},
};

const callCommand: CommandSpec = {
	name: "api call",
	summary: "Call any LINEJS service method directly with JSON arguments.",
	description:
		"This is the escape hatch for APIs without a dedicated command. A JSON object is passed as one argument; a JSON array is spread as multiple arguments. No shell is involved.",
	category: "Advanced",
	args: [
		{ name: "service", description: "Service name.", required: true },
		{ name: "method", description: "Method name.", required: true },
	],
	options: [
		{
			name: "args",
			type: "string",
			valueName: "json",
			description: "JSON arguments (object or array).",
		},
		{
			name: "args-file",
			type: "string",
			valueName: "path",
			description: "Read JSON arguments from a file (use - for stdin).",
		},
		outOption("Save a Blob/Uint8Array result to this file."),
	],
	examples: [
		"line api call talk getProfile --args '{}'",
		`line api call square getSquare --args '{"squareMid":"s..."}'`,
		`line api call obs downloadObjectForService --args '[{"obsPath":"talk/m/...","oid":"..."}]' --out ./file.bin`,
	],
	auth: true,
	async run(context) {
		const service = context.requireArg(0, "service");
		const method = context.requireArg(1, "method");
		const argsOption = context.getString("args");
		const fileOption = context.getString("args-file");
		if (argsOption !== undefined && fileOption !== undefined) {
			throw new UsageError("Use either --args or --args-file, not both");
		}
		let parsed: unknown;
		if (argsOption !== undefined) {
			parsed = parseJson(argsOption, "--args");
		} else if (fileOption !== undefined) {
			parsed = parseJson(await readTextInput(fileOption, context.settings.cwd), fileOption);
		}
		const callArgs = parsed === undefined ? [] : Array.isArray(parsed) ? parsed : [parsed];

		return await withClient(context, async (session) => {
			const target = resolveTarget(session, service);
			const fn = target[method];
			if (typeof fn !== "function") {
				throw new CliError("NOT_FOUND", `Method not found: ${service}.${method}`, {
					details: { hint: "Run `line api methods <service>` to list methods." },
				});
			}
			const result = await (fn as AnyFunction).apply(target, callArgs);
			const out = context.getString("out");
			if (
				out &&
				(result instanceof Blob || result instanceof Uint8Array || result instanceof ArrayBuffer)
			) {
				const written = await writeBinaryFile(out, result, context.settings.cwd);
				return {
					ok: true,
					...written,
					type: result instanceof Blob ? result.type : undefined,
				};
			}
			return { ok: true, result: result === undefined ? null : result };
		});
	},
	format(value) {
		const result = value as { result: unknown };
		return formatJson(result.result);
	},
};

function parseJson(text: string, source: string): unknown {
	try {
		return JSON.parse(text);
	} catch (error) {
		throw new UsageError(`Invalid JSON in ${source}`, {
			cause: error instanceof Error ? error.message : String(error),
		});
	}
}

export const apiCommands: CommandSpec[] = [servicesCommand, methodsCommand, callCommand];
