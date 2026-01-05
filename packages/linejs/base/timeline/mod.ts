// deno-lint-ignore-file no-explicit-any
import type { BaseClient } from "../mod.ts";

export type TimelineResponse<T = any> = {
	code: number;
	message: string;
	result: T;
};

export class Timeline {
	protected timelineToken: string | undefined;
	public timelineHeaders: Record<string, string | undefined> = {};
	client: BaseClient;
	constructor(client: BaseClient) {
		this.client = client;
	}

	public async initTimeline() {
		if (this.timelineToken) {
			return;
		}
		this.timelineToken = (
			await this.client.channel.approveChannelAndIssueChannelToken({
				channelId: "1341209850",
			})
		).channelAccessToken;
		this.timelineHeaders = {
			"x-line-bdbtemplateversion": "v1",
			"x-lsr": "JP",
			"user-agent": this.client.request.userAgent,
			"x-line-channeltoken": this.timelineToken,
			"accept-encoding": "gzip",
			"x-line-global-config":
				"discover.enable=true; follow.enable=true; reboot.phase=scenario",
			"x-line-mid": this.client.profile!.mid,
			"x-line-access": this.client.authToken,
			"content-type": "application/json; charset=UTF-8",
			"x-line-application": this.client.request.systemType,
			"x-lal": "ja_JP",
			"x-lpv": "1",
		};
	}

	public async createPost(options: {
		homeId: string;
		text?: string;
		sharedPostId?: string;
		textSizeMode?: "AUTO" | "NORMAL";
		backgroundColor?: string;
		textAnimation?: "NONE" | "SLIDE" | "ZOOM" | "BUZZ" | "BOUNCE" | "BLINK";
		readPermissionType?: "ALL" | "FRIEND" | "GROUP" | "EVENT" | "NONE";
		readPermissionGids?: string[];
		holdingTime?: number;
		stickerIds?: string[];
		stickerPackageIds?: string[];
		locationLatitudes?: number[];
		locationLongitudes?: number[];
		locationNames?: string[];
		mediaObjectIds?: string[];
		mediaObjectTypes?: string[];
		sourceType?: string;
	}): Promise<TimelineResponse> {
		await this.initTimeline();
		const {
			homeId,
			text,
			sharedPostId,
			textSizeMode,
			backgroundColor,
			textAnimation,
			readPermissionType,
			readPermissionGids,
			holdingTime,
			stickerIds,
			stickerPackageIds,
			locationLatitudes,
			locationLongitudes,
			locationNames,
			mediaObjectIds,
			mediaObjectTypes,
			sourceType,
		} = {
			textSizeMode: "NORMAL",
			backgroundColor: "#FFFFFF",
			textAnimation: "NONE",
			readPermissionType: "ALL",
			sourceType: "TIMELINE",
			readPermissionGids: [],
			stickerIds: [],
			stickerPackageIds: [],
			locationLatitudes: [],
			locationLongitudes: [],
			locationNames: [],
			mediaObjectIds: [],
			mediaObjectTypes: [],
			...options,
		};
		if (homeId[0] === "u") {
			throw new Error("Not support oto");
		}
		const params = new URLSearchParams({
			homeId: homeId,
			sourceType: sourceType,
		});
		const postInfo: any = {
			readPermission: {
				type: readPermissionType,
				gids: readPermissionGids,
			},
		};
		const stickers: {
			id: string;
			packageId: string;
			packageVersion: number;
			hasAnimation: boolean;
			hasSound: boolean;
			stickerResourceType: string;
		}[] = [];
		const locations: {
			latitude: number;
			longitude: number;
			name: string;
		}[] = [];
		const medias: { objectId: string; type: string; obsFace: string }[] = [];
		stickerIds.forEach((stickerId, stickerIndex) => {
			stickers.push({
				id: stickerId,
				packageId: stickerPackageIds[stickerIndex],
				packageVersion: 1,
				hasAnimation: true,
				hasSound: true,
				stickerResourceType: "ANIMATION",
			});
		});
		locationLatitudes.forEach((locationLatitude, locatioIndex) => {
			locations.push({
				latitude: locationLatitude,
				longitude: locationLongitudes[locatioIndex],
				name: locationNames[locatioIndex],
			});
		});
		mediaObjectIds.forEach((mediaObjectId, mediaIndex) => {
			medias.push({
				objectId: mediaObjectId,
				type: mediaObjectTypes[mediaIndex],
				obsFace: "[]",
			});
		});
		const contents: any = {
			contentsStyle: {
				textStyle: {
					textSizeMode: textSizeMode,
					backgroundColor: backgroundColor,
					textAnimation: textAnimation,
				},
				mediaStyle: { displayType: "GRID_1_A" },
			},
			stickers: stickers,
			locations: locations,
			media: medias,
		};
		if (typeof holdingTime !== "undefined") {
			postInfo.holdingTime = holdingTime;
		}
		if (typeof text !== "undefined") {
			contents.text = text;
		}
		if (typeof sharedPostId !== "undefined") {
			contents.sharedPostId = sharedPostId;
		}
		const data = { postInfo: postInfo, contents: contents };
		const headers = {
			...this.timelineHeaders,
			"x-lhm": "POST",
		};
		return await this.client.fetch(
			`https://${this.client.request.endpoint}/${
				homeId[0] == "s" ? "sn" : "mh"
			}/api/v57/post/create.json?${params}`,
			{ headers, body: JSON.stringify(data), method: "POST" },
		).then((r) => r.json());
	}

	public async deletePost(options: {
		homeId: string;
		postId: string;
	}): Promise<TimelineResponse> {
		await this.initTimeline();
		const { homeId, postId } = { ...options };
		const headers = {
			...this.timelineHeaders,
			"x-lhm": "GET",
		};
		const params = new URLSearchParams({
			homeId,
			postId,
		});
		return await this.client.fetch(
			`https://${this.client.request.endpoint}/${
				homeId[0] == "s" ? "sn" : "mh"
			}/api/v57/post/delete.json?${params}`,
			{ headers, method: "POST" },
		).then((r) => r.json());
	}

	public async getPost(options: {
		homeId: string;
		postId: string;
	}): Promise<TimelineResponse> {
		await this.initTimeline();
		const { homeId, postId } = { ...options };
		const headers = {
			...this.timelineHeaders,
			"x-lhm": "GET",
		};
		const params = new URLSearchParams({
			homeId,
			postId,
		});
		return await this.client.fetch(
			`https://${this.client.request.endpoint}/${
				homeId[0] == "s" ? "sn" : "mh"
			}/api/v57/post/get.json?${params}`,
			{ headers },
		).then((r) => r.json());
	}

	public async listPost(options: {
		homeId: string;
		postId?: string;
		updatedTime?: number;
		sourceType?: string;
	}): Promise<TimelineResponse> {
		await this.initTimeline();
		const { homeId, postId, updatedTime, sourceType } = {
			sourceType: "TALKROOM",
			...options,
		};
		const headers = {
			...this.timelineHeaders,
			"x-lhm": "GET",
		};
		const data: Record<string, string> = {
			homeId,
			sourceType,
			likeLimit: "0",
			commentLimit: "0",
		};
		if (postId) {
			data.postId = postId;
		}
		if (updatedTime) {
			data.updatedTime = updatedTime.toString();
		}
		const params = new URLSearchParams(data);
		return await this.client.fetch(
			`https://${this.client.request.endpoint}/${
				homeId[0] == "s" ? "sn" : "mh"
			}/api/v57/post/list.json?${params}`,
			{ headers },
		).then((r) => r.json());
	}
	
	public async updatePost(options: {
		homeId: string;
		postId: string;
		text?: string;
		sharedPostId?: string;
		textSizeMode?: "AUTO" | "NORMAL";
		backgroundColor?: string;
		textAnimation?: "NONE" | "SLIDE" | "ZOOM" | "BUZZ" | "BOUNCE" | "BLINK";
		holdingTime?: number;
		stickerIds?: string[];
		stickerPackageIds?: string[];
		locationLatitudes?: number[];
		locationLongitudes?: number[];
		locationNames?: string[];
		mediaObjectIds?: string[];
		mediaObjectTypes?: string[];
	}): Promise<TimelineResponse> {
		await this.initTimeline();
		const {
			homeId,
			postId,
			text,
			sharedPostId,
			textSizeMode,
			backgroundColor,
			textAnimation,
			holdingTime,
			stickerIds,
			stickerPackageIds,
			locationLatitudes,
			locationLongitudes,
			locationNames,
			mediaObjectIds,
			mediaObjectTypes,
		} = {
			textSizeMode: "NORMAL",
			backgroundColor: "#FFFFFF",
			textAnimation: "NONE",
			stickerIds: [],
			stickerPackageIds: [],
			locationLatitudes: [],
			locationLongitudes: [],
			locationNames: [],
			mediaObjectIds: [],
			mediaObjectTypes: [],
			...options,
		};
		if (!homeId) {
			throw new Error("homeId is required");
		}
		if (!postId) {
			throw new Error("postId is required");
		}
		const postInfo: any = {
			postId: postId,
			editableContents: ["ALL"],
			readPermission: {
				homeID: homeId,
			},
		};
		const stickers: {
			id: string;
			packageId: string;
			packageVersion: number;
			hasAnimation: boolean;
			hasSound: boolean;
			stickerResourceType: string;
		}[] = [];
		const locations: {
			latitude: number;
			longitude: number;
			name: string;
		}[] = [];
		const medias: { objectId: string; type: string; obsFace: string }[] = [];
		stickerIds.forEach((stickerId, stickerIndex) => {
			stickers.push({
				id: stickerId,
				packageId: stickerPackageIds[stickerIndex],
				packageVersion: 1,
				hasAnimation: true,
				hasSound: true,
				stickerResourceType: "ANIMATION",
			});
		});
		locationLatitudes.forEach((locationLatitude, locatioIndex) => {
			locations.push({
				latitude: locationLatitude,
				longitude: locationLongitudes[locatioIndex],
				name: locationNames[locatioIndex],
			});
		});
		mediaObjectIds.forEach((mediaObjectId, mediaIndex) => {
			medias.push({
				objectId: mediaObjectId,
				type: mediaObjectTypes[mediaIndex],
				obsFace: "[]",
			});
		});
		const contents: any = {
			sticonMetas: [],
			contentsStyle: {
				textStyle: textSizeMode || textAnimation ? {
					textSizeMode: textSizeMode,
					textAnimation: textAnimation,
				} : {},
				stickerStyle: backgroundColor ? {
					backgroundColor: backgroundColor,
				} : {},
				mediaStyle: {},
			},
			stickers: stickers,
			textMeta: [],
			locations: locations,
			media: medias,
		};
		if (typeof holdingTime !== "undefined") {
			postInfo.holdingTime = holdingTime;
		}
		if (typeof text !== "undefined") {
			contents.text = text;
		}
		if (typeof sharedPostId !== "undefined") {
			contents.sharedPostId = sharedPostId;
		}
		const data = { postInfo: postInfo, contents: contents };
		const params = new URLSearchParams({
			homeId: homeId,
		});
		const headers = {
			...this.timelineHeaders,
			"x-lhm": "POST",
		};
		return await this.client.fetch(
			`https://${this.client.request.endpoint}/${
				homeId[0] == "s" ? "sn" : "mh"
			}/api/v57/post/update.json?${params}`,
			{ headers, body: JSON.stringify(data), method: "POST" },
		).then((r) => r.json());
	}

	public async likePost(options: {
		contentId: string; // postId
		homeId: string;
		likeType?: "1003" | "1001" | "1002" | "1004" | "1006" | "1005"; // 1003: GOOD, 1001: LOVE, 1002: FUNNY, 1004: AMAZING, 1006: SAD, 1005: SURPRISED
		sourceType?: string;
	}): Promise<TimelineResponse> {
		await this.initTimeline();
		const { contentId, homeId, likeType, sourceType } = {
			likeType: "1003",
			sourceType: "TIMELINE",
			...options,
		};
		const params = new URLSearchParams({
			homeId,
		});
		const headers = {
			...this.timelineHeaders,
			"x-lhm": "POST",
		};
		return await this.client.fetch(
			`https://${this.client.request.endpoint}/ext/note/nt/api/v57/like/create.json?${params}`,
			{
				headers,
				method: "POST",
				body: JSON.stringify({
					sourceType,
					likeType,
					contentId,
				}),
			},
		).then((r) => r.json());
	}

	public async createComment(options: {
		contentId: string; // postId
		commentText: string;
		homeId: string;
		sourceType?: string;
		contentsList?: any[];
	}): Promise<TimelineResponse> {
		await this.initTimeline();
		const { contentId, commentText, homeId, sourceType, contentsList } = {
			sourceType: "TIMELINE",
			contentsList: [],
			...options,
		};
		const params = new URLSearchParams({
			sourceType,
			homeId,
		});
		const headers = {
			...this.timelineHeaders,
			"x-lhm": "POST",
		};
		const body = {
			commentText,
			contentId,
			contentsList,
		};
		return await this.client.fetch(
			`https://${this.client.request.endpoint}/ext/note/nt/api/v57/comment/create.json?${params}`,
			{
				headers,
				method: "POST",
				body: JSON.stringify(body),
			},
		).then((r) => r.json());
	}
	
	public async sharePost(options: {
		postId: string;
		chatMid: string;
		homeId: string;
	}): Promise<TimelineResponse> {
		const { chatMid, postId, homeId } = {
			...options,
		};
		await this.initTimeline();
		const headers = {
			...this.timelineHeaders,
			"x-lhm": "POST",
		};
		return await this.client.fetch(
			`https://${this.client.request.endpoint}/${
				homeId[0] == "s" ? "sn" : "mh"
			}/api/v57/post/sendPostToTalk.json`,
			{
				method: "POST",
				headers,
				body: JSON.stringify({
					postId: postId,
					receiveMids: [chatMid],
				}),
			},
		).then((r) => r.json());
	}
}
