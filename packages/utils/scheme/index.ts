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

	public getPrivacySettings(useSettings: boolean = true): string {
		if (useSettings) {
			return this.prefix + "nv/settings/privacy";
		} else {
			return this.prefix + "nv/privacy";
		}
	}

	public getAccountSettings(useSettings: boolean = true): string {
		if (useSettings) {
			return this.prefix + "nv/settings/account";
		} else {
			return this.prefix + "nv/account";
		}
	}

	public getStickerSettings(useSettings: boolean = true): string {
		if (useSettings) {
			return this.prefix + "nv/settings/sticker";
		} else {
			return this.prefix + "nv/stickerSettings";
		}
	}

	public getChatSettings(useSettings: boolean = true): string {
		if (useSettings) {
			return this.prefix + "nv/settings/chatSettings";
		} else {
			return this.prefix + "nv/chatVoiceCallSettings";
		}
	}

	public getAddressBookSync(useSettings: boolean = true): string {
		if (useSettings) {
			return this.prefix + "nv/settings/addressBookSync";
		} else {
			return this.prefix + "nv/friendsSettings";
		}
	}

	public getTimelineSettings(useSettings: boolean = true): string {
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

	public getRecommendOA(oaId: string): string {
		return this.prefix + `nv/recommendOA/${oaId}`;
	}

	public getCh(ch: string = ""): string {
		return this.prefix + "ch" + ch;
	}

	public getLiffApp(
		id: string = "",
		useLiff: boolean = false,
		param: Record<string, string> = {},
	): string {
		const urlParam = "?" + new URLSearchParams(param).toString();
		if (useLiff) {
			return "https://" + "liff.line.me/" + id + urlParam;
		} else {
			return this.prefix + "app/" + id + urlParam;
		}
	}

	public getOfficialAccountLiff(
		useLiff: boolean = false,
		param: Record<string, string> = {},
	): string {
		return this.getLiffApp("1645278921-kWRPP32q", useLiff, param);
	}

	public getVoteLiff(
		useLiff: boolean = false,
		param: Record<string, string> = {},
	): string {
		return this.getLiffApp("1477715170-Pl2JnXpR", useLiff, param);
	}

	public getSpamFilterLiff(
		useLiff: boolean = false,
		param: Record<string, string> = {},
	): string {
		return this.getLiffApp("1556150347-zL2b31Eq", useLiff, param);
	}

	public getAutoReplyLiff(
		useLiff: boolean = false,
		param: Record<string, string> = {},
	): string {
		return this.getLiffApp("1655702173-mvkgA1yR", useLiff, param);
	}

	public getTlanslateLiff(
		useLiff: boolean = false,
		param: Record<string, string> = {},
	): string {
		return this.getLiffApp("1506931274-R5LDWmAW", useLiff, param);
	}

	public getGiftLiff(
		useLiff: boolean = false,
		param: Record<string, string> = {},
	): string {
		return this.getLiffApp("1654120723-lYaWZEb6", useLiff, param);
	}

	public getSquareLiff(
		useLiff: boolean = false,
		param: Record<string, string> = {},
	): string {
		return this.getLiffApp("1573545970-LlNdaE20", useLiff, param);
	}

	public getPointClubLiff(
		useLiff: boolean = false,
		param: Record<string, string> = {},
	): string {
		return this.getLiffApp("1370466387-VxxzrzRW", useLiff, param);
	}

	public getScheduleLiff(
		useLiff: boolean = false,
		param: Record<string, string> = {},
	): string {
		return this.getLiffApp("1655112642-8v0aXBwM", useLiff, param);
	}

	public getCouponLiff(
		useLiff: boolean = false,
		param: Record<string, string> = {},
	): string {
		return this.getLiffApp("1611905212-3bydBEmv", useLiff, param);
	}

	public getStampShopLiff(
		useLiff: boolean = false,
		param: Record<string, string> = {},
	): string {
		return this.getLiffApp("1359301715-JKd7Y7j1", useLiff, param);
	}

	public getDressUpShopLiff(
		useLiff: boolean = false,
		param: Record<string, string> = {},
	): string {
		return this.getLiffApp("1359301715-lw9jxjqV", useLiff, param);
	}

	public getStampCategory(categoryId: string): string {
		return this.prefix + `shop/sticker/category/${categoryId}`;
	}

	public getStampPackage(packageId: string): string {
		return this.prefix + `shop/sticker/detail/${packageId}`;
	}

	public getStampAuthor(authorId: string): string {
		return this.prefix + `shop/sticker/author/${authorId}`;
	}

	public getStampProduct(productId: string): string {
		return this.prefix + `shop/theme/detail?id=${productId}`;
	}

	public getSquareMain(): string {
		return this.prefix + "square/main";
	}

	public getSquareCreate(): string {
		return this.prefix + "square/createSquare";
	}

	public getSquareReport(
		ticketOrEmid: string,
		isTicket: boolean = true,
	): string {
		if (isTicket) {
			return this.prefix + `square/report?ticket=${ticketOrEmid}`;
		} else {
			return this.prefix + `square/report?emid=${ticketOrEmid}`;
		}
	}

	public getSquareJoin(ticketOrEmid: string, isTicket: boolean = true): string {
		if (isTicket) {
			return this.prefix + `square/join?ticket=${ticketOrEmid}`;
		} else {
			return this.prefix + `square/join?emid=${ticketOrEmid}`;
		}
	}

	public getSquareHome(emid: string): string {
		return this.prefix + `square/home?encryptedSquareMid=${emid}`;
	}

	public getSquareNotePost(squareMid: string, postId: string): string {
		return this.prefix +
			`square/post?squareMid=${squareMid}&postId=${postId}&sourceType=TALKROOM_HOME`;
	}

	public getUserTicket(ticket: string): string {
		return this.prefix + `ti/p/${ticket}`;
	}

	public getUserIdSearch(userId: string): string {
		return this.prefix + `ti/p/~${userId}`;
	}

	public getGroupTicket(ticket: string): string {
		return this.prefix + `ti/g/${ticket}`;
	}

	public getSquareTicket(ticket: string): string {
		return this.prefix + `ti/g2/${ticket}`;
	}

	public getTextShare(text: string, useShare: boolean = true): string {
		if (useShare) {
			return this.prefix + "share?text=" + text;
		} else {
			return this.prefix + "msg/text/" + text;
		}
	}

	public getOaMessage(oaId: string, text: string): string {
		return this.prefix + `oaMessage/${oaId}/?${text}`;
	}

	public getAlbums(): string {
		return this.prefix + "moa/albums/album";
	}

	public getUserPost(userMid: string, postId: string): string {
		return this.prefix + `home/post?userMid=${userMid}&postId=${postId}`;
	}

	public getOaMain(oaId_withoutAT: string): string {
		return this.prefix + `home/public/main?id=${oaId_withoutAT}`;
	}

	public getOaProfile(oaId_withoutAT: string): string {
		return this.prefix + `home/public/profile?id=${oaId_withoutAT}`;
	}

	public getOaPost(oaId_withoutAT: string, postId: string): string {
		return this.prefix +
			`home/public/post?id=${oaId_withoutAT}&postId=${postId}`;
	}

	public getGroupCreate(): string {
		return this.prefix + "group/create";
	}

	public getGroupPost(groupId: string, postId: string): string {
		return this.prefix +
			`group/home/posts/post?homeId=${groupId}&postId=${postId}`;
	}

	public getGroupAlbum(albumId: string, groupId: string): string {
		return this.prefix +
			`group/home/albums/album?albumId=${albumId}&homeId=${groupId}&albumIdV2=${albumId}`;
	}
}

export { LINE_SCHEME_BASE as LINE_SCHEME };
