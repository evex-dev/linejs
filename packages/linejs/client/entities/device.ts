import { JSDOM } from 'npm:jsdom@25.0.0';

async function getLatestMobile() {
	const dom = await JSDOM.fromURL("https://apps.apple.com/jp/app/line/id443904275");
	const document = dom.window.document;
	const apple = JSON.parse(document.querySelector("#shoebox-media-api-cache-apps").innerText)
	const line = JSON.parse(Object.values(apple)[0] as string)
	return line.d[0].attributes.platformAttributes.ios.versionHistory[0].versionDisplay as string
}
async function getLatestDesktop() {
	const dom = await JSDOM.fromURL("https://apps.apple.com/jp/app/line/id539883307?ign-mpt=uo%3D4&mt=12");
	const document = dom.window.document;
	const apple = JSON.parse(document.querySelector("#shoebox-media-api-cache-apps").innerText)
	const line = JSON.parse(Object.values(apple)[0] as string)
	return line.d[0].attributes.platformAttributes.osx.versionHistory[0].versionDisplay as string
}

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

export async function getDeviceDetails(device: Device, useLatest: boolean = false): Promise<DeviceDetails | null> {
	let appVersion;
	let systemName;
	let systemVersion;
	systemVersion = "12.1.4";

	switch (device) {
		case "DESKTOPWIN":
			appVersion = "9.2.0.3403";
			if (useLatest) {
				appVersion = await getLatestDesktop()
			}
			systemName = "WINDOWS";
			systemVersion = "10.0.0-NT-x64";
			break;
		case "DESKTOPMAC":
			if (useLatest) {
				appVersion = await getLatestDesktop()
			}
			appVersion = "9.2.0.3402";
			systemName = "MAC";
			break;
		case "CHROMEOS":
			appVersion = "3.0.3";
			systemName = "Chrome_OS";
			systemVersion = "1";
			break;
		case "ANDROID":
			if (useLatest) {
				appVersion = await getLatestMobile()
			}
			appVersion = "13.4.1";
			systemName = "Android OS";
			break;
		case "IOS":
			if (useLatest) {
				appVersion = await getLatestMobile()
			}
			appVersion = "13.3.0";
			systemName = "iOS";
			break;
		case "IOSIPAD":
			if (useLatest) {
				appVersion = await getLatestMobile()
			}
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
