import type { Client } from "../core/mod.ts";
import type { ProtocolKey } from "../thrift/mod.ts";

export interface BaseService {
    client: Client;
    protocolType: ProtocolKey;
    requestPath: string;
    errorName: string;
}
