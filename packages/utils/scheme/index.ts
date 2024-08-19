/**
 * @module
 * Utility for LINE Scheme URI
 */

import type { ALL_STRING, WEB_SCHEME_PREFIX } from "../common/types.ts";

type LINE_SCHEME_PREFIX =
	| "line://"
	| WEB_SCHEME_PREFIX<"line.me/R/">
	| WEB_SCHEME_PREFIX<"line.naver.jp/R/">
	| ALL_STRING;

/**
 * @description LINE Scheme Utility
 */
class LINE_SCHEME_BASE {
	constructor(
		public prefix: LINE_SCHEME_PREFIX = "line://",
	) {}

	/**
     * @returns home url
     */
	public getHome(): string {
		return this.prefix + "home";
	}

	/**
     * @returns user profile setting url
     */
	public getProfile(): string {
		return this.prefix + "profile";
	}
}

export { LINE_SCHEME_BASE as LINE_SCHEME };
