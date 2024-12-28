import type { BaseStorage, Storage } from "./base.ts";

/**
 * @lassdesc Deno.Kv Storage for LINE Client
 * @constructor
 */
export class DenoKvStorage implements BaseStorage {
    kv?: Deno.Kv;
    isAwaited: Promise<void>;
    kvPrefix = "LINEJS_Storage";
    constructor(path?: string) {
        if (typeof globalThis.Deno === "undefined") {
            throw new Error("Only available in deno");
        }
        this.isAwaited = (async () => {
            this.kv = await Deno.openKv(path);
        })();
    }
    public async set(
        key: Storage["Key"],
        value: Storage["Value"],
    ): Promise<void> {
        await this.isAwaited;
        if (!this.kv) {
            throw new Error("Only available in deno");
        }
        await this.kv.set([this.kvPrefix, key], value);
    }
    public async get(
        key: Storage["Key"],
    ): Promise<Storage["Value"] | undefined> {
        await this.isAwaited;
        if (!this.kv) {
            throw new Error("Only available in deno");
        }
        return (await this.kv.get([this.kvPrefix, key])).value as any;
    }
    public async delete(key: Storage["Key"]): Promise<void> {
        await this.isAwaited;
        if (!this.kv) {
            throw new Error("Only available in deno");
        }
        await this.kv.delete([this.kvPrefix, key]);
    }
    public async clear(): Promise<void> {
        await this.isAwaited;
        if (!this.kv) {
            throw new Error("Only available in deno");
        }
        const entries = this.kv.list({ prefix: [this.kvPrefix] });
        for await (const entry of entries) {
            await this.kv.delete(entry.key);
        }
    }
}
