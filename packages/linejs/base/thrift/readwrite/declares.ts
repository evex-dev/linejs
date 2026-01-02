// @ts-types="thrift-types"
import * as thrift from "thrift";
import { Buffer } from "node:buffer";

export const genHeader = {
	3: (name: string) => {
		const nameBuf = Buffer.from(String(name), "utf8");
		if (nameBuf.length > 0xff) {
			throw new RangeError("genHeader v3: name too long");
		}
		const prefix = Buffer.from([
			0x80,
			0x01,
			0x00,
			0x01,
			0x00,
			0x00,
			0x00,
			nameBuf.length,
		]);
		const suffix = Buffer.from([0x00, 0x00, 0x00, 0x00]);
		return Buffer.concat([prefix, nameBuf, suffix]);
	},
	4: (name: string) => {
		const nameBuf = Buffer.from(String(name), "utf8");
		if (nameBuf.length > 0xff) {
			throw new RangeError("genHeader v4: name too long (max 255 bytes)");
		}
		const header = Buffer.from([0x82, 0x21, 0x00, nameBuf.length]);
		return Buffer.concat([header, nameBuf]);
	},
};

export const Protocols = {
	4: thrift.TCompactProtocol,
	//4: TMoreCompactProtocol,
	3: thrift.TBinaryProtocol,
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
				| Record<string | number, unknown>
				| undefined
			),
		]?,
	]
	| [14, number, [number, NestedArray[] | unknown[] | undefined]?]
	| [15, number, [number, NestedArray[] | unknown[] | undefined]?]
>;
export interface ParsedThrift {
	data: any;
	_info: thrift.TMessage;
}
