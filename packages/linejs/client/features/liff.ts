/**
 * High-level LIFF helpers built on top of the hand-written
 * {@link "../../base/service/liff/mod.ts" | LiffService} RPC layer.
 *
 * The base \`LiffService\` already covers the wire surface (issueLiffView /
 * getLiffToken / sendLiff / sub-LIFF / consent flow); this module is the
 * ergonomic adapter for it on \`Client\`.  Two motivations:
 *
 * 1. Save callers from having to know the LiffService's token-cache and
 *    consent retry mechanics.  \`client.liff.shareMessages(chatMid, [...])\`
 *    does what 90% of bots want with one call.
 * 2. Provide typed builders for the most common LINE Messaging-API
 *    message objects (text, sticker, image) so callers don't have to
 *    hand-roll the JSON.
 */
import type { Client } from "../mod.ts";

/** A LINE Messaging-API message payload, in the JSON shape accepted by
 *  the LIFF share endpoint (`/message/v3/share`).  The full schema is
 *  documented at https://developers.line.biz/en/reference/messaging-api/.
 *  This type is intentionally loose because LINE keeps extending it. */
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

/** Build a plain-text LIFF message.  Optional `sentBy` adds the
 *  "shared by X" badge LIFF apps can attach. */
export function text(
	body: string,
	sentBy?: LiffTextMessage["sentBy"],
): LiffTextMessage {
	return sentBy ? { type: "text", text: body, sentBy } : { type: "text", text: body };
}

/** Build a sticker LIFF message. */
export function sticker(packageId: string, stickerId: string): LiffStickerMessage {
	return { type: "sticker", packageId, stickerId };
}

/** Build an image LIFF message.  `previewImageUrl` defaults to the
 *  original-content URL when not supplied. */
export function image(
	originalContentUrl: string,
	previewImageUrl: string = originalContentUrl,
): LiffImageMessage {
	return { type: "image", originalContentUrl, previewImageUrl };
}

/** Build a Flex Message.  `contents` must follow LINE's Flex JSON. */
export function flex(
	altText: string,
	contents: Record<string, unknown>,
): LiffFlexMessage {
	return { type: "flex", altText, contents };
}

export interface LiffClient {
	/** The bot's default LIFF id, used when callers don't pass one. */
	readonly defaultLiffId: string;
	/** Override the default LIFF id (does not persist across reloads). */
	setDefaultLiffId(liffId: string): void;
	/** Mints a LIFF access token for a given chat + LIFF app id.
	 *  Handles consent retry under the hood. */
	getToken(opts: { chatMid?: string; liffId?: string; lang?: string }): Promise<string>;
	/** Sends one or more LIFF messages to a chat via the LIFF share
	 *  endpoint.  Returns the raw server response so callers can read
	 *  `sentMessages[]` if they need the assigned message ids. */
	shareMessages(
		to: string,
		messages: LiffMessage[],
		opts?: { liffId?: string; forceIssue?: boolean },
	): Promise<unknown>;
	/** Single-message convenience.  Equivalent to
	 *  `shareMessages(to, [message], opts)`. */
	shareMessage(
		to: string,
		message: LiffMessage,
		opts?: { liffId?: string; forceIssue?: boolean },
	): Promise<unknown>;
	/** Lower-level access to the LiffService for callers who need its
	 *  full surface (sub-LIFF, getLiffViewWithoutUserContext, etc.). */
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

/** Construct the `Client.liff` adapter.  Not user-facing — the Client
 *  class instantiates this lazily. */
export function createLiffClient(client: Client): LiffClient {
	return new ClientLiff(client);
}
