/// <reference lib="dom"/>

import type { BaseStorage, Storage } from "@evex/linejs/storage";

function successToPromise<T extends IDBRequest>(
	request: T,
): Promise<T["result"]> {
	return new Promise<T["result"]>((resolve, reject) => {
		request.onsuccess = () => {
			resolve(request.result);
		};
		request.onerror = (event) => {
			reject(event);
		};
	});
}
function completeToPromise<T extends IDBTransaction>(
	transaction: T,
): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		transaction.oncomplete = () => {
			resolve();
		};
		transaction.onerror = (event) => {
			reject(event);
		};
	});
}

export class IndexedDBStorage implements BaseStorage {
	onclose?: () => void;
	dbName: string;
	storeName: string;
	#db?: IDBDatabase;
	constructor(
		dbName: string = "IndexedDBStorage",
		storeName: string = "linejs",
	) {
		this.dbName = dbName;
		this.storeName = storeName;
	}
	async open(): Promise<IDBDatabase> {
		if (!this.#db) {
			const request = indexedDB.open(this.dbName);
			request.onupgradeneeded = () => {
				const db = request.result;

				db.createObjectStore(this.storeName, { keyPath: "key" });
			};
			this.#db = await successToPromise(request);
		}
		return this.#db;
	}
	public async set(
		key: Storage["Key"],
		value: Storage["Value"],
	): Promise<void> {
		const db = await this.open();
		const transaction = db.transaction(this.storeName, "readwrite");
		const success = successToPromise(
			transaction.objectStore(this.storeName).put({ key, value }),
		);
		const complete = completeToPromise(transaction);
		await success;
		await complete;
	}
	public async get(
		key: Storage["Key"],
	): Promise<Storage["Value"] | undefined> {
		const db = await this.open();
		const transaction = db.transaction(this.storeName);
		const complete = completeToPromise(transaction);
		const value = await successToPromise(
			transaction.objectStore(this.storeName).get(key),
		);
		await complete;
		return value.value;
	}
	public async delete(key: Storage["Key"]): Promise<void> {
		const db = await this.open();
		const transaction = db.transaction(this.storeName, "readwrite");
		const success = successToPromise(
			transaction.objectStore(this.storeName).delete(key),
		);
		const complete = completeToPromise(transaction);
		await success;
		await complete;
	}
	public async clear(): Promise<void> {
		const db = await this.open();
		const version = db.version;
		db.close();
		const request = indexedDB.open(this.dbName, version + 1);
		request.onupgradeneeded = () => {
			const db = request.result;
			db.deleteObjectStore(this.storeName);
			db.createObjectStore(this.storeName, { keyPath: "key" });
			db.onversionchange = () => {
				db.close();
				this.onclose && this.onclose();
			};
		};
		this.#db = await successToPromise(request);
	}
	public async migrate(storage: BaseStorage): Promise<void> {
		const db = await this.open();
		const transaction = db.transaction(this.storeName, "readwrite");
		const complete = completeToPromise(transaction);
		const objectStore = transaction.objectStore(this.storeName);
		const request = objectStore.openCursor();
		const { promise, resolve } = Promise.withResolvers<void>();
		const promises: Promise<void>[] = [];
		request.onsuccess = () => {
			const cursor = request.result;
			if (cursor) {
				const { value, key } = cursor.value;
				promises.push(storage.set(key, value));
				cursor.continue();
			} else {
				resolve();
			}
		};
		await Promise.all(promises);
		await promise;
		await complete;
	}
}
