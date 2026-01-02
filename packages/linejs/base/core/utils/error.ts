import type { LooseType } from "@evex/loose-types";

export class InternalError extends Error {
	constructor(
		readonly type: string,
		override readonly message: string,
		readonly data: Record<string, LooseType> = {},
	) {
		super(message);
		this.name = type;
		this.data = data;
	}
}
