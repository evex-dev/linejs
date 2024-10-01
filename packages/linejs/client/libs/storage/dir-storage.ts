import * as fs from "node:fs";
import { BaseStorage, type Storage } from "./base-storage.ts";

/**
 * @classdesc Directory Storage for LINE Client
 * @constructor
 */
export class DirStorage extends BaseStorage {
	private path: string;
	private keyIdPair: Array<{ key: Storage["Key"]; id: number }> = [];
	/**
	 * @description Construct a DirStorage with the given directory path.
	 *
	 * @param {string} path - The path to the directory.
	 */
	constructor(path: string) {
		super();
		if (!path.endsWith("/")) {
			path = path + "/";
		}
		this.path = path;
		try {
			fs.readdirSync(this.path);
			this.keyIdPair = JSON.parse(
				fs.readFileSync(this.path + "keyIdPair.json", "utf-8") as string,
			);
		} catch (_e) {
			fs.mkdirSync(this.path);
		}
	}

	private setNewKeyId(key: Storage["Key"], id: number): void {
		this.keyIdPair.push({ key, id });
		fs.writeFileSync(
			this.path + "keyIdPair.json",
			JSON.stringify(this.keyIdPair),
			"utf-8",
		);
	}
	private getIdFromKey(key: Storage["Key"]): number {
		let lastKeyId = 0;
		let id = 0;
		this.keyIdPair.forEach((e) => {
			if (lastKeyId < e.id) lastKeyId = e.id;
			if (e.key === key) {
				id = e.id;
			}
		});
		if (id) {
			return id;
		} else {
			lastKeyId++;
			this.setNewKeyId(key, lastKeyId);
			return lastKeyId;
		}
	}

	public set(key: Storage["Key"], value: Storage["Value"]): void {
		fs.writeFileSync(this.getPath(key), this.getTypedValue(value), "utf-8");
	}

	public get(key: Storage["Key"]): Storage["Value"] | undefined {
		try {
			return this.getValue(fs.readFileSync(this.getPath(key), "utf-8"));
		} catch (_e) {
			/* Do Nothing */
		}
	}

	public delete(key: Storage["Key"]): void {
		try {
			fs.rmSync(this.getPath(key));
		} catch (_e) {
			/* Do Nothing */
		}
	}

	public clear(): void {
		fs.readdirSync(this.path).forEach((e) => {
			try {
				fs.rmSync(e);
			} catch (_e) {
				/* Do Nothing */
			}
		});
	}

	public getPath(key: string): string {
		if (key.includes("/")) {
			throw new Error('Wrong dirStorage key "/"');
		}
		return this.path + this.getIdFromKey(key).toString(16) + ".txt";
	}

	public getTypedValue(obj: Storage["Value"]): string {
		switch (typeof obj) {
			case "string":
				return "s" + obj.toString();
			case "number":
				return "n" + obj.toString();
			case "boolean":
				return "b" + obj.toString();
			default:
				return "x";
		}
	}

	public getValue(value: string): Storage["Value"] {
		switch (value[0]) {
			case "s":
				return value.substring(1);
			case "n":
				return Number(value.substring(1));
			case "b":
				return Boolean(value.substring(1));
			case "x":
				return null;
			default:
				return null;
		}
	}
}
