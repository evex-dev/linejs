// For Sync (sync, etc)

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import { BaseClient } from "../base-client.ts";

export class SyncClient extends BaseClient {
	private SyncService_API_PATH = "/SYNC4";
	private SyncService_PROTOCOL_TYPE: ProtocolKey = 4;
}
