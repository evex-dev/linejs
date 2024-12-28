// For Relation (find user, etc)

import { LINEStruct, type ProtocolKey } from "../../thrift/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import type { Client } from "../../core/mod.ts";
import type { BaseService } from "../types.ts";
export class RelationService implements BaseService {
	client: Client;
	protocolType: ProtocolKey = 4;
	requestPath = "/RE4";
	errorName = "RelationServiceError";
	constructor(client: Client) {
		this.client = client;
	}
	async getTargetProfiles(
		...param: Parameters<typeof LINEStruct.getTargetProfiles_args>
	): Promise<LINETypes.getTargetProfiles_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getTargetProfiles_args(...param),
			"getTargetProfiles",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getRecommendationDetails(
		...param: Parameters<typeof LINEStruct.getRecommendationDetails_args>
	): Promise<LINETypes.getRecommendationDetails_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getRecommendationDetails_args(...param),
			"getRecommendationDetails",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getContactCalendarEvents(
		...param: Parameters<typeof LINEStruct.getContactCalendarEvents_args>
	): Promise<LINETypes.getContactCalendarEvents_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getContactCalendarEvents_args(...param),
			"getContactCalendarEvents",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getContactsV3(
		...param: Parameters<typeof LINEStruct.getContactsV3_args>
	): Promise<LINETypes.getContactsV3_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getContactsV3_args(...param),
			"getContactsV3",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getFriendDetails(
		...param: Parameters<typeof LINEStruct.getFriendDetails_args>
	): Promise<LINETypes.getFriendDetails_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getFriendDetails_args(...param),
			"getFriendDetails",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async addFriendByMid(
		...param: Parameters<typeof LINEStruct.addFriendByMid_args>
	): Promise<LINETypes.addFriendByMid_result["success"]> {
		return await this.client.request.request(
			LINEStruct.addFriendByMid_args(...param),
			"addFriendByMid",
			this.protocolType,
			true,
			this.requestPath,
		);
	}
}
