/**
 * @module
 * The Storage for LINE Client
 */

export interface Storage {
	Key: string;
	Value: string | number | boolean | null | undefined;
}

/**
 * @description Base Storage for LINE Client
 */
export abstract class BaseStorage {
    /**
     * @description Set a value.
     * 
     * @param {Storage["Key"]} key
     * @param {Storage["Value"]} value
     */
	public abstract set(key: Storage["Key"], value: Storage["Key"]): void;

    /**
     * @description Get a value.
     * 
     * @param {Storage["Key"]} key
     * 
     * @returns {Storage["Value"] | undefined}
     */
	public abstract get(key: Storage["Key"]): Storage["Value"] | undefined;

    /**
     * @description Delete a value.
     * 
     * @param {Storage["Key"]} key
     */
	public abstract delete(key: Storage["Key"]): void;

    /**
     * @description Clear a data.
     */
	public abstract clear(): void;
}

export { MemoryStorage } from "./memory-storage.ts";
export { FileStorage } from "./file-storage.ts";
