import type { LooseType } from "./common.ts";

export class InternalError extends Error {
	public data = {};
	constructor(type: string, message: string, data?: LooseType) {
		super(message);
		this.name = type;
	 	this.data = data;
	}
}
