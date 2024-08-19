import * as thrift from "npm:thrift@0.20.0";
import { Buffer } from "node:buffer";

function readStruct(input) {
	var Thrift = thrift.Thrift;
	var returnData = {};
	input.readStructBegin();
	var ret, ftype, fid;
	while (true) {
		ret = input.readFieldBegin();
		ftype = ret.ftype;
		fid = ret.fid;
		if (ftype == Thrift.Type.STOP) {
			break;
		}
		returnData[fid] = readValue(input, ftype);
		input.readFieldEnd();
	}
	input.readStructEnd();
	return returnData;
}
function readValue(input, ftype) {
	var Thrift = thrift.Thrift;
	if (ftype == Thrift.Type.STRUCT) {
		return readStruct(input);
	} else if (ftype == Thrift.Type.I32) {
		return input.readI32();
	} else if (ftype == Thrift.Type.I64) {
		return input.readI64();
	} else if (ftype == Thrift.Type.STRING) {
		return input.readString();
	} else if (ftype == Thrift.Type.LIST) {
		let returnData = [];
		var _rtmp = input.readListBegin();
		var _size = _rtmp.size || 0;
		for (var _i = 0; _i < _size; ++_i) {
			var elem = null;
			elem = readValue(input, _rtmp.etype);
			returnData.push(elem);
		}
		input.readListEnd();
		return returnData;
	} else if (ftype == Thrift.Type.MAP) {
		let returnData = {};
		var _rtmp3384 = input.readMapBegin();
		var _size383 = _rtmp3384.size || 0;
		for (var _i385 = 0; _i385 < _size383; ++_i385) {
			var key386 = null;
			var val387 = null;
			key386 = readValue(input, _rtmp3384.ktype);
			val387 = readValue(input, _rtmp3384.vtype);
			returnData[key386] = val387;
		}
		input.readMapEnd();
		return returnData;
	} else if (ftype == Thrift.Type.BOOL) {
		return input.readBool();
	} else if (ftype == Thrift.Type.DOUBLE) {
		return input.readDouble();
	} else {
		input.skip(ftype);
		return;
	}
	input.skip(ftype);
}

function readThrift(data, Protocol = thrift.TCompactProtocol) {
	const bufTrans = new thrift.TFramedTransport(Buffer.from(data));
	const proto = new Protocol(bufTrans);
	const msg_info = proto.readMessageBegin();
	const tdata = readStruct(proto);
	proto.readMessageEnd();
	return { value: tdata[0], e: tdata[1], _info: msg_info };
}
function object2json(data) {
	const keys = Object.keys(data);
	let returnJson = {};
	if (data.forEach) {
		returnJson = [];
	}
	keys.forEach((e) => {
		if ((data[e]) === undefined) {
		} else if (data[e].buffer) {
			returnJson[e] = parseInt(data[e].buffer.toString("hex"), 16);
		} else if (typeof (data[e]) == "object") {
			returnJson[e] = object2json(data[e]);
		} else {
			returnJson[e] = data[e];
		}
	});
	return returnJson;
}
export default function read(data, Protocol = thrift.TCompactProtocol) {
	return object2json(readThrift(data, Protocol));
}
