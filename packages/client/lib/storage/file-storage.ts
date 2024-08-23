import { BaseStorage, type Storage } from "./base-storage.ts";
import * as fs from "node:fs";

/**
 * @description File Storage for LINE Client
 */
export class FileStorage extends BaseStorage {
	constructor(
		private path: string,
		extendData?: string,
	) {
		super();

		try {
			fs.readFileSync(this.path, "utf-8");

			if (extendData) {
				fs.writeFileSync(this.path, extendData, "utf-8");
			}
		} catch (_) {
			fs.writeFileSync(this.path, extendData || "{}", "utf-8");
		}
	}

	public set(key: Storage["Key"], value: Storage["Value"]): void {
		const data = this.getAll();

		data[key] = value;
		fs.writeFileSync(this.path, JSON.stringify(data), "utf-8");
	}

	public get(key: Storage["Key"]): Storage["Value"] | undefined {
		const data = this.getAll();

		return data[key];
	}

	public delete(key: Storage["Key"]): void {
		const data = this.getAll();

		delete data[key];

		fs.writeFileSync(this.path, JSON.stringify(data), "utf-8");
	}

	public clear(): void {
		fs.writeFileSync(this.path, "{}", "utf-8");
	}

	public getAll(): Record<Storage["Key"], Storage["Value"]> {
		const file = fs.readFileSync(this.path, "utf-8");
		return JSON.parse(file);
	}
}
