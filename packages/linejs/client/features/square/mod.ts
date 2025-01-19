import type {
	Square as SquareRaw,
	SquareChat as SquareChatRaw,
} from "@evex/linejs-types";
import type { Client } from "../../mod.ts";

export interface SquareInit {
	raw: SquareRaw;
	client: Client;
}
export class Square {
	#raw: SquareRaw;
	#client: Client;
	constructor(init: SquareInit) {
		this.#raw = init.raw;
		this.#client = init.client;
	}
	/** Updates square information */
	async update() {
		this.#raw = (await this.#client.base.square.getSquare({
			squareMid: this.#raw.mid,
		}))
			.square;
	}

	/*
	async sendMessage(
		input: string | {
			text?: string;
		},
	): Promise<void> {
		if (typeof input === "string") {
			return this.sendMessage({ text: input });
		}
		await this.#client.base.square.sendMessage({
			text: input.text,
			squareChatMid: this.#raw.mid,
		});
	}
	*/

	/** OpenChat mid */
	get mid(): string {
		return this.#raw.mid;
	}
	/** OpenChat Name */
	get name(): string {
		return this.#raw.name;
	}

	static fromRaw(raw: SquareRaw, client: Client): Square {
		return new Square({ raw, client });
	}
}

export interface SquareChatInit {
	raw: SquareChatRaw;
	client: Client;
}
export class SquareChat {
	#raw: SquareChatRaw;
	#client: Client;
	constructor(init: SquareChatInit) {
		this.#raw = init.raw;
		this.#client = init.client;
	}
	/** Updates square information */
	async update() {
		this.#raw = (await this.#client.base.square.getSquareChat({
			squareChatMid: this.#raw.squareChatMid,
		}))
			.squareChat;
	}

	async sendMessage(
		input: string | {
			text?: string;
		},
	): Promise<void> {
		if (typeof input === "string") {
			return this.sendMessage({ text: input });
		}
		await this.#client.base.square.sendMessage({
			text: input.text,
			squareChatMid: this.#raw.squareChatMid,
		});
	}

	/** OpenChat mid */
	get mid(): string {
		return this.#raw.squareChatMid;
	}
	/** OpenChat Name */
	get name(): string {
		return this.#raw.name;
	}

	static fromRaw(raw: SquareRaw, client: Client): Square {
		return new Square({ raw, client });
	}
}
