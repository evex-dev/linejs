import type { BaseClient } from "../core/mod.ts";
import type { ProtocolKey } from "../thrift/mod.ts";

export interface BaseService {
	client: BaseClient;
	protocolType: ProtocolKey;
	requestPath: string;
	errorName: string;
}
