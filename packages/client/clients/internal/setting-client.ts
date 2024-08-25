// For Settings (settings, etc)

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import { TalkClient } from "./talk-client.ts";

export class SettingsClient extends TalkClient {
	private SettingsService_API_PATH = "/US4";
	private SettingsService_PROTOCOL_TYPE: ProtocolKey = 4;
}
