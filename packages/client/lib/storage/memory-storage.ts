import { BaseStorage, type Storage } from "./base-storage.ts";

/**
 * @description Mmemory Storage for LINE Client
 */
export class MemoryStorage extends BaseStorage {
	constructor(extendData?: Record<Storage["Key"], Storage["Value"]>) {
		super();
		if (extendData) {
			this.data = new Map(Object.entries(extendData));
		}
	}

	private data: Map<Storage["Key"], Storage["Value"]> = new Map();

	public set(key: Storage["Key"], value: Storage["Value"]): void {
		this.data.set(key, value);
	}

	public get(key: Storage["Key"]): Storage["Value"] | undefined {
		return this.data.get(key);
	}

	public delete(key: Storage["Key"]): void {
		this.data.delete(key);
	}

	public clear(): void {
		this.data.clear();
	}

	public getAll(): Record<Storage["Key"], Storage["Value"]> {
		return Object.fromEntries(this.data);
	}
}
