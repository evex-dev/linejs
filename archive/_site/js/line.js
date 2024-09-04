const TYPE = {
	STOP: 0,
	VOID: 1,
	BOOL: 2,
	BYTE: 3,
	I08: 3,
	DOUBLE: 4,
	I16: 6,
	I32: 8,
	I64: 10,
	STRING: 11,
	UTF7: 11,
	STRUCT: 12,
	MAP: 13,
	SET: 14,
	LIST: 15,
	UTF8: 16,
	UTF16: 17,
};
function getType(obj) {
	if (obj.type === "BaseType") {
		return TYPE[obj.baseType.toUpperCase()];
	} else if (obj.type === "Identifier") {
		return obj.name;
	}
}
function isStruct(obj) {
	return obj && obj.constructor === Array;
}
class ThriftRenameParser {
	constructor() {
		this.def = {};
	}
	name2fid(struct_name, name) {
		const struct = this.def[struct_name];
		if (struct) {
			const result = struct.findIndex((e) => {
				return e.name == name;
			});
			if (result === -1) {
				return { name: name, fid: -1 };
			} else {
				return struct[result];
			}
		} else {
			return { name: name, fid: -1 };
		}
	}
	fid2name(struct_name, fid) {
		const struct = this.def[struct_name];
		if (struct) {
			const result = struct.findIndex((e) => {
				return e.fid == fid;
			});
			if (result === -1) {
				return { name: fid, fid: fid };
			} else {
				return struct[result];
			}
		} else {
			return { name: fid, fid: fid };
		}
	}
	rename_thrift(struct_name, object) {
		const newObject = {};
		for (const fid in object) {
			const value = object[fid];
			const finfo = this.fid2name(struct_name, fid);
			if (finfo.struct) {
				if (isStruct(this.def[finfo.struct])) {
					newObject[finfo.name] = this.rename_thrift(
						finfo.struct,
						value,
					);
				} else {
					newObject[finfo.name] = this.def[finfo.struct][value] ||
						value;
				}
			} else if (finfo.list) {
				newObject[finfo.name] = [];
				value.forEach((e, i) => {
					newObject[finfo.name][i] = this.rename_thrift(
						finfo.list,
						e,
					);
				});
			} else if (finfo.map) {
				newObject[finfo.name] = {};
				for (const key in value) {
					const e = value[key];
					newObject[finfo.name][key] = this.rename_thrift(
						finfo.map,
						e,
					);
				}
			} else if (finfo.set) {
				newObject[finfo.name] = [];
				value.forEach((e, i) => {
					newObject[finfo.name][i] = this.rename_thrift(
						finfo.set,
						e,
					);
				});
			} else {
				newObject[finfo.name] = value;
			}
		}
		return newObject;
	}
	rename_data(data) {
		const name = data._info.fname;
		const value = data.value;
		const struct_name = name.substr(0, 1).toUpperCase() + name.substr(1) +
			"Response";
		data.value = this.rename_thrift(struct_name, value);
		return data;
	}
	parse_data(struct_name, object) {
		const newThrift = [];
		for (const fname in object) {
			const value = object[fname];
			const finfo = this.name2fid(struct_name, fname);
			if (finfo.fid == -1) {
				continue;
			}
			const thisValue = [null, finfo.fid, null];
			if (finfo.struct) {
				if (isStruct(this.def[finfo.struct])) {
					thisValue[2] = this.parse_data(
						finfo.struct,
						value,
					);
					thisValue[0] = TYPE.STRUCT;
				} else {
					if (typeof value === "number") {
						thisValue[2] = value;
						thisValue[0] = TYPE.I64;
					} else {
						const Enum = this.def[finfo.struct];
						let i64;
						for (const k in Enum) {
							const val = Enum[k];
							if (val == value) {
								i64 = Number(k);
							}
						}
						thisValue[2] = i64;
						thisValue[0] = TYPE.I64;
					}
				}
			} else if (finfo.list) {
				thisValue[0] = TYPE.LIST;
				if (typeof finfo.list === "number") {
					thisValue[2] = [finfo.list, value];
				} else {
					thisValue[2] = [
						TYPE.STRUCT,
						value.map((e) => this.parse_data(finfo.list, e)),
					];
				}
			} else if (finfo.map) {
				thisValue[0] = TYPE.MAP;
				if (typeof finfo.map === "number") {
					thisValue[2] = [TYPE.STRING, finfo.map, value];
				} else {
					const obj = {};
					for (const key in value) {
						const e = value[key];
						obj[key] = this.parse_data(finfo.map, e);
					}
					thisValue[2] = [TYPE.STRING, TYPE.STRUCT, obj];
				}
			} else if (finfo.set) {
				thisValue[0] = TYPE.SET;
				if (typeof finfo.map === "number") {
					thisValue[2] = [finfo.map, value];
				} else {
					thisValue[2] = [
						TYPE.STRUCT,
						value.map((e) => this.parse_data(finfo.map, e)),
					];
				}
			} else if (finfo.type) {
				thisValue[0] = finfo.type;
				thisValue[2] = value;
			}
			newThrift.push(thisValue);
		}
		return newThrift;
	}
}

class LineThriftPost {
	constructor(win) {
		this.window = win;
		this.waitFunc = {};
	}
	post(data) {
		return new Promise((resolve, reject) => {
			data = { arg: data };
			data.id = Date.now();
			this.send(
				this.window,
				this.waitFunc,
				data,
				resolve,
			);
		});
	}

	async postParseThrift(data) {
		let reqJson, resJson;
		reqJson = data;
		resJson = await this.post(reqJson);
		if (resJson.err) {
			throw new Error("Server Error : " + resJson.err);
		}
		return resJson;
	}

	postRequestAndGetResponse(
		CHRdata,
		methodName,
		protocol_type = 3,
		path = "/S3",
		headers = {},
	) {
		return new Promise((resolve, reject) => {
			const request = [path, CHRdata, methodName, protocol_type, headers];
			this.postParseThrift(request).then((r) => resolve(r));
		});
	}
	send(socket, funcMap, data, returnFunc) {
		if (socket) {
			socket.postMessage(data, "*");
			funcMap[data.id] = (e) => {
				returnFunc(e);
			};
			window.onmessage = (e) => {
				let j = e.data;
				funcMap[j.id](j);
				delete funcMap[j.id];
			};
		} else throw new Error("No parent window");
	}
}

class SquareServise {
	SquareService_API_PATH = "/SQ1";
	SquareService_P_TYPE = 4;
	async getJoinedSquares(limit = 50, continuationToken) {
		return await this.request(
			[[11, 2, continuationToken], [8, 3, limit]],
			"getJoinedSquares",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async inviteIntoSquareChat(inviteeMids, squareChatMid) {
		return await this.request(
			[[15, 1, [11, inviteeMids]], [11, 2, squareChatMid]],
			"inviteIntoSquareChat",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async inviteToSquare(squareMid, invitees, squareChatMid) {
		return await this.request(
			[[11, 2, squareMid], [15, 3, [11, invitees]], [
				11,
				4,
				squareChatMid,
			]],
			"inviteToSquare",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async markAsRead(squareChatMid, messageId) {
		return await this.request(
			[[11, 2, squareChatMid], [11, 4, messageId]],
			"markAsRead",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async reactToMessage(squareChatMid, messageId, reactionType = 2) {
		/*
  reactionType
    ALL   = 0,
    UNDO  = 1,
    NICE  = 2,
    LOVE  = 3,
    FUN   = 4,
    AMAZING = 5,
    SAD   = 6,
    OMG   = 7,
  */
		return await this.request(
			[
				[8, 1, 0],
				[11, 2, squareChatMid],
				[11, 3, messageId],
				[8, 4, reactionType],
			],
			"reactToMessage",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async findSquareByInvitationTicket(invitationTicket) {
		return await this.request(
			[[11, 2, invitationTicket]],
			"findSquareByInvitationTicket",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async fetchMyEvents(
		syncToken = undefined,
		limit = 100,
		continuationToken = undefined,
		subscriptionId,
	) {
		return await this.request(
			[
				[10, 1, subscriptionId],
				[11, 2, syncToken],
				[8, 3, limit],
				[11, 4, continuationToken],
			],
			"fetchMyEvents",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async fetchSquareChatEvents(
		squareChatMid,
		syncToken = undefined,
		continuationToken = undefined,
		subscriptionId = 0,
		limit = 100,
	) {
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
			],
			"fetchSquareChatEvents",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async sendSquareMessage(
		squareChatMid,
		text = "test Message",
		contentType = 0,
		contentMetadata = {},
		relatedMessageId = undefined,
	) {
		const msg = [
			[11, 2, squareChatMid],
			[11, 10, text],
			[8, 15, contentType],
			[13, 18, [11, 11, contentMetadata]],
		];
		if (relatedMessageId) {
			msg.push(
				[11, 21, relatedMessageId],
				[8, 22, 3],
				[8, 24, 2],
			);
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
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async getSquare(squareMid) {
		return await this.request(
			[[11, 2, squareMid]],
			"getSquare",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}
	async getSquareChat(squareChatMid) {
		return await this.request(
			[[11, 1, squareChatMid]],
			"getSquareChat",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}
	async getJoinableSquareChats(
		squareMid,
		continuationToken = undefined,
		limit = 100,
	) {
		return await this.request(
			[[11, 1, squareMid], [11, 10, continuationToken], [8, 11, limit]],
			"getJoinableSquareChats",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async createSquare(
		name = "TEST Square",
		displayName = "Tester",
		profileImageObsHash =
			"0h6tJf0hQsaVt3H0eLAsAWDFheczgHd3wTCTx2eApNKSoefHNVGRdwfgxbdgUMLi8MSngnPFMeNmpbLi8MSngnPFMeNmpbLi8MSngnOA",
		desc = "test with LINE-Deno-Client",
		searchable = true,
		SquareJoinMethodType = 0,
	) {
		/*
  SquareJoinMethodType
    NONE(0),
    APPROVAL(1),
    CODE(2);
    */
		return await this.request(
			[
				[8, 2, 0],
				[
					12,
					2,
					[
						[11, 2, name],
						[11, 4, profileImageObsHash],
						[11, 5, desc],
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
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async getSquareChatAnnouncements(squareChatMid) {
		return await this.request(
			[[11, 2, squareChatMid]],
			"getSquareChatAnnouncements",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async updateSquareFeatureSet(
		updateAttributes = [],
		squareMid,
		revision,
		creatingSecretSquareChat = 0,
	) {
		/*
  updateAttributes:
    CREATING_SECRET_SQUARE_CHAT(1),
    INVITING_INTO_OPEN_SQUARE_CHAT(2),
    CREATING_SQUARE_CHAT(3),
    READONLY_DEFAULT_CHAT(4),
    SHOWING_ADVERTISEMENT(5),
    DELEGATE_JOIN_TO_PLUG(6),
    DELEGATE_KICK_OUT_TO_PLUG(7),
    DISABLE_UPDATE_JOIN_METHOD(8),
    DISABLE_TRANSFER_ADMIN(9),
    CREATING_LIVE_TALK(10);
  */
		const SquareFeatureSet = [
			[11, 1, squareMid],
			[10, 2, revision],
		];
		if (creatingSecretSquareChat) {
			SquareFeatureSet.push([12, 11, [
				[8, 1, 1],
				[8, 2, creatingSecretSquareChat],
			]]);
		}
		return await this.request(
			[
				[14, 2, [8, updateAttributes]],
				[12, 3, SquareFeatureSet],
			],
			"updateSquareFeatureSet",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async joinSquare(
		squareMid,
		displayName,
		ableToReceiveMessage = false,
		passCode = undefined,
	) {
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
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async removeSubscriptions(subscriptionIds = []) {
		return await this.request(
			[
				[15, 2, [10, subscriptionIds]],
			],
			"removeSubscriptions",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async unsendSquareMessage(squareChatMid, messageId) {
		return await this.request(
			[[11, 2, squareChatMid], [11, 3, messageId]],
			"unsendMessage",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async createSquareChat(
		squareChatMid,
		name,
		chatImageObsHash,
		squareChatType = 1,
		maxMemberCount = 5000,
		ableToSearchMessage = 1,
		squareMemberMids = [],
	) {
		/*
  - SquareChatType:
    OPEN(1),
    SECRET(2),
    ONE_ON_ONE(3),
    SQUARE_DEFAULT(4);
  - ableToSearchMessage:
    NONE(0),
    OFF(1),
    ON(2);
  */
		return await this.request(
			[
				[8, 1, 0],
				[
					12,
					2,
					[
						[11, 1, squareChatMid],
						[8, 3, squareChatType],
						[11, 4, name],
						[11, 5, chatImageObsHash],
						[8, 7, maxMemberCount],
						[8, 11, ableToSearchMessage],
					],
				],
				[15, 3, [11, squareMemberMids]],
			],
			"createSquareChat",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async getSquareChatMembers(
		squareChatMid,
		continuationToken = undefined,
		limit = 200,
	) {
		const req = [[11, 1, squareChatMid], [8, 3, limit]];
		if (continuationToken) {
			req.push([11, 2, continuationToken]);
		}
		return await this.request(
			req,
			"getSquareChatMembers",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async getSquareFeatureSet(squareMid) {
		return await this.request(
			[
				[11, 2, squareMid],
			],
			"getSquareFeatureSet",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async getSquareInvitationTicketUrl(mid) {
		return await this.request(
			[
				[11, 2, mid],
			],
			"getInvitationTicketUrl",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async updateSquareChatMember(
		squareMemberMid,
		squareChatMid,
		notificationForMessage = true,
		notificationForNewMember = true,
		updatedAttrs = [6],
	) {
		/*
  - SquareChatMemberAttribute:
    MEMBERSHIP_STATE(4),
    NOTIFICATION_MESSAGE(6),
    NOTIFICATION_NEW_MEMBER(7);
  */
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
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async updateSquareMember(
		updatedAttrs = [],
		updatedPreferenceAttrs = [],
		squareMemberMid,
		squareMid,
		revision,
		displayName,
		membershipState,
		role,
	) {
		/*
  SquareMemberAttribute:
    DISPLAY_NAME(1),
    PROFILE_IMAGE(2),
    ABLE_TO_RECEIVE_MESSAGE(3),
    MEMBERSHIP_STATE(5),
    ROLE(6),
    PREFERENCE(7);
  SquareMembershipState:
    JOIN_REQUESTED(1),
    JOINED(2),
    REJECTED(3),
    LEFT(4),
    KICK_OUT(5),
    BANNED(6),
    DELETED(7);
  */
		const squareMember = [[11, 1, squareMemberMid], [11, 2, squareMid]];
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
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async kickOutSquareMember(sid, pid) {
		const UPDATE_PREF_ATTRS = [];
		const UPDATE_ATTRS = [5];
		const MEMBERSHIP_STATE = 5;
		const getSquareMemberResp = this.getSquareMember(pid);
		const squareMember = getSquareMemberResp[1];
		const squareMemberRevision = squareMember[9];
		return await this.updateSquareMember(
			UPDATE_ATTRS,
			UPDATE_PREF_ATTRS,
			pid,
			sid,
			squareMemberRevision,
			undefined,
			MEMBERSHIP_STATE,
		);
	}

	async checkSquareJoinCode(squareMid, code) {
		return await this.request(
			[
				[11, 2, squareMid],
				[11, 3, code],
			],
			"checkJoinCode",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async createSquareChatAnnouncement(
		squareChatMid,
		messageId,
		text,
		senderSquareMemberMid,
		createdAt,
		announcementType = 0,
	) {
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
										[11, 1, messageId],
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
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async getSquareMember(squareMemberMid) {
		return await this.request(
			[
				[11, 2, squareMemberMid],
			],
			"getSquareMember",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async searchSquareChatMembers(
		squareChatMid,
		displayName = "",
		continuationToken,
		limit = 20,
	) {
		const req = [
			[11, 1, squareChatMid],
			[
				12,
				2,
				[
					[11, 1, displayName],
				],
			],
			[8, 4, limit],
			[11, 3, continuationToken],
		];
		return await this.request(
			[[12, 1, req]],
			"searchSquareChatMembers",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async getSquareEmid(squareMid) {
		return await this.request(
			[[11, 1, squareMid]],
			"getSquareEmid",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async getSquareMembersBySquare(squareMid, squareMemberMids = []) {
		return await this.request(
			[
				[11, 2, squareMid],
				[14, 3, [11, squareMemberMids]],
			],
			"getSquareMembersBySquare",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async manualRepair(syncToken, limit = 100, continuationToken) {
		return await this.request(
			[
				[11, 1, syncToken],
				[8, 2, limit],
				[11, 3, continuationToken],
			],
			"manualRepair",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async leaveSquare(squareMid) {
		return await this.request(
			[
				[11, 2, squareMid],
			],
			"leaveSquare",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	async reportSquare(squareMid, reportType, otherReason) {
		/*
  ReportType {
  ADVERTISING = 1;
  GENDER_HARASSMENT = 2;
  HARASSMENT = 3;
  OTHER = 4;
  }
  */
		return await this.parse_request(
			{
				squareMid,
				reportType,
				otherReason,
			},
			"reportSquare",
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}
	async sendSquareRequestByName(METHOD_NAME, params) {
		return await this.request(
			params,
			METHOD_NAME,
			this.SquareService_P_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}
	async getSyncToken() {
		return (await Line.manualRepair(null, 1)).continuationToken;
	}
	async squareEvent(handler, syncToken, i, remove = {}) {
		if (!syncToken) {
			syncToken = await this.getSyncToken();
		}
		const res = await this.fetchMyEvents(syncToken);
		const _syncToken = res.syncToken;
		if (syncToken) {
			res.events.forEach((e) => {
				handler(e, this);
			});
		}
		let interval = 1000;
		if (!res.events.length) {
			interval = 2000;
		}
		if (!remove.remove) {
			setTimeout(() => {
				this.squareEvent(handler, _syncToken, i, remove);
			}, i ? i : interval);
		}
		return remove;
	}
	getSquareEventTarget() {
		if (this.squareEventTarget && (!this.squareEventTarget.remove.remove)) {
			return this.squareEventTarget;
		}
		const squareEventTarget = new EventTarget();
		this.squareEventTarget = squareEventTarget;
		this.parser.def.SquareEventPayload.forEach((e) => {
			let name = e.name.replace("notified", "")
				.replace("notification", "");
			name = name[0].toLowerCase() + name.substring(1);
			squareEventTarget["on" + name] = null;
		});
		squareEventTarget.remove = { remove: false };
		this.squareEvent(
			(event) => {
				let name = Object.keys(event.payload)[0].toString().replace(
					"notified",
					"",
				)
					.replace("notification", "");
				name = name[0].toLowerCase() + name.substring(1);
				const data = event.payload[Object.keys(event.payload)[0]];
				const squareEvent = new Event(name);
				objectPlus(squareEvent, data);
				if (typeof squareEventTarget["on" + name] === "function") {
					squareEventTarget["on" + name](squareEvent);
				}
				squareEventTarget.dispatchEvent(squareEvent);
			},
			null,
			null,
			squareEventTarget.remove,
		);
		return this.squareEventTarget;
	}
	async squareChatEvent(handler, mid, syncToken, i, remove = {}) {
		if (remove.remove) return;
		const res = await this.fetchSquareChatEvents(mid, syncToken);
		if (remove.remove) return;
		const _syncToken = res.syncToken;
		for (let i = 0; i < res.events.length; i++) {
			const event = res.events[i];
			if (remove.remove) return;
			await handler(event, this, mid);
		}
		let interval = 1000;
		if (!res.events.length) {
			interval = 2000;
		}
		if (!remove.remove) {
			setTimeout(() => {
				this.squareChatEvent(handler, mid, _syncToken, i, remove);
			}, i ? i : interval);
		}
		return remove;
	}
	squareChatEventTargets = {};
	getSquareChatEventTarget(mid) {
		if (this.squareChatEventTargets[mid]) {
			return this.squareChatEventTargets[mid];
		}
		const squareEventTarget = new EventTarget();
		this.squareChatEventTargets[mid] = squareEventTarget;
		squareEventTarget.remove = { remove: false };
		this.parser.def.SquareEventPayload.forEach((e) => {
			let name = e.name.replace("notified", "")
				.replace("notification", "");
			name = name[0].toLowerCase() + name.substring(1);
			squareEventTarget["on" + name] = null;
		});
		this.squareChatEvent(
			(event) => {
				let name = Object.keys(event.payload)[0].toString().replace(
					"notified",
					"",
				)
					.replace("notification", "");
				name = name[0].toLowerCase() + name.substring(1);
				const data = event.payload[Object.keys(event.payload)[0]];
				const squareEvent = new Event(name);
				objectPlus(squareEvent, data);
				if (typeof squareEventTarget["on" + name] === "function") {
					squareEventTarget["on" + name](squareEvent);
				}
				squareEventTarget.dispatchEvent(squareEvent);
				if (name == "receiveMessage" || name == "sendMessage") {
					const squareEventM = new Event("message");
					objectPlus(squareEventM, data);
					if (typeof squareEventTarget["onmessage"] === "function") {
						squareEventTarget["onmessage"](squareEventM);
					}
				}
			},
			mid,
			null,
			null,
			squareEventTarget.remove,
		);
		return this.squareChatEventTargets[mid];
	}
}
class LINEServise {
	LINEService_API_PATH = "/S4";
	LINEService_P_TYPE = 4;
	async getProfile() {
		const profile = await this.request(
			[],
			"getProfile",
			this.LINEService_P_TYPE,
			"Profile",
			this.LINEService_API_PATH,
		);
		this.profile = profile;
		return profile;
	}
}
class LiffServise {
	LiffService_API_PATH = "/LIFF1";
	LiffService_P_TYPE = 4;
	async issueLiffView(
		chatMid,
		liffId = "1562242036-RW04okm",
		lang = "ja_JP",
	) {
		let context = [12, 1, []];
		let chatType;
		if (chatMid) {
			chat = [11, 1, chatMid];
			if (chatMid[0] in ["u", "c", "r"]) {
				chatType = 2;
			} else {
				chatType = 3;
			}
			context = [12, chatType, [chat]];
		}
		return await this.request(
			[
				[11, 1, liffId],
				[12, 2, [
					context,
				]],
				[11, 3, lang],
			],
			"issueLiffView",
			this.LiffService_P_TYPE,
			true,
			this.LiffService_API_PATH,
		);
	}
}
class ChannelService {
	ChannelService_API_PATH = "/CH3";
	ChannelService_P_TYPE = 3;
	Channels = {};
	async approveChannelAndIssueChannelToken(channelId = "1341209850") {
		const res = await this.direct_request(
			[[11, 1, channelId]],
			"approveChannelAndIssueChannelToken",
			this.ChannelService_P_TYPE,
			true,
			this.ChannelService_API_PATH,
		);
		this.Channels[channelId] = res;
		return res;
	}
	async getChannelToken(channelId, refresh = false) {
		if (this.Channels[channelId] && (!refresh)) {
			return this.Channels[channelId][5];
		}
		return (await this.approveChannelAndIssueChannelToken(channelId))[5];
	}
}
class LineMethod {
	async voom2mid(postId) {
		const postf = await this.proxyFetchx(
			"https://gw.line.naver.jp/mh/api/v57/post/get.json?postId=" +
				postId +
				"&sourceType=TALKROOM",
			{
				method: "GET",
				headers: {
					"x-line-bdbtemplateversion": "v1",
					"x-lsr": "JP",
					"user-agent": this.thrift.config.ua,
					"x-line-channeltoken": await this.getChannelToken(
						"1341209850",
					),
					"accept-encoding": "gzip",
					"x-line-global-config":
						"discover.enable=true; follow.enable=true; reboot.phase=scenario",
					"x-line-mid": this.profile.mid,
					"content-type": "application/json; charset=UTF-8",
					"x-line-application": this.thrift.config.appName,
					"x-lal": "ja_JP",
					"x-lpv": "1",
				},
			},
		);
		const info = await postf.json();
		const resp = {};
		if (info.message == "success") {
			resp.postUser = {
				name: info.result.feed.post.userInfo.nickname,
				mid: info.result.feed.post.userInfo.mid,
			};
			if (info.result.feed.post.comments) {
				resp.commentUsers = [];
				for (
					let i = 0;
					i < info.result.feed.post.comments.length;
					i++
				) {
					resp.commentUsers[i] = {
						name: info.result.feed.post.comments[i].userInfo.nickname,
						mid: info.result.feed.post.comments[i].userInfo.mid,
					};
				}
			}
			if (info.result.feed.post.likes) {
				resp.likeUsers = [];
				for (let i = 0; i < info.result.feed.post.likes.length; i++) {
					resp.likeUsers[i] = {
						name: info.result.feed.post.likes[i].userInfo.nickname,
						mid: info.result.feed.post.likes[i].userInfo.mid,
					};
				}
			}
			return resp;
		}
		throw new Error(info.message);
	}
}

function objectPlus(baseObj, object) {
	for (const key in object) {
		if (Object.hasOwnProperty.call(object, key)) {
			baseObj[key] = object[key];
		}
	}
}

class LineClient extends Classes(
	LineMethod,
	ChannelService,
	SquareServise,
	LiffServise,
	LINEServise,
) {
	constructor() {
		var target;
		if (opener) {
			target = opener;
		} else if (parent) {
			target = parent;
		}
		super();
		if (target) {
			this.thrift = new LineThriftPost(target);
		} else {
			throw new Error("No parentWindow");
		}
		this.parser = new ThriftRenameParser();
	}
	async init() {
		this.parser.def = await fetch(
			"https://line-selfbot--dev.deno.dev/res/thrift.json",
		).then((r) => r.json());
	}
	async request(
		CHRdata,
		methodName,
		protocol_type = 3,
		parse = true,
		path = "/S3",
		headers = {},
	) {
		const res = await this.thrift.postRequestAndGetResponse(
			[
				[
					12,
					1,
					CHRdata,
				],
			],
			methodName,
			protocol_type,
			path,
			headers,
		);
		if (res.e) {
			throw new Error(JSON.stringify(res.e, null, 2), { cause: res.e });
		}
		if (this.parser && (parse === true)) {
			this.parser.rename_data(res);
		} else if (this.parser && parse) {
			return this.parser.rename_thrift(parse, res.value);
		}
		return res.value;
	}
	async direct_request(
		CHRdata,
		methodName,
		protocol_type = 3,
		parse = true,
		path = "/S3",
		headers = {},
	) {
		const res = await this.thrift.postRequestAndGetResponse(
			CHRdata,
			methodName,
			protocol_type,
			path,
			headers,
		);
		if (res.e) {
			throw new Error(JSON.stringify(res.e, null, 2), { cause: res.e });
		}
		if (this.parser && (parse === true)) {
			this.parser.rename_data(res);
		} else if (this.parser && parse) {
			return this.parser.rename_thrift(parse, res.value);
		}
		return res.value;
	}
	async parse_request(
		data,
		methodName,
		protocol_type = 3,
		parse = true,
		path = "/S3",
		headers = {},
		parseName,
	) {
		if (!parseName) {
			parseName = methodName.substr(0, 1).toUpperCase() +
				methodName.substr(1) + "Request";
		}
		const CHRdata = this.parser.parse_data(parseName, data);
		return this.request(
			CHRdata,
			methodName,
			protocol_type,
			parse,
			path,
			headers,
		);
	}
	sleep() {
		this.thrift.closeSocket();
	}
	wake() {
		this.thrift.reOpenSocket();
	}
	timeout(f, t, e) {
		return new Promise((resolve, reject) => {
			let time = true;
			f().then((res) => {
				resolve(res);
				time = false;
			});
			setTimeout(() => {
				if (time) {
					reject("Time Out");
					e();
				}
			}, t);
		});
	}
	toJSON() {
		return {
			device: this.deviceName,
			authToken: this.authToken,
			profile: this.profile,
		};
	}
	toString() {
		return "LineClient(" + (JSON.stringify({
			device: this.deviceName,
			authToken: this.authToken,
		})) + ")";
	}
}
//export {LineSquareClient,LineTCompactSocket}
function Classes(...bases) {
	class Bases {
		constructor() {
			bases.forEach((base) => Object.assign(this, new base()));
		}
	}
	bases.forEach((base) => {
		Object.getOwnPropertyNames(base.prototype)
			.filter((prop) => prop != "constructor")
			.forEach((prop) => Bases.prototype[prop] = base.prototype[prop]);
	});
	return Bases;
}
