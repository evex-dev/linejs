import * as fs from "node:fs";
import { BaseStorage, type Storage } from "./base.ts";

/**
 * @classdesc File Storage for LINE Client
 * @constructor
 */
export class FileStorage extends BaseStorage {
	/**
	 * @description Construct a FileStorage with the given path and data.
	 *
	 * @param {string} path - The path to the file.
	 * @param {string} [extendData] - The data to extend the file with. If the file does not exist, it will be created with the given data. If the file does exist, the data will be appended to the file. If no data is given, the file will be created with an empty object.
	 */
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
		} catch (_e) {
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
		return JSON.parse(file || "{}");
	}
}
