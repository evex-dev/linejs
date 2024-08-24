import * as thrift from "npm:thrift@0.20.0";
import { Buffer } from "node:buffer";
const Thrift = thrift.Thrift;

export function writeThrift(value, name, Protocol) {
	const Transport = thrift.TBufferedTransport;
	let myBuf = Buffer.from([]);
	const buftra = new Transport(myBuf, function (outBuf) {
		myBuf = Buffer.concat([myBuf, outBuf]);
	});
	const myprot = new Protocol(buftra);
	writeStruct(myprot, value);
	myprot.flush();
	buftra.flush();
	if (myBuf.length === 1 && myBuf[0] === 0) {
		myBuf = [];
	}
	const writedBinary = new Uint8Array([
		...Protocol.genHeader(name),
		...myBuf,
		0,
	]);
	return writedBinary;
}
// Thrift encoded buffer is ready to use, save or transport

function writeStruct(output, clValue = []) {
	output.writeStructBegin("");

	clValue.forEach((e) => {
		writeValue(output, e[0], e[1], e[2]);
	});

	output.writeFieldStop();
	output.writeStructEnd();
	return;
}
function writeValue(output, ftype, fid, val) {
	if (val === undefined || val === null) {
		return;
	}
	switch (ftype) {
		case Thrift.Type.STRING:
			output.writeFieldBegin("", Thrift.Type.STRING, fid);
			output.writeString(val);
			output.writeFieldEnd();
			break;

		case Thrift.Type.DOUBLE:
			output.writeFieldBegin("", Thrift.Type.DOUBLE, fid);
			output.writeDouble(val);
			output.writeFieldEnd();
			break;

		case Thrift.Type.I64:
			output.writeFieldBegin("", Thrift.Type.I64, fid);
			output.writeI64(val);
			output.writeFieldEnd();
			break;

		case Thrift.Type.I32:
			output.writeFieldBegin("", Thrift.Type.I32, fid);
			output.writeI32(val);
			output.writeFieldEnd();
			break;

		case Thrift.Type.BOOL:
			output.writeFieldBegin("", Thrift.Type.BOOL, fid);
			output.writeBool(val);
			output.writeFieldEnd();
			break;

		case Thrift.Type.STRUCT:
			output.writeFieldBegin("", Thrift.Type.STRUCT, fid);
			writeStruct(output, val);
			output.writeFieldEnd();
			break;

		case Thrift.Type.MAP:
			output.writeFieldBegin("", Thrift.Type.MAP, fid);
			output.writeMapBegin(val[0], val[1], Thrift.objectLength(val[2]));
			for (const kiter85 in val[2]) {
				if (Object.prototype.hasOwnProperty.call(val[2], kiter85)) {
					const viter86 = val[2][kiter85];
					writeValue_(output, val[0], kiter85);
					writeValue_(output, val[1], viter86);
				}
			}
			output.writeMapEnd();
			output.writeFieldEnd();
			break;

		case Thrift.Type.LIST:
			output.writeFieldBegin("", Thrift.Type.LIST, fid);
			output.writeListBegin(val[0], val[1].length);
			for (const iter483 in val[1]) {
				if (Object.prototype.hasOwnProperty.call(val[1], iter483)) {
					writeValue_(output, val[0], val[1][iter483]);
				}
			}
			output.writeListEnd();
			output.writeFieldEnd();
			break;
		default:
			console.log(fid, ftype, val, "unknown");
			break;
	}
}

function writeValue_(output, ftype, val) {
	switch (ftype) {
		case Thrift.Type.STRING:
			output.writeString(val);
			break;

		case Thrift.Type.DOUBLE:
			output.writeDouble(val);
			break;

		case Thrift.Type.I64:
			output.writeI64(val);
			break;

		case Thrift.Type.I32:
			output.writeI32(val);
			break;

		case Thrift.Type.BOOL:
			output.writeBool(val);
			break;

		case Thrift.Type.STRUCT:
			writeStruct(output, val);
			break;

		default:
			console.log(fid, ftype, val, "unknown");
			break;
	}
}
