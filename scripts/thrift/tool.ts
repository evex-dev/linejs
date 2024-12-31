// --input=path/to/file.thrift --thrift=path/to/out.ts --type=path/to/out.ts --struct=path/to/out.ts
import { parseThrift } from "./parser.ts";
import { main as typedef } from "./gen_typedef.ts";
import { main as struct } from "./gen_struct.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts";
import { Thrift as _Thrift } from "../../packages/types/thrift.ts";

const flags = parse(Deno.args, {
	string: ["thrift", "type", "struct", "input"],
	alias: { "struct": "s", "type": "t", "thrift": "T", "input": "i" },
});

let Thrift = _Thrift;

if (flags.thrift !== undefined && flags.input !== undefined) {
	console.log("parsing thrift...");
	const thrift = parseThrift(
		Deno.readTextFileSync(
			flags.input || fromFileUrl(import.meta.resolve(
				"../../resources/line/line.thrift",
			)),
		),
	);
	Thrift = thrift;
	Deno.writeTextFileSync(
		flags.thrift || fromFileUrl(import.meta.resolve(
			"../../packages/types/thrift.ts",
		)),
		"export const Thrift: Record<string, Record<string, string> | any[]> = " +
			JSON.stringify(thrift, null, 2) +
			`\nexport function parseEnum(name: string, value: number | string): string | null {
	return (Thrift as any)[name][value] ?? null;
}`,
	);
}

if (flags.type !== undefined) {
	console.log("generating ts typedef...");
	typedef(
		Thrift,
		flags.type || undefined,
	);
}

if (flags.struct !== undefined) {
	console.log("generating struct parser...");
	struct(
		Thrift,
		flags.struct || undefined,
	);
}
