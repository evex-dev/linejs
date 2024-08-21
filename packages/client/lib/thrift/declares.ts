import { TBinaryProtocol, TCompactProtocol } from "npm:thrift@0.20.0";
import { Buffer } from "node:buffer";

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

export type NestedArray = Array<NestedArray | number>;

// deno-lint-ignore no-explicit-any
export type LooseType = any;
