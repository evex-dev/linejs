// For Settings (settings, etc)

import type { ProtocolKey } from "@evex/linejs-types/declares";
import { RelationClient } from "./relation-client.ts";

export class SettingsClient extends RelationClient {
	protected SettingsService_API_PATH = "/US4";
	protected SettingsService_PROTOCOL_TYPE: ProtocolKey = 4;
}
