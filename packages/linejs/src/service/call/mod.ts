// For Call (call, etc)

import { LINEStruct, type ProtocolKey } from "../../thrift/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import type { ClientInitBase } from "../../core/types.ts";
import type { Client } from "../../core/mod.ts";
import type { BaseService } from "../types.ts";
export class CallService implements BaseService {
    client: Client;
    protocolType: ProtocolKey = 4;
    requestPath = "/V4";
    errorName = "CallServiceError";
    constructor(client: Client) {
        this.client = client;
    }
}
