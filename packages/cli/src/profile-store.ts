import { randomUUID } from "node:crypto";
import { chmod, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { CliError } from "./errors.ts";
import { serialize } from "./output.ts";
import { linejsHome } from "./paths.ts";

export type StorageValue = string | number | boolean | null | Record<string, unknown>;

export const PROFILE_VERSION = 1;

export interface ProfileAccount {
	mid?: string;
	displayName?: string;
	statusMessage?: string;
}

export interface ProfileLogin {
	method: "qr" | "password" | "token";
	at: string;
}

export interface ProfileFile {
	version: number;
	name: string;
	createdAt: string;
	updatedAt: string;
	device: string;
	appVersion?: string;
	endpoint?: string;
	authToken?: string;
	account?: ProfileAccount;
	/** Last successfully fetched LINE profile, used when --check-session is off. */
	profile?: Record<string, unknown>;
	profileUpdatedAt?: string;
	login?: ProfileLogin;
	storage: Record<string, StorageValue>;
	[key: string]: unknown;
}

export interface ProfileSummary {
	name: string;
	path: string;
	device?: string;
	appVersion?: string;
	endpoint?: string;
	authToken: boolean;
	profileCached: boolean;
	profileUpdatedAt?: string;
	mid?: string;
	displayName?: string;
	createdAt?: string;
	updatedAt?: string;
	login?: ProfileLogin;
}

function ensureObject(value: unknown, path: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new CliError("PROFILE_INVALID", `Profile is not a JSON object: ${path}`);
	}
	return value as Record<string, unknown>;
}

function ensureStorage(value: unknown, path: string): Record<string, StorageValue> {
	if (value === undefined) return {};
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new CliError("PROFILE_INVALID", `Profile storage is not an object: ${path}`);
	}
	return value as Record<string, StorageValue>;
}

function tokenExpiry(storage: Record<string, StorageValue>): {
	expiresAt: string | null;
	expired: boolean | null;
} {
	const raw = storage.expire;
	const value = typeof raw === "string" ? Number(raw) : typeof raw === "number" ? raw : NaN;
	if (!Number.isFinite(value) || value <= 0) return { expiresAt: null, expired: null };
	// LINE stores milliseconds since the epoch.
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return { expiresAt: null, expired: null };
	return { expiresAt: date.toISOString(), expired: Date.now() >= value };
}

export class ProfileStore {
	readonly path: string;
	readonly name: string;
	data: ProfileFile;
	#chain: Promise<void> = Promise.resolve();
	#lastError: unknown;

	private constructor(path: string, name: string, data: ProfileFile) {
		this.path = path;
		this.name = name;
		this.data = data;
	}

	static async open(
		path: string,
		options: { create?: boolean; name?: string } = {},
	): Promise<ProfileStore> {
		const now = new Date().toISOString();
		let data: ProfileFile;
		try {
			const text = await readFile(path, "utf8");
			const raw = ensureObject(JSON.parse(text), path);
			const storage = ensureStorage(raw.storage, path);
			data = {
				...raw,
				version: typeof raw.version === "number" ? raw.version : PROFILE_VERSION,
				name: typeof raw.name === "string" ? raw.name : (options.name ?? "default"),
				createdAt: typeof raw.createdAt === "string" ? raw.createdAt : now,
				updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : now,
				device: typeof raw.device === "string" ? raw.device : "ANDROIDSECONDARY",
				authToken: typeof raw.authToken === "string" ? raw.authToken : undefined,
				storage,
			} as ProfileFile;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
				if (error instanceof CliError) throw error;
				throw new CliError("PROFILE_INVALID", `Could not read profile: ${path}`, {
					cause: error,
				});
			}
			if (!options.create) {
				throw new CliError("PROFILE_NOT_FOUND", `Profile not found: ${path}`, {
					details: { path, hint: "Run `line auth login` first." },
				});
			}
			data = {
				version: PROFILE_VERSION,
				name: options.name ?? "default",
				createdAt: now,
				updatedAt: now,
				device: "ANDROIDSECONDARY",
				storage: {},
			};
		}
		return new ProfileStore(path, data.name, data);
	}

	#scheduleWrite(): Promise<void> {
		const snapshot = JSON.stringify(this.data, null, "\t");
		const run = this.#chain.then(async () => {
			const directory = dirname(this.path);
			await mkdir(directory, { recursive: true, mode: 0o700 });
			const temporary = join(directory, `.${this.name}.${process.pid}.${randomUUID()}.tmp`);
			await writeFile(temporary, `${snapshot}\n`, { encoding: "utf8", mode: 0o600 });
			await rename(temporary, this.path);
			await chmod(this.path, 0o600).catch(() => {});
		});
		this.#chain = run.catch((error) => {
			this.#lastError = error;
		});
		return run;
	}

	async save(): Promise<void> {
		this.data.updatedAt = new Date().toISOString();
		await this.#scheduleWrite();
	}

	async flush(): Promise<void> {
		await this.#chain;
		if (this.#lastError) {
			const error = this.#lastError;
			this.#lastError = undefined;
			throw new CliError("INTERNAL", `Could not write profile: ${this.path}`, {
				cause: error,
			});
		}
	}

	setAuthToken(token: string): Promise<void> {
		this.data.authToken = token;
		return this.save();
	}

	setAccount(account: ProfileAccount): Promise<void> {
		this.data.account = { ...this.data.account, ...account };
		return this.save();
	}

	/** Cache the full profile so non-checking commands can work offline. */
	setCachedProfile(profile: Record<string, unknown>, account?: ProfileAccount): Promise<void> {
		this.data.profile = serialize(profile) as Record<string, unknown>;
		this.data.profileUpdatedAt = new Date().toISOString();
		if (account) this.data.account = { ...this.data.account, ...account };
		return this.save();
	}

	setLogin(method: ProfileLogin["method"]): Promise<void> {
		this.data.login = { method, at: new Date().toISOString() };
		return this.save();
	}

	setDevice(device: string, appVersion?: string): Promise<void> {
		this.data.device = device;
		if (appVersion) this.data.appVersion = appVersion;
		return this.save();
	}

	getStorage(key: string): StorageValue | undefined {
		return this.data.storage[key];
	}

	async setStorage(key: string, value: StorageValue): Promise<void> {
		this.data.storage[key] = value;
		await this.save();
	}

	async deleteStorage(key: string): Promise<void> {
		delete this.data.storage[key];
		await this.save();
	}

	async clearStorage(): Promise<void> {
		this.data.storage = {};
		await this.save();
	}

	get authToken(): string | undefined {
		return this.data.authToken;
	}

	tokenExpiry(): { expiresAt: string | null; expired: boolean | null } {
		return tokenExpiry(this.data.storage);
	}

	summary(): ProfileSummary {
		return {
			name: this.data.name,
			path: this.path,
			device: this.data.device,
			appVersion: this.data.appVersion,
			endpoint: this.data.endpoint,
			authToken: Boolean(this.data.authToken),
			profileCached: Boolean(this.data.profile),
			profileUpdatedAt: this.data.profileUpdatedAt,
			mid: this.data.account?.mid,
			displayName: this.data.account?.displayName,
			createdAt: this.data.createdAt,
			updatedAt: this.data.updatedAt,
			login: this.data.login,
		};
	}

	async delete(): Promise<void> {
		await rm(this.path, { force: true });
	}
}

export interface ProfileListEntry extends ProfileSummary {
	file: string;
	error?: string;
}

export async function listProfiles(
	env: NodeJS.ProcessEnv = process.env,
): Promise<{ home: string; profiles: ProfileListEntry[] }> {
	const home = linejsHome(env);
	let files: string[];
	try {
		files = await readdir(home);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return { home, profiles: [] };
		}
		throw error;
	}
	const profiles: ProfileListEntry[] = [];
	for (const file of files.filter((entry) => entry.endsWith(".json")).sort()) {
		const path = join(home, file);
		try {
			const store = await ProfileStore.open(path, { name: file.slice(0, -5) });
			profiles.push({ ...store.summary(), file });
		} catch (error) {
			profiles.push({
				name: file.slice(0, -5),
				path,
				authToken: false,
				profileCached: false,
				file,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}
	return { home, profiles };
}
