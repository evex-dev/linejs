import type {
	Square as SquareRaw,
	SquareChat as SquareChatRaw,
} from "@evex/linejs-types";
import type * as LINETypes from "@evex/linejs-types";
import type { Client } from "../../mod.ts";
import { continueRequest } from "../../../base/mod.ts";
import { SquareMessage } from "../message/mod.ts";
import { TypedEventEmitter } from "../../../base/core/typed-event-emitter/index.ts";

export interface SquareInit {
	raw: SquareRaw;
	client: Client;
}

/**
 * Square(Openchat) (not a SquareChat)
 */
export class Square {
	raw: SquareRaw;
	#client: Client;
	constructor(init: SquareInit) {
		this.raw = init.raw;
		this.#client = init.client;
	}
	/** Updates square information */
	async update(): Promise<void> {
		this.raw = (await this.#client.base.square.getSquare({
			squareMid: this.raw.mid,
		}))
			.square;
	}
	async updateSquare(
		input: {
			updatedAttrs: LINETypes.SquareAttribute[];
			square: Partial<LINETypes.Square>;
		},
	): Promise<LINETypes.UpdateSquareResponse> {
		return await this.#client.base.square.updateSquare({
			request: {
				updatedAttrs: input.updatedAttrs,
				square: { ...this.raw, ...input.square },
			},
		});
	}
	async updateName(name: string): Promise<LINETypes.UpdateSquareResponse> {
		return await this.updateSquare({
			updatedAttrs: ["NAME"],
			square: { name },
		});
	}

	/** OpenChat mid */
	get mid(): string {
		return this.raw.mid;
	}
	/** OpenChat Name */
	get name(): string {
		return this.raw.name;
	}
}

export interface SquareChatInit {
	raw: SquareChatRaw;
	client: Client;
}
export type SquareChatEvents = {
	message: (message: SquareMessage) => void;
	// TODO:
	// kick: (event: LINETypes.SquareEvent & { payload: {} }) => void;
	// leave: (event: LINETypes.SquareEvent & { payload: {} }) => void;
	// join: (event: LINETypes.SquareEvent & { payload: {} }) => void;
	// mention: (event: LINETypes.SquareEvent & { payload: {} }) => void;
	// unsend: (event: LINETypes.SquareEvent & { payload: {} }, message: SquareMessage) => void;
	// destroy: (event: LINETypes.SquareEvent & { payload: {} }, message: SquareMessage) => void;
	event: (event: LINETypes.SquareEvent) => void;
	"update:syncToken": (syncToken: string) => void;
};
export class SquareChat extends TypedEventEmitter<SquareChatEvents> {
	raw: SquareChatRaw;
	#client: Client;
	constructor(init: SquareChatInit) {
		super();
		this.raw = init.raw;
		this.#client = init.client;
	}
	/** Updates square information */
	async update() {
		this.raw = (await this.#client.base.square.getSquareChat({
			squareChatMid: this.raw.squareChatMid,
		}))
			.squareChat;
	}
	async sendMessage(
		input: string | {
			text?: string;
			contentType?: LINETypes.ContentType;
			contentMetadata?: Record<string, string>;
			relatedMessageId?: string;
			location?: LINETypes.Location;
		},
	): Promise<LINETypes.SendMessageResponse> {
		if (typeof input === "string") {
			return this.sendMessage({ text: input });
		}
		return await this.#client.base.square.sendMessage({
			...input,
			squareChatMid: this.raw.squareChatMid,
		});
	}

	async updateSquareChat(
		input: {
			updatedAttrs: LINETypes.SquareChatAttribute[];
			squareChat: Partial<LINETypes.SquareChat>;
		},
	): Promise<LINETypes.UpdateSquareChatResponse> {
		return await this.#client.base.square.updateSquareChat({
			request: {
				updatedAttrs: input.updatedAttrs,
				squareChat: { ...this.raw, ...input.squareChat },
			},
		});
	}
	async updateName(
		name: string,
	): Promise<LINETypes.UpdateSquareChatResponse> {
		return await this.updateSquareChat({
			updatedAttrs: ["NAME"],
			squareChat: { name },
		});
	}

	async getMembers(): Promise<LINETypes.SquareMember[]> {
		const res = await continueRequest({
			handler: (arg) =>
				this.#client.base.square.getSquareChatMembers(arg),
			arg: {
				squareChatMid: this.raw.squareChatMid,
			},
		});
		return res.squareChatMembers;
	}
	#isPolling: boolean = false;
	/**
	 * @description start listen (fetchSquareChatEvents)
	 */
	public async listen(
		param: {
			signal?: AbortSignal;
			syncToken?: string;
			onError?: (error: unknown) => void;
		},
	): Promise<void> {
		if (this.#isPolling) {
			throw new Error("Polling has already started");
		}
		this.#isPolling = true;
		let syncToken = param.syncToken;
		if (!syncToken) {
			while (true) {
				const noneEvent = await this.#client.base.square
					.fetchSquareChatEvents({
						squareChatMid: this.raw.squareChatMid,
						syncToken,
					});
				syncToken = noneEvent.syncToken;
				if (noneEvent.events.length === 0) {
					break;
				}
			}
		}
		this.emit("update:syncToken", syncToken);
		while (!param.signal?.aborted && this.#client.base.authToken) {
			try {
				const response = await this.#client.base.square
					.fetchSquareChatEvents({
						squareChatMid: this.raw.squareChatMid,
						syncToken: syncToken,
					});
				if (syncToken !== response.syncToken) {
					this.emit("update:syncToken", response.syncToken);
					syncToken = response.syncToken;
				}
				for (const event of response.events) {
					this.emit("event", event);
					if (
						event.type === "SEND_MESSAGE" &&
						event.payload.sendMessage
					) {
						const message = new SquareMessage({
							client: this.#client,
							raw: event.payload.sendMessage.squareMessage,
						});
						this.emit("message", message);
					} else if (
						event.type === "RECEIVE_MESSAGE" &&
						event.payload.receiveMessage
					) {
						const message = new SquareMessage({
							client: this.#client,
							raw: event.payload.receiveMessage.squareMessage,
						});
						this.emit("message", message);
					}
				}
				await new Promise<void>((resolve) => setTimeout(resolve, 1000));
			} catch (e) {
				if (param.onError) param.onError(e);
				await new Promise<void>((resolve) => setTimeout(resolve, 2000));
			}
		}
	}

	/** OpenChat mid */
	get mid(): string {
		return this.raw.squareChatMid;
	}
	/** OpenChat Name */
	get name(): string {
		return this.raw.name;
	}
}
