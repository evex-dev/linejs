export interface UserInit {
	mid: string;
	isBot: boolean;
}

export class User {
	readonly mid: string;
	readonly isBot: boolean = false;
	constructor(init: UserInit) {
		this.mid = init.mid;
		this.isBot = init.isBot;
	}
}
