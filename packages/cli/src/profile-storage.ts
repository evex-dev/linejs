import { BaseStorage, type Storage } from "@evex-dev/linejs/storage";
import type { ProfileStore, StorageValue } from "./profile-store.ts";

/**
 * LINEJS storage backed by the same JSON file as the profile. Keeping the
 * E2EE keys, refresh token, and reqseq counter in one profile makes
 * `~/.linejs/<profile>.json` self-contained and portable.
 */
export class ProfileStorage extends BaseStorage {
	readonly store: ProfileStore;

	constructor(store: ProfileStore) {
		super();
		this.store = store;
	}

	async set(key: Storage["Key"], value: Storage["Value"]): Promise<void> {
		await this.store.setStorage(key, value as StorageValue);
	}

	async get(key: Storage["Key"]): Promise<Storage["Value"] | undefined> {
		return this.store.getStorage(key) as Storage["Value"] | undefined;
	}

	async delete(key: Storage["Key"]): Promise<void> {
		await this.store.deleteStorage(key);
	}

	async clear(): Promise<void> {
		await this.store.clearStorage();
	}

	async migrate(storage: BaseStorage): Promise<void> {
		for (const [key, value] of Object.entries(this.store.data.storage)) {
			await storage.set(key, value);
		}
	}
}
