/**
 * @description generate `ThriftRenameParser.def` from thrift IDL
 */

// deno-lint-ignore-file no-explicit-any
import thriftIdl from "./thrift-idl.js";

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
/**
 * @param input thrift File
 * @returns thrift
 */
export function parseThrift(
	input: string,
): Record<string, any[] | Record<string, string>> {
	const def = thriftIdl.parse(input);
	const thrift_def: Record<string, Record<string, string> | any[]> = {};
	def.definitions.forEach((e: any) => {
		if (e.type === "Struct" || e.type === "Exception") {
			const name = e.id.name;
			const fields_def = [];
			const fields = e.fields;
			for (let i = 0; i < fields.length; i++) {
				const field = fields[i];
				const field_fid = field.id.value;
				const field_name = field.name;
				const field_def: any = {
					fid: field_fid,
					name: field_name,
				};
				if (field.valueType.type == "Identifier") {
					field_def.struct = field.valueType.name;
				} else if (field.valueType.type == "Map") {
					field_def.map = getType(field.valueType.valueType);
					field_def.key = getType(field.valueType.keyType);
				} else if (field.valueType.type == "List") {
					field_def.list = getType(field.valueType.valueType);
				} else if (field.valueType.type == "Set") {
					field_def.set = getType(field.valueType.valueType);
				} else if (field.valueType.baseType) {
					field_def.type = TYPE[field.valueType.baseType.toUpperCase()];
				}
				fields_def.push(field_def);
			}
			thrift_def[name] = fields_def;
		} else if (e.type === "Enum") {
			const name = e.id.name;
			const defs_def: any = {};
			const defs = e.definitions;
			for (let i = 0; i < defs.length; i++) {
				const def = defs[i];
				defs_def[def.value.value] = def.id.name;
			}
			thrift_def[name] = defs_def;
		}
	});
	return thrift_def;
}
