import type { LooseType } from "./common.ts";

export class InternalError extends Error {
	constructor(
		readonly type: string,
		readonly message: string,
		readonly data: Record<string, LooseType> = {},
	) {
		super(message);
		this.name = type;
		this.data = data;
	}
}
