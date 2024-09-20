// For Liff (liff, etc)
import { JSDOM } from "npm:jsdom@25.0.0";
import type { NestedArray, ProtocolKey } from "../../libs/thrift/declares.ts";
import type { LooseType } from "../../entities/common.ts";
import { BaseClient } from "../base-client.ts";
import type * as LINETypes from "@evex/linejs-types";

export class LiffClient extends BaseClient {
	protected static readonly LINE_LIFF_ENDPOINT =
		"https://api.line.me/message/v3/share";
	protected static readonly CONSENT_API_URL =
		"https://access.line.me/dialog/api/permissions";
	protected static readonly AUTH_CONSENT_URL =
		"https://access.line.me/oauth2/v2.1/authorize/consent";
	protected liff_token_cache: { [key: string]: string } = {};
	public LiffService_API_PATH = "/LIFF1";
	public LiffService_PROTOCOL_TYPE: ProtocolKey = 4;
	protected liffId = "1562242036-RW04okm";

	protected getToType(mid: string): number | null {
		const typeMapping: { [key: string]: number } = {
			u: 0,
			r: 1,
			c: 2,
			s: 3,
			m: 4,
			p: 5,
			v: 6,
		};
		return typeMapping[mid[0]] ?? null;
	}

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
			if (["u", "c", "r"].includes(chatMid[0])) {
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

	/**
	 * @description Gets the LiffToken by liffId and chatMid with consent.
	 */
	public async getLiffToken(options: {
		chatMid?: string;
		liffId: string;
		lang?: string;
		tryConsent?: boolean;
	}): Promise<string> {
		const { chatMid, liffId, lang, tryConsent } = {
			lang: "ja_JP",
			tryConsent: true,
			...options,
		};
		try {
			const liff = await this.issueLiffView({
				liffId,
				chatMid,
				lang,
			});
			return liff[3];
		} catch (e) {
			this.log("liff-error", { ...e.data });
			if (e.data.code === 3 && tryConsent) {
				const data: LINETypes.LiffException = e.data;
				const payload = data.payload;
				const consentRequired = payload.consentRequired;
				const channelId = consentRequired.channelId;
				const consentUrl = consentRequired.consentUrl;
				const toType = chatMid && this.getToType(chatMid);
				let hasConsent = false;

				if (channelId && consentUrl) {
					if (toType === 4 || this.system?.device === "DESKTOPWIN") {
						hasConsent = await this.tryConsentAuthorize(consentUrl);
					} else {
						hasConsent = await this.tryConsentLiff(channelId);
					}
					if (hasConsent) {
						options.tryConsent = false;
						return this.getLiffToken(options);
					}
				}
			}
			throw new Error(
				`Failed to get LiffToken: ${liffId}${chatMid ? "@" + chatMid : ""}`,
			);
		}
	}

	/**
	 * @description Send the LiffMessages.
	 */
	public async sendLiff(options: {
		to: string;
		messages: { type: string; text?: string }[];
		tryConsent?: boolean;
		forceIssue?: boolean;
	}): Promise<LooseType> {
		let token: string;
		const {
			to,
			messages,
			tryConsent: _tryConsent,
			forceIssue,
		} = {
			tryConsent: true,
			forceIssue: false,
			...options,
		};
		if (!this.liff_token_cache[to] || forceIssue) {
			token = await this.getLiffToken({ chatMid: to, liffId: this.liffId });
		} else {
			token = this.liff_token_cache[to];
		}

		const liffHeaders = {
			Accept: "application/json, text/plain, */*",
			"User-Agent":
				"Mozilla/5.0 (Linux; Android 4.4.2; G730-U00 Build/JLS36C) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36 Line/9.8.0",
			"Accept-Encoding": "gzip, deflate",
			"Accept-Language": "zh-TW,zh;q=0.9",
			Authorization: `Bearer ${token}`,
			"content-type": "application/json",
		};
		const payload = JSON.stringify({ messages });
		const response = await fetch("https://api.line.me/message/v3/share", {
			method: "POST",
			body: payload,
			headers: liffHeaders,
		});

		if (!response.ok) {
			throw new Error(`Failed to send Liff message: ${response.statusText}`);
		}

		const responseBody = await response.json();
		return responseBody;
	}

	private async tryConsentLiff(
		channelId: string,
		referer?: string,
	): Promise<boolean> {
		const payload = JSON.stringify({ on: ["P", "CM"], off: [] });
		const headers: Record<string, string> = {
			"X-LINE-ChannelId": channelId,
			"X-LINE-Access": this.metadata?.authToken as string,
			"User-Agent":
				"Mozilla/5.0 (Linux; Android 8.0.1; SAMSUNG Realise/DeachSword; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/56.0.2924.87 Mobile Safari/537.36",
			"Content-Type": "application/json",
			"X-Line-Application": this.system?.type as string,
			"X-Requested-With": "XMLHttpRequest",
			"Accept-Language": "ja-JP,en-US;q=0.8",
			...(referer ? { referer } : {}),
		};
		const response = await fetch(LiffClient.CONSENT_API_URL, {
			method: "POST",
			body: payload,
			headers,
		});
		return response.ok;
	}

	private async tryConsentAuthorize(
		consentUrl: string,
		allPermission: string[] = ["P", "CM"],
		approvedPermission: string[] = ["P", "CM"],
	): Promise<boolean> {
		const headers: Record<string, string> = {
			"X-Line-Access": this.metadata?.authToken as string,
			"User-Agent":
				this.system?.device === "IOS"
					? `Mozilla/5.0 (iPhone; CPU iPhone OS ${this.system.systemVersion} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari Line/${this.system.appVersion}`
					: "Mozilla/5.0 (Linux; Android 8.0.1; SAMSUNG Realise/LineJS; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/56.0.2924.87 Mobile Safari/537.36",
			"X-Line-Application": this.system?.type as string,
		};

		const response = await fetch(consentUrl, { method: "GET", headers });
		if (response.ok) {
			const text = await response.text();
			const consentResponse = new JSDOM(text).dom.window.document;
			const channelId =
				consentResponse
					.querySelector('meta[name="channelId"]')
					?.getAttribute("content") ?? null;
			const csrfToken =
				consentResponse
					.querySelector('meta[name="csrfToken"]')
					?.getAttribute("content") ?? null;

			if (channelId && csrfToken) {
				const payload = new URLSearchParams({
					allPermission: JSON.stringify(allPermission),
					approvedPermission: JSON.stringify(approvedPermission),
					channelId,
					__csrf: csrfToken,
					__WLS: "",
					addFriendMode: "ALREADY_FRIENDED_MODE",
					addFriend: "true",
					allow: "true",
				});

				const authResponse = await fetch(LiffClient.AUTH_CONSENT_URL, {
					method: "POST",
					body: payload.toString(),
					headers,
				});

				return authResponse.ok;
			}
		}
		return false;
	}
}
