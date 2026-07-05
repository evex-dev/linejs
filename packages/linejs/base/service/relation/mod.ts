// For Relation (find user, etc)

import { LINEStruct, type ProtocolKey } from "../../thrift/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import type { BaseClient } from "../../core/mod.ts";
import type { BaseService } from "../types.ts";
import type { LooseType } from "@evex/loose-types";

export class RelationService implements BaseService {
	client: BaseClient;
	protocolType: ProtocolKey = 4;
	requestPath = "/RE4";
	errorName = "RelationServiceError";
	constructor(client: BaseClient) {
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
		options: { mids: string[]; checkUserStatusStrictly?: boolean },
	): Promise<LINETypes.getContactsV3_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getContactsV3_args({
				request: {
					targetUsers: options.mids.map((m) => ({
						targetUserMid: m,
					})),
					syncReason: "AUTO_REPAIR",
					checkUserStatusStrictly: options.checkUserStatusStrictly,
				},
			}),
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

	async getUserFriendIds(
		...param: Parameters<typeof LINEStruct.getUserFriendIds_args>
	): Promise<LINETypes.getUserFriendIds_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getUserFriendIds_args(...param),
			"getUserFriendIds",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	/**
	 * @description Add friend by mid.
	 */
	public async addFriendByMid(options: {
		mid: string;
		reference?: string;
		trackingMetaType?: number;
		trackingMetaHint?: string;
	}): Promise<LooseType> {
		const { mid, reference, trackingMetaType, trackingMetaHint } = {
			trackingMetaType: 5,
			...options,
		};
		return await this.client.request.request(
			[
				[8, 1, await this.client.getReqseq()], // seq
				[11, 2, mid],
				[
					12,
					3,
					[
						[11, 1, reference],
						[12, 3, [[12, trackingMetaType, [[
							11,
							1,
							trackingMetaHint,
						]]]]],
					],
				],
			],
			"addFriendByMid",
			this.protocolType,
			false,
			this.requestPath,
		);
	}

	/**
	 * @description Find a contact by its search id (the user's LINE ID). Official
	 * Accounts include the leading `@`, e.g. `@livecast`. Throws when nothing matches
	 * or the id search is rate limited.
	 */
	public async findContactBySearchIdOrTicketV3(options: {
		searchId: string;
	}): Promise<LINETypes.Contact> {
		const { searchId } = options;
		return await this.client.request.request(
			[[12, 1, [[12, 1, [[11, 1, searchId]]]]]],
			"findContactBySearchIdOrTicketV3",
			this.protocolType,
			"Contact",
			this.requestPath,
		);
	}

	/**
	 * @description Search a user by their LINE ID and add them as a friend. Official
	 * Account IDs include the leading `@`.
	 */
	public async addFriendByUserId(options: {
		userId: string;
	}): Promise<LooseType> {
		const contact = await this.findContactBySearchIdOrTicketV3({
			searchId: options.userId,
		});
		return await this.addFriendByMid({
			mid: contact.mid,
			reference: '{"screen":"friendAdd:idSearch","spec":"native"}',
			trackingMetaType: 2,
			trackingMetaHint: options.userId,
		});
	}

	/**
	 * @description Find a contact by phone number. The number is in E.164 form,
	 * e.g. `+66814298575`. Throws when nothing matches or the lookup is rate limited.
	 */
	public async findContactByPhoneV3(options: {
		phone: string;
	}): Promise<LINETypes.Contact> {
		return await this.client.request.request(
			[[12, 1, [[11, 1, options.phone]]]],
			"findContactByPhoneV3",
			this.protocolType,
			"Contact",
			this.requestPath,
		);
	}

	/**
	 * @description Look up a user by phone number (E.164) and add them as a friend.
	 */
	public async addFriendByPhone(options: {
		phone: string;
	}): Promise<LooseType> {
		const contact = await this.findContactByPhoneV3({ phone: options.phone });
		return await this.addFriendByMid({
			mid: contact.mid,
			reference: '{"screen":"friendAdd:phoneSearch","spec":"native"}',
			trackingMetaType: 2,
			trackingMetaHint: options.phone,
		});
	}
}
