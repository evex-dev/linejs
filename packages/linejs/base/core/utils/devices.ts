export type Device =
	| "DESKTOPWIN"
	| "DESKTOPMAC"
	//| "CHROMEOS"
	| "ANDROID"
	| "ANDROIDSECONDARY"
	| "IOS"
	| "IOSIPAD"
	| "WATCHOS"
	| "WEAROS";

export interface DeviceDetails {
	device: Device;
	appVersion: string;
	systemName: string;
	systemVersion: string;
}
export function isV3Support(
	device: Device,
): device is
	| "DESKTOPWIN"
	| "DESKTOPMAC"
	| "IOS"
	| "ANDROID"
	| "ANDROIDSECONDARY" {
	return ["DESKTOPWIN", "DESKTOPMAC", "IOS", "ANDROID", "ANDROIDSECONDARY"]
		.includes(device);
}
export function getDeviceDetails(
	device: Device,
	version?: string,
): DeviceDetails | null {
	let appVersion;
	let systemName;
	let systemVersion;

	switch (device) {
		case "DESKTOPWIN":
			appVersion = version || "9.7.0.3556";
			systemName = "WINDOWS";
			systemVersion = "10.0.0-NT-x64";
			break;
		case "DESKTOPMAC":
			appVersion = version || "26.2.0";
			systemName = "MAC";
			systemVersion = "13.0.0";
			break;
		/*
		case "CHROMEOS":
			appVersion = appVersion = deviceMap[device]||"3.0.3";
			systemName = "Chrome_OS";
			systemVersion = "1";
			break;
		*/
		case "ANDROID":
			appVersion = version || "26.6.2";
			systemName = "Android OS";
			systemVersion = "16";
			break;
		case "ANDROIDSECONDARY":
			appVersion = version || "26.6.2";
			systemName = "Android OS";
			systemVersion = "16";
			break;
		case "IOS":
			appVersion = version || "26.7.2";
			systemName = "iOS";
			systemVersion = "18.0";
			break;
		case "IOSIPAD":
			appVersion = version || "26.7.2";
			systemName = "iOS";
			systemVersion = "18.0";
			break;
		case "WATCHOS":
			appVersion = version || "26.7.2";
			systemName = "Watch OS";
			systemVersion = "11.0";
			break;
		case "WEAROS":
			appVersion = version || "13.4.1";
			systemName = "Wear OS";
			systemVersion = "3.0";
			break;
		default:
			return null;
	}

	return { device, appVersion, systemName, systemVersion };
}
