import { Buffer } from "node:buffer";
import { TBinaryProtocol, TCompactProtocol } from "thrift";
import type { LooseType } from "../../entities/common.ts";

TBinaryProtocol.genHeader = (name: string) => {
	return Buffer.from([
		0x80,
		1,
		0,
		1,
		0,
		0,
		0,
		name.length,
		...Buffer.from(name),
		0,
		0,
		0,
		0,
	]);
};

TCompactProtocol.genHeader = (name: string) => {
	return Buffer.from([0x82, 0x21, 0, name.length, ...Buffer.from(name)]);
};

export const Protocols = {
	4: TCompactProtocol,
	3: TBinaryProtocol,
};

export type ProtocolKey = keyof typeof Protocols;
/*
export type NestedArray = Array<
	| NestedArray
	| boolean
	| number
	| string
	| null
	| undefined
	| Buffer
	| LooseType
>;
*/
export type TypedTValue =
	[2, number, 0 | 1 | boolean | undefined] |
	[3, number, number?] |
	[4, number, number?] |
	[6, number, number?] |
	[8, number, number?] |
	[10, number, number | bigint | undefined] |
	[11, number, string | Buffer | undefined] |
	[12, number, NestedArray?] |
	[13, number, [number, Record<string | number, LooseType>]?] |
	[14, number, [number, Array<LooseType>]?] |
	[15, number, [number, Array<LooseType>]?]

export type NestedArray = Array<
	null |
	undefined |
	[2, number, 0 | 1 | boolean | undefined] |
	[3, number, number?] |
	[4, number, number?] |
	[6, number, number?] |
	[8, number, number?] |
	[10, number, number | bigint | undefined] |
	[11, number, string | Buffer | undefined] |
	[12, number, NestedArray?] |
	[13, number, [number, number, Record<string | number, NestedArray> | Record<string | number, LooseType>]?] |
	[14, number, [number, Array<NestedArray> | Array<LooseType>]?] |
	[15, number, [number, Array<NestedArray> | Array<LooseType>]?]
>
export interface ParsedThrift {
	value: LooseType;
	e: LooseType;
	_info: LooseType;
}
