/**
 * @module
 * Utility for LINE OBS
 */

import { ALL_STRING, WEB_SCHEME_PREFIX } from "../common/types.ts";

type LINE_OBS_PREFIX =
	| "obs://"
	| WEB_SCHEME_PREFIX<"obs.line-scdn.net/">
	| WEB_SCHEME_PREFIX<"obs-jp.line-apps.com/">
	| WEB_SCHEME_PREFIX<"obs.line-apps.com/">
	| ALL_STRING;

class LINE_OBS_BASE {
	constructor(
		public prefix: LINE_OBS_PREFIX = "obs://",
	) {}

	public createURI(hash: string) {
		return this.prefix + hash;
	}

	public createProfileImage(mid: string) {
		return this.prefix + "os/p/" + mid;
	}

	public createGroupImage(gid: string) {
		return this.prefix + "os/g/" + gid;
	}
}

export { LINE_OBS_BASE as LINE_OBS };
