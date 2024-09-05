// For Settings (settings, etc)

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import { E2EE } from "../e2ee/index.ts";

export class SettingsClient extends E2EE {
	protected SettingsService_API_PATH = "/US4";
	protected SettingsService_PROTOCOL_TYPE: ProtocolKey = 4;
}
