import * as thrift from "npm:thrift@0.19.0"
import { ttypes } from "./line_types_deno.js"
import { Buffer } from "node:buffer"
var Thrift = thrift.Thrift;


export default function write(data) {
  let type, b, writedBinary;
  if (data.type == 0||data.type == 1) {
    if (data.type == 0) {
      type = "Response"

    } else if (data.type == 1) {
      type = "Request"
    }
    let Ltype = data.name

    Ltype = Ltype.substr(0, 1).toUpperCase() + Ltype.substr(1) + type
    //data = data.slice(len + r)
    const Transport = thrift.TBufferedTransport
    const Protocol = thrift.TCompactProtocol
    var myBuf = new Buffer([])
    var buftra = new Transport(myBuf, function (outBuf) {
      myBuf = Buffer.concat([myBuf, outBuf])
    })
    var myprot = new Protocol(buftra)
    var tdata = new ttypes[Ltype](data.value)

    tdata.write(myprot)
    myprot.flush()
    buftra.flush()
    myBuf = Buffer.concat([new Uint8Array([0x82, 0x21, 1, data.name.length]), Buffer.from(data.name), new Uint8Array([0x1c]), myBuf, new Uint8Array([0])])
    writedBinary = new Uint8Array([...myBuf])

  } else {
    if (data.type == 3) {
      type = "CHRLINE_REQ"
      console.log(type);
      const Transport = thrift.TBufferedTransport
    const Protocol = thrift.TCompactProtocol
    var myBuf = new Buffer([])
    var buftra = new Transport(myBuf, function (outBuf) {
      myBuf = Buffer.concat([myBuf, outBuf])
    })
    var myprot = new Protocol(buftra)
    XwriteX(myprot,data.value)
    myprot.flush()
    buftra.flush()
    myBuf = Buffer.concat([new Uint8Array([0x82, 0x21, 1, data.name.length]), Buffer.from(data.name), new Uint8Array([0x1c]), myBuf, new Uint8Array([0])])
    writedBinary = new Uint8Array([...myBuf])
    }
  }

  try {
    //Deno.writeFile("./request.bin",writedBinary)
  } catch (error) {

  }
  return writedBinary
}
// Thrift encoded buffer is ready to use, save or transport

function XwriteX(output, inCHRLINE=[]) {
  output.writeStructBegin('');

  inCHRLINE.forEach(e=>{
    POWERRRR(output,e[0],e[1],e[2])
  })

  output.writeFieldStop();
  output.writeStructEnd();
  return;
};
function POWERRRR(output, ftype, fid, val) {
  switch (ftype) {
    case Thrift.Type.STRING:
      output.writeFieldBegin('', Thrift.Type.STRING, fid);
      output.writeString(val);
      output.writeFieldEnd();
      break;

    case Thrift.Type.DOUBLE:
      output.writeFieldBegin('', Thrift.Type.DOUBLE, fid);
      output.writeDouble(val);
      output.writeFieldEnd();
      break;

    case Thrift.Type.I64:
      output.writeFieldBegin('', Thrift.Type.I64, fid);
      output.writeI64(val);
      output.writeFieldEnd();
      break;

    case Thrift.Type.I32:
      output.writeFieldBegin('', Thrift.Type.I32, fid);
      output.writeI32(val);
      output.writeFieldEnd();
      break;

    case Thrift.Type.BOOL:
      output.writeFieldBegin('', Thrift.Type.BOOL, fid);
      output.writeBool(val);
      output.writeFieldEnd();
      break;

    case Thrift.Type.STRUCT:
      output.writeFieldBegin('', Thrift.Type.STRUCT, fid);
      XwriteX(output, val)
      output.writeFieldEnd();
      break;

      case Thrift.Type.MAP:
        output.writeFieldBegin('', Thrift.Type.MAP, fid);
        output.writeMapBegin(val[0], val[1], Thrift.objectLength(val[2]));
        for (var kiter85 in val[2]) {
            if (val[2].hasOwnProperty(kiter85)) {
                var viter86 = val[2][kiter85];
                POWER(output,val[0],kiter85);
                POWER(output,val[1],viter86);
            }
        } output.writeMapEnd();
        output.writeFieldEnd();
        break;

    default:
      break;
  }
}

function POWER(output, ftype, val) {
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
      XwriteX(output, val)
      break;

    default:
      break;
  }
}