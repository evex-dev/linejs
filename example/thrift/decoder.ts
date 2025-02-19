import { Thrift } from "@evex/linejs/thrift";
import { Buffer } from "node:buffer";

// @ts-types="thrift-types"
import * as thrift from "thrift";

const thriftClient = new Thrift();
console.log(
    thriftClient.readThrift(
        Deno.readFileSync("./http-body.bin"),
        thrift.TCompactProtocol,
    ),
);
