// For Call (call, etc)

import { LINEStruct, type ProtocolKey } from "../../thrift/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import type { Client } from "../../core/mod.ts";
import type { BaseService } from "../types.ts";

export class CallService implements BaseService {
	client: Client;
	protocolType: ProtocolKey = 4;
	requestPath = "/V4";
	errorName = "CallServiceError";
	constructor(client: Client) {
		this.client = client;
	}
	async acquireCallRoute(
		...param: Parameters<typeof LINEStruct.acquireCallRoute_args>
	): Promise<LINETypes.acquireCallRoute_result["success"]> {
		return await this.client.request.request(
			LINEStruct.acquireCallRoute_args(...param),
			"acquireCallRoute",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async acquireOACallRoute(
		...param: Parameters<typeof LINEStruct.acquireOACallRoute_args>
	): Promise<LINETypes.acquireOACallRoute_result["success"]> {
		return await this.client.request.request(
			LINEStruct.acquireOACallRoute_args(...param),
			"acquireOACallRoute",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async lookupPaidCall(
		...param: Parameters<typeof LINEStruct.lookupPaidCall_args>
	): Promise<LINETypes.lookupPaidCall_result["success"]> {
		return await this.client.request.request(
			LINEStruct.lookupPaidCall_args(...param),
			"lookupPaidCall",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async acquirePaidCallRoute(
		...param: Parameters<typeof LINEStruct.acquirePaidCallRoute_args>
	): Promise<LINETypes.acquirePaidCallRoute_result["success"]> {
		return await this.client.request.request(
			LINEStruct.acquirePaidCallRoute_args(...param),
			"acquirePaidCallRoute",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async acquireGroupCallRoute(
		...param: Parameters<typeof LINEStruct.acquireGroupCallRoute_args>
	): Promise<LINETypes.acquireGroupCallRoute_result["success"]> {
		return await this.client.request.request(
			LINEStruct.acquireGroupCallRoute_args(...param),
			"acquireGroupCallRoute",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getGroupCall(
		...param: Parameters<typeof LINEStruct.getGroupCall_args>
	): Promise<LINETypes.getGroupCall_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getGroupCall_args(...param),
			"getGroupCall",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async inviteIntoGroupCall(
		...param: Parameters<typeof LINEStruct.inviteIntoGroupCall_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.inviteIntoGroupCall_args(...param),
			"inviteIntoGroupCall",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getGroupCallUrls(
		...param: Parameters<typeof LINEStruct.getGroupCallUrls_args>
	): Promise<LINETypes.getGroupCallUrls_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getGroupCallUrls_args(...param),
			"getGroupCallUrls",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async createGroupCallUrl(
		...param: Parameters<typeof LINEStruct.createGroupCallUrl_args>
	): Promise<LINETypes.createGroupCallUrl_result["success"]> {
		return await this.client.request.request(
			LINEStruct.createGroupCallUrl_args(...param),
			"createGroupCallUrl",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async deleteGroupCallUrl(
		...param: Parameters<typeof LINEStruct.deleteGroupCallUrl_args>
	): Promise<LINETypes.deleteGroupCallUrl_result["success"]> {
		return await this.client.request.request(
			LINEStruct.deleteGroupCallUrl_args(...param),
			"deleteGroupCallUrl",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateGroupCallUrl(
		...param: Parameters<typeof LINEStruct.updateGroupCallUrl_args>
	): Promise<LINETypes.updateGroupCallUrl_result["success"]> {
		return await this.client.request.request(
			LINEStruct.updateGroupCallUrl_args(...param),
			"updateGroupCallUrl",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getGroupCallUrlInfo(
		...param: Parameters<typeof LINEStruct.getGroupCallUrlInfo_args>
	): Promise<LINETypes.getGroupCallUrlInfo_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getGroupCallUrlInfo_args(...param),
			"getGroupCallUrlInfo",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async joinChatByCallUrl(
		...param: Parameters<typeof LINEStruct.joinChatByCallUrl_args>
	): Promise<LINETypes.joinChatByCallUrl_result["success"]> {
		return await this.client.request.request(
			LINEStruct.joinChatByCallUrl_args(...param),
			"joinChatByCallUrl",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async kickoutFromGroupCall(
		...param: Parameters<typeof LINEStruct.kickoutFromGroupCall_args>
	): Promise<LINETypes.kickoutFromGroupCall_result["success"]> {
		return await this.client.request.request(
			LINEStruct.kickoutFromGroupCall_args(...param),
			"kickoutFromGroupCall",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async startPhotobooth(
		...param: Parameters<typeof LINEStruct.startPhotobooth_args>
	): Promise<LINETypes.startPhotobooth_result["success"]> {
		return await this.client.request.request(
			LINEStruct.startPhotobooth_args(...param),
			"startPhotobooth",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async usePhotoboothTicket(
		...param: Parameters<typeof LINEStruct.usePhotoboothTicket_args>
	): Promise<LINETypes.usePhotoboothTicket_result["success"]> {
		return await this.client.request.request(
			LINEStruct.usePhotoboothTicket_args(...param),
			"usePhotoboothTicket",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getPhotoboothBalance(
		...param: Parameters<typeof LINEStruct.getPhotoboothBalance_args>
	): Promise<LINETypes.getPhotoboothBalance_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getPhotoboothBalance_args(...param),
			"getPhotoboothBalance",
			this.protocolType,
			true,
			this.requestPath,
		);
	}
}
