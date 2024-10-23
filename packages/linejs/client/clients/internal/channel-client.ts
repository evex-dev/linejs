// For Channel (channel, etc)

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import type * as LINETypes from "@evex/linejs-types";
import { SquareClient } from "./square-client.ts";

export class ChannelClient extends SquareClient {
	public ChannelService_API_PATH = "/CH3";
	public ChannelService_PROTOCOL_TYPE: ProtocolKey = 3;

	/**
	 * @description Gets the ChannelToken by channelId.\
	 * channelIds:
	 * - linevoom: 1341209850
	 */
	public approveChannelAndIssueChannelToken(options: {
		channelId: string;
	}): Promise<LINETypes.ChannelToken> {
		const { channelId } = {
			...options,
		};
		return this.direct_request(
			[[11, 1, channelId]],
			"approveChannelAndIssueChannelToken",
			this.ChannelService_PROTOCOL_TYPE,
			"ChannelToken",
			this.ChannelService_API_PATH,
		);
	}
}
