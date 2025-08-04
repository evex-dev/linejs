import type { GetContactV3Response } from "@evex/linejs-types";

export interface UserInit {
	raw: GetContactV3Response;
}

export class User {
	readonly mid: string;
	readonly raw: GetContactV3Response;
	constructor(init: UserInit) {
		this.mid = init.raw.targetUserMid;
		this.raw = init.raw;
	}
}
