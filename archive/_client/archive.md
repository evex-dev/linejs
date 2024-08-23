archive (list)

```ts
    // -- Liff --
	public async issueLiffView(
		chatMid: string,
		liffId: string,
		lang: string = "ja_JP",
	): Promise<LooseType> {
		let context: NestedArray = [12, 1, []];
		let chaLINETypes;
		let chat;
		if (chatMid) {
			chat = [11, 1, chatMid];
			if (chatMid[0] in ["u", "c", "r"]) {
				chaLINETypes = 2;
			} else {
				chaLINETypes = 3;
			}
			context = [12, chaLINETypes, [chat]];
		}
		return await this.request(
			[
				[11, 1, liffId],
				[12, 2, [context]],
				[11, 3, lang],
			],
			"issueLiffView",
			this.LiffService_PROTOCOL_TYPE,
			true,
			this.LiffService_API_PATH,
		);
	}

	// -- Channel --

	public async approveChannelAndIssueChannelToken(
		channelId: string = "1341209850",
	): Promise<LooseType> {
		return await this.direct_request(
			[[11, 1, channelId]],
			"approveChannelAndIssueChannelToken",
			this.ChannelService_PROTOCOL_TYPE,
			true,
			this.ChannelService_API_PATH,
		);
	}

	// -- External --

	// -- Talk --

	// -- Sync --

	public async sync(
		limit: number = 100,
		revision: number = 0,
		globalRev: number = 0,
		individualRev: number = 0,
	): Promise<LINETypes.SyncResponse> {
		return await this.request(
			[
				[10, 1, revision],
				[8, 2, limit],
				[10, 3, globalRev],
				[10, 4, individualRev],
			],
			"sync",
			this.SyncService_PROTOCOL_TYPE,
			"SyncResponse",
			this.SyncService_API_PATH,
		);
	}

	// -- Group --

	// -- Square --

	public async getJoinedSquares(
		limit: number = 100,
		continuationToken: string | undefined = undefined,
	): Promise<LINETypes.GetJoinedSquaresResponse> {
		return await this.request(
			[
				[11, 2, continuationToken],
				[8, 3, limit],
			],
			"getJoinedSquares",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async inviteIntoSquareChat(
		squareChatMid: string,
		targetMids: string[],
	): Promise<LINETypes.InviteIntoSquareChatResponse> {
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

	public async inviteToSquare(
		squareMid: string,
		squareChatMid: string,
		targetMids: string[],
	): Promise<LINETypes.InviteToSquareResponse> {
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

	public async markAsReadInSquare(
		squareChatMid: string,
		squareMessageId: string,
		squareThreadMid: string | undefined = undefined,
	): Promise<LINETypes.MarkAsReadResponse> {
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

	public async reactToMessage(
		squareChatMid: string,
		reactionType: LINETypes.MessageReactionType = 2,
		squareMessageId: string,
		squareThreadMid: string | undefined = undefined,
	): Promise<LINETypes.ReactToMessageResponse> {
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

	public async findSquareByInvitationTicket(
		invitationTicket: string,
	): Promise<LINETypes.FindSquareByInvitationTicketResponse> {
		return await this.request(
			[[11, 2, invitationTicket]],
			"findSquareByInvitationTicket",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async fetchMyEvents(
		limit: number = 100,
		syncToken: string | undefined = undefined,
		continuationToken: string | undefined = undefined,
		subscriptionId = 0,
	): Promise<LINETypes.FetchMyEventsResponse> {
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

	public async fetchSquareChatEvents(
		squareChatMid: string,
		limit: number = 100,
		syncToken: string | undefined = undefined,
		continuationToken: string | undefined = undefined,
		subscriptionId: number = 0,
		squareThreadMid: string | undefined = undefined,
	): Promise<LINETypes.FetchSquareChatEventsResponse> {
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

	public async sendSquareMessage(
		squareChatMid: string,
		text: string | undefined,
		contentType: LINETypes.ContentType = 0,
		contentMetadata: LooseType = {},
		relatedMessageId: string | undefined = undefined,
	): Promise<LINETypes.SendMessageResponse> {
		const msg = [
			[11, 2, squareChatMid],
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
		);
	}

	public async getSquare(
		squareMid: string,
	): Promise<LINETypes.GetSquareResponse> {
		return await this.request(
			[[11, 2, squareMid]],
			"getSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getSquareChat(
		squareChatMid: string,
	): Promise<LINETypes.GetSquareChatResponse> {
		return await this.request(
			[[11, 1, squareChatMid]],
			"getSquareChat",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getJoinableSquareChats(
		squareMid: string,
		limit: number = 100,
		continuationToken: string | undefined = undefined,
	): Promise<LINETypes.GetJoinableSquareChatsResponse> {
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

	public async createSquare(
		squareName: string,
		displayName: string,
		profileImageObsHash: string = defaultSquareCoverImageObsHash,
		description: string = "",
		searchable: boolean = true,
		SquareJoinMethodType: LINETypes.SquareJoinMethodType = 0,
	): Promise<LINETypes.CreateSquareResponse> {
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

	public async getSquareChatAnnouncements(
		squareChatMid: string,
	): Promise<LINETypes.GetSquareChatAnnouncementsResponse> {
		return await this.request(
			[[11, 2, squareChatMid]],
			"getSquareChatAnnouncements",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async updateSquareFeatureSet(
		squareMid: string,
		updateAttributes: LINETypes.SquareFeatureSetAttribute[],
		revision: number = 0,
		creatingSecretSquareChat: LINETypes.BooleanState = 0,
	): Promise<LINETypes.UpdateSquareFeatureSetResponse> {
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

	public async joinSquare(
		squareMid: string,
		displayName: string,
		ableToReceiveMessage: boolean = false,
		passCode: string | undefined = undefined,
	): Promise<LINETypes.JoinSquareResponse> {
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

	public async removeSubscriptions(
		subscriptionIds: number[] = [],
	): Promise<LINETypes.RemoveSubscriptionsResponse> {
		return await this.request(
			[[15, 2, [10, subscriptionIds]]],
			"removeSubscriptions",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async unsendSquareMessage(
		squareChatMid: string,
		squareMessageId: string,
	): Promise<LINETypes.UnsendMessageResponse> {
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

	public async createSquareChat(
		squareChatMid: string,
		squareName: string,
		chatImageObsHash: string = defaultSquareCoverImageObsHash,
		squareChatType: LINETypes.SquareChatType = 1,
		maxMemberCount: number = 5000,
		ableToSearchMessage: LINETypes.BooleanState = 1,
		squareMemberMids: string[] = [],
	): Promise<LINETypes.CreateSquareChatResponse> {
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

	public async getSquareChatMembers(
		squareChatMid: string,
		limit: number = 200,
		continuationToken: string | undefined = undefined,
	): Promise<LINETypes.GetSquareChatMembersResponse> {
		const req = [
			[11, 1, squareChatMid],
			[8, 3, limit],
		];
		if (continuationToken) {
			req.push([11, 2, continuationToken]);
		}
		return await this.request(
			req,
			"getSquareChatMembers",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getSquareFeatureSet(
		squareMid: string,
	): Promise<LINETypes.GetSquareFeatureSetResponse> {
		return await this.request(
			[[11, 2, squareMid]],
			"getSquareFeatureSet",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getSquareInvitationTicketUrl(
		mid: string,
	): Promise<LINETypes.GetInvitationTicketUrlResponse> {
		return await this.request(
			[[11, 2, mid]],
			"getInvitationTicketUrl",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async updateSquareChatMember(
		squareMemberMid: string,
		squareChatMid: string,
		updatedAttrs: LINETypes.SquareChatMemberAttribute[] = [6],
		notificationForMessage: boolean = true,
		notificationForNewMember: boolean = true,
	): Promise<LINETypes.UpdateSquareChatMemberResponse> {
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

	public async updateSquareMember(
		squareMemberMid: string,
		squareMid: string,
		displayName: string | undefined,
		membershipState: LINETypes.SquareMembershipState | undefined,
		role: LINETypes.SquareMemberRole | undefined,
		updatedAttrs: LINETypes.SquareMemberAttribute[] = [],
		updatedPreferenceAttrs: number[] = [],
		revision: number = 0,
	): Promise<LINETypes.UpdateSquareMemberResponse> {
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

	public async kickOutSquareMember(
		squareMid: string,
		squareMemberMid: string,
		allowRejoin: boolean = true,
	): Promise<LINETypes.UpdateSquareMemberResponse> {
		const UPDATE_PREF_ATTRS: number[] = [];
		const UPDATE_ATTRS = [5];
		const MEMBERSHIP_STATE = allowRejoin ? 5 : 6;
		const getSquareMemberResp = await this.getSquareMember(squareMemberMid);
		const squareMember = getSquareMemberResp.squareMember;
		const squareMemberRevision = squareMember.revision;
		return await this.updateSquareMember(
			squareMemberMid,
			squareMid,
			undefined,
			MEMBERSHIP_STATE,
			undefined,
			UPDATE_ATTRS,
			UPDATE_PREF_ATTRS,
			squareMemberRevision,
		);
	}

	public async checkSquareJoinCode(
		squareMid: string,
		code: string,
	): Promise<LooseType> {
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

	public async createSquareChatAnnouncement(
		squareChatMid: string,
		squareMessageId: string,
		text: string,
		senderSquareMemberMid: string,
		createdAt: number,
		announcementType: LINETypes.SquareChatAnnouncementType = 0,
	): Promise<LINETypes.CreateSquareChatAnnouncementResponse> {
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

	public async getSquareMember(
		squareMemberMid: string,
	): Promise<LINETypes.GetSquareMemberResponse> {
		return await this.request(
			[[11, 2, squareMemberMid]],
			"getSquareMember",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async searchSquareChatMembers(
		squareChatMid: string,
		displayName: string = "",
		continuationToken: string | undefined = undefined,
		limit: number = 200,
	): Promise<LooseType> {
		const req = [
			[11, 1, squareChatMid],
			[12, 2, [[11, 1, displayName]]],
			[8, 4, limit],
			[11, 3, continuationToken],
		];
		return await this.request(
			[[12, 1, req]],
			"searchSquareChatMembers",
			this.SquareService_PROTOCOL_TYPE,
			false,
			this.SquareService_API_PATH,
		);
	}

	public async getSquareEmid(
		squareMid: string,
	): Promise<LINETypes.GetSquareEmidResponse> {
		return await this.request(
			[[11, 1, squareMid]],
			"getSquareEmid",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getSquareMembersBySquare(
		squareMid: string,
		squareMemberMids: string[] = [],
	): Promise<LINETypes.GetSquareMembersBySquareResponse> {
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

	public async manualRepair(
		limit: number = 100,
		syncToken: string | undefined = undefined,
		continuationToken: string | undefined = undefined,
	): Promise<LINETypes.ManualRepairResponse> {
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

	public async leaveSquare(
		squareMid: string,
	): Promise<LINETypes.LeaveSquareResponse> {
		return await this.request(
			[[11, 2, squareMid]],
			"leaveSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async reportSquare(
		squareMid: string,
		reportType: LINETypes.ReportType,
		otherReason: string | undefined = undefined,
	): Promise<LINETypes.ReportSquareResponse> {
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

	public async reportSquareMessage(
		squareMid: string,
		squareChatMid: string,
		squareMessageId: string,
		reportType: LINETypes.ReportType,
		otherReason: string | undefined = undefined,
		threadMid: string | undefined = undefined,
	): Promise<LINETypes.ReportSquareMessageResponse> {
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

	public async reportSquareMember(
		squareMemberMid: string,
		reportType: LINETypes.ReportType,
		otherReason: string | undefined = undefined,
		squareChatMid: string | undefined = undefined,
		threadMid: string | undefined = undefined,
	) {
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

	public async getFetchMyEventsCurrentSyncToken(): Promise<string> {
		return (await this.manualRepair(1, undefined)).continuationToken;
	}

	/**
	 * @experimental
	 */
	public async fetchSquareThreadEvents(
		squareChatMid: string,
		squareThreadMid: string,
		limit: number = 100,
		syncToken: string | undefined = undefined,
		continuationToken: string | undefined = undefined,
		subscriptionId: number = 0,
	): Promise<LINETypes.FetchSquareChatEventsResponse> {
		return await this.request(
			[
				[10, 1, subscriptionId],
				[11, 2, squareChatMid],
				[11, 3, syncToken],
				[8, 4, limit],
				[8, 5, 1],
				[8, 6, 1],
				[11, 7, continuationToken],
				[11, 9, squareThreadMid],
			],
			"fetchSquareChatEvents",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	/**
	 * @experimental
	 */
	public async sendSquareThreadMessage(
		squareThreadMid: string,
		text: string | undefined,
		contentType: LINETypes.ContentType = 0,
		_contentMetadata: LooseType = {},
		relatedMessageId: string | undefined = undefined,
	): Promise<LINETypes.SendMessageResponse> {
		const msg = [
			[11, 2, squareThreadMid],
			[8, 3, 7],
			[11, 10, text],
			[2, 14, false],
			[8, 15, contentType],
			[3, 19, null],
			[15, 27, [12, []]],
		];
		if (relatedMessageId) {
			msg.push([11, 21, relatedMessageId], [8, 22, 3], [8, 24, 2]);
		}
		const params = [
			12,
			1,
			[
				[
					[12, 1, msg],
					[8, 3, 5],
					[10, 4, 1],
					[8, 5, 1],
					[
						12,
						6,
						[
							[11, 1, squareThreadMid],
							[2, 2, false],
						],
					],
				],
			],
		];

		return await this.direct_request(
			params,
			"sendSquareThreadMessage",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}
```