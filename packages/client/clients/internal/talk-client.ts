// For Talk (talk, group, etc)

import type { NestedArray, ProtocolKey } from "../../libs/thrift/declares.ts";
import type * as LINETypes from "../../libs/thrift/line_types.ts";
import type { LooseType } from "../../entities/common.ts";
import { SquareClient } from "./square-client.ts";

export class TalkClient extends SquareClient {
	private TalkService_API_PATH = "/S4";
	private TalkService_PROTOCOL_TYPE: ProtocolKey = 4;

	public async sendMessage(
		to: string,
		text: string | null,
		contentType: number = 0,
		contentMetadata: LooseType = {},
		relatedMessageId: string | null = null,
		location: LINETypes.Location | null = null,
		chunk: string[] | null = null,
	): Promise<LINETypes.SendMessageResponse> {
		const message: NestedArray = [
			[11, 2, to],
			[10, 5, 0], // createdTime
			[10, 6, 0], // deliveredTime
			[2, 14, false], // hasContent
			[8, 15, contentType],
			[13, 18, [11, 11, contentMetadata]],
			[3, 19, 0], // sessionId
		];

		if (text !== null) {
			message.push([11, 10, text]);
		}

		if (location !== null) {
			const locationObj = [
				[11, 1, location.title || "LINEJS"],
				[11, 2, location.address || "https://github.com/evex-dev/linejs"],
				[4, 3, location.latitude || 0],
				[4, 4, location.longitude || 0],
				[11, 6, location.categoryId || "PC0"],
				[8, 7, location.provider || 2],
			];
			message.push([12, 11, locationObj]);
		}

		if (chunk !== null) {
			message.push([15, 20, [11, chunk]]);
		}

		if (relatedMessageId !== null) {
			message.push([11, 21, relatedMessageId]);
			message.push([8, 22, 3]); // messageRelationType; FORWARD(0), AUTO_REPLY(1), SUBORDINATE(2), REPLY(3);
			message.push([8, 24, 1]);
		}
		return await this.direct_request(
			[
				[8, 1, 0],
				[12, 2, message],
			],
			"sendMessage",
			this.TalkService_PROTOCOL_TYPE,
			"Message",
			this.TalkService_API_PATH,
		);
	}
}
