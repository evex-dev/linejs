/// <reference lib="dom"/>

import type { BaseStorage, Storage } from "@evex/linejs/storage";
export class LocalStorage implements BaseStorage {
	prefix = "linejs:";
	constructor() {
	}
	public async set(
		key: Storage["Key"],
		value: Storage["Value"],
	): Promise<void> {
		localStorage.setItem(this.prefix + key, JSON.stringify(value));
	}
	public async get(
		key: Storage["Key"],
	): Promise<Storage["Value"] | undefined> {
		try {
			return JSON.parse(
				localStorage.getItem(this.prefix + key) || "null",
			);
		} catch (_) {
		}
	}
	public async delete(key: Storage["Key"]): Promise<void> {
		localStorage.removeItem(this.prefix + key);
	}
	public async clear(): Promise<void> {
		localStorage.clear();
	}
	public async migrate(storage: BaseStorage): Promise<void> {
		for (let index = 0; index < localStorage.length; index++) {
			const k = localStorage.key(index);
			if (k) {
				await storage.set(
					k.replace(this.prefix, ""),
					localStorage.getItem(k),
				);
			} else {
				continue;
			}
		}
	}
}
