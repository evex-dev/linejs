// --input=path/to/file.thrift --thrift=path/to/out.ts --type=path/to/out.ts --struct=path/to/out.ts
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseArgs as nodeParseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { parseThrift } from "./parser.ts";
import { main as typedef } from "./gen_typedef.ts";
import { main as struct } from "./gen_struct.ts";
import { Thrift as _Thrift } from "../../packages/types/thrift.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));

/** Same flag object shape the old `std/flags` parser returned. */
function parseFlags(argv: string[]): Record<string, string | undefined> {
	const { values } = nodeParseArgs({
		args: argv,
		options: {
			thrift: { type: "string", short: "T" },
			type: { type: "string", short: "t" },
			struct: { type: "string", short: "s" },
			input: { type: "string", short: "i" },
		},
		allowPositionals: true,
	});
	return values as Record<string, string | undefined>;
}

const flags = parseFlags(process.argv.slice(2));

let Thrift = _Thrift;

if (flags.thrift !== undefined && flags.input !== undefined) {
	console.log("parsing thrift...");
	const thrift = parseThrift(
		readFileSync(flags.input || resolve(scriptDir, "../../resources/line/line.thrift"), "utf8"),
	);
	Thrift = thrift;
	writeFileSync(
		flags.thrift || resolve(scriptDir, "../../packages/types/thrift.ts"),
		"export const Thrift: Record<string, Record<string, string> | any[]> = " +
			JSON.stringify(thrift, null, 2) +
			`\nexport function parseEnum(name: string, value: number | string): string | null {
	return (Thrift as any)[name][value] ?? null;
}`,
	);
}

if (flags.type !== undefined) {
	console.log("generating ts typedef...");
	typedef(Thrift, flags.type || undefined);
}

if (flags.struct !== undefined) {
	console.log("generating struct parser...");
	struct(Thrift, flags.struct || undefined);
}
