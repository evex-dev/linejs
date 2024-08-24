// For Talk (talk, group, etc)

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import { SquareClient } from "./square-client.ts";

export class TalkClient extends SquareClient {
	private TalkService_API_PATH = "/S4";
	private TalkService_PROTOCOL_TYPE: ProtocolKey = 4;
}
