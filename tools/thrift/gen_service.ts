/**
 * @description Use to generate service from `ThriftRenameParser.def`
 * Warning: messy code
 */

import { Thrift } from "./thrift.ts";
const argList: string[] = [];
const structList: string[] = [];
const result = [`
import * as LINETypes from "@evex/linejs-types"
import {
	type NestedArray,
} from "../mod.ts";
function map(call: ((v:any)=>NestedArray) | ((v:any)=>number), value:any):Record<keyof any, NestedArray|number>{
    const tMap: Record<keyof any, NestedArray|number> = {}
    for (const key in value) {
        const e = value[key];
        tMap[key] = call(e);
    }
    return tMap
}
type PartialDeep<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<PartialDeep<U>>
        : T[P] extends ReadonlyArray<infer UU> ? ReadonlyArray<PartialDeep<UU>>
        : PartialDeep<T[P]>;
};
`];

Object.keys(Thrift).forEach((e) => {
    if (e.endsWith("_args")) {
        argList.push(e);
    }
});
function isExist(name: string) {
    return typeof (Thrift[name]) !== "undefined";
}
function isStruct(name: string) {
    addStruct(name);
    return Array.isArray(Thrift[name]);
}

function addStruct(name: string) {
    if (!structList.includes(name) && !argList.includes(name)) {
        structList.push(name);
        result.push(struct(name));
        console.log(name);
    }
}
function field(
    data: {
        fid: string;
        name: string;
        type?: number;
        struct?: string;
        list?: string | number;
        set?: string | number;
        map?: string | number;
        key?: number;
    },
): string {
    if (typeof data.type !== "undefined") {
        return `[${data.type}, ${data.fid}, param.${data.name}]`;
    } else if (typeof data.struct !== "undefined" && isExist(data.struct)) {
        return isStruct(data.struct)
            ? `[12, ${data.fid}, ${data.struct}(param.${data.name})]`
            : `[8, ${data.fid}, ${data.struct}(param.${data.name})]`;
    } else if (typeof data.list === "number") {
        return `[15, ${data.fid}, [${data.list}, param.${data.name}]]`;
    } else if (typeof data.list === "string" && isExist(data.list)) {
        return isStruct(data.list)
            ? `[15, ${data.fid}, [12, (param.${data.name}??[]).map(e=>${data.list}(e))]]`
            : `[15, ${data.fid}, [8, (param.${data.name}??[]).map(e=>${data.list}(e))]]`;
    } else if (typeof data.set === "number") {
        return `[14, ${data.fid}, [${data.set}, param.${data.name}]]`;
    } else if (typeof data.set === "string" && isExist(data.set)) {
        return isStruct(data.set)
            ? `[14, ${data.fid}, [12, (param.${data.name}??[]).map(e=>${data.set}(e))]]`
            : `[14, ${data.fid}, [8, (param.${data.name}??[]).map(e=>${data.set}(e))]]`;
    } else if (typeof data.map === "number" && typeof data.key === "number") {
        return `[13, ${data.fid}, [${data.key}, ${data.map}, param.${data.name}]]`;
    } else if (
        typeof data.map === "string" && typeof data.key === "number" &&
        isExist(data.map)
    ) {
        return isStruct(data.map)
            ? `[13, ${data.fid}, [${data.key}, 12, map(${data.map}, param.${data.name})]]`
            : `[13, ${data.fid}, [${data.key}, 8, map(${data.map}, param.${data.name})]]`;
    }
    return ``;
}
function struct(name: string): string {
    const fields = Thrift[name];
    if (isStruct(name)) {
        return (`
export function ${name}(param?: PartialDeep<LINETypes.${name}> | undefined): NestedArray {
    return typeof param === "undefined" ? [] : [
        ${
            (fields as any[])
                .map((e) => field(e))
                .join(",\n        ")
        }
    ]
}`);
    } else {
        return (`
export function ${name}(param: LINETypes.${name} | undefined): LINETypes.${name}&number | undefined {
    return typeof param === "string" ? LINETypes.enums.${name}[param] : param
}`);
    }
}

const args = argList.map((e) => struct(e));

Deno.writeTextFileSync(Deno.args[0], result.join("") + args.join(""));
