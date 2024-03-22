import * as thrift from "npm:thrift@0.19.0"
import { ttypes } from "./line_types_deno.js"
import { Buffer } from "node:buffer"
/*
const path = "f2.bin"//prompt("file:/// path? ")
console.log(`<${path}>`)
let data = await Deno.readFile(path)
data = [...data]*/

function XreadX(input) {
    var Thrift = thrift.Thrift;
    var returnData = ["hey!"];
    input.readStructBegin();
    var ret, ftype, fid;
    try {
        while (true) {
            ret = input.readFieldBegin();
            ftype = ret.ftype;
            fid = ret.fid;
            if (ftype == Thrift.Type.STOP) {
                break;
            }
            returnData[fid] = POWERRRRR(input, ftype)
            input.readFieldEnd();
        } input.readStructEnd();
    } catch (error) {
        console.log(error, ret, input, returnData)
    }
    return returnData;
}
function POWERRRRR(input, ftype) {
    var Thrift = thrift.Thrift;
    if (ftype == Thrift.Type.STRUCT) {
        return XreadX(input)
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
        for (var _i = 0;
            _i < _size;
            ++_i) {
            var elem = null;
            elem = POWERRRRR(input, _rtmp.etype)
            returnData.push(elem);
        } input.readListEnd();
        return returnData
    } else if (ftype == Thrift.Type.MAP) {
        let returnData = {};
        var _rtmp3384 = input.readMapBegin();
        var _size383 = _rtmp3384.size || 0;
        for (var _i385 = 0;
            _i385 < _size383;
            ++_i385) {
            var key386 = null;
            var val387 = null;
            key386 = POWERRRRR(input, _rtmp3384.ktype);
            val387 = POWERRRRR(input, _rtmp3384.vtype);
            returnData[key386] = val387;
        } input.readMapEnd();
        return returnData
    } else if (ftype == Thrift.Type.BOOL) {
        return input.readBool();
    } else if (ftype == Thrift.Type.DOUBLE) {
        return input.readDouble();
    } else {
        console.log(fid,ftype,val,"unknown");
        input.skip(ftype);
        return
    }
    input.skip(ftype);
}

function readThrift(data) {
    let opt = 0;
    let type, r;
    let outType = -1;
    //console.log(new TextDecoder().decode(new Uint8Array(data)))
    if (data[opt] != 0x82) {
        console.log("LINE Thriftではありません:0x82", data)

        return
    }
    if (data[1 + opt] == 0x41) {
        type = "Response"
        outType = 0
        r = 6 + opt
    } else if (data[1 + opt] == 0x21) {
        type = "Request"
        outType = 1
        r = 4 + opt
    } else {
        console.log("LINE Thriftではありません:0x41or0x21")
        console.log(new TextDecoder().decode(data))
        return
    }
    let len = data[3 + opt]
    let Ltype = new TextDecoder().decode(new Uint8Array(data.slice(4 + opt, 4 + opt + len)))
    let Lname = Ltype
    Ltype = Ltype.substr(0, 1).toUpperCase() + Ltype.substr(1) + type
    data = data.slice(len + r)
    let tdata, myprot, bufTrans;
    try {
        // Use frame transport to read
        const Transport = thrift.TFramedTransport
        const Protocol = thrift.TCompactProtocol
        let b = Buffer.from(data)
        bufTrans = new Transport(b)
        myprot = new Protocol(bufTrans)
        tdata = new ttypes[Ltype]()
        try {
            tdata.read(myprot)
        } catch (e) {
            console.log(e)
            console.log(tdata, myprot, bufTrans)
        }
    } catch {
        const Transport = thrift.TFramedTransport
        const Protocol = thrift.TCompactProtocol
        let b = Buffer.from(data)
        bufTrans = new Transport(b)
        myprot = new Protocol(bufTrans)
        try {
            tdata = XreadX(myprot)
        } catch (e) {
            console.log(e)
            console.log(tdata, myprot, bufTrans)
        }
        outType = outType + 2
    }
    return { value: tdata, name: Lname, type: outType.toString() }
}
export function object2json(data) {
    const keys = Object.keys(data)
    let returnJson = {}
    if (data.forEach) {
        returnJson = []
    }
    keys.forEach((e) => {
        if (!(data[e])) {
        } else if (typeof (data[e]) == 'object') {
            returnJson[e] = object2json(data[e])
        } else if (typeof (data[e]) == 'Buffer') {
            var _int = 0
            var b = data[e].reverse()
            b.forEach((e, i) => { _int += e * (256 ** i) })
            returnJson[e] = _int
        } else {
            returnJson[e] = data[e]
        }
    })
    return returnJson
}
// Use the decoded data
//Deno.writeTextFile("./result.json",JSON.stringify(json,null,2))

export default function read(data, type,b) {
    if (type = 1) {
        return object2json(readThrift(data))
    } else if (type = 3) {
        const Transport = thrift.TFramedTransport
        const Protocol = thrift.TCompactProtocol
        let b = Buffer.from(data)
        let tdata;
        bufTrans = new Transport(b)
        myprot = new Protocol(bufTrans)
        try {
            tdata = XreadX(myprot)
        } catch (e) {
            console.log(e)
            console.log(tdata, myprot, bufTrans)
        }
        outType = outType + 2
        return object2json({ value: tdata, name: Lname, type: outType.toString() })
    } else if (type = 5) {
        return data
    }
}