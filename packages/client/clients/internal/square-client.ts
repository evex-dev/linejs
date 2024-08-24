// For Square (square, etc)

import type { ProtocolKey } from "../../libs/thrift/declares.ts";
import { LiffClient } from "./liff-client.ts";

export class SquareClient extends LiffClient {
	private SquareService_API_PATH = "/SQ1";
	private SquareService_PROTOCOL_TYPE: ProtocolKey = 4;

	private SquareLiveTalkService_API_PATH = "/SQLV1";
	private SquareLiveTalkService_PROTOCOL_TYPE: ProtocolKey = 4;
}
