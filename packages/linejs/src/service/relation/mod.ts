// For Relation (find user, etc)

import { LINEStruct, type ProtocolKey } from "../../thrift/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import type { ClientInitBase } from "../../core/types.ts";
import type { Client } from "../../core/mod.ts";
import type { BaseService } from "../types.ts";
export class RelationService implements BaseService {
    client: Client;
    protocolType: ProtocolKey = 4;
    requestPath = "/RE4";
    errorName = "RelationServiceError";
    constructor(client: Client) {
        this.client = client;
    }
}
