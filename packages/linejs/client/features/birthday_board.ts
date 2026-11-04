/** Birthday Board REST API observed in the LINE Android client. */
import type { Client } from "../mod.ts";
import { voomRest, type VoomRestResponse, VoomRoutingPrefix } from "./voom.ts";

/**
 * Birthday Board requests authenticate with a TIMELINE channel token minted
 * via approveChannelAndIssueChannelToken (smali ce6/a.g: MYHOME_RENEWAL and
 * TIMELINE share pswitch_3 -> c() -> channel 1341209850/9950 path).
 * issueChannelToken tokens are rejected (401) and the primary access token is
 * rejected (403) on the /hm and /tl BDB routes.
 */
const BIRTHDAY_CHANNEL_ID = "1341209950";

export const BirthdayBoardEndpoints = {
	boardId: "/api/v1/home/getBirthdayBoardId.json",
	board: "/api/v1/bdb/board/get",
	cards: "/api/v1/bdb/card/list",
	celebrations: "/api/v1/bdb/celebrate/list",
	cardLikes: "/api/v1/bdb/card/like/list",
	cardTemplates: "/api/v1/bdb/template/card/list",
	createCard: "/api/v1/bdb/card/create",
	updateCard: "/api/v1/bdb/card/update",
	deleteCard: "/api/v1/bdb/card/delete",
	deleteBoard: "/api/v1/bdb/board/delete",
	updateReadPermission: "/api/v1/bdb/board/update/readPermission",
	createCardLike: "/api/v1/bdb/card/like/create",
	cancelCardLike: "/api/v1/bdb/card/like/cancel",
	celebrate: "/api/v1/bdb/celebrate/incr",
	cancelCelebration: "/api/v1/bdb/celebrate/cancel",
	reportCard: "/api/v1/bdb/card/report",
} as const;

export type BirthdayBoardRestResponse<T = unknown> = VoomRestResponse<T>;

export interface BirthdayBoardPageOptions {
	boardId: string;
	scrollId?: string;
}

export interface BirthdayBoardCardInput {
	boardId: string;
	cardStatus: string;
	text: string;
	/** Required only when creating a card. */
	celebratorMid?: string;
	/** APK sends an enum name in this field. */
	from?: string;
	templateId?: string;
}

export interface BirthdayBoardClient {
	getBoardId(homeId: string): Promise<BirthdayBoardRestResponse>;
	getBoard(boardId: string, cardId?: string): Promise<BirthdayBoardRestResponse>;
	listCards(options: BirthdayBoardPageOptions): Promise<BirthdayBoardRestResponse>;
	listCelebrations(options: BirthdayBoardPageOptions): Promise<BirthdayBoardRestResponse>;
	listCardLikes(boardId: string, cardId: string): Promise<BirthdayBoardRestResponse>;
	listCardTemplates(): Promise<BirthdayBoardRestResponse>;
	createCard(input: BirthdayBoardCardInput): Promise<BirthdayBoardRestResponse>;
	updateCard(
		input: BirthdayBoardCardInput & { cardId: string },
	): Promise<BirthdayBoardRestResponse>;
	deleteCard(boardId: string, cardId: string): Promise<BirthdayBoardRestResponse>;
	deleteBoard(boardId: string): Promise<BirthdayBoardRestResponse>;
	updateReadPermission(boardId: string, count: number): Promise<BirthdayBoardRestResponse>;
	createCardLike(boardId: string, cardId: string): Promise<BirthdayBoardRestResponse>;
	cancelCardLike(boardId: string, cardId: string): Promise<BirthdayBoardRestResponse>;
	celebrate(boardId: string): Promise<BirthdayBoardRestResponse>;
	cancelCelebration(boardId: string): Promise<BirthdayBoardRestResponse>;
	reportCard(boardId: string, cardId: string): Promise<BirthdayBoardRestResponse>;
}

class ClientBirthdayBoard implements BirthdayBoardClient {
	readonly #client: Client;
	#channelToken?: string;
	constructor(client: Client) {
		this.#client = client;
	}

	async #token(): Promise<string> {
		if (this.#channelToken) return this.#channelToken;
		const r = await this.#client.base.channel.approveChannelAndIssueChannelToken({
			channelId: BIRTHDAY_CHANNEL_ID,
		});
		const t = (r as unknown as { channelAccessToken?: string }).channelAccessToken;
		if (!t) {
			throw new Error("approveChannelAndIssueChannelToken returned no token");
		}
		this.#channelToken = t;
		return t;
	}

	async #post(
		routing: "TIMELINE" | "MYHOME_RENEWAL",
		path: string,
		body?: unknown,
	): Promise<BirthdayBoardRestResponse> {
		return voomRest(this.#client, {
			routing,
			path,
			method: body === undefined ? "GET" : "POST",
			body,
			channelToken: await this.#token(),
			extraHeaders: { "X-Line-BDBTemplateVersion": "v1" },
		});
	}

	#get(path: string, body: unknown): Promise<BirthdayBoardRestResponse> {
		return this.#post("TIMELINE", path, body);
	}

	getBoardId(homeId: string): Promise<BirthdayBoardRestResponse> {
		const query = new URLSearchParams({ homeId });
		return this.#post("MYHOME_RENEWAL", `${BirthdayBoardEndpoints.boardId}?${query}`);
	}

	getBoard(boardId: string, cardId?: string): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.board, {
			boardId,
			...(cardId ? { cardId } : {}),
		});
	}

	listCards(options: BirthdayBoardPageOptions): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.cards, options);
	}

	listCelebrations(options: BirthdayBoardPageOptions): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.celebrations, options);
	}

	listCardLikes(boardId: string, cardId: string): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.cardLikes, { boardId, cardId });
	}

	listCardTemplates(): Promise<BirthdayBoardRestResponse> {
		return this.#post("TIMELINE", BirthdayBoardEndpoints.cardTemplates);
	}

	createCard(input: BirthdayBoardCardInput): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.createCard, input);
	}

	updateCard(
		input: BirthdayBoardCardInput & { cardId: string },
	): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.updateCard, input);
	}

	deleteCard(boardId: string, cardId: string): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.deleteCard, { boardId, cardId });
	}

	deleteBoard(boardId: string): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.deleteBoard, { boardId });
	}

	updateReadPermission(boardId: string, count: number): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.updateReadPermission, {
			boardId,
			count,
		});
	}

	createCardLike(boardId: string, cardId: string): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.createCardLike, {
			boardId,
			cardId,
		});
	}

	cancelCardLike(boardId: string, cardId: string): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.cancelCardLike, {
			boardId,
			cardId,
		});
	}

	celebrate(boardId: string): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.celebrate, { boardId });
	}

	cancelCelebration(boardId: string): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.cancelCelebration, { boardId });
	}

	reportCard(boardId: string, cardId: string): Promise<BirthdayBoardRestResponse> {
		return this.#get(BirthdayBoardEndpoints.reportCard, { boardId, cardId });
	}
}

export function createBirthdayBoardClient(client: Client): BirthdayBoardClient {
	return new ClientBirthdayBoard(client);
}

// Keep the routing table referenced here so consumers can inspect the routing
// behavior alongside the endpoint list.
export const BirthdayBoardRouting = {
	boardId: VoomRoutingPrefix.MYHOME_RENEWAL,
	board: VoomRoutingPrefix.TIMELINE,
} as const;
