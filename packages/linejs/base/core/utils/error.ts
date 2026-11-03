import type { LooseType } from "../../types.ts";

export class InternalError extends Error {
	readonly type: string;
	override readonly message: string;
	readonly data: Record<string, LooseType>;

	constructor(type: string, message: string, data: Record<string, LooseType> = {}) {
		super(message);
		this.name = type;
		this.type = type;
		this.message = message;
		this.data = data;
	}
}
