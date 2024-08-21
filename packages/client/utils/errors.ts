export class InternalError extends Error {
	constructor(type: string, message: string) {
		super(message);
		this.name = type;
	}
}
