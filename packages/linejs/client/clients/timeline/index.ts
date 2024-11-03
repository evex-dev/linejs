import type { LooseType } from "../../entities/common.ts";
import { SettingsClient } from "../internal/setting-client.ts";
import type { TimelineResponse } from "../../entities/timeline.ts";

export class Timeline extends SettingsClient {
	protected timelineToken: string | undefined;

	public timelineHeaders: Record<string, string> = {};

	protected async initTimeline() {
		if (this.timelineToken) {
			return;
		}
		this.timelineToken = (
			await this.approveChannelAndIssueChannelToken({ channelId: "1341209850" })
		).channelAccessToken;
		this.timelineHeaders = {
			host: this.endpoint,
			"x-line-bdbtemplateversion": "v1",
			"x-lsr": "JP",
			"user-agent": this.system!.userAgent,
			"x-line-channeltoken": this.timelineToken,
			"accept-encoding": "gzip",
			"x-line-global-config":
				"discover.enable=true; follow.enable=true; reboot.phase=scenario",
			"x-line-mid": this.user!.mid,
			"x-line-access": this.metadata!.authToken,
			"content-type": "application/json; charset=UTF-8",
			"x-line-application": this.system!.type,
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
		const postInfo: LooseType = {
			readPermission: { type: readPermissionType, gids: readPermissionGids },
		};
		const stickers: {
			id: string;
			packageId: string;
			packageVersion: number;
			hasAnimation: boolean;
			hasSound: boolean;
			stickerResourceType: string;
		}[] = [];
		const locations: { latitude: number; longitude: number; name: string }[] =
			[];
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
		const contents: LooseType = {
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
			"Content-type": "application/json",
		};
		return this.customFetch(
			`https://${this.endpoint}/${homeId[0] == "s" ? "sn" : "mh"}/api/v57/post/create.json?${params}`,
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
			"x-lhm": "POST",
			"Content-type": "application/json",
		};
		const params = new URLSearchParams({
			homeId,
			postId,
		});
		return this.customFetch(
			`https://${this.endpoint}/${homeId[0] == "s" ? "sn" : "mh"}/api/v57/post/delete.json?${params}`,
			{ headers, method: "GET" },
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
			"Content-type": "application/json",
		};
		const params = new URLSearchParams({
			homeId,
			postId,
		});
		return this.customFetch(
			`https://${this.endpoint}/${homeId[0] == "s" ? "sn" : "mh"}/api/v57/post/get.json?${params}`,
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
			commentLimit: "0"
		};
		if (postId) {
			data.postId = postId;
		}
		if (updatedTime) {
			data.updatedTime = updatedTime.toString();
		}
		const params = new URLSearchParams(data);
		console.log(params.toString())
		return this.customFetch(
			`https://${this.endpoint}/${homeId[0] == "s" ? "sn" : "mh"}/api/v57/post/list.json?${params}`,
			{ headers },
		).then((r) => r.json());
	}

	public async sharePost(options: {
		postId: string,
		chatMid: string,
		homeId: string,
	}): Promise<TimelineResponse> {
		const { chatMid, postId, homeId } = {
			...options
		}
		await this.initTimeline();
		const headers = {
			...this.timelineHeaders,
			"x-lhm": "POST",
			"Content-type": "application/json",
		};
		return this.customFetch(
			`https://${this.endpoint}/${homeId[0] == "s" ? "sn" : "mh"}/api/v57/post/sendPostToTalk.json`,
			{
				method: "POST",
				headers,
				body: JSON.stringify({
					"postId": postId,
					"receiveMids": [chatMid],
				}),
			}).then((r) => r.json());
	}
}
