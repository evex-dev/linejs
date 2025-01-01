// For Channel (channel, voom, etc)

import { LINEStruct, type ProtocolKey } from "../../thrift/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import type { BaseClient } from "../../core/mod.ts";
import type { BaseService } from "../types.ts";
export class ChannelService implements BaseService {
	client: BaseClient;
	protocolType: ProtocolKey = 4;
	requestPath = "/CH4";
	errorName = "ChannelServiceError";
	constructor(client: BaseClient) {
		this.client = client;
	}
	/**
	 * @description Gets the ChannelToken by channelId.\
	 * channelIds:
	 * - linevoom: 1341209850
	 */
	async approveChannelAndIssueChannelToken(
		...param: Parameters<
			typeof LINEStruct.approveChannelAndIssueChannelToken_args
		>
	): Promise<LINETypes.approveChannelAndIssueChannelToken_result["success"]> {
		return await this.client.request.request(
			LINEStruct.approveChannelAndIssueChannelToken_args(...param),
			"approveChannelAndIssueChannelToken",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getChannelInfo(
		...param: Parameters<typeof LINEStruct.getChannelInfo_args>
	): Promise<LINETypes.getChannelInfo_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getChannelInfo_args(...param),
			"getChannelInfo",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getCommonDomains(
		...param: Parameters<typeof LINEStruct.getCommonDomains_args>
	): Promise<LINETypes.getCommonDomains_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getCommonDomains_args(...param),
			"getCommonDomains",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async issueRequestTokenWithAuthScheme(
		...param: Parameters<
			typeof LINEStruct.issueRequestTokenWithAuthScheme_args
		>
	): Promise<LINETypes.issueRequestTokenWithAuthScheme_result["success"]> {
		return await this.client.request.request(
			LINEStruct.issueRequestTokenWithAuthScheme_args(...param),
			"issueRequestTokenWithAuthScheme",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getReturnUrlWithRequestTokenForAutoLogin(
		...param: Parameters<
			typeof LINEStruct.getReturnUrlWithRequestTokenForAutoLogin_args
		>
	): Promise<
		LINETypes.getReturnUrlWithRequestTokenForAutoLogin_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.getReturnUrlWithRequestTokenForAutoLogin_args(...param),
			"getReturnUrlWithRequestTokenForAutoLogin",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getWebLoginDisallowedUrl(
		...param: Parameters<typeof LINEStruct.getWebLoginDisallowedUrl_args>
	): Promise<LINETypes.getWebLoginDisallowedUrl_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getWebLoginDisallowedUrl_args(...param),
			"getWebLoginDisallowedUrl",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateChannelNotificationSetting(
		...param: Parameters<
			typeof LINEStruct.updateChannelNotificationSetting_args
		>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.updateChannelNotificationSetting_args(...param),
			"updateChannelNotificationSetting",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateChannelSettings(
		...param: Parameters<typeof LINEStruct.updateChannelSettings_args>
	): Promise<LINETypes.updateChannelSettings_result["success"]> {
		return await this.client.request.request(
			LINEStruct.updateChannelSettings_args(...param),
			"updateChannelSettings",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getUpdatedChannelIds(
		...param: Parameters<typeof LINEStruct.getUpdatedChannelIds_args>
	): Promise<LINETypes.getUpdatedChannelIds_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getUpdatedChannelIds_args(...param),
			"getUpdatedChannelIds",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getChannelNotificationSettings(
		...param: Parameters<
			typeof LINEStruct.getChannelNotificationSettings_args
		>
	): Promise<LINETypes.getChannelNotificationSettings_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getChannelNotificationSettings_args(...param),
			"getChannelNotificationSettings",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getApprovedChannels(
		...param: Parameters<typeof LINEStruct.getApprovedChannels_args>
	): Promise<LINETypes.getApprovedChannels_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getApprovedChannels_args(...param),
			"getApprovedChannels",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async issueChannelToken(
		...param: Parameters<typeof LINEStruct.issueChannelToken_args>
	): Promise<LINETypes.issueChannelToken_result["success"]> {
		return await this.client.request.request(
			LINEStruct.issueChannelToken_args(...param),
			"issueChannelToken",
			this.protocolType,
			true,
			this.requestPath,
		);
	}
}
