// For Talk (talk, group, etc)

import {
	type NestedArray,
	type ProtocolKey,
} from "../../libs/thrift/declares.ts";
import type * as LINETypes from "../../libs/thrift/line_types.ts";
import type { LooseType } from "../../entities/common.ts";
import { SquareClient } from "./square-client.ts";

export class TalkClient extends SquareClient {
	private TalkService_API_PATH = "/S4";
	private TalkService_PROTOCOL_TYPE: ProtocolKey = 4;
}
