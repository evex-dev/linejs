/**
 * linejs client.
 * @module
 */

import type { FetchLike } from "../base/mod.ts";
import type { Device } from "../base/mod.ts";
import { BaseClient } from "../base/mod.ts";
import type { BaseStorage } from "../base/storage/mod.ts";
import { Client } from "./client.ts";

export interface InitOptions {
	fetch?: FetchLike;
	device: Device;
	storage?: BaseStorage;
}
const createBaseClient = (init: InitOptions) =>
	new BaseClient({
		fetch: init.fetch,
		device: init.device,
		storage: init.storage,
	});

export interface WithQROptions {
	onReceiveQRUrl(url: string): Promise<void> | void;
	onPincodeRequest(pin: string): void | Promise<void>;
}
export const loginWithQR = async (
	opts: WithQROptions,
	init: InitOptions,
): Promise<Client> => {
	const base = createBaseClient(init);
	base.on("qrcall", opts.onReceiveQRUrl);
	base.on("pincall", opts.onPincodeRequest);
	base.loginProcess.withQrCode({});
	await base.waitFor("ready");
	return new Client(base);
};

export interface WithPasswordOptions {
	email: string;
	password: string;
	/** @default 114514 */
	pincode?: string;

	onPincodeRequest(pin: string): void | Promise<void>;
}
export const loginWithPassword = async (
	opts: WithPasswordOptions,
	init: InitOptions,
): Promise<Client> => {
	const base = createBaseClient(init);
	base.loginProcess.withPassword({
		email: opts.email,
		password: opts.password,
		pincode: opts.pincode,
	});
	await base.waitFor("ready");
	base.on("pincall", opts.onPincodeRequest);
	return new Client(base);
};

export const loginWithAuthToken = async (
	authToken: string,
	init: InitOptions,
): Promise<Client> => {
	const base = createBaseClient(init);
	base.authToken = authToken;
	await base.loginProcess.ready();
	return new Client(base);
};
