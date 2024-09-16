import type { Device, DeviceMap } from "./device.ts";

export type EmailOptions = {
	email?: string;
	password?: string;
};

export type AuthTokenOptions = {
	authToken?: string;
};

export type LoginOptions = (EmailOptions & AuthTokenOptions) & {
	device?: Device;
	deviceMap?: DeviceMap;
	e2ee?: boolean;
	qr?: boolean;
	pincode?: string;
	polling?: Polling[];
	v3?:boolean;
};

type Polling = "talk" | "square";
