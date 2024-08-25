export class InternalError extends Error {
	public data = {};
	constructor(type: string, message: string, data = {}) {
		super(message);
		this.name = type;
		this.data = data;
	}
}
