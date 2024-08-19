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
	) { }

	/**
	 * @returns home url
	 */
	public getHome(): string {
		return this.prefix + "home";
	}

	/**
	 * @returns user profile setting url
	 */
	public getProfile(useNv: boolean = true): string {
		if (useNv) {
			return this.prefix + "nv/profile";
		} else {
			return this.prefix + "profile";
		}
	}

	/**
	 * @returns nv url
	 */
	public getNv(nv: string = ""): string {
		return this.prefix + "nv" + nv;
	}

	public getFriend(): string {
		return this.prefix + "nv/friend";
	}

	public getChat(): string {
		return this.prefix + "nv/chat";
	}

	public getTimeline(): string {
		return this.prefix + "nv/timeline";
	}

	public getVoom(): string {
		return this.prefix + "nv/timeline";
	}

	public getNews(): string {
		return this.prefix + "nv/news";
	}

	public getWallet(): string {
		return this.prefix + "nv/wallet";
	}

	public getCall(): string {
		return this.prefix + "nv/call";
	}

	public getSettings(): string {
		return this.prefix + "nv/settings";
	}

	public getAddFriends(useNv: boolean = false): string {
		if (useNv) {
			return this.prefix + "nv/addFriends";
		} else {
			return this.prefix + "addFriend";
		}
	}

	public getInvitationEmail(): string {
		return this.prefix + "nv/invitationEmail";
	}

	public getInvitationSms(): string {
		return this.prefix + "nv/invitationSms";
	}

	public getQRCodeReader(): string {
		return this.prefix + "nv/QRCodeReader";
	}

	public getQRCode(): string {
		return this.prefix + "nv/QRCode";
	}

	public getKeep(): string {
		return this.prefix + "nv/keep";
	}

	public getProfileSetId(): string {
		return this.prefix + "nv/profileSetId";
	}

	public getConnectedApps(): string {
		return this.prefix + "nv/connectedApps";
	}

	public getConnectedDevices(): string {
		return this.prefix + "nv/connectedDevices";
	}

	public getThemeSettingsMenu(): string {
		return this.prefix + "nv/themeSettingsMenu";
	}

	public getCoinsSettings(): string {
		return this.prefix + "nv/coinsSettings";
	}

	public getNotificationSettings(): string {
		return this.prefix + "nv/notificationSettings";
	}

	public getNotificationServiceDetail(): string {
		return this.prefix + "nv/notificationServiceDetail";
	}

	public getImageVideoSettings(): string {
		return this.prefix + "nv/imageVideoSettings";
	}

	public getSuggestSettings(): string {
		return this.prefix + "nv/suggestSettings";
	}

	public getNotifications(): string {
		return this.prefix + "nv/notifications";
	}

	public getHelp(): string {
		return this.prefix + "nv/help";
	}

	public getAbout(): string {
		return this.prefix + "nv/about";
	}

	public getOfficialAccounts(): string {
		return this.prefix + "nv/officialAccounts";
	}

	public getCamera(): string {
		return this.prefix + "nv/camera";
	}

	public getLocation(): string {
		return this.prefix + "nv/location";
	}

	public getCameraRollMulti(): string {
		return this.prefix + "nv/cameraRoll/multi";
	}

	public getCameraRollSingle(): string {
		return this.prefix + "nv/cameraRoll/single";
	}

	public getCallSettings(): string {
		return this.prefix + "nv/settings/callSettings";
	}

	public getRingbacktoneSettings(): string {
		return this.prefix + "nv/settings/ringbacktone";
	}

	public getRingtoneSettings(): string {
		return this.prefix + "nv/settings/ringtone";
	}

	public getThemeSettings(): string {
		return this.prefix + "nv/settings/themeSettings";
	}

	public getPrivacySettings(useSettings: boolean = false): string {
		if (useSettings) {
			return this.prefix + "nv/settings/privacy";
		} else {
			return this.prefix + "nv/privacy";
		}
	}

	public getAccountSettings(useSettings: boolean = false): string {
		if (useSettings) {
			return this.prefix + "nv/settings/account";
		} else {
			return this.prefix + "nv/account";
		}
	}

	public getStickerSettings(useSettings: boolean = false): string {
		if (useSettings) {
			return this.prefix + "nv/settings/sticker";
		} else {
			return this.prefix + "nv/stickerSettings";
		}
	}

	public getChatSettings(useSettings: boolean = false): string {
		if (useSettings) {
			return this.prefix + "nv/settings/chatSettings";
		} else {
			return this.prefix + "nv/chatVoiceCallSettings";
		}
	}

	public getAddressBookSync(useSettings: boolean = false): string {
		if (useSettings) {
			return this.prefix + "nv/settings/addressBookSync";
		} else {
			return this.prefix + "nv/friendsSettings";
		}
	}

	public getTimelineSettings(useSettings: boolean = false): string {
		if (useSettings) {
			return this.prefix + "nv/settings/timelineSettings";
		} else {
			return this.prefix + "nv/timelineSettings";
		}
	}

	public getMySticker(): string {
		return this.prefix + "nv/stickerShop/mySticker";
	}

	public getDeviceLink(): string {
		return this.prefix + "nv/things/deviceLink";
	}

	public getNewPost(): string {
		return this.prefix + "nv/timeline/post";
	}

	public getProfilePopup(mid: string): string {
		return this.prefix + `nv/profilePopup/mid=${mid}`;
	}

	public getJumpToChatMsg(groupId: string, messageId: string): string {
		return this.prefix + `nv/chatMsg?chatId=${groupId}&messageId=${messageId}`;
	}

	public getRecommendOA(oaId:string): string {
		return this.prefix + `nv/recommendOA/${oaId}`;
	}
}

export { LINE_SCHEME_BASE as LINE_SCHEME };
