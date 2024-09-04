// For Settings (settings, etc)

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import { E2EE } from "../e2ee/index.ts";

export class SettingsClient extends E2EE {
	private SettingsService_API_PATH = "/US4";
	private SettingsService_PROTOCOL_TYPE: ProtocolKey = 4;
}
