import * as thrift from "npm:thrift@0.20.0";
import { Buffer } from "node:buffer";
import type { NestedArray, ProtocolKey, Protocols } from "./declares.ts";
import type { LooseType } from "../../entities/common.ts";
const Thrift = thrift.Thrift;

export function writeThrift(
	value: NestedArray,
	name: string,
	Protocol: (typeof Protocols)[ProtocolKey],
): Uint8Array {
	const Transport = thrift.TBufferedTransport;
	let myBuf: Buffer = Buffer.from([]);
	const buftra = new Transport(myBuf, function (outBuf: Uint8Array) {
		myBuf = Buffer.concat([myBuf, outBuf]);
	});
	const myprot = new Protocol(buftra);
	writeStruct(myprot, value);
	myprot.flush();
	buftra.flush();
	if (myBuf.length === 1 && myBuf[0] === 0) {
		myBuf = Buffer.from([]);
	}
	const writedBinary = new Uint8Array([
		...Protocol.genHeader(name),
		...myBuf,
		0,
	]);
	return writedBinary;
}
// Thrift encoded buffer is ready to use, save or transport

function writeStruct(output: LooseType, clValue: NestedArray = []): void {
	output.writeStructBegin("");

	clValue.forEach((e: LooseType) => {
		writeValue(output, e[0], e[1], e[2]);
	});

	output.writeFieldStop();
	output.writeStructEnd();
	return;
}

function writeValue(
	output: LooseType,
	ftype: LooseType,
	fid: LooseType,
	val:
		| NestedArray
		| string
		| boolean
		| number
		| Buffer
		| [number, Array<LooseType>]
		| [number, number, object],
): void {
	if (val === undefined || val === null) {
		return;
	}
	switch (ftype) {
		case Thrift.Type.STRING:
			if (Buffer === val.constructor) {
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
			if (typeof val !== "number") {
				throw new TypeError(`ftype=${ftype}: value is not number`);
			}
			output.writeFieldBegin("", Thrift.Type.I64, fid);
			output.writeI64(val);
			output.writeFieldEnd();
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
			if (typeof val !== "boolean") {
				throw new TypeError(`ftype=${ftype}: value is not boolean`);
			}
			output.writeFieldBegin("", Thrift.Type.BOOL, fid);
			output.writeBool(val);
			output.writeFieldEnd();
			break;

		case Thrift.Type.STRUCT:
			if (!Array.isArray(val)) {
				throw new TypeError(`ftype=${ftype}: value is not struct`);
			}
			output.writeFieldBegin("", Thrift.Type.STRUCT, fid);
			writeStruct(output, val as NestedArray);
			output.writeFieldEnd();
			break;

		case Thrift.Type.MAP:
			if (typeof val !== "object") {
				throw new TypeError(`ftype=${ftype}: value is not map`);
			}
			val = val as [number, number, object];
			output.writeFieldBegin("", Thrift.Type.MAP, fid);
			output.writeMapBegin(val[0], val[1], Thrift.objectLength(val[2]));
			for (const kiter85 in val[2] as NestedArray) {
				if (Object.prototype.hasOwnProperty.call(val[2], kiter85)) {
					const viter86 = (val as LooseType)[2][kiter85];
					writeValue_(output, val[0], kiter85);
					writeValue_(output, val[1], viter86);
				}
			}
			output.writeMapEnd();
			output.writeFieldEnd();
			break;

		case Thrift.Type.LIST:
			if (!Array.isArray((val as Array<LooseType>)[1])) {
				throw new TypeError(`ftype=${ftype}: value is not list`);
			}
			val = val as [number, Array<LooseType>];
			output.writeFieldBegin("", Thrift.Type.LIST, fid);
			output.writeListBegin(
				val[0],
				(val[1] as NonNullable<NestedArray>).length,
			);
			for (const iter483 in val[1] as NestedArray) {
				if (Object.prototype.hasOwnProperty.call(val[1], iter483)) {
					writeValue_(output, val[0], (val as LooseType)[1][iter483]);
				}
			}
			output.writeListEnd();
			output.writeFieldEnd();
			break;
		default:
			break;
	}
}

function writeValue_(
	output: LooseType,
	ftype: LooseType,
	val: LooseType,
): void {
	switch (ftype) {
		case Thrift.Type.STRING:
			if (Buffer === val.constructor) {
				output.writeBinary(val);
			} else {
				if (typeof val !== "string") {
					throw new TypeError(`ftype=${ftype}: value is not string`);
				}
				output.writeString(val.toString());
			}
			output.writeString(val);
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
			writeStruct(output, val);
			break;

		default:
			break;
	}
}
