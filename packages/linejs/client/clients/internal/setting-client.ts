// For Settings (settings, etc)

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import { RelationClient } from "./relation-client.ts";

export class SettingsClient extends RelationClient {
	protected SettingsService_API_PATH = "/US4";
	protected SettingsService_PROTOCOL_TYPE: ProtocolKey = 4;
}
