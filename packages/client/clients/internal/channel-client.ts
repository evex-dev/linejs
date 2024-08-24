// For Channel (channel, etc)

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import { SquareClient } from "./square-client.ts";

export class ChannelClient extends SquareClient {
	private ChannelService_API_PATH = "/CH3";
	private ChannelService_PROTOCOL_TYPE: ProtocolKey = 3;
}
