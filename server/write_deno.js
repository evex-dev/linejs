import * as thrift from "npm:thrift@0.19.0"
import { ttypes } from "./line_types_deno.js"
import { Buffer } from "node:buffer"

export default function write(data) {
  let type, b;
  if (data.type == 0) {
    type = "Response"

  } else if (data.type == 1) {
    type = "Request"
  }
  let Ltype = data.name

  Ltype = Ltype.substr(0, 1).toUpperCase() + Ltype.substr(1) + type
  //data = data.slice(len + r)
  // Use frame transport to read
  const Transport = thrift.TBufferedTransport
  const Protocol = thrift.TCompactProtocol
  var myBuf = new Buffer([])
  var buftra = new Transport(myBuf, function (outBuf) {
    myBuf = Buffer.concat([myBuf, outBuf])
  })
  var myprot = new Protocol(buftra)

  // replace ChatMessageData with your own thrift structure
  var tdata = new ttypes[Ltype](data.value)

  // Write and flush buffers
  // The callback above will be called and fill myBuf
  tdata.write(myprot)
  myprot.flush()
  buftra.flush()
  myBuf = Buffer.concat([new Uint8Array([0x82,0x21,1,data.name.length]),Buffer.from(data.name),new Uint8Array([0x1c]), myBuf,new Uint8Array([0])])
  const writedBinary=new Uint8Array([...myBuf])
 
  try {
    //Deno.writeFile("./request.bin",writedBinary)
  } catch (error) {
    
  }
  return writedBinary
}
// Thrift encoded buffer is ready to use, save or transport

