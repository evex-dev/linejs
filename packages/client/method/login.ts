import type { Device } from "../utils/device.ts";

export type EmailOptions = {
	email?: string;
	password?: string;
};

export type AuthTokenOptions = {
	authToken?: string;
};

export type LoginOptions =
	& (EmailOptions & AuthTokenOptions)
	& {
		device?: Device;
	};
