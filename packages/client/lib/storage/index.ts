/**
import { MemoryStorage } from './memory-storage';
import { FileStorage } from './file-storage';
 * @module
 * The Storage for LINE Client
 */

export interface Storage {
	Key: string;
	Value: string | number | boolean | null | undefined;
}

export abstract class BaseStorage {
	public abstract set(key: Storage["Key"], value: Storage["Key"]): void;
	public abstract get(key: Storage["Key"]): Storage["Value"] | undefined;
	public abstract delete(key: Storage["Key"]): void;
	public abstract clear(): void;
}

export { MemoryStorage } from "./memory-storage.ts";
export { FileStorage } from "./file-storage.ts";
