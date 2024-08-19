/**
 * @module
 * Utility for LINE OBS
 */

import type { ALL_STRING, WEB_SCHEME_PREFIX } from "../common/types.ts";

type LINE_OBS_PREFIX =
	| "obs://"
	| WEB_SCHEME_PREFIX<"obs.line-scdn.net/">
	| WEB_SCHEME_PREFIX<"obs-jp.line-apps.com/">
	| WEB_SCHEME_PREFIX<"obs.line-apps.com/">
	| ALL_STRING;

/**
 * @description LINE Obs Utility
 */
class LINE_OBS_BASE {
	constructor(
		public prefix: LINE_OBS_PREFIX = "obs://",
	) {}

	/**
	 * @param hash {string} obs hash
	 * @returns line-obs url
	 */
	public createURI(hash: string): string {
		return this.prefix + hash;
	}

	/**
	 * @param mid {string} user mid
	 * @returns line-obs profile-image url
	 */
	public createProfileImage(mid: string): string {
		return this.prefix + "os/p/" + mid;
	}

	/**
	 * @param groupId {string} group id (gid)
	 * @returns line-obs group-image url
	 */
	public createGroupImage(groupId: string): string {
		return this.prefix + "os/g/" + groupId;
	}
}

export { LINE_OBS_BASE as LINE_OBS };
