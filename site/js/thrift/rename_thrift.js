//import thriftIdl from "./thriftrw-node/thrift-idl.js";

function getType(obj) {
    if (obj.type === "BaseType") {
        return ;
    } else if (obj.type === "Identifier") {
        return obj.name;
    }
}
function isStruct(obj) {
    return obj && obj.constructor === Array
    ;
}
export default class ThriftRenameParser {
    constructor(input) {
        if (!input) {
            this.def = {}
            return
        }
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
        this.def = thrift_def;
    }
    add_def(input){
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
        this.def = {...this.def,...thrift_def};
    }
    name2fid(struct_name, name) {
        const struct = this.def[struct_name];
        if (struct) {
            const result = struct.findIndex((e) => {
                return e.name == name;
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
            } else if (finfo.list) {
                newObject[finfo.name] = [];
                value.forEach((e, i) => {
                    newObject[finfo.name][i] = this.rename_thrift(
                        finfo.list,
                        e,
                    );
                });
            } else if (finfo.map) {
                newObject[finfo.name] = {};
                for (const key in value) {
                    const e = value[key];
                    newObject[finfo.name][key] = this.rename_thrift(
                        finfo.map,
                        e,
                    );
                }
            } else if (finfo.set) {
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
    rename_data(data){
        const name = data._info.fname
        const value = data.value
        const struct_name = name.substr(0, 1).toUpperCase() + name.substr(1) + "Response";
        data.value = this.rename_thrift(struct_name,value)
        return data
    }
}

globalThis.ThriftRenameParser = ThriftRenameParser