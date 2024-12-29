// For Square (chat, etc)

import { LINEStruct, type ProtocolKey } from "../../thrift/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import type { Client } from "../../core/mod.ts";
import type { BaseService } from "../types.ts";

export class SquareService implements BaseService {
	client: Client;
	protocolType: ProtocolKey = 4;
	requestPath = "/SQ1";
	errorName = "SquareServiceError";
	constructor(client: Client) {
		this.client = client;
	}
	async inviteIntoSquareChat(
		...param: Parameters<
			typeof LINEStruct.SquareService_inviteIntoSquareChat_args
		>
	): Promise<LINETypes.SquareService_inviteIntoSquareChat_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_inviteIntoSquareChat_args(...param),
			"inviteIntoSquareChat",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async inviteToSquare(
		...param: Parameters<
			typeof LINEStruct.SquareService_inviteToSquare_args
		>
	): Promise<LINETypes.SquareService_inviteToSquare_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_inviteToSquare_args(...param),
			"inviteToSquare",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getJoinedSquares(
		...param: Parameters<
			typeof LINEStruct.SquareService_getJoinedSquares_args
		>
	): Promise<LINETypes.SquareService_getJoinedSquares_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getJoinedSquares_args(...param),
			"getJoinedSquares",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async markAsRead(
		...param: Parameters<typeof LINEStruct.SquareService_markAsRead_args>
	): Promise<LINETypes.SquareService_markAsRead_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_markAsRead_args(...param),
			"markAsRead",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async reactToMessage(
		...param: Parameters<
			typeof LINEStruct.SquareService_reactToMessage_args
		>
	): Promise<LINETypes.SquareService_reactToMessage_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_reactToMessage_args(...param),
			"reactToMessage",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async findSquareByInvitationTicket(
		...param: Parameters<
			typeof LINEStruct.SquareService_findSquareByInvitationTicket_args
		>
	): Promise<
		LINETypes.SquareService_findSquareByInvitationTicket_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_findSquareByInvitationTicket_args(
				...param,
			),
			"findSquareByInvitationTicket",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async fetchMyEvents(
		...param: Parameters<typeof LINEStruct.SquareService_fetchMyEvents_args>
	): Promise<LINETypes.SquareService_fetchMyEvents_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_fetchMyEvents_args(...param),
			"fetchMyEvents",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async fetchSquareChatEvents(
		...param: Parameters<
			typeof LINEStruct.SquareService_fetchSquareChatEvents_args
		>
	): Promise<
		LINETypes.SquareService_fetchSquareChatEvents_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_fetchSquareChatEvents_args(...param),
			"fetchSquareChatEvents",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async sendMessage(
		options: {
			squareChatMid: string;
			text?: string;
			contentType?: LINETypes.ContentType;
			contentMetadata?: Record<string, string>;
			relatedMessageId?: string;
			location?: LINETypes.Location;
		},
	): Promise<LINETypes.SquareService_sendMessage_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_sendMessage_args({
				request: {
					reqSeq: await this.client.getReqseq("sq"),
					squareChatMid: options.squareChatMid,
					squareMessage: {
						squareMessageRevision: 4,
						message: {
							to: options.squareChatMid,
							text: options.text,
							contentType: options.contentType,
							contentMetadata: options.contentMetadata,
							location: options.location,
							...options.relatedMessageId
								? {
									relatedMessageId: options.relatedMessageId,
									relatedMessageServiceCode: "SQUARE",
									messageRelationType: "REPLY",
								}
								: {},
						},
					},
				},
			}),
			"sendMessage",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquare(
		...param: Parameters<typeof LINEStruct.SquareService_getSquare_args>
	): Promise<LINETypes.SquareService_getSquare_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquare_args(...param),
			"getSquare",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getJoinableSquareChats(
		...param: Parameters<
			typeof LINEStruct.SquareService_getJoinableSquareChats_args
		>
	): Promise<
		LINETypes.SquareService_getJoinableSquareChats_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_getJoinableSquareChats_args(...param),
			"getJoinableSquareChats",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	defaultSquareCoverImageObsHash =
		"0h6tJfahRYaVt3H0eLAsAWDFheczgHd3wTCTx2eApNKSoefHNVGRdwfgxbdgUMLi8MSngnPFMeNmpbLi8MSngnPFMeNmpbLi8MSngnPQ";

	/**
	 *  @description Create square.
	 */
	async createSquare(options: {
		squareName: string;
		displayName: string;
		profileImageObsHash?: string;
		description?: string;
		searchable?: boolean;
		SquareJoinMethodType?: LINETypes.SquareJoinMethodType;
	}): Promise<LINETypes.SquareService_createSquare_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_createSquare_args({
				request: {
					reqSeq: await this.client.getReqseq("sq"),
					square: {
						name: options.squareName,
						profileImageObsHash: options.profileImageObsHash ||
							this.defaultSquareCoverImageObsHash,
						desc: options.description,
						searchable: options.searchable,
						type: "OPEN",
						categoryId: 1,
						revision: 0,
						ableToUseInvitationTicket: true,
						joinMethod: { type: options.SquareJoinMethodType },
						adultOnly: "NONE",
						svcTags: [],
					},
					creator: {
						displayName: options.displayName,
						ableToReceiveMessage: true,
						revision: 0,
					},
				},
			}),
			"createSquare",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareChatAnnouncements(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareChatAnnouncements_args
		>
	): Promise<
		LINETypes.SquareService_getSquareChatAnnouncements_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareChatAnnouncements_args(...param),
			"getSquareChatAnnouncements",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async leaveSquareChat(
		...param: Parameters<
			typeof LINEStruct.SquareService_leaveSquareChat_args
		>
	): Promise<LINETypes.SquareService_leaveSquareChat_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_leaveSquareChat_args(...param),
			"leaveSquareChat",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareChatMember(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareChatMember_args
		>
	): Promise<LINETypes.SquareService_getSquareChatMember_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareChatMember_args(...param),
			"getSquareChatMember",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async searchSquares(
		...param: Parameters<typeof LINEStruct.SquareService_searchSquares_args>
	): Promise<LINETypes.SquareService_searchSquares_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_searchSquares_args(...param),
			"searchSquares",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateSquareFeatureSet(
		...param: Parameters<
			typeof LINEStruct.SquareService_updateSquareFeatureSet_args
		>
	): Promise<
		LINETypes.SquareService_updateSquareFeatureSet_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_updateSquareFeatureSet_args(...param),
			"updateSquareFeatureSet",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async joinSquare(
		options: {
			squareMid: string;
			displayName: string;
			ableToReceiveMessage?: boolean;
			passCode?: string | undefined;
			joinMessage?: string;
		},
	): Promise<LINETypes.SquareService_joinSquare_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_joinSquare_args({
				request: {
					squareMid: options.squareMid,
					joinValue: {
						approvalValue: { message: options.joinMessage },
						codeValue: { code: options.passCode },
					},
					member: {
						squareMid: options.squareMid,
						displayName: options.displayName,
						ableToReceiveMessage: options.ableToReceiveMessage,
						revision: 0,
					},
				},
			}),
			"joinSquare",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getPopularKeywords(
		...param: Parameters<
			typeof LINEStruct.SquareService_getPopularKeywords_args
		>
	): Promise<LINETypes.SquareService_getPopularKeywords_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getPopularKeywords_args(...param),
			"getPopularKeywords",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async reportSquareMessage(
		...param: Parameters<
			typeof LINEStruct.SquareService_reportSquareMessage_args
		>
	): Promise<LINETypes.SquareService_reportSquareMessage_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_reportSquareMessage_args(...param),
			"reportSquareMessage",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateSquareMemberRelation(
		...param: Parameters<
			typeof LINEStruct.SquareService_updateSquareMemberRelation_args
		>
	): Promise<
		LINETypes.SquareService_updateSquareMemberRelation_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_updateSquareMemberRelation_args(...param),
			"updateSquareMemberRelation",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async leaveSquare(
		...param: Parameters<typeof LINEStruct.SquareService_leaveSquare_args>
	): Promise<LINETypes.SquareService_leaveSquare_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_leaveSquare_args(...param),
			"leaveSquare",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareMemberRelations(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareMemberRelations_args
		>
	): Promise<
		LINETypes.SquareService_getSquareMemberRelations_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareMemberRelations_args(...param),
			"getSquareMemberRelations",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async removeSubscriptions(
		...param: Parameters<
			typeof LINEStruct.SquareService_removeSubscriptions_args
		>
	): Promise<LINETypes.SquareService_removeSubscriptions_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_removeSubscriptions_args(...param),
			"removeSubscriptions",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareMembers(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareMembers_args
		>
	): Promise<LINETypes.SquareService_getSquareMembers_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareMembers_args(...param),
			"getSquareMembers",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateSquareChat(
		...param: Parameters<
			typeof LINEStruct.SquareService_updateSquareChat_args
		>
	): Promise<LINETypes.SquareService_updateSquareChat_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_updateSquareChat_args(...param),
			"updateSquareChat",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async destroyMessage(
		...param: Parameters<
			typeof LINEStruct.SquareService_destroyMessage_args
		>
	): Promise<LINETypes.SquareService_destroyMessage_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_destroyMessage_args(...param),
			"destroyMessage",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async reportSquareChat(
		...param: Parameters<
			typeof LINEStruct.SquareService_reportSquareChat_args
		>
	): Promise<LINETypes.SquareService_reportSquareChat_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_reportSquareChat_args(...param),
			"reportSquareChat",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async unsendMessage(
		...param: Parameters<typeof LINEStruct.SquareService_unsendMessage_args>
	): Promise<LINETypes.SquareService_unsendMessage_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_unsendMessage_args(...param),
			"unsendMessage",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async deleteSquareChatAnnouncement(
		...param: Parameters<
			typeof LINEStruct.SquareService_deleteSquareChatAnnouncement_args
		>
	): Promise<
		LINETypes.SquareService_deleteSquareChatAnnouncement_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_deleteSquareChatAnnouncement_args(
				...param,
			),
			"deleteSquareChatAnnouncement",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async createSquareChat(
		...param: Parameters<
			typeof LINEStruct.SquareService_createSquareChat_args
		>
	): Promise<LINETypes.SquareService_createSquareChat_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_createSquareChat_args(...param),
			"createSquareChat",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async deleteSquareChat(
		...param: Parameters<
			typeof LINEStruct.SquareService_deleteSquareChat_args
		>
	): Promise<LINETypes.SquareService_deleteSquareChat_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_deleteSquareChat_args(...param),
			"deleteSquareChat",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareChatMembers(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareChatMembers_args
		>
	): Promise<LINETypes.SquareService_getSquareChatMembers_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareChatMembers_args(...param),
			"getSquareChatMembers",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareFeatureSet(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareFeatureSet_args
		>
	): Promise<LINETypes.SquareService_getSquareFeatureSet_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareFeatureSet_args(...param),
			"getSquareFeatureSet",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateSquareAuthority(
		...param: Parameters<
			typeof LINEStruct.SquareService_updateSquareAuthority_args
		>
	): Promise<
		LINETypes.SquareService_updateSquareAuthority_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_updateSquareAuthority_args(...param),
			"updateSquareAuthority",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async rejectSquareMembers(
		...param: Parameters<
			typeof LINEStruct.SquareService_rejectSquareMembers_args
		>
	): Promise<LINETypes.SquareService_rejectSquareMembers_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_rejectSquareMembers_args(...param),
			"rejectSquareMembers",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async deleteSquare(
		...param: Parameters<typeof LINEStruct.SquareService_deleteSquare_args>
	): Promise<LINETypes.SquareService_deleteSquare_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_deleteSquare_args(...param),
			"deleteSquare",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async reportSquare(
		...param: Parameters<typeof LINEStruct.SquareService_reportSquare_args>
	): Promise<LINETypes.SquareService_reportSquare_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_reportSquare_args(...param),
			"reportSquare",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getInvitationTicketUrl(
		...param: Parameters<
			typeof LINEStruct.SquareService_getInvitationTicketUrl_args
		>
	): Promise<
		LINETypes.SquareService_getInvitationTicketUrl_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_getInvitationTicketUrl_args(...param),
			"getInvitationTicketUrl",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateSquareChatMember(
		...param: Parameters<
			typeof LINEStruct.SquareService_updateSquareChatMember_args
		>
	): Promise<
		LINETypes.SquareService_updateSquareChatMember_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_updateSquareChatMember_args(...param),
			"updateSquareChatMember",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateSquareMember(
		...param: Parameters<
			typeof LINEStruct.SquareService_updateSquareMember_args
		>
	): Promise<LINETypes.SquareService_updateSquareMember_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_updateSquareMember_args(...param),
			"updateSquareMember",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateSquare(
		...param: Parameters<typeof LINEStruct.SquareService_updateSquare_args>
	): Promise<LINETypes.SquareService_updateSquare_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_updateSquare_args(...param),
			"updateSquare",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareAuthorities(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareAuthorities_args
		>
	): Promise<LINETypes.SquareService_getSquareAuthorities_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareAuthorities_args(...param),
			"getSquareAuthorities",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateSquareMembers(
		...param: Parameters<
			typeof LINEStruct.SquareService_updateSquareMembers_args
		>
	): Promise<LINETypes.SquareService_updateSquareMembers_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_updateSquareMembers_args(...param),
			"updateSquareMembers",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareChatStatus(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareChatStatus_args
		>
	): Promise<LINETypes.SquareService_getSquareChatStatus_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareChatStatus_args(...param),
			"getSquareChatStatus",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async approveSquareMembers(
		...param: Parameters<
			typeof LINEStruct.SquareService_approveSquareMembers_args
		>
	): Promise<LINETypes.SquareService_approveSquareMembers_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_approveSquareMembers_args(...param),
			"approveSquareMembers",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareStatus(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareStatus_args
		>
	): Promise<LINETypes.SquareService_getSquareStatus_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareStatus_args(...param),
			"getSquareStatus",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async searchSquareMembers(
		...param: Parameters<
			typeof LINEStruct.SquareService_searchSquareMembers_args
		>
	): Promise<LINETypes.SquareService_searchSquareMembers_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_searchSquareMembers_args(...param),
			"searchSquareMembers",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async checkJoinCode(
		...param: Parameters<typeof LINEStruct.SquareService_checkJoinCode_args>
	): Promise<LINETypes.SquareService_checkJoinCode_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_checkJoinCode_args(...param),
			"checkJoinCode",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async createSquareChatAnnouncement(
		...param: Parameters<
			typeof LINEStruct.SquareService_createSquareChatAnnouncement_args
		>
	): Promise<
		LINETypes.SquareService_createSquareChatAnnouncement_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_createSquareChatAnnouncement_args(
				...param,
			),
			"createSquareChatAnnouncement",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareAuthority(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareAuthority_args
		>
	): Promise<LINETypes.SquareService_getSquareAuthority_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareAuthority_args(...param),
			"getSquareAuthority",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareChat(
		...param: Parameters<typeof LINEStruct.SquareService_getSquareChat_args>
	): Promise<LINETypes.SquareService_getSquareChat_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareChat_args(...param),
			"getSquareChat",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async refreshSubscriptions(
		...param: Parameters<
			typeof LINEStruct.SquareService_refreshSubscriptions_args
		>
	): Promise<LINETypes.SquareService_refreshSubscriptions_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_refreshSubscriptions_args(...param),
			"refreshSubscriptions",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getJoinedSquareChats(
		...param: Parameters<
			typeof LINEStruct.SquareService_getJoinedSquareChats_args
		>
	): Promise<LINETypes.SquareService_getJoinedSquareChats_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getJoinedSquareChats_args(...param),
			"getJoinedSquareChats",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async joinSquareChat(
		...param: Parameters<
			typeof LINEStruct.SquareService_joinSquareChat_args
		>
	): Promise<LINETypes.SquareService_joinSquareChat_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_joinSquareChat_args(...param),
			"joinSquareChat",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async findSquareByEmid(
		...param: Parameters<
			typeof LINEStruct.SquareService_findSquareByEmid_args
		>
	): Promise<LINETypes.SquareService_findSquareByEmid_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_findSquareByEmid_args(...param),
			"findSquareByEmid",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareMemberRelation(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareMemberRelation_args
		>
	): Promise<
		LINETypes.SquareService_getSquareMemberRelation_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareMemberRelation_args(...param),
			"getSquareMemberRelation",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareMember(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareMember_args
		>
	): Promise<LINETypes.SquareService_getSquareMember_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareMember_args(...param),
			"getSquareMember",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async destroyMessages(
		...param: Parameters<
			typeof LINEStruct.SquareService_destroyMessages_args
		>
	): Promise<LINETypes.SquareService_destroyMessages_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_destroyMessages_args(...param),
			"destroyMessages",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getCategories(
		...param: Parameters<typeof LINEStruct.SquareService_getCategories_args>
	): Promise<LINETypes.SquareService_getCategories_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getCategories_args(...param),
			"getCategories",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async reportSquareMember(
		...param: Parameters<
			typeof LINEStruct.SquareService_reportSquareMember_args
		>
	): Promise<LINETypes.SquareService_reportSquareMember_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_reportSquareMember_args(...param),
			"reportSquareMember",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getNoteStatus(
		...param: Parameters<typeof LINEStruct.SquareService_getNoteStatus_args>
	): Promise<LINETypes.SquareService_getNoteStatus_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getNoteStatus_args(...param),
			"getNoteStatus",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async searchSquareChatMembers(
		...param: Parameters<
			typeof LINEStruct.SquareService_searchSquareChatMembers_args
		>
	): Promise<
		LINETypes.SquareService_searchSquareChatMembers_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_searchSquareChatMembers_args(...param),
			"searchSquareChatMembers",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareChatFeatureSet(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareChatFeatureSet_args
		>
	): Promise<
		LINETypes.SquareService_getSquareChatFeatureSet_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareChatFeatureSet_args(...param),
			"getSquareChatFeatureSet",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareEmid(
		...param: Parameters<typeof LINEStruct.SquareService_getSquareEmid_args>
	): Promise<LINETypes.SquareService_getSquareEmid_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareEmid_args(...param),
			"getSquareEmid",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareMembersBySquare(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareMembersBySquare_args
		>
	): Promise<
		LINETypes.SquareService_getSquareMembersBySquare_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareMembersBySquare_args(...param),
			"getSquareMembersBySquare",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async manualRepair(
		...param: Parameters<typeof LINEStruct.SquareService_manualRepair_args>
	): Promise<LINETypes.SquareService_manualRepair_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_manualRepair_args(...param),
			"manualRepair",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async syncSquareMembers(
		...param: Parameters<
			typeof LINEStruct.SquareService_syncSquareMembers_args
		>
	): Promise<LINETypes.SquareService_syncSquareMembers_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_syncSquareMembers_args(...param),
			"syncSquareMembers",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async hideSquareMemberContents(
		...param: Parameters<
			typeof LINEStruct.SquareService_hideSquareMemberContents_args
		>
	): Promise<
		LINETypes.SquareService_hideSquareMemberContents_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_hideSquareMemberContents_args(...param),
			"hideSquareMemberContents",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async markChatsAsRead(
		...param: Parameters<
			typeof LINEStruct.SquareService_markChatsAsRead_args
		>
	): Promise<LINETypes.SquareService_markChatsAsRead_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_markChatsAsRead_args(...param),
			"markChatsAsRead",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async reportMessageSummary(
		...param: Parameters<
			typeof LINEStruct.SquareService_reportMessageSummary_args
		>
	): Promise<LINETypes.SquareService_reportMessageSummary_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_reportMessageSummary_args(...param),
			"reportMessageSummary",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getGoogleAdOptions(
		...param: Parameters<
			typeof LINEStruct.SquareService_getGoogleAdOptions_args
		>
	): Promise<LINETypes.SquareService_getGoogleAdOptions_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getGoogleAdOptions_args(...param),
			"getGoogleAdOptions",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async unhideSquareMemberContents(
		...param: Parameters<
			typeof LINEStruct.SquareService_unhideSquareMemberContents_args
		>
	): Promise<
		LINETypes.SquareService_unhideSquareMemberContents_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_unhideSquareMemberContents_args(...param),
			"unhideSquareMemberContents",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareChatEmid(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareChatEmid_args
		>
	): Promise<LINETypes.SquareService_getSquareChatEmid_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareChatEmid_args(...param),
			"getSquareChatEmid",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareThread(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareThread_args
		>
	): Promise<LINETypes.SquareService_getSquareThread_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareThread_args(...param),
			"getSquareThread",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSquareThreadMid(
		...param: Parameters<
			typeof LINEStruct.SquareService_getSquareThreadMid_args
		>
	): Promise<LINETypes.SquareService_getSquareThreadMid_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getSquareThreadMid_args(...param),
			"getSquareThreadMid",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getUserSettings(
		...param: Parameters<
			typeof LINEStruct.SquareService_getUserSettings_args
		>
	): Promise<LINETypes.SquareService_getUserSettings_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_getUserSettings_args(...param),
			"getUserSettings",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async markThreadsAsRead(
		...param: Parameters<
			typeof LINEStruct.SquareService_markThreadsAsRead_args
		>
	): Promise<LINETypes.SquareService_markThreadsAsRead_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_markThreadsAsRead_args(...param),
			"markThreadsAsRead",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async sendSquareThreadMessage(
		...param: Parameters<
			typeof LINEStruct.SquareService_sendSquareThreadMessage_args
		>
	): Promise<
		LINETypes.SquareService_sendSquareThreadMessage_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_sendSquareThreadMessage_args(...param),
			"sendSquareThreadMessage",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async findSquareByInvitationTicketV2(
		...param: Parameters<
			typeof LINEStruct.SquareService_findSquareByInvitationTicketV2_args
		>
	): Promise<
		LINETypes.SquareService_findSquareByInvitationTicketV2_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.SquareService_findSquareByInvitationTicketV2_args(
				...param,
			),
			"findSquareByInvitationTicketV2",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async leaveSquareThread(
		...param: Parameters<
			typeof LINEStruct.SquareService_leaveSquareThread_args
		>
	): Promise<LINETypes.SquareService_leaveSquareThread_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_leaveSquareThread_args(...param),
			"leaveSquareThread",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async joinSquareThread(
		...param: Parameters<
			typeof LINEStruct.SquareService_joinSquareThread_args
		>
	): Promise<LINETypes.SquareService_joinSquareThread_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_joinSquareThread_args(...param),
			"joinSquareThread",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateUserSettings(
		...param: Parameters<
			typeof LINEStruct.SquareService_updateUserSettings_args
		>
	): Promise<LINETypes.SquareService_updateUserSettings_result["success"]> {
		return await this.client.request.request(
			LINEStruct.SquareService_updateUserSettings_args(...param),
			"updateUserSettings",
			this.protocolType,
			true,
			this.requestPath,
		);
	}
}
