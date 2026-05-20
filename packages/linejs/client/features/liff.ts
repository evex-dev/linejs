// High-level LIFF adapter on top of base/service/liff/mod.ts.
import type { Client } from "../mod.ts";

export type LiffMessage =
	| LiffTextMessage
	| LiffStickerMessage
	| LiffImageMessage
	| LiffFlexMessage
	| LiffTemplateMessage
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| Record<string, any>;

export interface LiffTextMessage {
	type: "text";
	text: string;
	sentBy?: { label: string; iconUrl: string; linkUrl?: string };
}
export interface LiffStickerMessage {
	type: "sticker";
	packageId: string;
	stickerId: string;
}
export interface LiffImageMessage {
	type: "image";
	originalContentUrl: string;
	previewImageUrl: string;
}
export interface LiffFlexMessage {
	type: "flex";
	altText: string;
	contents: Record<string, unknown>;
}
export interface LiffTemplateMessage {
	type: "template";
	altText: string;
	template: Record<string, unknown>;
}

export function text(
	body: string,
	sentBy?: LiffTextMessage["sentBy"],
): LiffTextMessage {
	return sentBy ? { type: "text", text: body, sentBy } : { type: "text", text: body };
}

export function sticker(packageId: string, stickerId: string): LiffStickerMessage {
	return { type: "sticker", packageId, stickerId };
}

export function image(
	originalContentUrl: string,
	previewImageUrl: string = originalContentUrl,
): LiffImageMessage {
	return { type: "image", originalContentUrl, previewImageUrl };
}

export function flex(
	altText: string,
	contents: Record<string, unknown>,
): LiffFlexMessage {
	return { type: "flex", altText, contents };
}

export interface LiffClient {
	readonly defaultLiffId: string;
	setDefaultLiffId(liffId: string): void;
	getToken(opts: { chatMid?: string; liffId?: string; lang?: string }): Promise<string>;
	issueView(opts: {
		chatMid?: string;
		liffId?: string;
		lang?: string;
	}): Promise<import("@evex/linejs-types").LiffViewResponse>;
	issueSubView(
		...args: Parameters<
			import("../../base/service/liff/mod.ts").LiffService["issueSubLiffView"]
		>
	): ReturnType<
		import("../../base/service/liff/mod.ts").LiffService["issueSubLiffView"]
	>;
	shareMessages(
		to: string,
		messages: LiffMessage[],
		opts?: { liffId?: string; forceIssue?: boolean },
	): Promise<unknown>;
	shareMessage(
		to: string,
		message: LiffMessage,
		opts?: { liffId?: string; forceIssue?: boolean },
	): Promise<unknown>;
	readonly service: import("../../base/service/liff/mod.ts").LiffService;
}

class ClientLiff implements LiffClient {
	#client: Client;
	#liffId: string;
	constructor(client: Client) {
		this.#client = client;
		this.#liffId = client.base.liff.liffId;
	}
	get defaultLiffId(): string {
		return this.#liffId;
	}
	setDefaultLiffId(liffId: string): void {
		this.#liffId = liffId;
		this.#client.base.liff.liffId = liffId;
	}
	get service() {
		return this.#client.base.liff;
	}
	async getToken(opts: { chatMid?: string; liffId?: string; lang?: string }) {
		return await this.#client.base.liff.getLiffToken({
			chatMid: opts.chatMid,
			liffId: opts.liffId ?? this.#liffId,
			lang: opts.lang,
		});
	}
	issueView(opts: { chatMid?: string; liffId?: string; lang?: string }) {
		return this.#client.base.liff.issueLiffView({
			chatMid: opts.chatMid,
			liffId: opts.liffId ?? this.#liffId,
			lang: opts.lang,
		});
	}
	issueSubView(
		...args: Parameters<typeof this.service.issueSubLiffView>
	): ReturnType<typeof this.service.issueSubLiffView> {
		return this.service.issueSubLiffView(...args);
	}
	async shareMessages(
		to: string,
		messages: LiffMessage[],
		opts: { liffId?: string; forceIssue?: boolean } = {},
	) {
		return await this.#client.base.liff.sendLiff({
			to,
			messages: messages as never,
			forceIssue: opts.forceIssue,
		});
	}
	shareMessage(
		to: string,
		message: LiffMessage,
		opts?: { liffId?: string; forceIssue?: boolean },
	) {
		return this.shareMessages(to, [message], opts);
	}
}

export function createLiffClient(client: Client): LiffClient {
	return new ClientLiff(client);
}
