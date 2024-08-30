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

function isBinary(str) {
	str = str.toString()
	const json = JSON.stringify(str)
	return json.search(/\\u/) !== -1
}

function readValue(input, ftype) {
	var Thrift = thrift.Thrift;
	if (ftype == Thrift.Type.STRUCT) {
		return readStruct(input);
	} else if (ftype == Thrift.Type.I32) {
		return input.readI32();
	} else if (ftype == Thrift.Type.I64) {
		return parseInt(input.readI64().buffer.toString("hex"), 16);
	} else if (ftype == Thrift.Type.STRING) {
		const bin = input.readBinary();
		if (isBinary(bin)) {
			return bin
		}else{
			return bin.toString()
		}
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
}

function _readThrift(data, Protocol = thrift.TCompactProtocol) {
	const bufTrans = new thrift.TFramedTransport(Buffer.from(data));
	const proto = new Protocol(bufTrans);
	const msg_info = proto.readMessageBegin();
	const tdata = readStruct(proto);
	proto.readMessageEnd();
	return { value: tdata[0], e: tdata[1], _info: msg_info };
}

export function readThrift(data, Protocol = thrift.TCompactProtocol) {
	return _readThrift(data, Protocol);
}

function TreadValue(input, ftype) {
	var Thrift = thrift.Thrift;
	if (ftype == Thrift.Type.STRUCT) {
		return TreadStruct(input);
	} else if (ftype == Thrift.Type.I32) {
		return input.readI32();
	} else if (ftype == Thrift.Type.I64) {
		return parseInt(input.readI64().buffer.toString("hex"), 16);
	} else if (ftype == Thrift.Type.STRING) {
		return input.readString();
	} else if (ftype == Thrift.Type.LIST) {
		let returnData = [];
		var _rtmp = input.readListBegin();
		var _size = _rtmp.size || 0;
		for (var _i = 0; _i < _size; ++_i) {
			var elem = null;
			elem = TreadValue(input, _rtmp.etype);
			returnData.push(elem);
		}
		input.readListEnd();
		return [_rtmp.etype, returnData];
	} else if (ftype == Thrift.Type.MAP) {
		let returnData = {};
		var _rtmp3384 = input.readMapBegin();
		var _size383 = _rtmp3384.size || 0;
		for (var _i385 = 0; _i385 < _size383; ++_i385) {
			var key386 = null;
			var val387 = null;
			key386 = TreadValue(input, _rtmp3384.ktype);
			val387 = TreadValue(input, _rtmp3384.vtype);
			returnData[key386] = val387;
		}
		input.readMapEnd();
		return [_rtmp3384.ktype, _rtmp3384.vtype, returnData];
	} else if (ftype == Thrift.Type.BOOL) {
		return input.readBool();
	} else if (ftype == Thrift.Type.DOUBLE) {
		return input.readDouble();
	} else {
		input.skip(ftype);
		return;
	}
}

function TreadStruct(input) {
	var Thrift = thrift.Thrift;
	var returnData = [];
	input.readStructBegin();
	var ret, ftype, fid;
	while (true) {
		ret = input.readFieldBegin();
		ftype = ret.ftype;
		fid = ret.fid;
		if (ftype == Thrift.Type.STOP) {
			break;
		}
		returnData.push([ftype, fid, TreadValue(input, ftype)]);
		input.readFieldEnd();
	}
	input.readStructEnd();
	return returnData;
}
export function TreadThrift(data, Protocol = thrift.TCompactProtocol) {
	const bufTrans = new thrift.TFramedTransport(Buffer.from(data));
	const proto = new Protocol(bufTrans);
	const msg_info = proto.readMessageBegin();
	const tdata = TreadStruct(proto);
	proto.readMessageEnd();
	return { value: tdata[0], e: tdata[1], _info: msg_info };
}
