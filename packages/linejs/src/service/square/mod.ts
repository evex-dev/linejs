// For Square (chat, etc)

import { LINEStruct, type ProtocolKey } from "../../thrift/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import type { ClientInitBase } from "../../core/types.ts";
import type { Client } from "../../core/mod.ts";
import type { BaseService } from "../types.ts";
export class SquareService implements BaseService {
    client: Client;
    protocolType: ProtocolKey = 4;
    requestPath = "/SQ1";
    errorName = "SquareServiceError";
    constructor(client: Client) {
        this.client = client;
    }
}
