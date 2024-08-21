import { TBinaryProtocol, TCompactProtocol } from "npm:thrift@0.20.0";
import { Buffer } from "node:buffer";

export const Protocols = {
	4: TCompactProtocol,
	3: TBinaryProtocol,
	0: Buffer,
};

export type NestedArray = Array<NestedArray | number>;

// deno-lint-ignore no-explicit-any
export type LooseType = any;
