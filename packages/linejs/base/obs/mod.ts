import { Buffer } from "node:buffer";
import { type BaseClient, InternalError } from "../core/mod.ts";
import { MimeType } from "./mime.ts";

export class LineObs {
	client: BaseClient;
	prefix = "https://obs.line-apps.com/";
	constructor(client: BaseClient) {
		this.client = client;
	}

	/**
	 * Gets a message image URI by appending the given message ID to the prefixSticker
	 * @param {string} [messageId] - The message ID to use in the URLSticker
	 * @param {boolean} [isPreview=false] - Whether to append '/preview' to the URL.
	 * @return {string} The getted message image
	 */
	public getDataUrl(
		messageId: string,
		isPreview: boolean = false,
		square: boolean = false,
	): string {
		return `${this.prefix}r/${square ? "g2" : "talk"}/m/${messageId}${
			isPreview ? "/preview" : ""
		}`;
	}

	/**
	 * Gets a message image URI by appending the given message ID to the prefixSticker
	 * @param {string} [messageId] - The message ID to use in the URLSticker
	 * @return {string} The getted message image
	 */
	public getMetadataUrl(
		messageId: string,
		square: boolean = false,
	): string {
		return `${this.prefix}r/${
			square ? "g2" : "talk"
		}/m/${messageId}/object_info.obs`;
	}

	/**
	 * @description Gets the message's data from LINE Obs.
	 */
	public async getMessageObsData(options: {
		messageId: string;
		isPreview?: boolean;
		isSquare?: boolean;
	}): Promise<Blob> {
		if (!this.client.authToken) {
			throw new InternalError(
				"Not setup yet",
				"Please call 'login()' first",
			);
		}
		const { messageId, isPreview, isSquare } = {
			isPreview: false,
			isSquare: false,
			...options,
		};
		const r = await this.client.fetch(
			this.getDataUrl(messageId, isPreview, isSquare),
			{
				headers: {
					accept: "application/json, text/plain, */*",
					"x-line-application": this.client.request.systemType,
					"x-Line-access": this.client.authToken,
				},
			},
		);
		return r.blob();
	}

	/**
	 * @description Gets the message's data from LINE Obs.
	 */
	public async getMessageObsMetadata(options: {
		messageId: string;
		isPreview?: boolean;
		isSquare?: boolean;
	}): Promise<Blob> {
		if (!this.client.authToken) {
			throw new InternalError(
				"Not setup yet",
				"Please call 'login()' first",
			);
		}
		const { messageId, isPreview, isSquare } = {
			isPreview: false,
			isSquare: false,
			...options,
		};
		const r = await this.client.fetch(
			this.getMetadataUrl(messageId, isSquare),
			{
				headers: {
					accept: "application/json, text/plain, */*",
					"x-line-application": this.client.request.systemType,
					"x-Line-access": this.client.authToken,
				},
			},
		);
		return r.blob();
	}

	/**
	 * @description Upload obs message to talk.
	 */
	public uploadObjTalk(
		to: string,
		type: "image" | "gif" | "video" | "audio" | "file",
		data: Blob,
		filename?: string,
	): Promise<Response> {
		if (!this.client.authToken) {
			throw new InternalError(
				"Not setup yet",
				"Please call 'login()' first",
			);
		}
		const ext = MimeType[data.type as keyof typeof MimeType];
		const param: {
			oid: string;
			reqseq: string;
			tomid: string;
			ver: string;
			name: string;
			type: string;
			cat?: string;
			duration?: string;
		} = {
			ver: "2.0",
			name: filename || "linejs." + ext,
			type,
			tomid: to,
			oid: "reqseq",
			reqseq: this.client.getReqseq("talk").toString(),
		};
		if (type === "image") {
			param.cat = "original";
		} else if (type === "gif") {
			param.cat = "original";
			param.type = "image";
		} else if (type === "audio" || type === "video") {
			param.duration = "1919"; // 810
		}
		const toType: "talk" | "g2" = to[0] === "m" || to[0] === "t"
			? "g2"
			: "talk";
		return this.client.fetch(
			this.prefix + "r/" + toType + "/m/reqseq",
			{
				headers: {
					accept: "application/json, text/plain, */*",
					"x-line-application": this.client.request
						.systemType as string,
					"x-Line-access": this.client.authToken,
					"content-type": "application/x-www-form-urlencoded",
					"x-obs-params": Buffer.from(JSON.stringify(param)).toString(
						"base64",
					), // allow unicode
				},
				body: data,
				method: "POST",
			},
		);
	}
}
