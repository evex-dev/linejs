import * as thrift from "npm:thrift@0.19.0"
import { ttypes } from "./line_types_deno.js"
import { Buffer } from "node:buffer"

const path = prompt("file:/// path ")
console.log(`<${path}>`)
let data = await Deno.readFile(path)
data = [...data]
function readThrift(data) {
    let opt = 0;
    let type, r;
    let outType = -1;
    if (data[opt] != 0x82) {
        console.log("LINE Thriftではありません")
        return
    }
    if (data[1 + opt] == 0x41) {
        type = "Response"
        outType = 0
        r = 6 + opt
    } else if (data[1 + opt] == 0x21) {
        type = "Request"
        outType = 1
        r = 5 + opt
    } else {
        console.log("LINE Thriftではありません")
        return
    }
    let len = data[3 + opt]
    let Ltype = new TextDecoder().decode(new Uint8Array(data.slice(4 + opt, 4 + opt + len)))
    let Lname = Ltype
    Ltype = Ltype.substr(0, 1).toUpperCase() + Ltype.substr(1) + type
    data = data.slice(len + r)
    console.log(Ltype)
    // Use frame transport to read
    const Transport = thrift.TFramedTransport
    const Protocol = thrift.TCompactProtocol
    let b = Buffer.from(data)
    // packet.payload is the thrift encoded data we have received
    let bufTrans = new Transport(b)
    let myprot = new Protocol(bufTrans)
    let tdata = new ttypes[Ltype]()
    try {
        tdata.read(myprot)
    } catch (e) {
        console.log(e)
        console.log(tdata, myprot, bufTrans)
    }
    // Replace ChatMessageData with your own thrift structure
    return tdata, Lname,outType
}
let json = object2json(readThrift(data))


function object2json(data) {
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
            returnJson[e] = [...data[e]]
        } else {
            returnJson[e] = data[e]
        }
    })
    return returnJson
}
// Use the decoded data
Deno.writeTextFile("./result.json", JSON.stringify(json, null, 2))

export default function read(data) {
    return object2json(readThrift(data))
}