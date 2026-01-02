import { type BaseClient, InternalError } from "../../core/mod.ts";
import type { ProtocolKey } from "../../thrift/mod.ts";
import type { BaseService } from "../types.ts";
import type * as LINETypes from "@evex/linejs-types";
import { LINEStruct } from "../../thrift/mod.ts";
import type { Buffer } from "node:buffer";
import { ContentType } from "../../thrift/readwrite/struct.ts";

export class TalkService implements BaseService {
	client: BaseClient;
	protocolType: ProtocolKey = 4;
	requestPath = "/S4";
	errorName = "TalkServiceError";
	constructor(client: BaseClient) {
		this.client = client;
	}

	/**
	 * Retrieves LINE events from the server.
	 *
	 * @param options - Optional parameters for retrieving events.
	 * @param options.limit - The maximum number of events to retrieve. Default is 100.
	 * @param options.revision - The last known revision number. Default is 0.
	 * @param options.globalRev - The last known global revision number. Default is 0.
	 * @param options.individualRev - The last known individual revision number. Default is 0.
	 * @param options.timeout - The timeout for the request in milliseconds. Default is the client's long timeout configuration.
	 * @returns A promise that resolves to the success result of the event retrieval.
	 */
	async sync(
		options: {
			limit?: number;
			revision?: number | bigint;
			globalRev?: number | bigint;
			individualRev?: number | bigint;
			timeout?: number;
		} = {},
	): Promise<LINETypes.sync_result["success"]> {
		const { limit, revision, individualRev, globalRev, timeout } = {
			limit: 100,
			revision: 0,
			globalRev: 0,
			individualRev: 0,
			timeout: this.client.config.longTimeout,
			...options,
		};
		return await this.client.request.request(
			LINEStruct.sync_args({
				request: {
					lastRevision: revision,
					lastGlobalRevision: globalRev,
					lastIndividualRevision: individualRev,
					count: limit,
				},
			}),
			"sync",
			4,
			true,
			"/SYNC4",
			{},
			timeout,
		);
	}

	/**
	 * Sends a message to a specified recipient with various options.
	 *
	 * @param options - The options for sending the message.
	 * @param options.to - The recipient's ID.
	 * @param options.text - The text content of the message (optional).
	 * @param options.contentType - The type of content being sent (optional).
	 * @param options.contentMetadata - Additional metadata for the content (optional).
	 * @param options.relatedMessageId - The ID of a related message, if any (optional).
	 * @param options.location - The location information to be sent (optional).
	 * @param options.chunks - The message content in chunks, either as strings or buffers (optional).
	 * @param options.e2ee - Flag indicating whether to use end-to-end encryption (optional).
	 * @returns A promise that resolves to the sent message.
	 * @throws Will throw an error if the message sending fails.
	 */
	async sendMessage(options: {
		to: string;
		text?: string;
		contentType?: LINETypes.ContentType;
		contentMetadata?: Record<string, string>;
		relatedMessageId?: string;
		location?: LINETypes.Location;
		chunks?: string[] | Buffer[];
		e2ee?: boolean;
	}): Promise<LINETypes.Message> {
		const {
			to,
			text,
			contentType,
			contentMetadata,
			relatedMessageId,
			location,
			e2ee,
			chunks,
		} = {
			contentType: "NONE" as LINETypes.ContentType,
			contentMetadata: {},
			...options,
		};
		if ((e2ee && !chunks && location) || (e2ee && !chunks && text)) {
			const chunks = await this.client.e2ee.encryptE2EEMessage(
				to,
				text || location || "invalid",
				contentType,
			);
			const _contentMetadata = {
				...contentMetadata,
				...{
					e2eeVersion: "2",
					contentType: (ContentType(contentType) || 0).toString(),
					e2eeMark: "2",
				},
			};
			const options = {
				to,
				contentType,
				contentMetadata: _contentMetadata,
				relatedMessageId,
				e2ee,
				chunks,
			};
			return this.sendMessage(options);
		}

		const message = LINEStruct.sendMessage_args({
			seq: await this.client.getReqseq(),
			message: {
				reactions: undefined,
				to,
				createdTime: 0,
				deliveredTime: 0,
				hasContent: false,
				contentType,
				contentMetadata,
				sessionId: 0,
				text,
				location,
				chunks,
				relatedMessageId,
				...relatedMessageId
					? {
						messageRelationType: "REPLY",
						relatedMessageServiceCode: "TALK",
					}
					: {},
			},
		});
		try {
			return await this.client.request.request(
				message,
				"sendMessage",
				this.protocolType,
				true,
				this.requestPath,
			);
		} catch (error) {
			if (
				error instanceof InternalError &&
				(error.data?.code.toString()).includes("E2EE") &&
				typeof e2ee === "undefined"
			) {
				options.e2ee = true;
				return this.sendMessage(options);
			} else {
				throw error;
			}
		}
	}

	async getProfile(
		...param: Parameters<typeof LINEStruct.getProfile_args>
	): Promise<LINETypes.getProfile_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getProfile_args(...param),
			"getProfile",
			this.protocolType,
			"Profile",
			this.requestPath,
		);
	}

	async getSettings(
		...param: Parameters<typeof LINEStruct.getSettings_args>
	): Promise<LINETypes.getSettings_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getSettings_args(...param),
			"getSettings",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async sendChatChecked(
		...param: Parameters<typeof LINEStruct.sendChatChecked_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.sendChatChecked_args(...param),
			"sendChatChecked",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async unsendMessage(
		...param: Parameters<typeof LINEStruct.unsendMessage_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.unsendMessage_args(...param),
			"unsendMessage",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async deleteOtherFromChat(
		...param: Parameters<typeof LINEStruct.deleteOtherFromChat_args>
	): Promise<LINETypes.deleteOtherFromChat_result["success"]> {
		return await this.client.request.request(
			LINEStruct.deleteOtherFromChat_args(...param),
			"deleteOtherFromChat",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async inviteIntoChat(
		options: {
			chatMid: string;
			targetUserMids: string[];
		},
	): Promise<LINETypes.inviteIntoChat_result["success"]> {
		return await this.client.request.request(
			LINEStruct.inviteIntoChat_args({
				request: {
					targetUserMids: options.targetUserMids,
					chatMid: options.chatMid,
				},
			}),
			"inviteIntoChat",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async cancelChatInvitation(
		...param: Parameters<typeof LINEStruct.cancelChatInvitation_args>
	): Promise<LINETypes.cancelChatInvitation_result["success"]> {
		return await this.client.request.request(
			LINEStruct.cancelChatInvitation_args(...param),
			"cancelChatInvitation",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async deleteSelfFromChat(
		...param: Parameters<typeof LINEStruct.deleteSelfFromChat_args>
	): Promise<LINETypes.deleteSelfFromChat_result["success"]> {
		return await this.client.request.request(
			LINEStruct.deleteSelfFromChat_args(...param),
			"deleteSelfFromChat",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async acceptChatInvitation(
		...param: Parameters<typeof LINEStruct.acceptChatInvitation_args>
	): Promise<LINETypes.acceptChatInvitation_result["success"]> {
		return await this.client.request.request(
			LINEStruct.acceptChatInvitation_args(...param),
			"acceptChatInvitation",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async reissueChatTicket(
		...param: Parameters<typeof LINEStruct.reissueChatTicket_args>
	): Promise<LINETypes.reissueChatTicket_result["success"]> {
		return await this.client.request.request(
			LINEStruct.reissueChatTicket_args(...param),
			"reissueChatTicket",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async findChatByTicket(
		...param: Parameters<typeof LINEStruct.findChatByTicket_args>
	): Promise<LINETypes.findChatByTicket_result["success"]> {
		return await this.client.request.request(
			LINEStruct.findChatByTicket_args(...param),
			"findChatByTicket",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async acceptChatInvitationByTicket(
		...param: Parameters<
			typeof LINEStruct.acceptChatInvitationByTicket_args
		>
	): Promise<LINETypes.acceptChatInvitationByTicket_result["success"]> {
		return await this.client.request.request(
			LINEStruct.acceptChatInvitationByTicket_args(...param),
			"acceptChatInvitationByTicket",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateChat(
		...param: Parameters<typeof LINEStruct.updateChat_args>
	): Promise<LINETypes.updateChat_result["success"]> {
		return await this.client.request.request(
			LINEStruct.updateChat_args(...param),
			"updateChat",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getAllContactIds(
		...param: Parameters<typeof LINEStruct.getAllContactIds_args>
	): Promise<LINETypes.getAllContactIds_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getAllContactIds_args(...param),
			"getAllContactIds",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getBlockedContactIds(
		...param: Parameters<typeof LINEStruct.getBlockedContactIds_args>
	): Promise<LINETypes.getBlockedContactIds_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getBlockedContactIds_args(...param),
			"getBlockedContactIds",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getBlockedRecommendationIds(
		...param: Parameters<typeof LINEStruct.getBlockedRecommendationIds_args>
	): Promise<LINETypes.getBlockedRecommendationIds_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getBlockedRecommendationIds_args(...param),
			"getBlockedRecommendationIds",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async sendPostback(
		...param: Parameters<typeof LINEStruct.sendPostback_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.sendPostback_args(...param),
			"sendPostback",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getMessageBoxes(
		...param: Parameters<typeof LINEStruct.getMessageBoxes_args>
	): Promise<LINETypes.getMessageBoxes_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getMessageBoxes_args(...param),
			"getMessageBoxes",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getChatRoomAnnouncementsBulk(
		...param: Parameters<
			typeof LINEStruct.getChatRoomAnnouncementsBulk_args
		>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.getChatRoomAnnouncementsBulk_args(...param),
			"getChatRoomAnnouncementsBulk",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getChatRoomAnnouncements(
		...param: Parameters<typeof LINEStruct.getChatRoomAnnouncements_args>
	): Promise<LINETypes.getChatRoomAnnouncements_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getChatRoomAnnouncements_args(...param),
			"getChatRoomAnnouncements",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async removeChatRoomAnnouncement(
		...param: Parameters<typeof LINEStruct.removeChatRoomAnnouncement_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.removeChatRoomAnnouncement_args(...param),
			"removeChatRoomAnnouncement",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async createChatRoomAnnouncement(
		...param: Parameters<typeof LINEStruct.createChatRoomAnnouncement_args>
	): Promise<LINETypes.createChatRoomAnnouncement_result["success"]> {
		return await this.client.request.request(
			LINEStruct.createChatRoomAnnouncement_args(...param),
			"createChatRoomAnnouncement",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async leaveRoom(
		...param: Parameters<typeof LINEStruct.leaveRoom_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.leaveRoom_args(...param),
			"leaveRoom",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getRoomsV2(
		...param: Parameters<typeof LINEStruct.getRoomsV2_args>
	): Promise<LINETypes.getRoomsV2_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getRoomsV2_args(...param),
			"getRoomsV2",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async createRoomV2(
		...param: Parameters<typeof LINEStruct.createRoomV2_args>
	): Promise<LINETypes.createRoomV2_result["success"]> {
		return await this.client.request.request(
			LINEStruct.createRoomV2_args(...param),
			"createRoomV2",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getCountries(
		...param: Parameters<typeof LINEStruct.getCountries_args>
	): Promise<LINETypes.getCountries_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getCountries_args(...param),
			"getCountries",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async acquireEncryptedAccessToken(
		...param: Parameters<typeof LINEStruct.acquireEncryptedAccessToken_args>
	): Promise<LINETypes.acquireEncryptedAccessToken_result["success"]> {
		return await this.client.request.request(
			LINEStruct.acquireEncryptedAccessToken_args(...param),
			"acquireEncryptedAccessToken",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async blockContact(
		...param: Parameters<typeof LINEStruct.blockContact_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.blockContact_args(...param),
			"blockContact",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async unblockContact(
		...param: Parameters<typeof LINEStruct.unblockContact_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.unblockContact_args(...param),
			"unblockContact",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getConfigurations(
		...param: Parameters<typeof LINEStruct.getConfigurations_args>
	): Promise<LINETypes.getConfigurations_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getConfigurations_args(...param),
			"getConfigurations",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async fetchOperations(
		...param: Parameters<typeof LINEStruct.fetchOperations_args>
	): Promise<LINETypes.fetchOperations_result["success"]> {
		return await this.client.request.request(
			LINEStruct.fetchOperations_args(...param),
			"fetchOperations",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getRepairElements(
		...param: Parameters<typeof LINEStruct.getRepairElements_args>
	): Promise<LINETypes.getRepairElements_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getRepairElements_args(...param),
			"getRepairElements",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getSettingsAttributes2(
		...param: Parameters<typeof LINEStruct.getSettingsAttributes2_args>
	): Promise<LINETypes.getSettingsAttributes2_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getSettingsAttributes2_args(...param),
			"getSettingsAttributes2",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateSettingsAttributes2(
		...param: Parameters<typeof LINEStruct.updateSettingsAttributes2_args>
	): Promise<LINETypes.updateSettingsAttributes2_result["success"]> {
		return await this.client.request.request(
			LINEStruct.updateSettingsAttributes2_args(...param),
			"updateSettingsAttributes2",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async rejectChatInvitation(
		...param: Parameters<typeof LINEStruct.rejectChatInvitation_args>
	): Promise<LINETypes.rejectChatInvitation_result["success"]> {
		return await this.client.request.request(
			LINEStruct.rejectChatInvitation_args(...param),
			"rejectChatInvitation",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getE2EEPublicKey(
		...param: Parameters<typeof LINEStruct.getE2EEPublicKey_args>
	): Promise<LINETypes.getE2EEPublicKey_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getE2EEPublicKey_args(...param),
			"getE2EEPublicKey",
			this.protocolType,
			true,
			this.requestPath,
		);
	}
	public async getE2EEPublicKeys(): Promise<
		LINETypes.getE2EEPublicKeys_result["success"]
	> {
		return await this.client.request.request(
			[],
			"getE2EEPublicKeys",
			this.protocolType,
			false,
			this.requestPath,
		);
	}

	async registerE2EEPublicKey(
		...param: Parameters<typeof LINEStruct.registerE2EEPublicKey_args>
	): Promise<LINETypes.registerE2EEPublicKey_result["success"]> {
		return await this.client.request.request(
			LINEStruct.registerE2EEPublicKey_args(...param),
			"registerE2EEPublicKey",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async registerE2EEGroupKey(
		...param: Parameters<typeof LINEStruct.registerE2EEGroupKey_args>
	): Promise<LINETypes.registerE2EEGroupKey_result["success"]> {
		return await this.client.request.request(
			LINEStruct.registerE2EEGroupKey_args(...param),
			"registerE2EEGroupKey",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getE2EEGroupSharedKey(
		...param: Parameters<typeof LINEStruct.getE2EEGroupSharedKey_args>
	): Promise<LINETypes.getE2EEGroupSharedKey_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getE2EEGroupSharedKey_args(...param),
			"getE2EEGroupSharedKey",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getLastE2EEGroupSharedKey(
		...param: Parameters<typeof LINEStruct.getLastE2EEGroupSharedKey_args>
	): Promise<LINETypes.getLastE2EEGroupSharedKey_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getLastE2EEGroupSharedKey_args(...param),
			"getLastE2EEGroupSharedKey",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getLastE2EEPublicKeys(
		...param: Parameters<typeof LINEStruct.getLastE2EEPublicKeys_args>
	): Promise<LINETypes.getLastE2EEPublicKeys_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getLastE2EEPublicKeys_args(...param),
			"getLastE2EEPublicKeys",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async negotiateE2EEPublicKey(
		...param: Parameters<typeof LINEStruct.negotiateE2EEPublicKey_args>
	): Promise<LINETypes.negotiateE2EEPublicKey_result["success"]> {
		return await this.client.request.request(
			LINEStruct.negotiateE2EEPublicKey_args(...param),
			"negotiateE2EEPublicKey",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async react(options: {
		id: bigint | number;
		reaction: LINETypes.MessageReactionType;
	}): Promise<void> {
		return await this.client.request.request(
			LINEStruct.react_args({
				reactRequest: {
					reqSeq: 0,
					messageId: options.id,
					reactionType: {
						predefinedReactionType: options.reaction,
					},
				},
			}),
			"react",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async createChat(
		...param: Parameters<typeof LINEStruct.createChat_args>
	): Promise<LINETypes.createChat_result["success"]> {
		return await this.client.request.request(
			LINEStruct.createChat_args(...param),
			"createChat",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async setChatHiddenStatus(
		...param: Parameters<typeof LINEStruct.setChatHiddenStatus_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.setChatHiddenStatus_args(...param),
			"setChatHiddenStatus",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getFollowers(
		...param: Parameters<typeof LINEStruct.getFollowers_args>
	): Promise<LINETypes.getFollowers_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getFollowers_args(...param),
			"getFollowers",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getFollowings(
		...param: Parameters<typeof LINEStruct.getFollowings_args>
	): Promise<LINETypes.getFollowings_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getFollowings_args(...param),
			"getFollowings",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async removeFollower(
		...param: Parameters<typeof LINEStruct.removeFollower_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.removeFollower_args(...param),
			"removeFollower",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async follow(
		...param: Parameters<typeof LINEStruct.follow_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.follow_args(...param),
			"follow",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async unfollow(
		...param: Parameters<typeof LINEStruct.unfollow_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.unfollow_args(...param),
			"unfollow",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async bulkFollow(
		...param: Parameters<typeof LINEStruct.bulkFollow_args>
	): Promise<LINETypes.bulkFollow_result["success"]> {
		return await this.client.request.request(
			LINEStruct.bulkFollow_args(...param),
			"bulkFollow",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async decryptFollowEMid(
		...param: Parameters<typeof LINEStruct.decryptFollowEMid_args>
	): Promise<LINETypes.decryptFollowEMid_result["success"]> {
		return await this.client.request.request(
			LINEStruct.decryptFollowEMid_args(...param),
			"decryptFollowEMid",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getMessageReadRange(
		...param: Parameters<typeof LINEStruct.getMessageReadRange_args>
	): Promise<LINETypes.getMessageReadRange_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getMessageReadRange_args(...param),
			"getMessageReadRange",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getChatRoomBGMs(
		...param: Parameters<typeof LINEStruct.getChatRoomBGMs_args>
	): Promise<LINETypes.getChatRoomBGMs_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getChatRoomBGMs_args(...param),
			"getChatRoomBGMs",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateChatRoomBGM(
		...param: Parameters<typeof LINEStruct.updateChatRoomBGM_args>
	): Promise<LINETypes.updateChatRoomBGM_result["success"]> {
		return await this.client.request.request(
			LINEStruct.updateChatRoomBGM_args(...param),
			"updateChatRoomBGM",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async blockRecommendation(
		...param: Parameters<typeof LINEStruct.blockRecommendation_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.blockRecommendation_args(...param),
			"blockRecommendation",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async unblockRecommendation(
		...param: Parameters<typeof LINEStruct.unblockRecommendation_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.unblockRecommendation_args(...param),
			"unblockRecommendation",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getRecommendationIds(
		...param: Parameters<typeof LINEStruct.getRecommendationIds_args>
	): Promise<LINETypes.getRecommendationIds_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getRecommendationIds_args(...param),
			"getRecommendationIds",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getExtendedProfile(
		...param: Parameters<typeof LINEStruct.getExtendedProfile_args>
	): Promise<LINETypes.getExtendedProfile_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getExtendedProfile_args(...param),
			"getExtendedProfile",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateExtendedProfileAttribute(
		...param: Parameters<
			typeof LINEStruct.updateExtendedProfileAttribute_args
		>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.updateExtendedProfileAttribute_args(...param),
			"updateExtendedProfileAttribute",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async setNotificationsEnabled(
		...param: Parameters<typeof LINEStruct.setNotificationsEnabled_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.setNotificationsEnabled_args(...param),
			"setNotificationsEnabled",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async syncContacts(
		...param: Parameters<typeof LINEStruct.syncContacts_args>
	): Promise<LINETypes.syncContacts_result["success"]> {
		return await this.client.request.request(
			LINEStruct.syncContacts_args(...param),
			"syncContacts",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async findContactsByPhone(
		...param: Parameters<typeof LINEStruct.findContactsByPhone_args>
	): Promise<LINETypes.findContactsByPhone_result["success"]> {
		return await this.client.request.request(
			LINEStruct.findContactsByPhone_args(...param),
			"findContactsByPhone",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async findContactByUserid(
		...param: Parameters<typeof LINEStruct.findContactByUserid_args>
	): Promise<LINETypes.findContactByUserid_result["success"]> {
		return await this.client.request.request(
			LINEStruct.findContactByUserid_args(...param),
			"findContactByUserid",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateContactSetting(
		...param: Parameters<typeof LINEStruct.updateContactSetting_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.updateContactSetting_args(...param),
			"updateContactSetting",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async findContactByUserTicket(
		...param: Parameters<typeof LINEStruct.findContactByUserTicket_args>
	): Promise<LINETypes.findContactByUserTicket_result["success"]> {
		return await this.client.request.request(
			LINEStruct.findContactByUserTicket_args(...param),
			"findContactByUserTicket",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async verifyQrcode(
		...param: Parameters<typeof LINEStruct.verifyQrcode_args>
	): Promise<LINETypes.verifyQrcode_result["success"]> {
		return await this.client.request.request(
			LINEStruct.verifyQrcode_args(...param),
			"verifyQrcode",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async reportAbuseEx(
		...param: Parameters<typeof LINEStruct.reportAbuseEx_args>
	): Promise<LINETypes.reportAbuseEx_result["success"]> {
		return await this.client.request.request(
			LINEStruct.reportAbuseEx_args(...param),
			"reportAbuseEx",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateProfileAttributes(
		...param: Parameters<typeof LINEStruct.updateProfileAttributes_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.updateProfileAttributes_args(...param),
			"updateProfileAttributes",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateNotificationToken(
		...param: Parameters<typeof LINEStruct.updateNotificationToken_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.updateNotificationToken_args(...param),
			"updateNotificationToken",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async tryFriendRequest(
		...param: Parameters<typeof LINEStruct.tryFriendRequest_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.tryFriendRequest_args(...param),
			"tryFriendRequest",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async generateUserTicket(
		...param: Parameters<typeof LINEStruct.generateUserTicket_args>
	): Promise<LINETypes.generateUserTicket_result["success"]> {
		return await this.client.request.request(
			LINEStruct.generateUserTicket_args(...param),
			"generateUserTicket",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getRecentFriendRequests(
		...param: Parameters<typeof LINEStruct.getRecentFriendRequests_args>
	): Promise<LINETypes.getRecentFriendRequests_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getRecentFriendRequests_args(...param),
			"getRecentFriendRequests",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async resendPinCode(
		...param: Parameters<typeof LINEStruct.resendPinCode_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.resendPinCode_args(...param),
			"resendPinCode",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async notifyRegistrationComplete(
		...param: Parameters<typeof LINEStruct.notifyRegistrationComplete_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.notifyRegistrationComplete_args(...param),
			"notifyRegistrationComplete",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getInstantNews(
		...param: Parameters<typeof LINEStruct.getInstantNews_args>
	): Promise<LINETypes.getInstantNews_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getInstantNews_args(...param),
			"getInstantNews",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async changeVerificationMethod(
		...param: Parameters<typeof LINEStruct.changeVerificationMethod_args>
	): Promise<LINETypes.changeVerificationMethod_result["success"]> {
		return await this.client.request.request(
			LINEStruct.changeVerificationMethod_args(...param),
			"changeVerificationMethod",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getChatEffectMetaList(
		...param: Parameters<typeof LINEStruct.getChatEffectMetaList_args>
	): Promise<LINETypes.getChatEffectMetaList_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getChatEffectMetaList_args(...param),
			"getChatEffectMetaList",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async notifyInstalled(
		...param: Parameters<typeof LINEStruct.notifyInstalled_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.notifyInstalled_args(...param),
			"notifyInstalled",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async reportDeviceState(
		...param: Parameters<typeof LINEStruct.reportDeviceState_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.reportDeviceState_args(...param),
			"reportDeviceState",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async sendChatRemoved(
		...param: Parameters<typeof LINEStruct.sendChatRemoved_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.sendChatRemoved_args(...param),
			"sendChatRemoved",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async startUpdateVerification(
		...param: Parameters<typeof LINEStruct.startUpdateVerification_args>
	): Promise<LINETypes.startUpdateVerification_result["success"]> {
		return await this.client.request.request(
			LINEStruct.startUpdateVerification_args(...param),
			"startUpdateVerification",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async inviteIntoRoom(
		...param: Parameters<typeof LINEStruct.inviteIntoRoom_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.inviteIntoRoom_args(...param),
			"inviteIntoRoom",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async removeFriendRequest(
		...param: Parameters<typeof LINEStruct.removeFriendRequest_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.removeFriendRequest_args(...param),
			"removeFriendRequest",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async reportProfile(
		...param: Parameters<typeof LINEStruct.reportProfile_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.reportProfile_args(...param),
			"reportProfile",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async wakeUpLongPolling(
		...param: Parameters<typeof LINEStruct.wakeUpLongPolling_args>
	): Promise<LINETypes.wakeUpLongPolling_result["success"]> {
		return await this.client.request.request(
			LINEStruct.wakeUpLongPolling_args(...param),
			"wakeUpLongPolling",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateAndGetNearby(
		...param: Parameters<typeof LINEStruct.updateAndGetNearby_args>
	): Promise<LINETypes.updateAndGetNearby_result["success"]> {
		return await this.client.request.request(
			LINEStruct.updateAndGetNearby_args(...param),
			"updateAndGetNearby",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async reportSettings(
		...param: Parameters<typeof LINEStruct.reportSettings_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.reportSettings_args(...param),
			"reportSettings",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async verifyPhoneNumber(
		...param: Parameters<typeof LINEStruct.verifyPhoneNumber_args>
	): Promise<LINETypes.verifyPhoneNumber_result["success"]> {
		return await this.client.request.request(
			LINEStruct.verifyPhoneNumber_args(...param),
			"verifyPhoneNumber",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async isUseridAvailable(
		...param: Parameters<typeof LINEStruct.isUseridAvailable_args>
	): Promise<LINETypes.isUseridAvailable_result["success"]> {
		return await this.client.request.request(
			LINEStruct.isUseridAvailable_args(...param),
			"isUseridAvailable",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async registerUserid(
		...param: Parameters<typeof LINEStruct.registerUserid_args>
	): Promise<LINETypes.registerUserid_result["success"]> {
		return await this.client.request.request(
			LINEStruct.registerUserid_args(...param),
			"registerUserid",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async finishUpdateVerification(
		...param: Parameters<typeof LINEStruct.finishUpdateVerification_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.finishUpdateVerification_args(...param),
			"finishUpdateVerification",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async clearRingtone(
		...param: Parameters<typeof LINEStruct.clearRingtone_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.clearRingtone_args(...param),
			"clearRingtone",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async notifyUpdated(
		...param: Parameters<typeof LINEStruct.notifyUpdated_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.notifyUpdated_args(...param),
			"notifyUpdated",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async reportPushRecvReports(
		...param: Parameters<typeof LINEStruct.reportPushRecvReports_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.reportPushRecvReports_args(...param),
			"reportPushRecvReports",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getFriendRequests(
		...param: Parameters<typeof LINEStruct.getFriendRequests_args>
	): Promise<LINETypes.getFriendRequests_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getFriendRequests_args(...param),
			"getFriendRequests",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async addToFollowBlacklist(
		...param: Parameters<typeof LINEStruct.addToFollowBlacklist_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.addToFollowBlacklist_args(...param),
			"addToFollowBlacklist",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async removeFromFollowBlacklist(
		...param: Parameters<typeof LINEStruct.removeFromFollowBlacklist_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.removeFromFollowBlacklist_args(...param),
			"removeFromFollowBlacklist",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getFollowBlacklist(
		...param: Parameters<typeof LINEStruct.getFollowBlacklist_args>
	): Promise<LINETypes.getFollowBlacklist_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getFollowBlacklist_args(...param),
			"getFollowBlacklist",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async determineMediaMessageFlow(
		...param: Parameters<typeof LINEStruct.determineMediaMessageFlow_args>
	): Promise<LINETypes.determineMediaMessageFlow_result["success"]> {
		return await this.client.request.request(
			LINEStruct.determineMediaMessageFlow_args(...param),
			"determineMediaMessageFlow",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async createSession(
		...param: Parameters<typeof LINEStruct.createSession_args>
	): Promise<LINETypes.createSession_result["success"]> {
		return await this.client.request.request(
			LINEStruct.createSession_args(...param),
			"createSession",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async cancelReaction(
		...param: Parameters<typeof LINEStruct.cancelReaction_args>
	): Promise<void> {
		return await this.client.request.request(
			LINEStruct.cancelReaction_args(...param),
			"cancelReaction",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getNotificationSettings(
		...param: Parameters<typeof LINEStruct.getNotificationSettings_args>
	): Promise<LINETypes.getNotificationSettings_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getNotificationSettings_args(...param),
			"getNotificationSettings",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getChats(
		options: {
			chatMids: string[];
			withInvitees?: boolean;
			withMembers?: boolean;
		},
	): Promise<LINETypes.getChats_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getChats_args({
				request: {
					withInvitees: true,
					withMembers: true,
					...options,
				},
				syncReason: "INTERNAL",
			}),
			"getChats",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getChat(options: {
		chatMid: string;
		withInvitees?: boolean;
		withMembers?: boolean;
	}): Promise<LINETypes.Chat> {
		const res = await this.getChats({
			chatMids: [options.chatMid],
			withInvitees: options.withInvitees,
			withMembers: options.withMembers,
		});
		return res.chats[0];
	}

	async getAllChatMids(
		...param: Parameters<typeof LINEStruct.getAllChatMids_args>
	): Promise<LINETypes.getAllChatMids_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getAllChatMids_args(...param),
			"getAllChatMids",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getPreviousMessagesV2WithRequest(
		...param: Parameters<
			typeof LINEStruct.getPreviousMessagesV2WithRequest_args
		>
	): Promise<LINETypes.getPreviousMessagesV2WithRequest_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getPreviousMessagesV2WithRequest_args(...param),
			"getPreviousMessagesV2WithRequest",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	/**
	 * @description Gets the server time
	 */
	public async getServerTime(): Promise<number> {
		return await this.client.request.request(
			[],
			"getServerTime",
			this.protocolType,
			true,
			this.requestPath,
		);
	}
	/**
	 * @description Get user information from mid.
	 */
	async getContact(
		options: {
			mid: string;
		},
	): Promise<LINETypes.Contact> {
		const { mid } = { ...options };
		return await this.client.request.request(
			[[11, 2, mid]],
			"getContact",
			this.protocolType,
			"Contact",
			this.requestPath,
		);
	}
	/**
	 * @description Get users information from mids.
	 */
	public async getContacts(
		options: {
			mids: string[];
		},
	): Promise<LINETypes.Contact[]> {
		const { mids } = { ...options };
		const response = (await this.client.request.request<any[]>(
			[[15, 2, [11, mids]]],
			"getContacts",
			this.protocolType,
			false,
			this.requestPath,
		)).map((e) =>
			this.client.thrift.rename_thrift("Contact", e)
		) as LINETypes.Contact[];
		return response;
	}
	public async getContactsV2(
		options: {
			mids: string[];
		},
	): Promise<LINETypes.GetContactsV2Response> {
		const { mids } = { ...options };

		return (await this.client.request.request(
			[[12, 1, [[15, 1, [11, mids]]]]],
			"getContactsV2",
			this.protocolType,
			"GetContactsV2Response",
			this.requestPath,
		));
	}

	async noop(): Promise<void> {
		return await this.client.request.request(
			[],
			"noop",
			this.protocolType,
			true,
			this.requestPath,
		);
	}
}
