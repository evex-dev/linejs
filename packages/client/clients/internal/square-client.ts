// For Square (square, etc)

import type { NestedArray, ProtocolKey } from "../../libs/thrift/declares.ts";
import type * as LINETypes from "../../libs/thrift/line_types.ts";
import type { LooseType } from "../../entities/common.ts";
import { LiffClient } from "./liff-client.ts";

export class SquareClient extends LiffClient {
	protected SquareService_API_PATH = "/SQ1";
	protected SquareService_PROTOCOL_TYPE: ProtocolKey = 4;

	protected SquareLiveTalkService_API_PATH = "/SQLV1";
	protected SquareLiveTalkService_PROTOCOL_TYPE: ProtocolKey = 4;

	private async continueRequest<
		T extends (...args: LooseType) => LooseType,
	>(options: {
		response: ReturnType<T>;
		continuationToken: string;
		method: {
			handler: T;
			args: Parameters<T>;
		};
	}) {
		const responseSum = { ...options.response };
		while (true) {
			options.continuationToken = options.response.continuationToken;
			const _response = await options.method.handler(options.method.args);
			for (const key in _response) {
				if (Object.prototype.hasOwnProperty.call(_response, key)) {
					const value = (_response as Record<string, LooseType>)[key];
					if (typeof value === "object") {
						if (Array.isArray(value)) {
							responseSum[key] = [...value, ...responseSum[key]];
						} else {
							responseSum[key] = { ...value, ...responseSum[key] };
						}
					} else {
						responseSum[key] = value;
					}
				}
			}
			if (!_response.continuationToken) {
				break;
			}
		}
		return responseSum;
	}

	/**
	 * @description Get joined squares.
	 */
	public async getJoinedSquares(
		options: {
			limit?: number;
			continuationToken?: string;
			continueRequest?: boolean;
		} = {},
	): Promise<LINETypes.GetJoinedSquaresResponse> {
		const { limit, continuationToken, continueRequest } = {
			limit: 100,
			continueRequest: !options.limit && !options.continuationToken,
			...options,
		};
		const response = await this.request(
			[
				[11, 2, continuationToken],
				[8, 3, limit],
			],
			"getJoinedSquares",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);

		if (continueRequest && response.continuationToken) {
			return await this.continueRequest({
				response,
				continuationToken: response.continuationToken,
				method: {
					handler: this.getJoinedSquares,
					args: [options],
				},
			});
		} else {
			return response;
		}
	}

	/**
	 * @description Invite to square chat.
	 */
	public async inviteIntoSquareChat(options: {
		squareChatMid: string;
		targetMids: string[];
	}): Promise<LINETypes.InviteIntoSquareChatResponse> {
		const { squareChatMid, targetMids } = {
			...options,
		};
		return await this.request(
			[
				[15, 1, [11, targetMids]],
				[11, 2, squareChatMid],
			],
			"inviteIntoSquareChat",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Invite to square.
	 */
	public async inviteToSquare(options: {
		squareMid: string;
		squareChatMid: string;
		targetMids: string[];
	}): Promise<LINETypes.InviteToSquareResponse> {
		const { squareMid, squareChatMid, targetMids } = {
			...options,
		};
		return await this.request(
			[
				[11, 2, squareMid],
				[15, 3, [11, targetMids]],
				[11, 4, squareChatMid],
			],
			"inviteToSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Mark as read for square chat.
	 */
	public async markAsReadInSquare(options: {
		squareChatMid: string;
		squareMessageId: string;
		squareThreadMid?: string;
	}): Promise<LINETypes.MarkAsReadResponse> {
		const { squareChatMid, squareMessageId, squareThreadMid } = {
			...options,
		};
		return await this.request(
			[
				[11, 2, squareChatMid],
				[11, 4, squareMessageId],
				squareThreadMid && [11, 5, squareThreadMid],
			],
			"markAsRead",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description React to message for square chat message.
	 *
	 * @param reactionType
	 * ALL     = 0,
	 * UNDO    = 1,
	 * NICE    = 2,
	 * LOVE    = 3,
	 * FUN     = 4,
	 * AMAZING = 5,
	 * SAD     = 6,
	 * OMG     = 7,
	 */
	public async reactToMessage(options: {
		squareChatMid: string;
		reactionType?: LINETypes.MessageReactionType;
		squareMessageId: string;
		squareThreadMid?: string;
	}): Promise<LINETypes.ReactToMessageResponse> {
		const { squareChatMid, reactionType, squareMessageId, squareThreadMid } = {
			reactionType: 2,
			...options,
		};
		return await this.request(
			[
				[8, 1, 0],
				[11, 2, squareChatMid],
				[11, 3, squareMessageId],
				[8, 4, reactionType],
				squareThreadMid && [11, 5, squareThreadMid],
			],
			"reactToMessage",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Find square by invitation ticket.
	 */
	public async findSquareByInvitationTicket(options: {
		invitationTicket: string;
	}): Promise<LINETypes.FindSquareByInvitationTicketResponse> {
		const { invitationTicket } = { ...options };
		return await this.request(
			[[11, 2, invitationTicket]],
			"findSquareByInvitationTicket",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Fetch square events.
	 */
	public override async fetchMyEvents(
		options: {
			limit?: number;
			syncToken?: string;
			continuationToken?: string;
			subscriptionId?: number;
		} = {},
	): Promise<LINETypes.FetchMyEventsResponse> {
		const { limit, syncToken, continuationToken, subscriptionId } = {
			limit: 100,
			...options,
		};
		return await this.request(
			[
				[10, 1, subscriptionId],
				[11, 2, syncToken],
				[8, 3, limit],
				[11, 4, continuationToken],
			],
			"fetchMyEvents",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Fetch square chat events.
	 */
	public async fetchSquareChatEvents(options: {
		squareChatMid: string;
		limit?: number;
		syncToken?: string;
		continuationToken?: string;
		subscriptionId?: number;
		squareThreadMid?: string;
	}): Promise<LINETypes.FetchSquareChatEventsResponse> {
		const {
			squareChatMid,
			limit,
			syncToken,
			continuationToken,
			subscriptionId,
			squareThreadMid,
		} = { limit: 100, ...options };
		return await this.request(
			[
				[10, 1, subscriptionId],
				[11, 2, squareChatMid],
				[11, 3, syncToken],
				[8, 4, limit],
				[8, 5, 1],
				[8, 6, 1],
				[11, 7, continuationToken],
				[8, 8, 1],
				[11, 9, squareThreadMid],
			],
			"fetchSquareChatEvents",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Send message for square chat.
	 */
	public async sendSquareMessage(
		options: {
			squareChatMid: string;
			text?: string;
			contentType?: LINETypes.ContentType;
			contentMetadata?: LooseType;
			relatedMessageId?: string;
		},
		safe: boolean = true,
	): Promise<LINETypes.SendMessageResponse> {
		const {
			squareChatMid,
			text,
			contentType,
			contentMetadata,
			relatedMessageId,
		} = { contentType: 0, contentMetadata: {}, ...options };
		const msg = [
			[11, 2, squareChatMid],
			[11, 10, text],
			[8, 15, contentType],
			[13, 18, [11, 11, contentMetadata]],
		];
		if (relatedMessageId) {
			msg.push([11, 21, relatedMessageId], [8, 22, 3], [8, 24, 2]);
		}
		let request:any;
		const promise = new Promise<LINETypes.SendMessageResponse>((resolve, reject) => {
			request = async() =>
				resolve(await this.request(
					[
						[8, 1, 0],
						[11, 2, squareChatMid],
						[
							12,
							3,
							[
								[12, 1, msg],
								[8, 3, 4],
							],
						],
					],
					"sendMessage",
					this.SquareService_PROTOCOL_TYPE,
					true,
					this.SquareService_API_PATH,
				));
		})

		if (safe) {
			this.squareRateLimitter.appendCall(request);
			// TypeScript Limitations (narrowing)
			return await promise;
		} else {
			request();
			return await promise;
		}
	}

	/**
	 * @description Get square info.
	 */
	public async getSquare(options: {
		squareMid: string;
	}): Promise<LINETypes.GetSquareResponse> {
		const { squareMid } = { ...options };
		return await this.request(
			[[11, 2, squareMid]],
			"getSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Get my member ship (profile) of square.
	 */
	public async getSquareProfile(options: {
		squareMid: string;
	}): Promise<LINETypes.SquareMember> {
		return (await this.getSquare(options)).myMembership;
	}

	/**
	 * @description Get square chat info.
	 */
	public async getSquareChat(options: {
		squareChatMid: string;
	}): Promise<LINETypes.GetSquareChatResponse> {
		const { squareChatMid } = { ...options };
		return await this.request(
			[[11, 1, squareChatMid]],
			"getSquareChat",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Get joinable square chats.
	 */
	public async getJoinableSquareChats(options: {
		squareMid: string;
		limit?: number;
		continuationToken?: string;
	}): Promise<LINETypes.GetJoinableSquareChatsResponse> {
		const { squareMid, limit, continuationToken } = { limit: 100, ...options };
		return await this.request(
			[
				[11, 1, squareMid],
				[11, 10, continuationToken],
				[8, 11, limit],
			],
			"getJoinableSquareChats",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	private defaultSquareCoverImageObsHash =
		"0h6tJfahRYaVt3H0eLAsAWDFheczgHd3wTCTx2eApNKSoefHNVGRdwfgxbdgUMLi8MSngnPFMeNmpbLi8MSngnPFMeNmpbLi8MSngnPQ";

	/**
	 *  @description Create square.
	 * @param SquareJoinMethodType
	 * NONE(0),
	 * APPROVAL(1),
	 * CODE(2);
	 */
	public async createSquare(options: {
		squareName: string;
		displayName: string;
		profileImageObsHash?: string;
		description?: string;
		searchable?: boolean;
		SquareJoinMethodType?: LINETypes.SquareJoinMethodType;
	}): Promise<LINETypes.CreateSquareResponse> {
		const {
			squareName,
			displayName,
			profileImageObsHash,
			description,
			searchable,
			SquareJoinMethodType,
		} = {
			profileImageObsHash: this.defaultSquareCoverImageObsHash,
			description: "",
			searchable: true,
			SquareJoinMethodType: 0,
			...options,
		};
		return await this.request(
			[
				[8, 2, 0],
				[
					12,
					2,
					[
						[11, 2, squareName],
						[11, 4, profileImageObsHash],
						[11, 5, description],
						[2, 6, searchable],
						[8, 7, 1], // type
						[8, 8, 1], // categoryId
						[10, 10, 0], // revision
						[2, 11, true], // ableToUseInvitationTicket
						[12, 14, [[8, 1, SquareJoinMethodType]]],
						[2, 15, false], // adultOnly
						[15, 16, [11, []]], // svcTags
					],
				],
				[
					12,
					3,
					[
						[11, 3, displayName],
						// [11, 4, profileImageObsHash],
						[2, 5, true], // ableToReceiveMessage
						[10, 9, 0], // revision
					],
				],
			],
			"createSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Get square chat announcements.
	 */
	public async getSquareChatAnnouncements(options: {
		squareChatMid: string;
	}): Promise<LINETypes.GetSquareChatAnnouncementsResponse> {
		const { squareChatMid } = { ...options };
		return await this.request(
			[[11, 2, squareChatMid]],
			"getSquareChatAnnouncements",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Update square feature set.
	 * @param updateAttributes
	 * CREATING_SECRET_SQUARE_CHAT(1),
	 * INVITING_INTO_OPEN_SQUARE_CHAT(2),
	 * CREATING_SQUARE_CHAT(3),
	 * READONLY_DEFAULT_CHAT(4),
	 * SHOWING_ADVERTISEMENT(5),
	 * DELEGATE_JOIN_TO_PLUG(6),
	 * DELEGATE_KICK_OUT_TO_PLUG(7),
	 * DISABLE_UPDATE_JOIN_METHOD(8),
	 * DISABLE_TRANSFER_ADMIN(9),
	 * CREATING_LIVE_TALK(10);
	 */
	public async updateSquareFeatureSet(options: {
		squareMid: string;
		updateAttributes: LINETypes.SquareFeatureSetAttribute[];
		revision?: number;
		creatingSecretSquareChat?: LINETypes.BooleanState;
	}): Promise<LINETypes.UpdateSquareFeatureSetResponse> {
		const { squareMid, updateAttributes, revision, creatingSecretSquareChat } =
			{ revision: 0, creatingSecretSquareChat: 0, ...options };
		const SquareFeatureSet: NestedArray = [
			[11, 1, squareMid],
			[10, 2, revision],
		];
		if (creatingSecretSquareChat) {
			SquareFeatureSet.push([
				12,
				11,
				[
					[8, 1, 1],
					[8, 2, creatingSecretSquareChat],
				],
			]);
		}
		return await this.request(
			[
				[14, 2, [8, updateAttributes]],
				[12, 3, SquareFeatureSet],
			],
			"updateSquareFeatureSet",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Join square.
	 */
	public async joinSquare(options: {
		squareMid: string;
		displayName: string;
		ableToReceiveMessage?: boolean;
		passCode?: string | undefined;
	}): Promise<LINETypes.JoinSquareResponse> {
		const { squareMid, displayName, ableToReceiveMessage, passCode } = {
			ableToReceiveMessage: false,
			...options,
		};
		return await this.request(
			[
				[11, 2, squareMid],
				[
					12,
					3,
					[
						[11, 2, squareMid],
						[11, 3, displayName],
						[2, 5, ableToReceiveMessage],
						[10, 9, 0],
					],
				],
				[12, 5, [[12, 2, [[11, 1, passCode]]]]],
			],
			"joinSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Remove square subscriptions.
	 */
	public async removeSubscriptions(options: {
		subscriptionIds: number[];
	}): Promise<LINETypes.RemoveSubscriptionsResponse> {
		const { subscriptionIds } = { ...options };
		return await this.request(
			[[15, 2, [10, subscriptionIds]]],
			"removeSubscriptions",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Unsend square chat message.
	 */
	public async unsendSquareMessage(options: {
		squareChatMid: string;
		squareMessageId: string;
	}): Promise<LINETypes.UnsendMessageResponse> {
		const { squareChatMid, squareMessageId } = { ...options };
		return await this.request(
			[
				[11, 2, squareChatMid],
				[11, 3, squareMessageId],
			],
			"unsendMessage",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Create square chat.
	 */
	public async createSquareChat(options: {
		squareChatMid: string;
		squareName: string;
		chatImageObsHash?: string;
		squareChatType?: LINETypes.SquareChatType;
		maxMemberCount?: number;
		ableToSearchMessage?: LINETypes.BooleanState;
		squareMemberMids?: string[];
	}): Promise<LINETypes.CreateSquareChatResponse> {
		const {
			squareChatMid,
			squareName,
			chatImageObsHash,
			squareChatType,
			maxMemberCount,
			ableToSearchMessage,
			squareMemberMids,
		} = {
			chatImageObsHash: this.defaultSquareCoverImageObsHash,
			squareChatType: 1,
			maxMemberCount: 5000,
			ableToSearchMessage: 1,
			squareMemberMids: [],
			...options,
		};
		return await this.request(
			[
				[8, 1, 0],
				[
					12,
					2,
					[
						[11, 1, squareChatMid],
						[8, 3, squareChatType],
						[11, 4, squareName],
						[11, 5, chatImageObsHash],
						[8, 7, maxMemberCount],
						[8, 11, ableToSearchMessage],
					],
				],
				[15, 3, [11, squareMemberMids]],
			],
			"createSquareChat",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Get square chat members.
	 */
	public async getSquareChatMembers(options: {
		squareChatMid: string;
		limit?: number;
		continuationToken?: string;
		continueRequest?: boolean;
	}): Promise<LINETypes.GetSquareChatMembersResponse> {
		const { squareChatMid, limit, continuationToken, continueRequest } = {
			limit: 100,
			continueRequest: !options.limit && !options.continuationToken,
			...options,
		};
		const req = [
			[11, 1, squareChatMid],
			[8, 3, limit],
		];
		if (continuationToken) {
			req.push([11, 2, continuationToken]);
		}
		const response = await this.request(
			req,
			"getSquareChatMembers",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);

		if (continueRequest && response.continuationToken) {
			return await this.continueRequest({
				response,
				continuationToken: response.continueationToken,
				method: {
					handler: this.getSquareChatMembers,
					args: [options],
				},
			});
		} else {
			return response;
		}
	}

	/**
	 * @description Get square feature set.
	 */
	public async getSquareFeatureSet(options: {
		squareMid: string;
	}): Promise<LINETypes.GetSquareFeatureSetResponse> {
		const { squareMid } = { ...options };
		return await this.request(
			[[11, 2, squareMid]],
			"getSquareFeatureSet",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Get square invitation ticket Url.
	 */
	public async getSquareInvitationTicketUrl(options: {
		mid: string;
	}): Promise<LINETypes.GetInvitationTicketUrlResponse> {
		const { mid } = { ...options };
		return await this.request(
			[[11, 2, mid]],
			"getInvitationTicketUrl",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Update square chat member.
	 */
	public async updateSquareChatMember(options: {
		squareMemberMid: string;
		squareChatMid: string;
		updatedAttrs?: LINETypes.SquareChatMemberAttribute[];
		notificationForMessage?: boolean;
		notificationForNewMember?: boolean;
	}): Promise<LINETypes.UpdateSquareChatMemberResponse> {
		const {
			squareMemberMid,
			squareChatMid,
			updatedAttrs,
			notificationForMessage,
			notificationForNewMember,
		} = {
			updatedAttrs: [6],
			notificationForMessage: true,
			notificationForNewMember: true,
			...options,
		};
		return await this.request(
			[
				[14, 2, [8, updatedAttrs]],
				[
					12,
					3,
					[
						[11, 1, squareMemberMid],
						[11, 2, squareChatMid],
						[2, 5, notificationForMessage],
						[2, 6, notificationForNewMember],
					],
				],
			],
			"updateSquareChatMember",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Update square member.
	 */
	public async updateSquareMember(options: {
		squareMemberMid: string;
		squareMid: string;
		displayName?: string;
		membershipState?: LINETypes.SquareMembershipState;
		role?: LINETypes.SquareMemberRole;
		updatedAttrs?: LINETypes.SquareMemberAttribute[];
		updatedPreferenceAttrs?: number[];
		revision?: number;
	}): Promise<LINETypes.UpdateSquareMemberResponse> {
		const {
			squareMemberMid,
			squareMid,
			displayName,
			membershipState,
			role,
			updatedAttrs,
			updatedPreferenceAttrs,
			revision,
		} = {
			updatedAttrs: [],
			updatedPreferenceAttrs: [],
			revision: 0,
			...options,
		};
		const squareMember: NestedArray = [
			[11, 1, squareMemberMid],
			[11, 2, squareMid],
		];
		if (updatedAttrs.includes(1)) {
			squareMember.push([11, 3, displayName]);
		}
		if (updatedAttrs.includes(5)) {
			squareMember.push([8, 7, membershipState]);
		}
		if (updatedAttrs.includes(6)) {
			squareMember.push([8, 8, role]);
		}
		squareMember.push([10, 9, revision]);
		return await this.request(
			[
				[14, 2, [8, updatedAttrs]],
				[14, 3, [8, updatedPreferenceAttrs]],
				[12, 4, squareMember],
			],
			"updateSquareMember",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Kick out square member.
	 */
	public async kickOutSquareMember(options: {
		squareMid: string;
		squareMemberMid: string;
		allowRejoin?: boolean;
	}): Promise<LINETypes.UpdateSquareMemberResponse> {
		const { squareMid, squareMemberMid, allowRejoin } = {
			allowRejoin: true,
			...options,
		};
		const UPDATE_PREF_ATTRS: number[] = [];
		const UPDATE_ATTRS = [5];
		const MEMBERSHIP_STATE = allowRejoin ? 5 : 6;
		const getSquareMemberResp = await this.getSquareMember({ squareMemberMid });
		const squareMember = getSquareMemberResp.squareMember;
		const squareMemberRevision = squareMember.revision;
		return await this.updateSquareMember({
			squareMemberMid,
			squareMid,
			membershipState: MEMBERSHIP_STATE,
			updatedAttrs: UPDATE_ATTRS,
			updatedPreferenceAttrs: UPDATE_PREF_ATTRS,
			revision: squareMemberRevision,
		});
	}

	/**
	 * @description Check square join code.
	 */
	public async checkSquareJoinCode(options: {
		squareMid: string;
		code: string;
	}): Promise<LooseType> {
		const { squareMid, code } = { ...options };
		return await this.request(
			[
				[11, 2, squareMid],
				[11, 3, code],
			],
			"checkJoinCode",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Create square chat announcement.
	 */
	public async createSquareChatAnnouncement(options: {
		squareChatMid: string;
		squareMessageId: string;
		text: string;
		senderSquareMemberMid: string;
		createdAt: number;
		announcementType?: LINETypes.SquareChatAnnouncementType;
	}): Promise<LINETypes.CreateSquareChatAnnouncementResponse> {
		const {
			squareChatMid,
			squareMessageId,
			text,
			senderSquareMemberMid,
			createdAt,
			announcementType,
		} = { announcementType: 0, ...options };
		return await this.request(
			[
				[8, 1, 0],
				[11, 2, squareChatMid],
				[
					12,
					3,
					[
						[8, 2, announcementType],
						[
							12,
							3,
							[
								[
									12,
									1,
									[
										[11, 1, squareMessageId],
										[11, 2, text],
										[11, 3, senderSquareMemberMid],
										[10, 4, createdAt],
									],
								],
							],
						],
					],
				],
			],
			"createSquareChatAnnouncement",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Get square member.
	 */
	public async getSquareMember(options: {
		squareMemberMid: string;
	}): Promise<LINETypes.GetSquareMemberResponse> {
		const { squareMemberMid } = { ...options };
		return await this.request(
			[[11, 2, squareMemberMid]],
			"getSquareMember",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Search square chat members.
	 */
	public async searchSquareChatMembers(options: {
		squareChatMid: string;
		displayName: string;
		continuationToken?: string;
		limit?: number;
	}): Promise<LooseType> {
		const { squareChatMid, displayName, continuationToken, limit } = {
			limit: 200,
			...options,
		};
		return await this.request(
			[
				[11, 1, squareChatMid],
				[12, 2, [[11, 1, displayName]]],
				[8, 4, limit],
				[11, 3, continuationToken],
			],
			"searchSquareChatMembers",
			this.SquareService_PROTOCOL_TYPE,
			false,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Get square emid.
	 */
	public async getSquareEmid(options: {
		squareMid: string;
	}): Promise<LINETypes.GetSquareEmidResponse> {
		const { squareMid } = { ...options };
		return await this.request(
			[[11, 1, squareMid]],
			"getSquareEmid",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Get square members by square.
	 */
	public async getSquareMembersBySquare(options: {
		squareMid: string;
		squareMemberMids?: string[];
	}): Promise<LINETypes.GetSquareMembersBySquareResponse> {
		const { squareMid, squareMemberMids } = {
			squareMemberMids: [],
			...options,
		};
		return await this.request(
			[
				[11, 2, squareMid],
				[14, 3, [11, squareMemberMids]],
			],
			"getSquareMembersBySquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Manual square repair.
	 */
	public async manualRepair(options: {
		limit?: number;
		syncToken?: string;
		continuationToken?: string;
	}): Promise<LINETypes.ManualRepairResponse> {
		const { limit, syncToken, continuationToken } = { limit: 100, ...options };
		return await this.request(
			[
				[11, 1, syncToken],
				[8, 2, limit],
				[11, 3, continuationToken],
			],
			"manualRepair",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Leave square.
	 */
	public async leaveSquare(options: {
		squareMid: string;
	}): Promise<LINETypes.LeaveSquareResponse> {
		const { squareMid } = { ...options };
		return await this.request(
			[[11, 2, squareMid]],
			"leaveSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Report square.
	 */
	public async reportSquare(options: {
		squareMid: string;
		reportType: LINETypes.ReportType;
		otherReason?: string;
	}): Promise<LINETypes.ReportSquareResponse> {
		const { squareMid, reportType, otherReason } = { ...options };
		return await this.request(
			[
				[11, 2, squareMid],
				[10, 3, reportType],
				[11, 4, otherReason],
			],
			"reportSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Report square message.
	 */
	public async reportSquareMessage(options: {
		squareMid: string;
		squareChatMid: string;
		squareMessageId: string;
		reportType: LINETypes.ReportType;
		otherReason?: string;
		threadMid?: string;
	}): Promise<LINETypes.ReportSquareMessageResponse> {
		const {
			squareMid,
			squareChatMid,
			squareMessageId,
			reportType,
			otherReason,
			threadMid,
		} = { ...options };
		return await this.request(
			[
				[11, 2, squareMid],
				[11, 3, squareChatMid],
				[11, 4, squareMessageId],
				[8, 5, reportType],
				otherReason && [11, 6, otherReason],
				threadMid && [11, 7, threadMid],
			],
			"reportSquareMessage",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Report square member.
	 */
	public async reportSquareMember(options: {
		squareMemberMid: string;
		reportType: LINETypes.ReportType;
		otherReason?: string;
		squareChatMid?: string;
		threadMid?: string;
	}): Promise<LINETypes.ReportSquareMemberResponse> {
		const {
			squareMemberMid,
			reportType,
			otherReason,
			squareChatMid,
			threadMid,
		} = { ...options };
		return await this.request(
			[
				[11, 2, squareMemberMid],
				[8, 3, reportType],
				otherReason && [11, 4, otherReason],
				squareChatMid && [11, 5, squareChatMid],
				threadMid && [11, 6, threadMid],
			],
			"reportSquareMessage",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description Send square thrift request.
	 */
	public async sendSquareRequest(
		methodName: string,
		params: NestedArray,
	): Promise<LooseType> {
		return await this.request(
			params,
			methodName,
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @description get fetchMyEvents current syncToken.
	 */
	public async getFetchMyEventsCurrentSyncToken(): Promise<string> {
		return (await this.manualRepair({ limit: 1 })).continuationToken;
	}

	/**
	 * @experimental
	 * @description Fetch square thread events.
	 */
	public async fetchSquareThreadEvents(options: {
		squareChatMid: string;
		squareThreadMid: string;
		limit?: number;
		syncToken?: string;
		continuationToken?: string;
		subscriptionId?: number;
	}): Promise<LINETypes.FetchSquareChatEventsResponse> {
		return await this.fetchSquareChatEvents(options);
	}

	/**
	 * @experimental
	 * @description Send message to square thread.
	 */
	public async sendSquareThreadMessage(options: {
		squareThreadMid: string;
		squareChatMid: string;
		text?: string;
		contentType?: LINETypes.ContentType;
		contentMetadata?: LooseType;
		relatedMessageId?: string;
	}): Promise<LINETypes.SendMessageResponse> {
		const {
			squareThreadMid,
			squareChatMid,
			text,
			contentType,
			contentMetadata,
			relatedMessageId,
		} = { contentType: 0, contentMetadata: {}, ...options };
		const msg = [
			[11, 2, squareThreadMid],
			[11, 10, text],
			[8, 15, contentType],
			[13, 18, [11, 11, contentMetadata]],
		];
		if (relatedMessageId) {
			msg.push([11, 21, relatedMessageId], [8, 22, 3], [8, 24, 2]);
		}

		return await this.request(
			[
				[8, 1, 0],
				[11, 2, squareChatMid],
				[11, 3, squareThreadMid],
				[
					12,
					4,
					[
						[12, 1, msg],
						[8, 3, 5],
					],
				],
			],
			"sendSquareThreadMessage",
			this.SquareService_PROTOCOL_TYPE,
			"SendMessageResponse",
			this.SquareService_API_PATH,
		);
	}
}
