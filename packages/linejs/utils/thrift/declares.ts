import { Buffer } from "node:buffer";
import { TBinaryProtocol, TCompactProtocol } from "thrift";
import type { LooseType } from "../../client/entities/common.ts";
export const genHeader = {
	3: (name: string) => {
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
	},
	4: (name: string) => {
		return Buffer.from([0x82, 0x21, 0, name.length, ...Buffer.from(name)]);
	},
};

export const Protocols = {
	4: TCompactProtocol,
	3: TBinaryProtocol,
};

export type ProtocolKey = keyof typeof Protocols;

/**
 * @description NestedArray is an array that represents each value of thrift that is compatible with CHRLINE.
 * ```
 * [thrift_type, field_id, value]
 * ```
 */
export type NestedArray = Array<
	| null
	| undefined
	| [2, number, 0 | 1 | boolean | undefined]
	| [3, number, number?]
	| [4, number, number?]
	| [6, number, number?]
	| [8, number, number?]
	| [10, number, number | bigint | undefined]
	| [11, number, string | Buffer | undefined]
	| [12, number, NestedArray?]
	| [
			13,
			number,
			[
				number,
				number,
				(
					| Record<string | number, NestedArray>
					| Record<string | number, LooseType>
				),
			]?,
	  ]
	| [14, number, [number, Array<NestedArray> | Array<LooseType>]?]
	| [15, number, [number, Array<NestedArray> | Array<LooseType>]?]
>;
export interface ParsedThrift {
	value: LooseType;
	e: LooseType;
	_info: LooseType;
}
