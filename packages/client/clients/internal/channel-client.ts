// For Channel (channel, etc)

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import type * as LINETypes from "../../libs/thrift/line_types.ts";
import { SquareClient } from "./square-client.ts";

export class ChannelClient extends SquareClient {
	protected ChannelService_API_PATH = "/CH3";
	protected ChannelService_PROTOCOL_TYPE: ProtocolKey = 3;

	/**
	 * @description Gets the ChannelToken by channelId.\
	 * channelIds:
	 * - linevoom: 1341209850
	 */
	public async approveChannelAndIssueChannelToken(options: {
		channelId: string;
	}): Promise<LINETypes.ChannelToken> {
		const { channelId } = {
			...options,
		};
		return await this.direct_request(
			[[11, 1, channelId]],
			"approveChannelAndIssueChannelToken",
			this.ChannelService_PROTOCOL_TYPE,
			"ChannelToken",
			this.ChannelService_API_PATH,
		);
	}
}
