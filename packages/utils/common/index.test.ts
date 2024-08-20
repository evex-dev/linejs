import { assert } from "@std/assert";
import { LINE_SCHEME } from "../scheme/index.ts";
import { LINE_OBS } from "../obs/index.ts";
import { LINE_REGEX } from "../index.ts";

Deno.test({
	name: "Scheme Test",
	fn: () => {
		const scheme_with_scheme = new LINE_SCHEME();
		assert(scheme_with_scheme.getHome() === "line://home");
		const scheme_with_line_url = new LINE_SCHEME("https://line.me/R/");
		assert(scheme_with_line_url.getHome() === "https://line.me/R/home");
		const scheme_with_custom = new LINE_SCHEME("https://example.com/");
		assert(scheme_with_custom.getHome() === "https://example.com/home");
	},
});

Deno.test({
	name: "Obs Test",
	fn: () => {
		const MOCK_TEXT = "mock";

		const obs = new LINE_OBS();
		assert(obs.getURI(MOCK_TEXT) === "https://obs.line-apps.com/" + MOCK_TEXT);
		const obs_with_custom = new LINE_OBS("https://example.com/");
		assert(
			obs_with_custom.getURI(MOCK_TEXT) === "https://example.com/" + MOCK_TEXT,
		);
	},
});

Deno.test({
	name: "Regex Test",
	fn: () => {
		const TICKET_MOCK_DATA = [
			[
				"https://line.me/ti/g2/abcdefghijklmnopqrstuvwxyzABCDEFGH01-_?utm_source=invitation&utm_medium=link_copy&utm_campaign=default",
				"abcdefghijklmnopqrstuvwxyzABCDEFGH01-_",
			],
			[
				"abcdefghijklmnopqrstuvwxyzABCDEFGH01-_",
				"abcdefghijklmnopqrstuvwxyzABCDEFGH01-_",
			],
			[
				"OpenChat: https://line.me/ti/g2/abcdefghijklmnopqrstuvwxyzABCDEFGH01-_?utm_source=invitation&utm_medium=link_copy&utm_campaign=default",
				"abcdefghijklmnopqrstuvwxyzABCDEFGH01-_",
			],
			[
				"",
				null,
			],
			[
				"https://line.me",
				null,
			],
		] as const;

		const EMID_MOCK_DATA = [
			[
				"line://square/join?emid=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSRYVWXYZ01234-_",
				"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSRYVWXYZ01234-_",
			],
			[
				"",
				null,
			],
			[
				"https://line.me",
				null,
			],
		] as const;

		const regex = new LINE_REGEX();

		for (const data of TICKET_MOCK_DATA) {
			const ticket = regex.getTicket(data[0]);
			assert(ticket === data[1]);
		}

		for (const data of EMID_MOCK_DATA) {
			const emid = regex.getEmid(data[0]);
			assert(emid === data[1]);
		}
	},
});
