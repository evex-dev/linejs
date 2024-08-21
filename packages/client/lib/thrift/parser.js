import thriftIdl from "./thrift-ast-parser.js";

const TYPE = {
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
function getType(obj) {
	if (obj.type === "BaseType") {
		return TYPE[obj.baseType.toUpperCase()];
	} else if (obj.type === "Identifier") {
		return obj.name;
	}
}
function isStruct(obj) {
	return obj && obj.constructor === Array;
}
export default class ThriftRenameParser {
	constructor(input) {
		this.def = {};
		if (!input) {
			return;
		}
		this.add_def(input);
	}
	add_def(input) {
		const def = thriftIdl.parse(input);
		const thrift_def = {};
		def.definitions.forEach((e) => {
			if (e.type === "Struct") {
				const name = e.id.name;
				const fields_def = [];
				const fields = e.fields;
				for (let i = 0; i < fields.length; i++) {
					const field = fields[i];
					const field_fid = field.id.value;
					const field_name = field.name;
					const field_def = { fid: field_fid, name: field_name };
					if (field.valueType.type == "Identifier") {
						field_def.struct = field.valueType.name;
					} else if (field.valueType.type == "Map") {
						field_def.map = getType(field.valueType.valueType);
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
				const defs_def = {};
				const defs = e.definitions;
				for (let i = 0; i < defs.length; i++) {
					const def = defs[i];
					defs_def[def.value.value] = def.id.name;
				}
				thrift_def[name] = defs_def;
			}
		});
		this.def = { ...this.def, ...thrift_def };
	}
	name2fid(struct_name, name) {
		const struct = this.def[struct_name];
		if (struct) {
			const result = struct.findIndex((e) => {
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
	fid2name(struct_name, fid) {
		const struct = this.def[struct_name];
		if (struct) {
			const result = struct.findIndex((e) => {
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
	rename_thrift(struct_name, object) {
		const newObject = {};
		for (const fid in object) {
			const value = object[fid];
			const finfo = this.fid2name(struct_name, fid);
			if (finfo.struct) {
				if (isStruct(this.def[finfo.struct])) {
					newObject[finfo.name] = this.rename_thrift(
						finfo.struct,
						value,
					);
				} else {
					newObject[finfo.name] = this.def[finfo.struct][value] ||
						value;
				}
			} else if (typeof finfo.list === "string") {
				newObject[finfo.name] = [];
				value.forEach((e, i) => {
					newObject[finfo.name][i] = this.rename_thrift(
						finfo.list,
						e,
					);
				});
			} else if (typeof finfo.map === "string") {
				newObject[finfo.name] = {};
				for (const key in value) {
					const e = value[key];
					newObject[finfo.name][key] = this.rename_thrift(
						finfo.map,
						e,
					);
				}
			} else if (typeof finfo.set === "string") {
				newObject[finfo.name] = [];
				value.forEach((e, i) => {
					newObject[finfo.name][i] = this.rename_thrift(
						finfo.set,
						e,
					);
				});
			} else {
				newObject[finfo.name] = value;
			}
		}
		return newObject;
	}
	rename_data(data) {
		const name = data._info.fname;
		const value = data.value;
		const struct_name = name.substr(0, 1).toUpperCase() + name.substr(1) +
			"Response";
		data.value = this.rename_thrift(struct_name, value);
		return data;
	}
	parse_data(struct_name, object) {
		const newThrift = [];
		for (const fname in object) {
			const value = object[fname];
			const finfo = this.name2fid(struct_name, fname);
			if (finfo.fid == -1) {
				continue;
			}
			const thisValue = [null, finfo.fid, null];
			if (finfo.struct) {
				if (isStruct(this.def[finfo.struct])) {
					thisValue[2] = this.parse_data(
						finfo.struct,
						value,
					);
					thisValue[0] = TYPE.STRUCT;
				} else {
					if (typeof value === "number") {
						thisValue[2] = value;
						thisValue[0] = TYPE.I64;
					} else {
						const Enum = this.def[finfo.struct];
						let i64;
						for (const k in Enum) {
							const val = Enum[k];
							if (val == value) {
								i64 = Number(k);
							}
						}
						thisValue[2] = i64;
						thisValue[0] = TYPE.I64;
					}
				}
			} else if (finfo.list) {
				thisValue[0] = TYPE.LIST;
				if (typeof finfo.list === "number") {
					thisValue[2] = [finfo.list, value];
				} else {
					thisValue[2] = [
						TYPE.STRUCT,
						value.map((e) => this.parse_data(finfo.list, e)),
					];
				}
			} else if (finfo.map) {
				thisValue[0] = TYPE.MAP;
				if (typeof finfo.map === "number") {
					thisValue[2] = [TYPE.STRING, finfo.map, value];
				} else {
					const obj = {};
					for (const key in value) {
						const e = value[key];
						obj[key] = this.parse_data(finfo.map, e);
					}
					thisValue[2] = [TYPE.STRING, TYPE.STRUCT, obj];
				}
			} else if (finfo.set) {
				thisValue[0] = TYPE.SET;
				if (typeof finfo.map === "number") {
					thisValue[2] = [finfo.map, value];
				} else {
					thisValue[2] = [
						TYPE.STRUCT,
						value.map((e) => this.parse_data(finfo.map, e)),
					];
				}
			} else if (finfo.type) {
				thisValue[0] = finfo.type;
				thisValue[2] = value;
			}
			newThrift.push(thisValue);
		}
		return newThrift;
	}
}
