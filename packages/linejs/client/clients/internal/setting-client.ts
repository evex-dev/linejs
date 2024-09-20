// For Settings (settings, etc)

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import { RelationClient } from "./relation-client.ts";

export class SettingsClient extends RelationClient {
	public SettingsService_API_PATH = "/US4";
	public SettingsService_PROTOCOL_TYPE: ProtocolKey = 4;
}
