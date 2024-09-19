import type { LooseType } from "../../entities/common.ts";

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
const EPYT = {
	0: "stop",
	1: "void",
	2: "bool",
	3: "byte",
	4: "double",
	6: "i16",
	8: "i32",
	10: "i64",
	11: "string",
} as Record<number, string>;

function isStruct(obj: LooseType) {
	return obj && obj.constructor === Array;
}

export default class ThriftRenameParser {
	def: LooseType;

	constructor() {
		this.def = {};
	}

	name2fid(structName: string, name: string): LooseType {
		const struct = this.def[structName];
		if (struct) {
			const result = struct.findIndex((e: LooseType) => {
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

	fid2name(structName: string, fid: string): LooseType {
		const struct = this.def[structName];
		if (struct) {
			const result = struct.findIndex((e: LooseType) => {
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

	rename_thrift(structName: string, object: LooseType): LooseType {
		const newObject: LooseType = {};
		if (typeof object !== "object") return object;
		for (const fid in object) {
			const value = object[fid];
			const finfo = this.fid2name(structName, fid);
			if (typeof value === "undefined") {
				continue;
			}
			if (
				finfo.struct &&
				(typeof value === "object" || typeof value === "number")
			) {
				if (isStruct(this.def[finfo.struct])) {
					newObject[finfo.name] = this.rename_thrift(finfo.struct, value);
				} else {
					newObject[finfo.name] = this.def[finfo.struct][value] || value;
				}
			} else if (typeof finfo.list === "string" && typeof value === "object") {
				newObject[finfo.name] = [];
				value.forEach((e: LooseType, i: number) => {
					newObject[finfo.name][i] = this.rename_thrift(finfo.list, e);
				});
			} else if (typeof finfo.map === "string" && typeof value === "object") {
				newObject[finfo.name] = {};
				for (const key in value) {
					const e = value[key];
					newObject[finfo.name][key] = this.rename_thrift(finfo.map, e);
				}
			} else if (typeof finfo.set === "string" && typeof value === "object") {
				newObject[finfo.name] = [];
				value.forEach((e: LooseType, i: number) => {
					newObject[finfo.name][i] = this.rename_thrift(finfo.set, e);
				});
			} else {
				newObject[finfo.name] = value;
			}
		}
		return newObject;
	}

	rename_data(data: LooseType): LooseType {
		const name = data._info.fname;
		const value = data.value;
		const structName =
			name.substr(0, 1).toUpperCase() + name.substr(1) + "Response";
		data.value = this.rename_thrift(structName, value);
		return data;
	}

	parse_data(structName: string, object?: LooseType): LooseType[][] {
		const newThrift = [];
		for (const fname in object) {
			const value = object[fname];
			const finfo = this.name2fid(structName, fname);
			if (finfo.fid == -1) {
				continue;
			}
			const thisValue = [null, finfo.fid, null];
			if (finfo.struct) {
				if (isStruct(this.def[finfo.struct])) {
					thisValue[2] = this.parse_data(finfo.struct, value);
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
						value.map((e: LooseType) => this.parse_data(finfo.list, e)),
					];
				}
			} else if (finfo.map) {
				thisValue[0] = TYPE.MAP;
				if (typeof finfo.map === "number") {
					thisValue[2] = [TYPE.STRING, finfo.map, value];
				} else {
					const obj: LooseType = {};
					for (const key in value) {
						const e = value[key];
						obj[key] = this.parse_data(finfo.map, e);
					}
					thisValue[2] = [TYPE.STRING, TYPE.STRUCT, obj];
				}
			} else if (finfo.set) {
				thisValue[0] = TYPE.SET;
				if (typeof finfo.set === "number") {
					thisValue[2] = [finfo.set, value];
				} else {
					thisValue[2] = [
						TYPE.STRUCT,
						value.map((e: LooseType) => this.parse_data(finfo.set, e)),
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

	get_cl(structName: string): LooseType[][] {
		const newThrift = [];
		const thisStruct = this.def[structName];
		for (const i in thisStruct) {
			const finfo = thisStruct[i];
			const value = finfo.name;
			const thisValue = [null, finfo.fid, value];
			if (finfo.struct) {
				if (isStruct(this.def[finfo.struct])) {
					thisValue[2] = this.get_cl(finfo.struct);
					thisValue[0] = TYPE.STRUCT;
				} else {
					thisValue[0] = TYPE.I64;
					thisValue[2] = `${EPYT[TYPE.I64]}(${finfo.struct}): ${value}`;
				}
			} else if (finfo.list) {
				thisValue[0] = TYPE.LIST;
				if (typeof finfo.list === "number") {
					thisValue[2] = [finfo.list, [value]];
				} else {
					thisValue[2] = [TYPE.STRUCT, [this.get_cl(finfo.list)]];
				}
			} else if (finfo.map) {
				thisValue[0] = TYPE.MAP;
				if (typeof finfo.map === "number") {
					thisValue[2] = [TYPE.STRING, finfo.map, { key: value }];
				} else {
					const obj: LooseType = {};
					obj.key = this.get_cl(finfo.map);
					thisValue[2] = [TYPE.STRING, TYPE.STRUCT, obj];
				}
			} else if (finfo.set) {
				thisValue[0] = TYPE.SET;
				if (typeof finfo.map === "number") {
					thisValue[2] = [finfo.map, [value]];
				} else {
					thisValue[2] = [TYPE.STRUCT, [this.parse_data(finfo.map)]];
				}
			} else if (finfo.type) {
				thisValue[0] = finfo.type;
				thisValue[2] = `${EPYT[finfo.type]}: ${value}`;
			}
			newThrift.push(thisValue);
		}
		return newThrift;
	}
}
