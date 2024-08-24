// For Liff (liff, etc)

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import { SyncClient } from "./sync-client.ts";

export class LiffClient extends SyncClient {
	private LiffService_API_PATH = "/LIFF1";
	private LiffService_PROTOCOL_TYPE: ProtocolKey = 4;
}
