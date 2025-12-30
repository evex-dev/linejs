import { JSDOM } from "jsdom";

export async function getLatestMobile() {
	const dom = new JSDOM(
		await fetch("https://apps.apple.com/jp/app/line/id443904275", {
			"headers": {
				"accept":
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
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
				"user-agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
			},
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": null,
			"method": "GET",
		}).then((r) => r.text()),
	);
	const document = dom.window.document;
	return document.querySelector(
		"#mostRecentVersion > div > dialog > div > div.content-container.svelte-1ih6d3u > ul > li:nth-child(1) > article > div > div > h4",
	)!.textContent;
}
export async function getLatestDesktop() {
	const dom = new JSDOM(
		await fetch(
			"https://apps.apple.com/jp/app/line/id539883307?ign-mpt=uo%3D4&mt=12",
			{
				"headers": {
					"accept":
						"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
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
					"user-agent":
						"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
				},
				"referrerPolicy": "strict-origin-when-cross-origin",
				"body": null,
				"method": "GET",
			},
		).then((r) => r.text()),
	);
	const document = dom.window.document;
	return document.querySelector(
		"#mostRecentVersion > div > dialog > div > div.content-container.svelte-1ih6d3u > ul > li:nth-child(1) > article > div > div > h4",
	)!.textContent;
}
