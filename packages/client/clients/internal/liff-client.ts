// For Liff (liff, etc)

import type { NestedArray, ProtocolKey } from "../../libs/thrift/declares.ts";
import type { LooseType } from "../../entities/common.ts";
import { SyncClient } from "./sync-client.ts";

export class LiffClient extends SyncClient {
	private LiffService_API_PATH = "/LIFF1";
	private LiffService_PROTOCOL_TYPE: ProtocolKey = 4;

	/**
	 * @description Gets the LiffToken by liffId and chatMid.
	 */
	public async issueLiffView(options: {
		chatMid?: string;
		liffId: string;
		lang?: string;
	}): Promise<LooseType> {
		const { chatMid, liffId, lang } = {
			lang: "ja_JP",
			...options,
		};

		let context: NestedArray = [12, 1, []];
		let chaLINETypes;
		let chat;
		if (chatMid) {
			chat = [11, 1, chatMid];
			if (chatMid[0] in ["u", "c", "r"]) {
				chaLINETypes = 2;
			} else {
				chaLINETypes = 3;
			}
			context = [12, chaLINETypes, [chat]];
		}
		return await this.request(
			[
				[11, 1, liffId],
				[12, 2, [context]],
				[11, 3, lang],
			],
			"issueLiffView",
			this.LiffService_PROTOCOL_TYPE,
			true,
			this.LiffService_API_PATH,
		);
	}
}
