/**
 * linejs client.
 * @module
 */

import type { FetchLike } from "../base/mod.ts";
import type { Device } from "../base/mod.ts";
import { BaseClient } from "../base/mod.ts";
import { Client } from "./client.ts";

export interface InitOptions {
	fetch?: FetchLike;
	device: Device;
}
const createBaseClient = (init: InitOptions) =>
	new BaseClient({
		fetch: init.fetch,
		device: init.device,
	});

export interface WithQROptions {
	onReceiveQRUrl(url: string): Promise<void> | void;
}
export const loginWithQR = async (
	opts: WithQROptions,
	init: InitOptions,
): Promise<Client> => {
	const base = createBaseClient(init);
	base.loginProcess.withQrCode({});
	const [qrURL] = await base.waitFor("qrcall");
	await opts.onReceiveQRUrl(qrURL);
	await base.waitFor("update:authtoken");
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
	const [pin] = await base.waitFor("pincall");
	await opts.onPincodeRequest(pin);
	await base.waitFor("update:authtoken");
	return new Client(base);
};
