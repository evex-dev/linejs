import type { Device } from "./device.ts";

export type System = {
	appVersion: string;
	systemName: string;
	systemVersion: string;
	type: string;
	userAgent: string;
	device: Device;
};
