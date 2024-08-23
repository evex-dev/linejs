export type Device =
	| "DESKTOPWIN"
	| "DESKTOPMAC"
	| "CHROMEOS"
	| "ANDROID"
	| "IOS"
	| "IOSIPAD"
	| "WATCHOS"
	| "WEAROS";

export interface DeviceDetails {
	appVersion: string;
	systemName: string;
	systemVersion: string;
}

export function getDeviceDetails(device: Device): DeviceDetails | null {
	let appVersion;
	let systemName;
	let systemVersion;
	systemVersion = "12.1.4";

	switch (device) {
		case "DESKTOPWIN":
			appVersion = "7.16.1.3000";
			systemName = "WINDOWS";
			systemVersion = "10.0.0-NT-x64";
			break;
		case "DESKTOPMAC":
			appVersion = "7.16.1.3000";
			systemName = "MAC";
			break;
		case "CHROMEOS":
			appVersion = "3.0.3";
			systemName = "Chrome_OS";
			systemVersion = "1";
			break;
		case "ANDROID":
			appVersion = "13.4.1";
			systemName = "Android OS";
			break;
		case "IOS":
			appVersion = "13.3.0";
			systemName = "iOS";
			break;
		case "IOSIPAD":
			appVersion = "13.3.0";
			systemName = "iOS";
			break;
		case "WATCHOS":
			appVersion = "13.3.0";
			systemName = "Watch OS";
			break;
		case "WEAROS":
			appVersion = "13.4.1";
			systemName = "Wear OS";
			break;
		default:
			return null;
	}

	return { appVersion, systemName, systemVersion };
}
