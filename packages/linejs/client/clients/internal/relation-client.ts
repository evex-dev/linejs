// For Friend

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import type { LooseType } from "../../entities/common.ts";
import { E2EE } from "../e2ee/index.ts";

export class RelationClient extends E2EE {
	protected RelationService_API_PATH = "/RE4";
	protected RelationService_PROTOCOL_TYPE: ProtocolKey = 4;

	/**
	 * @description Add friend by mid.
	 */
	public async addFriendByMid(options: {
		mid: string;
		reference?: string;
		trackingMetaType?: number;
		trackingMetaHint?: string;
	}): Promise<LooseType> {
		const { mid, reference, trackingMetaType, trackingMetaHint } = {
			trackingMetaType: 5,
			...options,
		};
		return await this.request(
			[
				[8, 1, 0], // seq
				[11, 2, mid],
				[
					12,
					3,
					[
						[11, 1, reference],
						[12, 2, [[12, trackingMetaType, [[11, 1, trackingMetaHint]]]]],
					],
				],
			],
			"addFriendByMid",
			this.RelationService_PROTOCOL_TYPE,
			false,
			this.RelationService_API_PATH,
		);
	}
}
