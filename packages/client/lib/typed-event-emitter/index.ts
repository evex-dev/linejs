// deno-lint-ignore no-explicit-any
type RecordEvent = Record<string, (...args: any[]) => any>;

export class TypedEventEmitter<
	T extends RecordEvent,
	E extends keyof T = keyof T,
> {
	constructor() {}

	public listeners: Map<E, T[E][]> = new Map();

	public on(event: E, listener: T[E]): void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)?.push(listener);
	}

	public off(event: E, listener: T[E]): void {
		if (this.listeners.has(event)) {
			this.listeners.get(event)?.splice(
				this.listeners.get(event)?.indexOf(listener) ?? 0,
				1,
			);
		}
	}

	public emit(event: E, ...args: Parameters<T[E]>): void {
		if (this.listeners.has(event)) {
			this.listeners.get(event)?.forEach((listener) => listener(...args));
		}
	}
}
