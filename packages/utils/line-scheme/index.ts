/**
 * @module
 * Utility for LINE Scheme URI
 */

import { ALL_STRING, WEB_SCHEME_PREFIX } from "../common/types.ts";

type LINE_SCHEME_PREFIX =
	| "line://"
	| WEB_SCHEME_PREFIX<"line.me/R/">
	| WEB_SCHEME_PREFIX<"line.naver.jp/R/">
	| ALL_STRING;

class LINE_SCHEME_BASE {
	constructor(
		public prefix: LINE_SCHEME_PREFIX = "line://",
	) {}

	public getHome() {
		return this.prefix + "home";
	}

	public getProfile() {
		return this.prefix + "profile";
	}
}

export { LINE_SCHEME_BASE as LINE_SCHEME };
