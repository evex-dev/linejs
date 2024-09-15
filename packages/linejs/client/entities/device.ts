import { JSDOM } from 'npm:jsdom@25.0.0';

async function getLatestMobile() {
	const dom = new JSDOM(await fetch("https://apps.apple.com/jp/app/line/id443904275", {
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			"accept-language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
			"cache-control": "no-cache",
			"pragma": "no-cache",
			"priority": "u=0, i",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "same-origin",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1",
			"cookie": "geo=JP; dssf=1; geo=JP",
			"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
		},
		"referrerPolicy": "strict-origin-when-cross-origin",
		"body": null,
		"method": "GET"
	}).then(r => r.text()));
	const document = dom.window.document;
	const apple = JSON.parse(document.querySelector("#shoebox-media-api-cache-apps").textContent)
	const line = JSON.parse(Object.values(apple)[0] as string)
	return line.d[0].attributes.platformAttributes.ios.versionHistory[0].versionDisplay as string
}
async function getLatestDesktop() {
	const dom = new JSDOM(await fetch("https://apps.apple.com/jp/app/line/id539883307?ign-mpt=uo%3D4&mt=12", {
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			"accept-language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
			"cache-control": "no-cache",
			"pragma": "no-cache",
			"priority": "u=0, i",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "same-origin",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1",
			"cookie": "geo=JP; dssf=1; geo=JP",
			"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
		},
		"referrerPolicy": "strict-origin-when-cross-origin",
		"body": null,
		"method": "GET"
	}).then(r => r.text()));
	const document = dom.window.document;
	const apple = JSON.parse(document.querySelector("#shoebox-media-api-cache-apps").textContent)
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
