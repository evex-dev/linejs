import type { Square as SquareRaw } from "@evex/linejs-types";
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
		this.#raw =
			(await this.#client.base.square.getSquare({ squareMid: this.#raw.mid }))
				.square;
	}

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
