export type Device =
	| "DESKTOPWIN"
	| "DESKTOPMAC"
	//	| "CHROMEOS"
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

export type DeviceMap = Partial<Record<Device, string>>;

export function getDeviceDetails(
	device: Device,
	deviceMap: DeviceMap,
): DeviceDetails | null {
	let appVersion;
	let systemName;
	let systemVersion;
	systemVersion = "12.1.4";

	switch (device) {
		case "DESKTOPWIN":
			appVersion = "9.2.0.3403";
			if (deviceMap[device]) {
				appVersion = deviceMap[device];
			}
			systemName = "WINDOWS";
			systemVersion = "10.0.0-NT-x64";
			break;
		case "DESKTOPMAC":
			appVersion = "9.2.0.3402";
			if (deviceMap[device]) {
				appVersion = deviceMap[device];
			}
			systemName = "MAC";
			break;
		/*
		case "CHROMEOS":
			appVersion = "3.0.3";
			if (deviceMap[device]) {
				appVersion = deviceMap[device];
			}
			systemName = "Chrome_OS";
			systemVersion = "1";
			break;
		*/
		case "ANDROID":
			appVersion = "13.4.1";
			if (deviceMap[device]) {
				appVersion = deviceMap[device];
			}
			systemName = "Android OS";
			break;
		case "IOS":
			appVersion = "13.3.0";
			if (deviceMap[device]) {
				appVersion = deviceMap[device];
			}
			systemName = "iOS";
			break;
		case "IOSIPAD":
			appVersion = "13.3.0";
			if (deviceMap[device]) {
				appVersion = deviceMap[device];
			}
			systemName = "iOS";
			break;
		case "WATCHOS":
			appVersion = "13.3.0";
			if (deviceMap[device]) {
				appVersion = deviceMap[device];
			}
			systemName = "Watch OS";
			break;
		case "WEAROS":
			appVersion = "13.4.1";
			if (deviceMap[device]) {
				appVersion = deviceMap[device];
			}
			systemName = "Wear OS";
			break;
		default:
			return null;
	}

	return { appVersion, systemName, systemVersion };
}