// deno-lint-ignore-file no-explicit-any
import type { ParsedThrift } from "../readwrite/declares.ts";

const TYPE: Record<string, number> = {
	STOP: 0,
	VOID: 1,
	BOOL: 2,
	BYTE: 3,
	I08: 3,
	DOUBLE: 4,
	I16: 6,
	I32: 8,
	I64: 10,
	STRING: 11,
	UTF7: 11,
	STRUCT: 12,
	MAP: 13,
	SET: 14,
	LIST: 15,
	UTF8: 16,
	UTF16: 17,
};
function getType(obj: any) {
	if (obj.type === "BaseType") {
		return TYPE[obj.baseType.toUpperCase()];
	} else if (obj.type === "Identifier") {
		return obj.name;
	}
}

function isStruct(obj: any): obj is any[] {
	return obj && Array.isArray(obj);
}

export class ThriftRenameParser {
	def: Record<string, Record<string, string> | any[]> = {};

	#name2fid(structName: string, name: string): any {
		const struct = this.def[structName];
		if (struct && Array.isArray(struct)) {
			const result = struct.findIndex((e: any) => {
				return e.name == name;
			});
			if (result === -1) {
				return { name: name, fid: -1 };
			} else {
				return struct[result];
			}
		} else {
			return { name: name, fid: -1 };
		}
	}

	#fid2name(structName: string, fid: string): any {
		const struct = this.def[structName];
		if (struct && Array.isArray(struct)) {
			const result = struct.findIndex((e: any) => {
				return e.fid == fid;
			});
			if (result === -1) {
				return { name: fid, fid: fid };
			} else {
				return struct[result];
			}
		} else {
			return { name: fid, fid: fid };
		}
	}

	rename_thrift(structName: string, object: any): any {
		const newObject: any = {};
		if (typeof object !== "object") return object;
		for (const fid in object) {
			const value = object[fid];
			const finfo = this.#fid2name(structName, fid);
			if (typeof value === "undefined") {
				continue;
			}
			if (
				finfo.struct &&
				(typeof value === "object" || typeof value === "number")
			) {
				if (isStruct(this.def[finfo.struct])) {
					newObject[finfo.name] = this.rename_thrift(
						finfo.struct,
						value,
					);
				} else {
					newObject[finfo.name] = (this.def[finfo.struct] as any)[value] ||
						value;
				}
			} else if (
				typeof finfo.list === "string" && typeof value === "object"
			) {
				newObject[finfo.name] = [];
				value.forEach((e: any, i: number) => {
					newObject[finfo.name][i] = this.rename_thrift(
						finfo.list,
						e,
					);
				});
			} else if (
				typeof finfo.map === "string" && typeof value === "object"
			) {
				newObject[finfo.name] = {};
				for (const key in value) {
					const e = value[key];
					newObject[finfo.name][key] = this.rename_thrift(
						finfo.map,
						e,
					);
				}
			} else if (
				typeof finfo.set === "string" && typeof value === "object"
			) {
				newObject[finfo.name] = [];
				value.forEach((e: any, i: number) => {
					newObject[finfo.name][i] = this.rename_thrift(finfo.set, e);
				});
			} else {
				newObject[finfo.name] = value;
			}
		}
		return newObject;
	}

	rename_data(data: ParsedThrift, square?: boolean): ParsedThrift {
		const name = data._info.fname;
		const struct_name = (square ? "SquareService_" : "") + name + "_result";
		data.data = this.rename_thrift(struct_name, data.data);
		return data;
	}
}
