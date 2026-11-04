import { readFileSync } from "node:fs";
import { Thrift } from "@evex-dev/linejs/thrift";
import { Buffer } from "node:buffer";

// @ts-types="thrift-types"
import * as thrift from "thrift";

const thriftClient = new Thrift();
console.log(thriftClient.readThrift(readFileSync("./http-body.bin"), thrift.TCompactProtocol));
