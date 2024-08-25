// For Channel (channel, etc)

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import type * as LINETypes from "../../libs/thrift/line_types.ts";
import { SquareClient } from "./square-client.ts";

export class ChannelClient extends SquareClient {
	private ChannelService_API_PATH = "/CH3";
	private ChannelService_PROTOCOL_TYPE: ProtocolKey = 3;

	public async approveChannelAndIssueChannelToken(
		channelId: string = "1341209850",
	): Promise<LINETypes.ChannelToken> {
		return await this.direct_request(
			[[11, 1, channelId]],
			"approveChannelAndIssueChannelToken",
			this.ChannelService_PROTOCOL_TYPE,
			"ChannelToken",
			this.ChannelService_API_PATH,
		);
	}
}
