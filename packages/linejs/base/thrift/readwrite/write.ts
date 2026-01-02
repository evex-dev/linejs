// @ts-types="thrift-types"
import * as thrift from "thrift";
import { Buffer } from "node:buffer";
import {
	genHeader,
	type NestedArray,
	type ProtocolKey,
	type Protocols,
} from "./declares.ts";
import Int64 from "node-int64";
import type { LooseType } from "@evex/loose-types";

const Thrift = thrift.Thrift;
export function writeThrift(
	value: NestedArray,
	name: string,
	Protocol: (typeof Protocols)[ProtocolKey],
): Uint8Array {
	const chunks: Buffer[] = [];
	// 初期バッファは空にして、コールバックでチャンクを集める
	const buftra = new thrift.TBufferedTransport(
		Buffer.from([]),
		function (outBuf?: Buffer) {
			if (!outBuf) return;
			chunks.push(outBuf);
		},
	);
	const myprot = new Protocol(buftra);
	_writeStruct(myprot, value);
	myprot.flush();
	buftra.flush();

	let myBuf = chunks.length ? Buffer.concat(chunks) : Buffer.from([]);
	if (myBuf.length === 1 && myBuf[0] === 0) {
		myBuf = Buffer.from([]);
	}

	const header = genHeader[Protocol == thrift.TBinaryProtocol ? 3 : 4](name);
	const totalLen = header.length + myBuf.length + 1;
	const writedBinary = new Uint8Array(totalLen);
	writedBinary.set(header, 0);
	writedBinary.set(myBuf, header.length);
	writedBinary[totalLen - 1] = 0;
	return writedBinary;
}

export function writeStruct(
	value: NestedArray,
	Protocol: (typeof Protocols)[ProtocolKey],
): Uint8Array {
	const chunks: Buffer[] = [];
	const buftra = new thrift.TBufferedTransport(
		Buffer.from([]),
		function (outBuf?: Buffer) {
			if (!outBuf) return;
			chunks.push(outBuf);
		},
	);
	const myprot = new Protocol(buftra);
	_writeStruct(myprot, value);
	myprot.flush();
	buftra.flush();
	let myBuf = chunks.length ? Buffer.concat(chunks) : Buffer.from([]);
	if (myBuf.length === 1 && myBuf[0] === 0) {
		myBuf = Buffer.from([]);
	}
	return myBuf;
}

function _writeStruct(
	output: thrift.TCompactProtocol | thrift.TCompactProtocol,
	value: NestedArray = [],
): void {
	if (!value.length) {
		return;
	}
	output.writeStructBegin("");

	for (let i = 0, L = value.length; i < L; i++) {
		const e = value[i];
		if (e === null || e === undefined) {
			continue;
		}
		writeValue(output, e[0], e[1], e[2]);
	}

	output.writeFieldStop();
	output.writeStructEnd();
	return;
}

function writeValue(
	output: thrift.TCompactProtocol | thrift.TBinaryProtocol,
	ftype: number,
	fid: number,
	val:
		| undefined
		| null
		| NestedArray
		| string
		| boolean
		| number
		| bigint
		| Buffer
		| [number, Array<LooseType>?]
		| [number, number, object?],
): void {
	if (val === undefined || val === null) {
		return;
	}
	switch (ftype) {
		case Thrift.Type.STRING:
			if (val instanceof Buffer) {
				output.writeFieldBegin("", Thrift.Type.STRING, fid);
				output.writeBinary(val);
				output.writeFieldEnd();
			} else {
				if (typeof val !== "string") {
					throw new TypeError(`ftype=${ftype}: value is not string`);
				}
				output.writeFieldBegin("", Thrift.Type.STRING, fid);
				output.writeString(val.toString());
				output.writeFieldEnd();
			}
			break;

		case Thrift.Type.DOUBLE:
			if (typeof val !== "number") {
				throw new TypeError(`ftype=${ftype}: value is not number`);
			}
			output.writeFieldBegin("", Thrift.Type.DOUBLE, fid);
			output.writeDouble(val);
			output.writeFieldEnd();
			break;

		case Thrift.Type.I64:
			if (typeof val === "bigint") {
				output.writeFieldBegin("", Thrift.Type.I64, fid);
				output.writeI64(new Int64(val.toString()));
				output.writeFieldEnd();
			} else if (typeof val !== "number") {
				throw new TypeError(`ftype=${ftype}: value is not number`);
			} else {
				output.writeFieldBegin("", Thrift.Type.I64, fid);
				output.writeI64(val);
				output.writeFieldEnd();
			}

			break;

		case Thrift.Type.I32:
			if (typeof val !== "number") {
				throw new TypeError(`ftype=${ftype}: value is not number`);
			}
			output.writeFieldBegin("", Thrift.Type.I32, fid);
			output.writeI32(val);
			output.writeFieldEnd();
			break;

		case Thrift.Type.BOOL:
			if (typeof val !== "boolean" && typeof val !== "number") {
				throw new TypeError(`ftype=${ftype}: value is not boolean`);
			}
			output.writeFieldBegin("", Thrift.Type.BOOL, fid);
			output.writeBool(Boolean(val));
			output.writeFieldEnd();
			break;

		case Thrift.Type.STRUCT:
			if (!Array.isArray(val)) {
				throw new TypeError(`ftype=${ftype}: value is not struct`);
			}
			if (!val.length) {
				return;
			}
			output.writeFieldBegin("", Thrift.Type.STRUCT, fid);
			_writeStruct(output, val as NestedArray);
			output.writeFieldEnd();
			break;

		case Thrift.Type.MAP:
			val = val as [number, number, object];
			if (!val[2]) {
				return;
			}
			output.writeFieldBegin("", Thrift.Type.MAP, fid);
			{
				const obj = val[2] as Record<string, LooseType>;
				const keys = Object.keys(obj);
				output.writeMapBegin(val[0], val[1], keys.length);
				for (let i = 0; i < keys.length; i++) {
					const kiter = keys[i];
					const viter = obj[kiter];
					writeValue_(output, val[0], kiter);
					writeValue_(output, val[1], viter);
				}
				output.writeMapEnd();
			}
			output.writeFieldEnd();
			break;

		case Thrift.Type.LIST:
			val = val as [number, Array<LooseType>];
			if (!val[1]) {
				return;
			}
			output.writeFieldBegin("", Thrift.Type.LIST, fid);
			{
                const arr = val[1] as LooseType[];
                output.writeListBegin(val[0], arr.length);
                for (let i = 0, L = arr.length; i < L; i++) {
                    writeValue_(output, val[0], arr[i]);
                }
                output.writeListEnd();
            }
			output.writeFieldEnd();
			break;
		case Thrift.Type.SET:
			val = val as [number, Array<LooseType>];
			if (!val[1]) {
				return;
			}
			output.writeFieldBegin("", Thrift.Type.SET, fid);
			{
                const arr = val[1] as LooseType[];
                output.writeSetBegin(val[0], arr.length);
                for (let i = 0, L = arr.length; i < L; i++) {
                    writeValue_(output, val[0], arr[i]);
                }
                output.writeSetEnd();
            }
			output.writeFieldEnd();
			break;
		default:
			break;
	}
}

function writeValue_(
	output: thrift.TCompactProtocol | thrift.TCompactProtocol,
	ftype: number,
	val:
		| undefined
		| null
		| NestedArray
		| string
		| boolean
		| number
		| bigint
		| Buffer
		| [number, Array<LooseType>]
		| [number, number, object],
): void {
	if (val === undefined || val === null) {
		return;
	}
	switch (ftype) {
		case Thrift.Type.STRING:
			if (val instanceof Buffer) {
				output.writeBinary(val);
			} else {
				if (typeof val !== "string") {
					throw new TypeError(`ftype=${ftype}: value is not string`);
				}
				output.writeString(val.toString());
			}
			break;

		case Thrift.Type.DOUBLE:
			if (typeof val !== "number") {
				throw new TypeError(`ftype=${ftype}: value is not number`);
			}
			output.writeDouble(val);
			break;

		case Thrift.Type.I64:
			if (typeof val !== "number") {
				throw new TypeError(`ftype=${ftype}: value is not number`);
			}
			output.writeI64(val);
			break;

		case Thrift.Type.I32:
			if (typeof val !== "number") {
				throw new TypeError(`ftype=${ftype}: value is not number`);
			}
			output.writeI32(val);
			break;

		case Thrift.Type.BOOL:
			if (typeof val !== "boolean") {
				throw new TypeError(`ftype=${ftype}: value is not boolean`);
			}
			output.writeBool(val);
			break;

		case Thrift.Type.STRUCT:
			if (!Array.isArray(val)) {
				throw new TypeError(`ftype=${ftype}: value is not struct`);
			}
			_writeStruct(output, val as NestedArray);
			break;

		default:
			break;
	}
}
