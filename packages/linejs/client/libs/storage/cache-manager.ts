import type { BaseStorage } from "../../../storage/index.ts";
import type { LooseType } from "../../entities/common.ts";

interface Storage {
	Key: string;
	Value: string | number | boolean | null | Record<string | number, LooseType>;
}

type CacheInfo = Record<Storage["Key"], number>;

export class CacheManager {
	private storage: BaseStorage;
	private cacheInfo: CacheInfo = {};
	constructor(storage: BaseStorage, expire: number = 30 * 60 * 1000) {
		this.storage = storage;
		if (!this.storage.get("cache")) {
			this.storage.set("cache", "{}");
		} else {
			this.cacheInfo = JSON.parse(this.storage.get("cache") as string);
		}
		setInterval(() => {
			const now = new Date().getTime();
			for (const key in this.cacheInfo) {
				if (Object.prototype.hasOwnProperty.call(this.cacheInfo, key)) {
					const time = this.cacheInfo[key];
					if (now - time > expire) {
						this.storage.delete("cache:" + key);
						delete this.cacheInfo[key];
					}
				}
			}
			this.storage.set("cache", JSON.stringify(this.cacheInfo));
		}, 60 * 1000);
	}

	/**
	 * @description Set a value.
	 *
	 * @param {Storage["Key"]} key
	 * @param {Storage["Value"]} value
	 */
	public set(key: Storage["Key"], value: Storage["Value"]): void {
		this.cacheInfo[key] = new Date().getTime();
		this.storage.set("cache:" + key, JSON.stringify(value));
	}

	/**
	 * @description Set a response value.
	 *
	 * @param {string} requestName
	 * @param {Record<string,any>} request
	 * @param {Storage["Value"]} response
	 */
	public setCache(
		requestName: string,
		request: Record<string, LooseType>,
		response: Storage["Value"],
	): void {
		this.set(requestName + JSON.stringify(request), response);
	}

	/**
	 * @description Get a value.
	 *
	 * @param {Storage["Key"]} key
	 *
	 * @returns {Storage["Value"] | undefined}
	 */
	public get(key: Storage["Key"]): Storage["Value"] | undefined {
		try {
			this.cacheInfo[key] = new Date().getTime();
			return JSON.parse(this.storage.get("cache:" + key) as string);
		} catch (_e) {/* Do Nothing */}
	}

	/**
	 * @description Get a response value.
	 *
	 * @param {string} requestName
	 * @param {Record<string,any>} request
	 * @param {Storage["Value"]} response
	 */
	public getCache(
		requestName: string,
		request: Record<string, LooseType>,
	): Storage["Value"] | undefined {
		return this.get(requestName + JSON.stringify(request));
	}
}
