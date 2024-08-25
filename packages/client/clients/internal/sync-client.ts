// For Sync (sync, etc)
import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import type * as LINETypes from "../../libs/thrift/line_types.ts";
import { BaseClient } from "../base-client.ts";

export class SyncClient extends BaseClient {
	private SyncService_API_PATH = "/SYNC4";
	private SyncService_PROTOCOL_TYPE: ProtocolKey = 4;

	public async sync(
		limit: number = 100,
		revision: number = 0,
		globalRev: number = 0,
		individualRev: number = 0,
	): Promise<LINETypes.SyncResponse> {
		return await this.request(
			[
				[10, 1, revision],
				[8, 2, limit],
				[10, 3, globalRev],
				[10, 4, individualRev],
			],
			"sync",
			this.SyncService_PROTOCOL_TYPE,
			"SyncResponse",
			this.SyncService_API_PATH,
		);
	}
}
