// For Settings (settings, etc)

import {
	type NestedArray,
	type ProtocolKey,
} from "../../libs/thrift/declares.ts";
import type * as LINETypes from "../../libs/thrift/line_types.ts";
import type { LooseType } from "../../entities/common.ts";
import { TalkClient } from "./talk-client.ts";

export class SettingsClient extends TalkClient {
	private SettingsService_API_PATH = "/US4";
	private SettingsService_PROTOCOL_TYPE: ProtocolKey = 4;
}
