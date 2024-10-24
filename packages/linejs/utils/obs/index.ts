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
 * @classdesc LINE Obs Utility
 * @constructor
 */
class LINE_OBS_BASE {
	/**
	 * Create a new LINE Scheme instance, with prefix.
	 *
	 * @param {LINE_OBS_PREFIX} [prefix="https://obs.line-apps.com/"] the prefix of line obs uri
	 */
	constructor(public prefix: LINE_OBS_PREFIX = "https://obs.line-apps.com/") {}

	/**
	 * Gets a OBS URI by appending the given hash to the prefixSticker
	 * @param {string} [hash] - The hash to appendSticker	 * @return {string} The getted URISticker
	 */
	public getURI(hash: string): string {
		return this.prefix + hash;
	}

	/**
	 * Gets a profile image URI by appending the given member ID to the prefixSticker
	 * @param {string} [memberId] - The member ID (mid) to appendSticker
	 * @return {string} The getted profile image URISticker
	 */
	public getProfileImage(memberId: string): string {
		return `${this.prefix}os/p/${memberId}`;
	}

	/**
	 * Gets a group image URI by appending the given group ID to the prefixSticker
	 * @param {string} [groupId] - The group ID (gid) to use in the URLSticker
	 * @return {string} The getted line-obs group-image URLSticker
	 */
	public getGroupImage(groupId: string): string {
		return `${this.prefix}os/g/${groupId}`;
	}

	/**
	 * Gets a message image URI by appending the given message ID to the prefixSticker
	 * @param {string} [messageId] - The message ID to use in the URLSticker
	 * @param {boolean} [isPreview=false] - Whether to append '/preview' to the URL.
	 * @return {string} The getted message image URISticker
	 */
	public getDataUrl(
		messageId: string,
		isPreview: boolean = false,
		square: boolean = false,
	): string {
		return `${this.prefix}r/${square ? "g2" : "talk"}/m/${messageId}${isPreview ? "/preview" : ""}`;
	}

	/**
	 * Gets an OpenChat member image URI by appending the given OpenChat member ID to the prefixSticker
	 * @param {string} [squareMemberId] - The square member ID (pid) to use in the URLSticker
	 * @param {boolean} [isPreview=false] - Whether to append '/preview' to the URL.
	 * @return {string} The getted OpenChat member image URISticker
	 */
	public getSquareMemberImage(
		squareMemberId: string,
		isPreview: boolean = false,
	): string {
		return `${this.prefix}r/g2/member/${squareMemberId}${
			isPreview ? "/preview" : ""
		}`;
	}
}

export { LINE_OBS_BASE as LINE_OBS };
