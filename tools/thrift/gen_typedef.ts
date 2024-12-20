/**
 * @description Use to generate ts types from `ThriftRenameParser.def`
 * Warning: messy code
 */

import * as path_ from "https://deno.land/std@0.79.0/path/mod.ts";
import { Thrift as _Thrift } from "../../packages/types/thrift.ts";
export function main(
	Thrift: Record<string, any[] | Record<string, string>> = _Thrift,
	path?: string,
) {
	const out: string[] = [];
	const enums: Record<string, any> = {};

	const ttype: Record<number, string> = {
		2: "boolean",
		3: "number",
		4: "number",
		6: "number",
		8: "number",
		10: "Int64",
		11: "string",
		12: "",
		13: "Record<$K,$V>",
		14: "$E[]",
		15: "$E[]",
	};

	type tdata = {
		fid: number;
		name: string;
		type?: number;
		struct?: string;
		map?: string | number;
		key?: string | number;
		list?: string | number;
		set?: string | number;
	};
	const toType = (tname: string | number) =>
		typeof tname !== "undefined"
			? (tname !== "_any"
				? (tname !== "_anykey"
					? (typeof tname === "string"
						? (typeof (Thrift as any)[tname] !== "undefined"
							? tname
							: "any")
						: ttype[tname])
					: "keyof any")
				: "any")
			: "any";
	function toUnion(input: Record<string, string>, name: string) {
		const unions: string[] = [];
		const enumValue: Record<string, number> = {};
		for (const key in input) {
			if (Object.prototype.hasOwnProperty.call(input, key)) {
				const value = input[key];
				unions.push(key);
				unions.push(`"${value}"\n`);
				enumValue[value] = parseInt(key);
			}
		}
		enums[name] = enumValue;
		if (!unions.length) {
			return `export type ${name} = number;`;
		}
		return `export type ${name} = ${unions.join(" | ")};`;
	}
	function toInterface(input: tdata[], name: string) {
		const defs: string[] = [];
		for (const e of input) {
			if (typeof e.type !== "undefined") {
				defs.push(`${e.name}: ${ttype[e.type]};`);
			} else if (typeof e.struct !== "undefined") {
				defs.push(`${e.name}: ${toType(e.struct)};`);
			} else if (
				typeof e.map !== "undefined" && typeof e.key !== "undefined"
			) {
				defs.push(
					`${e.name}: ${
						ttype[13].replace(
							"$K",
							e.key === 10 ? "number" : toType(e.key),
						).replace("$V", toType(e.map))
					};`,
				);
			} else if (typeof e.list !== "undefined") {
				defs.push(
					`${e.name}: ${ttype[14].replace("$E", toType(e.list))};`,
				);
			} else if (typeof e.set !== "undefined") {
				defs.push(
					`${e.name}: ${ttype[15].replace("$E", toType(e.set))};`,
				);
			}
		}
		return (
			`export interface ${name} {
		${defs.join("\n	")}
	}`
		);
	}
	const types = [];
	const tname = [];
	for (const key in Thrift) {
		if (Object.prototype.hasOwnProperty.call(Thrift, key)) {
			const element = (Thrift as any)[key];
			if (!Array.isArray(element)) {
				tname.push(`${key}: Record<${key}&string,${key}&number>;`);
				types.push(toUnion(element, key));
			} else if (typeof element === "object") {
				types.push(toInterface(element, key));
			}
		}
	}
	out.push(`// deno-lint-ignore-file
	/*
	 * @module
	 * LINEJS Types
	 * Autogenerated by data2typedef.ts
	 * Time ${new Date().toLocaleString("EN")}
	 */
	`);
	out.push("type Int64 = number | bigint;");
	out.push(
		`export const enums:{${tname.join("\n")}} = ${
			JSON.stringify(enums, null, 2)
		};`,
	);
	out.push(types.join("\n\n"));

	Deno.writeTextFileSync(
		path || path_.fromFileUrl(import.meta.resolve(
			"../../packages/linejs/src/thrift/readwrite/struct.ts",
		)),
		out.join("\n"),
		{ create: true },
	);
}