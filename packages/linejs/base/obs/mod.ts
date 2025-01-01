import { Buffer } from "node:buffer";
import { type BaseClient, InternalError } from "../core/mod.ts";
import { MimeType } from "./mime.ts";
import crypto from "node:crypto";
import type { Message } from "@evex/linejs-types";

export type ObjType = "image" | "gif" | "video" | "audio" | "file";
export interface ObsMetadata {
	status: string;
	name: string;
	mime: string;
	type: string;
	hash: string;
	cksum: string;
	size: number | string;
	ctimeMillis: number;
	imageDetails?: {
		format: string;
		height: number;
		width: number;
		signature: string;
	};
	videoMp4Details?: {
		size: number;
		durationMillis: number;
		height: number;
		width: number;
		format: string;
		status: string;
	};
	audioM4aDetails?: {
		size: number;
		durationMillis: number;
		format: string;
		status: string;
	};
	svc: string;
	offset: number;
	ctime: string;
	oid: string;
	userid: string;
	sid: string;
}

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
	public getMessageDataUrl(
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
	public getMessageMetadataUrl(
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
			this.getMessageDataUrl(messageId, isPreview, isSquare),
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
		isSquare?: boolean;
	}): Promise<ObsMetadata> {
		if (!this.client.authToken) {
			throw new InternalError(
				"Not setup yet",
				"Please call 'login()' first",
			);
		}
		const { messageId, isSquare } = {
			isSquare: false,
			...options,
		};
		const r = await this.client.fetch(
			this.getMessageMetadataUrl(messageId, isSquare),
			{
				headers: {
					accept: "application/json, text/plain, */*",
					"x-line-application": this.client.request.systemType,
					"x-Line-access": this.client.authToken,
				},
			},
		);
		return r.json();
	}

	/**
	 * @description Upload obs message to talk.
	 */
	public async uploadObjTalk(
		to: string,
		type: ObjType,
		data: Blob,
		oid?: string,
		filename?: string,
	): Promise<{
		objId: string;
		objHash: string;
		headers: Headers;
	}> {
		if (!this.client.authToken) {
			throw new InternalError(
				"Not setup yet",
				"Please call 'login()' first",
			);
		}
		const ext = MimeType[data.type as keyof typeof MimeType];
		const param: {
			oid: string;
			reqseq?: string;
			tomid?: string;
			ver: string;
			name: string;
			type: string;
			cat?: string;
			duration?: string;
		} = {
			ver: "2.0",
			name: filename || "linejs." + ext,
			type,
			...oid ? { oid: oid } : {
				oid: "reqseq",
				tomid: to,
				reqseq: this.client.getReqseq("talk").toString(),
			},
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
		return await this.uploadObjectForService({
			data,
			oType: type,
			obsPath: toType + "/m/" + oid || "reqseq",
			filename: param.name,
		});
	}

	async uploadObjectForService(options: {
		data: Blob;
		oType?: ObjType;
		obsPath?: string;
		params?: Record<string, string | undefined>;
		filename?: string;
		addHeaders?: Record<string, string>;
	}): Promise<
		{ objId: string; objHash: string; headers: Headers }
	> {
		let {
			data,
			oType,
			obsPath,
			params,
			filename,
			addHeaders,
		} = {
			oType: "image",
			obsPath: "myhome/h",
			...options,
		};
		const obsPathFinal = `/r/${obsPath}`;
		oType = oType.toLowerCase();

		filename = filename || crypto.randomUUID();
		const baseParams = {
			type: oType,
			ver: "2.0",
			name: filename,
		};

		params = { ...baseParams, ...(params || {}) };

		if (!data || data.size === 0) {
			throw new InternalError("ObsError", "No data to send.");
		}
		let headers: Record<string, string> = this.client.request
			.getHeader("POST");
		headers["Content-Type"] = "application/octet-stream";
		headers["X-Obs-Params"] = Buffer.from(JSON.stringify(params)).toString(
			"base64",
		);

		if (addHeaders) {
			headers = { ...headers, ...addHeaders };
		}

		const response = await this.client.fetch(
			this.prefix + obsPathFinal,
			{ method: "POST", headers, body: data },
		);

		const objId = response.headers.get("x-obs-oid") ?? "";
		const objHash = response.headers.get("x-obs-hash") ?? "";
		return { objId, objHash, headers: response.headers };
	}

	async downloadObjectForService(options: {
		obsPath: string;
		oid: string;
		addHeaders?: Record<string, string>;
	}): Promise<Blob> {
		let { obsPath, oid, addHeaders } = {
			addHeaders: {},
			...options,
		};
		if (obsPath.includes("{oid}")) {
			obsPath = obsPath.replace("{oid}", oid);
		} else {
			obsPath += "/" + oid;
		}
		let headers: Record<string, string> = this.client.request
			.getHeader("GET");
		headers = { ...headers, ...addHeaders };

		const obsPathFinal = "r/" + obsPath;
		const response = await this.client.fetch(
			this.prefix + obsPathFinal,
			{ method: "GET", headers },
		);
		return response.blob();
	}

	public async uploadMediaByE2EE(options: {
		data: Blob;
		oType: ObjType;
		to: string;
		filename?: string;
	}): Promise<Message> {
		const { data, oType, to, filename } = options;
		const typeSet: {
			image: [string, 1];
			video: [string, 2];
			audio: [string, 3];
			file: [string, 14];
			gif: [string, 1];
		} = {
			"image": ["emi", 1],
			"video": ["emv", 2],
			"audio": ["ema", 3],
			"file": ["emf", 14],
			"gif": ["emi", 1],
		};

		const ext = (filename && filename.split(".").at(-1)) ||
			MimeType[data.type as keyof typeof MimeType];

		const serviceName = "talk";
		const [obsNamespace, contentType] = typeSet[oType];
		const params: Record<string, string> = { "type": "file" };

		if (oType === "gif") {
			params["cat"] = "original";
		}
		if (!(to[0] === "u" || to[0] === "c")) {
			throw new InternalError("ObsError", "Invalid mid");
		}
		const { keyMaterial, encryptedData } = await this.client.e2ee
			.encryptByKeyMaterial(
				Buffer.from(await data.arrayBuffer()),
			);
		const tempId = "reqid-" + crypto.randomUUID();
		const edata = new Blob([encryptedData.buffer]);
		const { objId } = await this.uploadObjectForService({
			data: edata,
			oType: "file",
			obsPath: `${serviceName}/${obsNamespace}/${tempId}`,
			params,
		});
		if (oType === "image" || oType === "gif" || oType === "video") {
			const { objId: objId2, headers } = await this
				.uploadObjectForService({
					data: edata,
					oType: "file",
					obsPath: `${serviceName}/${obsNamespace}/${tempId}__ud-preview`,
					params,
				});
			if (objId !== objId2) {
				throw new InternalError("ObsError", "objId not match", {
					headers,
				});
			}
		}

		const chunks = await this.client.e2ee.encryptE2EEMessage(
			to,
			{ keyMaterial, fileName: filename || "linejs." + ext },
			1,
		);

		return await this.client.talk.sendMessage({
			to,
			chunks,
			contentType: contentType,
			contentMetadata: {
				SID: obsNamespace,
				OID: objId,
				FILE_SIZE: edata.size.toString(),
				e2eeVersion: "2",
				...(oType === "image" || oType === "gif" || oType === "video")
					? {
						MEDIA_CONTENT_INFO: JSON.stringify(
							{
								category: "original",
								fileSize: edata.size,
								extension: ext,
								animated: oType == "gif",
							},
						),
					}
					: {},
			},
		});
	}
}
