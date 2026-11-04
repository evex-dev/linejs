import { inspect } from "node:util";

export interface SerializeOptions {
	/** Include stacks in Error objects. Defaults to false. */
	includeStack?: boolean;
}

/**
 * Convert a LINEJS result into a JSON-safe value. LINE uses a mix of string
 * ids, 64-bit integers, Dates, and binary blobs, so plain JSON.stringify is not
 * enough for `--json`.
 */
export function serialize(value: unknown, options: SerializeOptions = {}): unknown {
	const seen = new WeakSet<object>();

	const walk = (input: unknown): unknown => {
		if (input === null || typeof input === "string" || typeof input === "boolean") {
			return input;
		}
		if (typeof input === "number") {
			return Number.isFinite(input) ? input : String(input);
		}
		if (typeof input === "bigint") {
			return input.toString();
		}
		if (typeof input === "undefined") {
			return undefined;
		}
		if (typeof input === "function") {
			return `[Function ${input.name || "anonymous"}]`;
		}
		if (typeof input === "symbol") {
			return input.toString();
		}

		if (input instanceof Date) return input.toISOString();
		if (input instanceof Error) {
			return {
				name: input.name,
				message: input.message,
				...(input.cause === undefined ? {} : { cause: walk(input.cause) }),
				...("code" in input && typeof input.code === "string" ? { code: input.code } : {}),
				...("details" in input && input.details !== undefined
					? { details: walk(input.details) }
					: {}),
				...(options.includeStack && input.stack ? { stack: input.stack } : {}),
			};
		}
		if (typeof Blob !== "undefined" && input instanceof Blob) {
			return {
				type: input.type || "application/octet-stream",
				size: input.size,
				...(typeof File !== "undefined" && input instanceof File ? { name: input.name } : {}),
			};
		}
		if (input instanceof ArrayBuffer) {
			return { type: "ArrayBuffer", byteLength: input.byteLength };
		}
		if (ArrayBuffer.isView(input)) {
			return {
				type: input.constructor.name,
				byteLength: input.byteLength,
			};
		}

		if (typeof input !== "object") return String(input);
		if (seen.has(input)) return "[Circular]";
		seen.add(input);

		try {
			if (input instanceof Map) {
				return Object.fromEntries(
					[...input.entries()].map(([key, value]) => [String(key), walk(value)]),
				);
			}
			if (input instanceof Set) {
				return [...input].map(walk);
			}
			if (Array.isArray(input)) {
				return input.map(walk);
			}
			const output: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
				const converted = walk(value);
				if (converted !== undefined) output[key] = converted;
			}
			return output;
		} finally {
			seen.delete(input);
		}
	};

	return walk(value);
}

export function formatJson(value: unknown): string {
	return JSON.stringify(serialize(value), null, 2);
}

/** Compact one-line rendering for tables and key/value output. */
export function humanValue(value: unknown): string {
	if (value === null) return "null";
	if (value === undefined) return "";
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	if (typeof value === "bigint") return value.toString();
	if (value instanceof Date) return value.toISOString();
	if (Array.isArray(value)) return value.map(humanValue).join(", ");
	if (typeof value === "object") return inspect(value, { depth: 2, breakLength: Infinity });
	return String(value);
}

export interface OutputStreams {
	stdout(chunk: string): void;
	stderr(chunk: string): void;
}

export interface OutputOptions {
	json: boolean;
	color?: boolean;
}

export interface TableColumn {
	key: string;
	label?: string;
	maxWidth?: number;
}

export class Output {
	readonly streams: OutputStreams;
	readonly json: boolean;
	readonly color: boolean;

	constructor(streams: OutputStreams, options: OutputOptions) {
		this.streams = streams;
		this.json = options.json;
		this.color = options.color ?? false;
	}

	write(text: string): void {
		this.streams.stdout(text);
	}

	writeLine(text = ""): void {
		this.streams.stdout(`${text}\n`);
	}

	writeErr(text: string): void {
		this.streams.stderr(text);
	}

	writeErrLine(text = ""): void {
		this.streams.stderr(`${text}\n`);
	}

	style(style: "bold" | "dim" | "red" | "green" | "yellow" | "cyan", text: string): string {
		if (!this.color) return text;
		const codes = {
			bold: ["1", "22"],
			dim: ["2", "22"],
			red: ["31", "39"],
			green: ["32", "39"],
			yellow: ["33", "39"],
			cyan: ["36", "39"],
		} as const;
		const [open, close] = codes[style];
		return `\u001b[${open}m${text}\u001b[${close}m`;
	}

	/** Emit a command result: JSON in --json mode, otherwise the formatter. */
	result(value: unknown, formatter?: (value: unknown) => string): void {
		if (this.json) {
			this.writeLine(formatJson(value));
			return;
		}
		const text = formatter ? formatter(value) : formatJson(value);
		if (text.length) this.writeLine(text);
	}

	jsonLine(value: unknown): void {
		this.writeLine(JSON.stringify(serialize(value)));
	}

	heading(text: string): void {
		this.writeLine(this.style("bold", text));
	}

	dim(text: string): string {
		return this.style("dim", text);
	}

	keyValue(values: Record<string, unknown>): void {
		const entries = Object.entries(values).filter(([, value]) => value !== undefined);
		if (!entries.length) return;
		const width = Math.max(...entries.map(([key]) => key.length));
		for (const [key, value] of entries) {
			this.writeLine(`${key.padEnd(width)}  ${humanValue(value)}`);
		}
	}

	table(rows: readonly Record<string, unknown>[], columns: readonly TableColumn[]): void {
		if (!rows.length) {
			this.writeLine(this.dim("(empty)"));
			return;
		}
		const values = rows.map((row) =>
			columns.map((column) => humanValue(row[column.key]).replace(/\s+/g, " ").trim()),
		);
		const widths = columns.map((column, index) => {
			const max = column.maxWidth ?? 48;
			const contentWidth = Math.max(
				column.label?.length ?? column.key.length,
				...values.map((row) => row[index]!.length),
			);
			return Math.min(contentWidth, max);
		});
		const header = columns
			.map((column, index) => (column.label ?? column.key).padEnd(widths[index]!))
			.join("  ");
		this.writeLine(this.style("bold", header.trimEnd()));
		for (const row of values) {
			this.writeLine(
				row
					.map((cell, index) => {
						const width = widths[index]!;
						const clipped =
							cell.length > width ? `${cell.slice(0, Math.max(0, width - 1))}…` : cell;
						return clipped.padEnd(width);
					})
					.join("  ")
					.trimEnd(),
			);
		}
	}
}

export function formatErrorText(error: unknown): string {
	if (error instanceof Error) return error.message;
	return humanValue(error);
}
