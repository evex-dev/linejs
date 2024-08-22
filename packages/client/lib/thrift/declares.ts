import { TBinaryProtocol, TCompactProtocol } from "npm:thrift@0.20.0";
import { Buffer } from "node:buffer";
import { LooseType } from "../../utils/common.ts";

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
	return Buffer.from([
		0x82,
		0x21,
		0,
		name.length,
		...Buffer.from(name),
	]);
};

export const Protocols = {
	4: TCompactProtocol,
	3: TBinaryProtocol,
	0: Buffer,
};

export type ProtocolKey = keyof typeof Protocols;

export type NestedArray = Array<NestedArray | number>;

export interface ParsedThrift {
    value: LooseType;
    e: LooseType;
    _info: LooseType;
}
