import type { LooseType } from "../../utils/common.ts";

type RecordEvent = Record<string, (...args: LooseType[]) => LooseType>;

export class TypedEventEmitter<
	T extends RecordEvent,
	E extends keyof T = keyof T,
> {
	public listeners: Map<E, T[E][]> = new Map();

	public on<E2 extends E>(event: E2, listener: T[E2]): void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)?.push(listener);
	}

	public off<E2 extends E>(event: E2, listener: T[E2]): void {
		if (this.listeners.has(event)) {
			this.listeners
				.get(event)
				?.splice(this.listeners.get(event)?.indexOf(listener) ?? 0, 1);
		}
	}

	public emit<E2 extends E>(event: E2, ...args: Parameters<T[E2]>): void {
		if (this.listeners.has(event)) {
			this.listeners.get(event)?.forEach((listener) => listener(...args));
		}
	}
}
