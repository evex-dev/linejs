import * as LINETypes from "@evex/linejs-types";
import { type NestedArray } from "../mod.ts";
function map(
	call: ((v: any) => NestedArray) | ((v: any) => number),
	value: any,
): Record<keyof any, NestedArray | number> {
	const tMap: Record<keyof any, NestedArray | number> = {};
	for (const key in value) {
		const e = value[key];
		tMap[key] = call(e);
	}
	return tMap;
}
export type PartialDeep<T> = {
	[P in keyof T]?: T[P] extends Array<infer U> ? Array<PartialDeep<U>>
		: T[P] extends ReadonlyArray<infer UU> ? ReadonlyArray<PartialDeep<UU>>
		: PartialDeep<T[P]>;
};

export function AcceptChatInvitationByTicketRequest(
	param?:
		| PartialDeep<LINETypes.AcceptChatInvitationByTicketRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.chatMid],
		[11, 3, param.ticketId],
	];
}
export function AcceptChatInvitationRequest(
	param?: PartialDeep<LINETypes.AcceptChatInvitationRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.chatMid],
	];
}
export function AcceptSpeakersRequest(
	param?: PartialDeep<LINETypes.AcceptSpeakersRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[14, 3, [11, param.targetMids]],
	];
}
export function AcceptToChangeRoleRequest(
	param?: PartialDeep<LINETypes.AcceptToChangeRoleRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[11, 3, param.inviteRequestId],
	];
}
export function AcceptToListenRequest(
	param?: PartialDeep<LINETypes.AcceptToListenRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[11, 3, param.inviteRequestId],
	];
}
export function AcceptToSpeakRequest(
	param?: PartialDeep<LINETypes.AcceptToSpeakRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[11, 3, param.inviteRequestId],
	];
}
export function LiveTalkType(
	param: LINETypes.LiveTalkType | undefined,
): LINETypes.LiveTalkType & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.LiveTalkType[param]
		: param;
}
export function LiveTalkSpeakerSetting(
	param: LINETypes.LiveTalkSpeakerSetting | undefined,
): LINETypes.LiveTalkSpeakerSetting & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.LiveTalkSpeakerSetting[param]
		: param;
}
export function AcquireLiveTalkRequest(
	param?: PartialDeep<LINETypes.AcquireLiveTalkRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.title],
		[8, 3, LiveTalkType(param.type)],
		[8, 4, LiveTalkSpeakerSetting(param.speakerSetting)],
	];
}
export function CancelToSpeakRequest(
	param?: PartialDeep<LINETypes.CancelToSpeakRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
	];
}
export function FetchLiveTalkEventsRequest(
	param?: PartialDeep<LINETypes.FetchLiveTalkEventsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[11, 3, param.syncToken],
		[8, 4, param.limit],
	];
}
export function FindLiveTalkByInvitationTicketRequest(
	param?:
		| PartialDeep<LINETypes.FindLiveTalkByInvitationTicketRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.invitationTicket],
	];
}
export function ForceEndLiveTalkRequest(
	param?: PartialDeep<LINETypes.ForceEndLiveTalkRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
	];
}
export function GetLiveTalkInfoForNonMemberRequest(
	param?: PartialDeep<LINETypes.GetLiveTalkInfoForNonMemberRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[15, 3, [11, param.speakers]],
	];
}
export function GetLiveTalkInvitationUrlRequest(
	param?: PartialDeep<LINETypes.GetLiveTalkInvitationUrlRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
	];
}
export function GetLiveTalkSpeakersForNonMemberRequest(
	param?:
		| PartialDeep<LINETypes.GetLiveTalkSpeakersForNonMemberRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[15, 3, [11, param.speakers]],
	];
}
export function GetSquareInfoByChatMidRequest(
	param?: PartialDeep<LINETypes.GetSquareInfoByChatMidRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
	];
}
export function LiveTalkRole(
	param: LINETypes.LiveTalkRole | undefined,
): LINETypes.LiveTalkRole & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.LiveTalkRole[param]
		: param;
}
export function InviteToChangeRoleRequest(
	param?: PartialDeep<LINETypes.InviteToChangeRoleRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[11, 3, param.targetMid],
		[8, 4, LiveTalkRole(param.targetRole)],
	];
}
export function InviteToListenRequest(
	param?: PartialDeep<LINETypes.InviteToListenRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[11, 3, param.targetMid],
	];
}
export function InviteToLiveTalkRequest(
	param?: PartialDeep<LINETypes.InviteToLiveTalkRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[15, 3, [11, param.invitees]],
	];
}
export function InviteToSpeakRequest(
	param?: PartialDeep<LINETypes.InviteToSpeakRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[11, 3, param.targetMid],
	];
}
export function BooleanState(
	param: LINETypes.BooleanState | undefined,
): LINETypes.BooleanState & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.BooleanState[param]
		: param;
}
export function JoinLiveTalkRequest(
	param?: PartialDeep<LINETypes.JoinLiveTalkRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[2, 3, param.wantToSpeak],
		[8, 4, BooleanState(param.claimAdult)],
	];
}
export function LiveTalkParticipant(
	param?: PartialDeep<LINETypes.LiveTalkParticipant> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.mid],
	];
}
export function AllNonMemberLiveTalkParticipants(
	param?: PartialDeep<LINETypes.AllNonMemberLiveTalkParticipants> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LiveTalkKickOutTarget(
	param?: PartialDeep<LINETypes.LiveTalkKickOutTarget> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, LiveTalkParticipant(param.liveTalkParticipant)],
		[
			12,
			2,
			AllNonMemberLiveTalkParticipants(param.allNonMemberLiveTalkParticipants),
		],
	];
}
export function KickOutLiveTalkParticipantsRequest(
	param?: PartialDeep<LINETypes.KickOutLiveTalkParticipantsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[12, 3, LiveTalkKickOutTarget(param.target)],
	];
}
export function RejectSpeakersRequest(
	param?: PartialDeep<LINETypes.RejectSpeakersRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[14, 3, [11, param.targetMids]],
	];
}
export function RejectToSpeakRequest(
	param?: PartialDeep<LINETypes.RejectToSpeakRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[11, 3, param.inviteRequestId],
	];
}
export function RemoveLiveTalkSubscriptionRequest(
	param?: PartialDeep<LINETypes.RemoveLiveTalkSubscriptionRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
	];
}
export function LiveTalkReportType(
	param: LINETypes.LiveTalkReportType | undefined,
): LINETypes.LiveTalkReportType & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.LiveTalkReportType[param]
		: param;
}
export function ReportLiveTalkRequest(
	param?: PartialDeep<LINETypes.ReportLiveTalkRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[8, 3, LiveTalkReportType(param.reportType)],
	];
}
export function ReportLiveTalkSpeakerRequest(
	param?: PartialDeep<LINETypes.ReportLiveTalkSpeakerRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[11, 3, param.speakerMemberMid],
		[8, 4, LiveTalkReportType(param.reportType)],
	];
}
export function RequestToListenRequest(
	param?: PartialDeep<LINETypes.RequestToListenRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
	];
}
export function RequestToSpeakRequest(
	param?: PartialDeep<LINETypes.RequestToSpeakRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
	];
}
export function LiveTalkAttribute(
	param: LINETypes.LiveTalkAttribute | undefined,
): LINETypes.LiveTalkAttribute & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.LiveTalkAttribute[param]
		: param;
}
export function LiveTalk(
	param?: PartialDeep<LINETypes.LiveTalk> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.sessionId],
		[11, 3, param.title],
		[8, 4, LiveTalkType(param.type)],
		[8, 5, LiveTalkSpeakerSetting(param.speakerSetting)],
		[2, 6, param.allowRequestToSpeak],
		[11, 7, param.hostMemberMid],
		[11, 8, param.announcement],
		[8, 9, param.participantCount],
		[10, 10, param.revision],
		[10, 11, param.startedAt],
	];
}
export function UpdateLiveTalkAttrsRequest(
	param?: PartialDeep<LINETypes.UpdateLiveTalkAttrsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 1, [
			8,
			param.updatedAttrs && param.updatedAttrs.map((e) => LiveTalkAttribute(e)),
		]],
		[12, 2, LiveTalk(param.liveTalk)],
	];
}
export function Pb1_D4(
	param: LINETypes.Pb1_D4 | undefined,
): LINETypes.Pb1_D4 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_D4[param] : param;
}
export function Pb1_EnumC13222w4(
	param: LINETypes.Pb1_EnumC13222w4 | undefined,
): LINETypes.Pb1_EnumC13222w4 & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.Pb1_EnumC13222w4[param]
		: param;
}
export function Pb1_EnumC13237x5(
	param: LINETypes.Pb1_EnumC13237x5 | undefined,
): LINETypes.Pb1_EnumC13237x5 & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.Pb1_EnumC13237x5[param]
		: param;
}
export function AcquireOACallRouteRequest(
	param?: PartialDeep<LINETypes.AcquireOACallRouteRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.searchId],
		[13, 2, [11, 11, param.fromEnvInfo]],
		[11, 3, param.otp],
	];
}
export function PaidCallType(
	param: LINETypes.PaidCallType | undefined,
): LINETypes.PaidCallType & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.PaidCallType[param]
		: param;
}
export function og_EnumC32661b(
	param: LINETypes.og_EnumC32661b | undefined,
): LINETypes.og_EnumC32661b & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.og_EnumC32661b[param]
		: param;
}
export function ActivateSubscriptionRequest(
	param?: PartialDeep<LINETypes.ActivateSubscriptionRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.uniqueKey],
		[8, 2, og_EnumC32661b(param.activeStatus)],
	];
}
export function AdTypeOptOutClickEventRequest(
	param?: PartialDeep<LINETypes.AdTypeOptOutClickEventRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.moduleAdId],
		[11, 2, param.targetId],
	];
}
export function AddMetaInvalid(
	param?: PartialDeep<LINETypes.AddMetaInvalid> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.hint],
	];
}
export function AddMetaByPhone(
	param?: PartialDeep<LINETypes.AddMetaByPhone> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.phone],
	];
}
export function AddMetaBySearchId(
	param?: PartialDeep<LINETypes.AddMetaBySearchId> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.searchId],
	];
}
export function AddMetaByUserTicket(
	param?: PartialDeep<LINETypes.AddMetaByUserTicket> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.ticket],
	];
}
export function AddMetaGroupMemberList(
	param?: PartialDeep<LINETypes.AddMetaGroupMemberList> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
	];
}
export function LN0_P(
	param?: PartialDeep<LINETypes.LN0_P> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_L(
	param?: PartialDeep<LINETypes.LN0_L> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_G(
	param?: PartialDeep<LINETypes.LN0_G> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11282h(
	param?: PartialDeep<LINETypes.LN0_C11282h> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11300q(
	param?: PartialDeep<LINETypes.LN0_C11300q> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11307u(
	param?: PartialDeep<LINETypes.LN0_C11307u> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function AddMetaShareContact(
	param?: PartialDeep<LINETypes.AddMetaShareContact> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.messageId],
		[11, 2, param.chatMid],
		[11, 3, param.senderMid],
	];
}
export function AddMetaStrangerMessage(
	param?: PartialDeep<LINETypes.AddMetaStrangerMessage> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.messageId],
		[11, 2, param.chatMid],
	];
}
export function AddMetaStrangerCall(
	param?: PartialDeep<LINETypes.AddMetaStrangerCall> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.messageId],
	];
}
export function AddMetaMentionInChat(
	param?: PartialDeep<LINETypes.AddMetaMentionInChat> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
		[11, 2, param.messageId],
	];
}
export function LN0_O(
	param?: PartialDeep<LINETypes.LN0_O> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_Q(
	param?: PartialDeep<LINETypes.LN0_Q> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11313x(
	param?: PartialDeep<LINETypes.LN0_C11313x> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_A(
	param?: PartialDeep<LINETypes.LN0_A> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function AddMetaGroupVideoCall(
	param?: PartialDeep<LINETypes.AddMetaGroupVideoCall> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
	];
}
export function LN0_r(
	param?: PartialDeep<LINETypes.LN0_r> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11315y(
	param?: PartialDeep<LINETypes.LN0_C11315y> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11316z(
	param?: PartialDeep<LINETypes.LN0_C11316z> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_B(
	param?: PartialDeep<LINETypes.LN0_B> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11280g(
	param?: PartialDeep<LINETypes.LN0_C11280g> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_T(
	param?: PartialDeep<LINETypes.LN0_T> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11276e(
	param?: PartialDeep<LINETypes.LN0_C11276e> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_S(
	param?: PartialDeep<LINETypes.LN0_S> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function AddMetaProfileUndefined(
	param?: PartialDeep<LINETypes.AddMetaProfileUndefined> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.hint],
	];
}
export function LN0_F(
	param?: PartialDeep<LINETypes.LN0_F> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11294n(
	param?: PartialDeep<LINETypes.LN0_C11294n> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11290l(
	param?: PartialDeep<LINETypes.LN0_C11290l> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11309v(
	param?: PartialDeep<LINETypes.LN0_C11309v> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11292m(
	param?: PartialDeep<LINETypes.LN0_C11292m> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function AddMetaChatNote(
	param?: PartialDeep<LINETypes.AddMetaChatNote> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
	];
}
export function AddMetaChatNoteMenu(
	param?: PartialDeep<LINETypes.AddMetaChatNoteMenu> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
	];
}
export function LN0_U(
	param?: PartialDeep<LINETypes.LN0_U> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_E(
	param?: PartialDeep<LINETypes.LN0_E> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function AddMetaSearchIdInUnifiedSearch(
	param?: PartialDeep<LINETypes.AddMetaSearchIdInUnifiedSearch> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.searchId],
	];
}
export function LN0_D(
	param?: PartialDeep<LINETypes.LN0_D> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11278f(
	param?: PartialDeep<LINETypes.LN0_C11278f> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_H(
	param?: PartialDeep<LINETypes.LN0_H> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LN0_C11274d(
	param?: PartialDeep<LINETypes.LN0_C11274d> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AddMetaInvalid(param.invalid)],
		[12, 2, AddMetaByPhone(param.byPhone)],
		[12, 3, AddMetaBySearchId(param.bySearchId)],
		[12, 4, AddMetaByUserTicket(param.byUserTicket)],
		[12, 5, AddMetaGroupMemberList(param.groupMemberList)],
		[12, 6, LN0_P(param.timelineCPF)],
		[12, 7, LN0_L(param.smartChannelCPF)],
		[12, 8, LN0_G(param.openchatCPF)],
		[12, 9, LN0_C11282h(param.beaconBanner)],
		[12, 10, LN0_C11300q(param.friendRecommendation)],
		[12, 11, LN0_C11307u(param.homeRecommendation)],
		[12, 12, AddMetaShareContact(param.shareContact)],
		[12, 13, AddMetaStrangerMessage(param.strangerMessage)],
		[12, 14, AddMetaStrangerCall(param.strangerCall)],
		[12, 15, AddMetaMentionInChat(param.mentionInChat)],
		[12, 16, LN0_O(param.timeline)],
		[12, 17, LN0_Q(param.unifiedSearch)],
		[12, 18, LN0_C11313x(param.lineLab)],
		[12, 19, LN0_A(param.lineToCall)],
		[12, 20, AddMetaGroupVideoCall(param.groupVideo)],
		[12, 21, LN0_r(param.friendRequest)],
		[12, 22, LN0_C11315y(param.liveViewer)],
		[12, 23, LN0_C11316z(param.lineThings)],
		[12, 24, LN0_B(param.mediaCapture)],
		[12, 25, LN0_C11280g(param.avatarOASetting)],
		[12, 26, LN0_T(param.urlScheme)],
		[12, 27, LN0_C11276e(param.addressBook)],
		[12, 28, LN0_S(param.unifiedSearchOATab)],
		[12, 29, AddMetaProfileUndefined(param.profileUndefined)],
		[12, 30, LN0_F(param.DEPRECATED_oaChatHeader)],
		[12, 31, LN0_C11294n(param.chatMenu)],
		[12, 32, LN0_C11290l(param.chatHeader)],
		[12, 33, LN0_C11309v(param.homeTabCPF)],
		[12, 34, LN0_C11292m(param.chatList)],
		[12, 35, AddMetaChatNote(param.chatNote)],
		[12, 36, AddMetaChatNoteMenu(param.chatNoteMenu)],
		[12, 37, LN0_U(param.walletTabCPF)],
		[12, 38, LN0_E(param.oaCall)],
		[12, 39, AddMetaSearchIdInUnifiedSearch(param.searchIdInUnifiedSearch)],
		[12, 40, LN0_D(param.newsDigestADCPF)],
		[12, 41, LN0_C11278f(param.albumCPF)],
		[12, 42, LN0_H(param.premiumAgreement)],
	];
}
export function AddFriendTracking(
	param?: PartialDeep<LINETypes.AddFriendTracking> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.reference],
		[12, 2, LN0_C11274d(param.trackingMeta)],
	];
}
export function AddFriendByMidRequest(
	param?: PartialDeep<LINETypes.AddFriendByMidRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.userMid],
		[12, 3, AddFriendTracking(param.tracking)],
	];
}
export function Ob1_O0(
	param: LINETypes.Ob1_O0 | undefined,
): LINETypes.Ob1_O0 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Ob1_O0[param] : param;
}
export function AddItemToCollectionRequest(
	param?: PartialDeep<LINETypes.AddItemToCollectionRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.collectionId],
		[8, 2, Ob1_O0(param.productType)],
		[11, 3, param.productId],
		[11, 4, param.itemId],
	];
}
export function NZ0_C12155c(
	param?: PartialDeep<LINETypes.NZ0_C12155c> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function AddProductToSubscriptionSlotRequest(
	param?:
		| PartialDeep<LINETypes.AddProductToSubscriptionSlotRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Ob1_O0(param.productType)],
		[11, 2, param.productId],
		[11, 3, param.oldProductId],
	];
}
export function AddThemeToSubscriptionSlotRequest(
	param?: PartialDeep<LINETypes.AddThemeToSubscriptionSlotRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.productId],
		[11, 2, param.currentlyAppliedProductId],
	];
}
export function Pb1_A4(
	param?: PartialDeep<LINETypes.Pb1_A4> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.mid],
		[11, 2, param.eMid],
	];
}
export function AddToFollowBlacklistRequest(
	param?: PartialDeep<LINETypes.AddToFollowBlacklistRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Pb1_A4(param.followMid)],
	];
}
export function TermsAgreement(
	param?: PartialDeep<LINETypes.TermsAgreement> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function AgreeToTermsRequest(
	param?: PartialDeep<LINETypes.AgreeToTermsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		,
		[12, 2, TermsAgreement(param.termsAgreement)],
	];
}
export function ApproveSquareMembersRequest(
	param?: PartialDeep<LINETypes.ApproveSquareMembersRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
		[15, 3, [11, param.requestedMemberMids]],
	];
}
export function CheckJoinCodeRequest(
	param?: PartialDeep<LINETypes.CheckJoinCodeRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
		[11, 3, param.joinCode],
	];
}
export function TextMessageAnnouncementContents(
	param?: PartialDeep<LINETypes.TextMessageAnnouncementContents> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.messageId],
		[11, 2, param.text],
		[11, 3, param.senderSquareMemberMid],
		[10, 4, param.createdAt],
	];
}
export function SquareChatAnnouncementContents(
	param?: PartialDeep<LINETypes.SquareChatAnnouncementContents> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[
			12,
			1,
			TextMessageAnnouncementContents(param.textMessageAnnouncementContents),
		],
	];
}
export function SquareChatAnnouncement(
	param?: PartialDeep<LINETypes.SquareChatAnnouncement> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 1, param.announcementSeq],
		[8, 2, param.type],
		[12, 3, SquareChatAnnouncementContents(param.contents)],
		[10, 4, param.createdAt],
		[11, 5, param.creator],
	];
}
export function CreateSquareChatAnnouncementRequest(
	param?:
		| PartialDeep<LINETypes.CreateSquareChatAnnouncementRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.squareChatMid],
		[12, 3, SquareChatAnnouncement(param.squareChatAnnouncement)],
	];
}
export function SquareChatType(
	param: LINETypes.SquareChatType | undefined,
): LINETypes.SquareChatType & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareChatType[param]
		: param;
}
export function SquareChatState(
	param: LINETypes.SquareChatState | undefined,
): LINETypes.SquareChatState & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareChatState[param]
		: param;
}
export function MessageVisibility(
	param?: PartialDeep<LINETypes.MessageVisibility> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[2, 1, param.showJoinMessage],
		[2, 2, param.showLeaveMessage],
		[2, 3, param.showKickoutMessage],
	];
}
export function SquareChat(
	param?: PartialDeep<LINETypes.SquareChat> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.squareMid],
		[8, 3, SquareChatType(param.type)],
		[11, 4, param.name],
		[11, 5, param.chatImageObsHash],
		[10, 6, param.squareChatRevision],
		[8, 7, param.maxMemberCount],
		[8, 8, SquareChatState(param.state)],
		[11, 9, param.invitationUrl],
		[12, 10, MessageVisibility(param.messageVisibility)],
		[8, 11, BooleanState(param.ableToSearchMessage)],
	];
}
export function CreateSquareChatRequest(
	param?: PartialDeep<LINETypes.CreateSquareChatRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[12, 2, SquareChat(param.squareChat)],
		[15, 3, [11, param.squareMemberMids]],
	];
}
export function SquareType(
	param: LINETypes.SquareType | undefined,
): LINETypes.SquareType & number | undefined {
	return typeof param === "string" ? LINETypes.enums.SquareType[param] : param;
}
export function SquareState(
	param: LINETypes.SquareState | undefined,
): LINETypes.SquareState & number | undefined {
	return typeof param === "string" ? LINETypes.enums.SquareState[param] : param;
}
export function SquareEmblem(
	param: LINETypes.SquareEmblem | undefined,
): LINETypes.SquareEmblem & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareEmblem[param]
		: param;
}
export function SquareJoinMethodType(
	param: LINETypes.SquareJoinMethodType | undefined,
): LINETypes.SquareJoinMethodType & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareJoinMethodType[param]
		: param;
}
export function ApprovalValue(
	param?: PartialDeep<LINETypes.ApprovalValue> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.message],
	];
}
export function CodeValue(
	param?: PartialDeep<LINETypes.CodeValue> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.code],
	];
}
export function SquareJoinMethodValue(
	param?: PartialDeep<LINETypes.SquareJoinMethodValue> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ApprovalValue(param.approvalValue)],
		[12, 2, CodeValue(param.codeValue)],
	];
}
export function SquareJoinMethod(
	param?: PartialDeep<LINETypes.SquareJoinMethod> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, SquareJoinMethodType(param.type)],
		[12, 2, SquareJoinMethodValue(param.value)],
	];
}
export function Square(
	param?: PartialDeep<LINETypes.Square> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.mid],
		[11, 2, param.name],
		[11, 3, param.welcomeMessage],
		[11, 4, param.profileImageObsHash],
		[11, 5, param.desc],
		[2, 6, param.searchable],
		[8, 7, SquareType(param.type)],
		[8, 8, param.categoryId],
		[11, 9, param.invitationURL],
		[10, 10, param.revision],
		[2, 11, param.ableToUseInvitationTicket],
		[8, 12, SquareState(param.state)],
		[15, 13, [8, param.emblems && param.emblems.map((e) => SquareEmblem(e))]],
		[12, 14, SquareJoinMethod(param.joinMethod)],
		[8, 15, BooleanState(param.adultOnly)],
		[15, 16, [11, param.svcTags]],
		[10, 17, param.createdAt],
	];
}
export function SquareMembershipState(
	param: LINETypes.SquareMembershipState | undefined,
): LINETypes.SquareMembershipState & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareMembershipState[param]
		: param;
}
export function SquareMemberRole(
	param: LINETypes.SquareMemberRole | undefined,
): LINETypes.SquareMemberRole & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareMemberRole[param]
		: param;
}
export function SquarePreference(
	param?: PartialDeep<LINETypes.SquarePreference> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 1, param.favoriteTimestamp],
		[2, 2, param.notiForNewJoinRequest],
	];
}
export function SquareMember(
	param?: PartialDeep<LINETypes.SquareMember> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareMemberMid],
		[11, 2, param.squareMid],
		[11, 3, param.displayName],
		[11, 4, param.profileImageObsHash],
		[2, 5, param.ableToReceiveMessage],
		[8, 7, SquareMembershipState(param.membershipState)],
		[8, 8, SquareMemberRole(param.role)],
		[10, 9, param.revision],
		[12, 10, SquarePreference(param.preference)],
		[11, 11, param.joinMessage],
		[10, 12, param.createdAt],
	];
}
export function CreateSquareRequest(
	param?: PartialDeep<LINETypes.CreateSquareRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[12, 2, Square(param.square)],
		[12, 3, SquareMember(param.creator)],
	];
}
export function DeleteSquareChatAnnouncementRequest(
	param?:
		| PartialDeep<LINETypes.DeleteSquareChatAnnouncementRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareChatMid],
		[10, 3, param.announcementSeq],
	];
}
export function DeleteSquareChatRequest(
	param?: PartialDeep<LINETypes.DeleteSquareChatRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareChatMid],
		[10, 3, param.revision],
	];
}
export function DeleteSquareRequest(
	param?: PartialDeep<LINETypes.DeleteSquareRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.mid],
		[10, 3, param.revision],
	];
}
export function DestroyMessageRequest(
	param?: PartialDeep<LINETypes.DestroyMessageRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareChatMid],
		[11, 4, param.messageId],
		[11, 5, param.threadMid],
	];
}
export function DestroyMessagesRequest(
	param?: PartialDeep<LINETypes.DestroyMessagesRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareChatMid],
		[14, 4, [11, param.messageIds]],
		[11, 5, param.threadMid],
	];
}
export function FetchMyEventsRequest(
	param?: PartialDeep<LINETypes.FetchMyEventsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 1, param.subscriptionId],
		[11, 2, param.syncToken],
		[8, 3, param.limit],
		[11, 4, param.continuationToken],
	];
}
export function FetchDirection(
	param: LINETypes.FetchDirection | undefined,
): LINETypes.FetchDirection & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.FetchDirection[param]
		: param;
}
export function FetchType(
	param: LINETypes.FetchType | undefined,
): LINETypes.FetchType & number | undefined {
	return typeof param === "string" ? LINETypes.enums.FetchType[param] : param;
}
export function FetchSquareChatEventsRequest(
	param?: PartialDeep<LINETypes.FetchSquareChatEventsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 1, param.subscriptionId],
		[11, 2, param.squareChatMid],
		[11, 3, param.syncToken],
		[8, 4, param.limit],
		[8, 5, FetchDirection(param.direction)],
		[8, 6, BooleanState(param.inclusive)],
		[11, 7, param.continuationToken],
		[8, 8, FetchType(param.fetchType)],
		[11, 9, param.threadMid],
	];
}
export function FindSquareByEmidRequest(
	param?: PartialDeep<LINETypes.FindSquareByEmidRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.emid],
	];
}
export function FindSquareByInvitationTicketRequest(
	param?:
		| PartialDeep<LINETypes.FindSquareByInvitationTicketRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.invitationTicket],
	];
}
export function FindSquareByInvitationTicketV2Request(
	param?:
		| PartialDeep<LINETypes.FindSquareByInvitationTicketV2Request>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.invitationTicket],
	];
}
export function AdScreen(
	param: LINETypes.AdScreen | undefined,
): LINETypes.AdScreen & number | undefined {
	return typeof param === "string" ? LINETypes.enums.AdScreen[param] : param;
}
export function GetGoogleAdOptionsRequest(
	param?: PartialDeep<LINETypes.GetGoogleAdOptionsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareMid],
		[11, 2, param.chatMid],
		[8, 3, AdScreen(param.adScreen)],
	];
}
export function GetInvitationTicketUrlRequest(
	param?: PartialDeep<LINETypes.GetInvitationTicketUrlRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.mid],
	];
}
export function GetJoinableSquareChatsRequest(
	param?: PartialDeep<LINETypes.GetJoinableSquareChatsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareMid],
		[11, 10, param.continuationToken],
		[8, 11, param.limit],
	];
}
export function GetJoinedSquareChatsRequest(
	param?: PartialDeep<LINETypes.GetJoinedSquareChatsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.continuationToken],
		[8, 3, param.limit],
	];
}
export function GetJoinedSquaresRequest(
	param?: PartialDeep<LINETypes.GetJoinedSquaresRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.continuationToken],
		[8, 3, param.limit],
	];
}
export function MessageReactionType(
	param: LINETypes.MessageReactionType | undefined,
): LINETypes.MessageReactionType & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.MessageReactionType[param]
		: param;
}
export function GetMessageReactionsRequest(
	param?: PartialDeep<LINETypes.GetMessageReactionsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.messageId],
		[8, 3, MessageReactionType(param.type)],
		[11, 4, param.continuationToken],
		[8, 5, param.limit],
		[11, 6, param.threadMid],
	];
}
export function GetNoteStatusRequest(
	param?: PartialDeep<LINETypes.GetNoteStatusRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
	];
}
export function GetPopularKeywordsRequest(
	param?: PartialDeep<LINETypes.GetPopularKeywordsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function GetSquareAuthoritiesRequest(
	param?: PartialDeep<LINETypes.GetSquareAuthoritiesRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 2, [11, param.squareMids]],
	];
}
export function GetSquareAuthorityRequest(
	param?: PartialDeep<LINETypes.GetSquareAuthorityRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareMid],
	];
}
export function GetSquareCategoriesRequest(
	param?: PartialDeep<LINETypes.GetSquareCategoriesRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function GetSquareChatAnnouncementsRequest(
	param?: PartialDeep<LINETypes.GetSquareChatAnnouncementsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareChatMid],
	];
}
export function GetSquareChatEmidRequest(
	param?: PartialDeep<LINETypes.GetSquareChatEmidRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
	];
}
export function GetSquareChatFeatureSetRequest(
	param?: PartialDeep<LINETypes.GetSquareChatFeatureSetRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareChatMid],
	];
}
export function GetSquareChatMemberRequest(
	param?: PartialDeep<LINETypes.GetSquareChatMemberRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMemberMid],
		[11, 3, param.squareChatMid],
	];
}
export function GetSquareChatMembersRequest(
	param?: PartialDeep<LINETypes.GetSquareChatMembersRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[11, 2, param.continuationToken],
		[8, 3, param.limit],
	];
}
export function GetSquareChatRequest(
	param?: PartialDeep<LINETypes.GetSquareChatRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
	];
}
export function GetSquareChatStatusRequest(
	param?: PartialDeep<LINETypes.GetSquareChatStatusRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareChatMid],
	];
}
export function GetSquareEmidRequest(
	param?: PartialDeep<LINETypes.GetSquareEmidRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareMid],
	];
}
export function GetSquareFeatureSetRequest(
	param?: PartialDeep<LINETypes.GetSquareFeatureSetRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
	];
}
export function GetSquareMemberRelationRequest(
	param?: PartialDeep<LINETypes.GetSquareMemberRelationRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
		[11, 3, param.targetSquareMemberMid],
	];
}
export function SquareMemberRelationState(
	param: LINETypes.SquareMemberRelationState | undefined,
): LINETypes.SquareMemberRelationState & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareMemberRelationState[param]
		: param;
}
export function GetSquareMemberRelationsRequest(
	param?: PartialDeep<LINETypes.GetSquareMemberRelationsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 2, SquareMemberRelationState(param.state)],
		[11, 3, param.continuationToken],
		[8, 4, param.limit],
	];
}
export function GetSquareMemberRequest(
	param?: PartialDeep<LINETypes.GetSquareMemberRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMemberMid],
	];
}
export function GetSquareMembersBySquareRequest(
	param?: PartialDeep<LINETypes.GetSquareMembersBySquareRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
		[14, 3, [11, param.squareMemberMids]],
	];
}
export function GetSquareMembersRequest(
	param?: PartialDeep<LINETypes.GetSquareMembersRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 2, [11, param.mids]],
	];
}
export function GetSquareRequest(
	param?: PartialDeep<LINETypes.GetSquareRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.mid],
	];
}
export function GetSquareStatusRequest(
	param?: PartialDeep<LINETypes.GetSquareStatusRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
	];
}
export function GetSquareThreadMidRequest(
	param?: PartialDeep<LINETypes.GetSquareThreadMidRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
		[11, 2, param.messageId],
	];
}
export function GetSquareThreadRequest(
	param?: PartialDeep<LINETypes.GetSquareThreadRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.threadMid],
		[2, 2, param.includeRootMessage],
	];
}
export function GetUserSettingsRequest(
	param?: PartialDeep<LINETypes.GetUserSettingsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function HideSquareMemberContentsRequest(
	param?: PartialDeep<LINETypes.HideSquareMemberContentsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareMemberMid],
	];
}
export function InviteIntoSquareChatRequest(
	param?: PartialDeep<LINETypes.InviteIntoSquareChatRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [11, param.inviteeMids]],
		[11, 2, param.squareChatMid],
	];
}
export function InviteToSquareRequest(
	param?: PartialDeep<LINETypes.InviteToSquareRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
		[15, 3, [11, param.invitees]],
		[11, 4, param.squareChatMid],
	];
}
export function JoinSquareChatRequest(
	param?: PartialDeep<LINETypes.JoinSquareChatRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
	];
}
export function JoinSquareRequest(
	param?: PartialDeep<LINETypes.JoinSquareRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
		[12, 3, SquareMember(param.member)],
		[11, 4, param.squareChatMid],
		[12, 5, SquareJoinMethodValue(param.joinValue)],
		[8, 6, BooleanState(param.claimAdult)],
	];
}
export function JoinSquareThreadRequest(
	param?: PartialDeep<LINETypes.JoinSquareThreadRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
		[11, 2, param.threadMid],
	];
}
export function LeaveSquareChatRequest(
	param?: PartialDeep<LINETypes.LeaveSquareChatRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareChatMid],
		[2, 3, param.sayGoodbye],
		[10, 4, param.squareChatMemberRevision],
	];
}
export function LeaveSquareRequest(
	param?: PartialDeep<LINETypes.LeaveSquareRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
	];
}
export function LeaveSquareThreadRequest(
	param?: PartialDeep<LINETypes.LeaveSquareThreadRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
		[11, 2, param.threadMid],
	];
}
export function ManualRepairRequest(
	param?: PartialDeep<LINETypes.ManualRepairRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.syncToken],
		[8, 2, param.limit],
		[11, 3, param.continuationToken],
	];
}
export function MarkAsReadRequest(
	param?: PartialDeep<LINETypes.MarkAsReadRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareChatMid],
		[11, 4, param.messageId],
		[11, 5, param.threadMid],
	];
}
export function MarkChatsAsReadRequest(
	param?: PartialDeep<LINETypes.MarkChatsAsReadRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 2, [11, param.chatMids]],
	];
}
export function MarkThreadsAsReadRequest(
	param?: PartialDeep<LINETypes.MarkThreadsAsReadRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
	];
}
export function ReactToMessageRequest(
	param?: PartialDeep<LINETypes.ReactToMessageRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.squareChatMid],
		[11, 3, param.messageId],
		[8, 4, MessageReactionType(param.reactionType)],
		[11, 5, param.threadMid],
	];
}
export function RefreshSubscriptionsRequest(
	param?: PartialDeep<LINETypes.RefreshSubscriptionsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 2, [10, param.subscriptions]],
	];
}
export function RejectSquareMembersRequest(
	param?: PartialDeep<LINETypes.RejectSquareMembersRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
		[15, 3, [11, param.requestedMemberMids]],
	];
}
export function RemoveSubscriptionsRequest(
	param?: PartialDeep<LINETypes.RemoveSubscriptionsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 2, [10, param.unsubscriptions]],
	];
}
export function MessageSummaryReportType(
	param: LINETypes.MessageSummaryReportType | undefined,
): LINETypes.MessageSummaryReportType & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.MessageSummaryReportType[param]
		: param;
}
export function ReportMessageSummaryRequest(
	param?: PartialDeep<LINETypes.ReportMessageSummaryRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatEmid],
		[10, 2, param.messageSummaryRangeTo],
		[8, 3, MessageSummaryReportType(param.reportType)],
	];
}
export function ReportType(
	param: LINETypes.ReportType | undefined,
): LINETypes.ReportType & number | undefined {
	return typeof param === "string" ? LINETypes.enums.ReportType[param] : param;
}
export function ReportSquareChatRequest(
	param?: PartialDeep<LINETypes.ReportSquareChatRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
		[11, 3, param.squareChatMid],
		[8, 5, ReportType(param.reportType)],
		[11, 6, param.otherReason],
	];
}
export function ReportSquareMemberRequest(
	param?: PartialDeep<LINETypes.ReportSquareMemberRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMemberMid],
		[8, 3, ReportType(param.reportType)],
		[11, 4, param.otherReason],
		[11, 5, param.squareChatMid],
		[11, 6, param.threadMid],
	];
}
export function ReportSquareMessageRequest(
	param?: PartialDeep<LINETypes.ReportSquareMessageRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
		[11, 3, param.squareChatMid],
		[11, 4, param.squareMessageId],
		[8, 5, ReportType(param.reportType)],
		[11, 6, param.otherReason],
		[11, 7, param.threadMid],
	];
}
export function ReportSquareRequest(
	param?: PartialDeep<LINETypes.ReportSquareRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
		[8, 3, ReportType(param.reportType)],
		[11, 4, param.otherReason],
	];
}
export function SquareChatMemberSearchOption(
	param?: PartialDeep<LINETypes.SquareChatMemberSearchOption> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.displayName],
		[2, 2, param.includingMe],
	];
}
export function SearchSquareChatMembersRequest(
	param?: PartialDeep<LINETypes.SearchSquareChatMembersRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[12, 2, SquareChatMemberSearchOption(param.searchOption)],
		[11, 3, param.continuationToken],
		[8, 4, param.limit],
	];
}
export function SquareChatMentionableSearchOption(
	param?: PartialDeep<LINETypes.SquareChatMentionableSearchOption> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.displayName],
	];
}
export function SearchSquareChatMentionablesRequest(
	param?:
		| PartialDeep<LINETypes.SearchSquareChatMentionablesRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
		[12, 2, SquareChatMentionableSearchOption(param.searchOption)],
		[11, 3, param.continuationToken],
		[8, 4, param.limit],
	];
}
export function SquareMemberSearchOption(
	param?: PartialDeep<LINETypes.SquareMemberSearchOption> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, SquareMembershipState(param.membershipState)],
		[14, 2, [
			8,
			param.memberRoles && param.memberRoles.map((e) => SquareMemberRole(e)),
		]],
		[11, 3, param.displayName],
		[8, 4, BooleanState(param.ableToReceiveMessage)],
		[8, 5, BooleanState(param.ableToReceiveFriendRequest)],
		[11, 6, param.chatMidToExcludeMembers],
		[2, 7, param.includingMe],
		[2, 8, param.excludeBlockedMembers],
		[2, 9, param.includingMeOnlyMatch],
	];
}
export function SearchSquareMembersRequest(
	param?: PartialDeep<LINETypes.SearchSquareMembersRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
		[12, 3, SquareMemberSearchOption(param.searchOption)],
		[11, 4, param.continuationToken],
		[8, 5, param.limit],
	];
}
export function SearchSquaresRequest(
	param?: PartialDeep<LINETypes.SearchSquaresRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.query],
		[11, 3, param.continuationToken],
		[8, 4, param.limit],
	];
}
export function MIDType(
	param: LINETypes.MIDType | undefined,
): LINETypes.MIDType & number | undefined {
	return typeof param === "string" ? LINETypes.enums.MIDType[param] : param;
}
export function Pb1_D6(
	param: LINETypes.Pb1_D6 | undefined,
): LINETypes.Pb1_D6 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_D6[param] : param;
}
export function Pb1_EnumC13050k(
	param: LINETypes.Pb1_EnumC13050k | undefined,
): LINETypes.Pb1_EnumC13050k & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.Pb1_EnumC13050k[param]
		: param;
}
export function GeolocationAccuracy(
	param?: PartialDeep<LINETypes.GeolocationAccuracy> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[4, 1, param.radiusMeters],
		[4, 2, param.radiusConfidence],
		[4, 3, param.altitudeAccuracy],
		[4, 4, param.velocityAccuracy],
		[4, 5, param.bearingAccuracy],
		[8, 6, Pb1_EnumC13050k(param.accuracyMode)],
	];
}
export function Location(
	param?: PartialDeep<LINETypes.Location> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.title],
		[11, 2, param.address],
		[4, 3, param.latitude],
		[4, 4, param.longitude],
		[11, 5, param.phone],
		[11, 6, param.categoryId],
		[8, 7, Pb1_D6(param.provider)],
		[12, 8, GeolocationAccuracy(param.accuracy)],
		[4, 9, param.altitudeMeters],
	];
}
export function ContentType(
	param: LINETypes.ContentType | undefined,
): LINETypes.ContentType & number | undefined {
	return typeof param === "string" ? LINETypes.enums.ContentType[param] : param;
}
export function Pb1_EnumC13015h6(
	param: LINETypes.Pb1_EnumC13015h6 | undefined,
): LINETypes.Pb1_EnumC13015h6 & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.Pb1_EnumC13015h6[param]
		: param;
}
export function Pb1_E7(
	param: LINETypes.Pb1_E7 | undefined,
): LINETypes.Pb1_E7 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_E7[param] : param;
}
export function Pb1_B(
	param: LINETypes.Pb1_B | undefined,
): LINETypes.Pb1_B & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_B[param] : param;
}
export function ReactionType(
	param?: PartialDeep<LINETypes.ReactionType> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, MessageReactionType(param.predefinedReactionType)],
	];
}
export function Reaction(
	param?: PartialDeep<LINETypes.Reaction> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.fromUserMid],
		[10, 2, param.atMillis],
		[12, 3, ReactionType(param.reactionType)],
	];
}
export function Message(
	param?: PartialDeep<LINETypes.Message> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.from],
		[11, 2, param.to],
		[8, 3, MIDType(param.toType)],
		[11, 4, param.id],
		[10, 5, param.createdTime],
		[10, 6, param.deliveredTime],
		[11, 10, param.text],
		[12, 11, Location(param.location)],
		[2, 14, param.hasContent],
		[8, 15, ContentType(param.contentType)],
		[11, 17, param.contentPreview],
		[13, 18, [11, 11, param.contentMetadata]],
		[3, 19, param.sessionId],
		[15, 20, [11, param.chunks]],
		[11, 21, param.relatedMessageId],
		[8, 22, Pb1_EnumC13015h6(param.messageRelationType)],
		[8, 23, param.readCount],
		[8, 24, Pb1_E7(param.relatedMessageServiceCode)],
		[8, 25, Pb1_B(param.appExtensionType)],
		[15, 27, [12, param.reactions && param.reactions.map((e) => Reaction(e))]],
	];
}
export function SquareMessageState(
	param: LINETypes.SquareMessageState | undefined,
): LINETypes.SquareMessageState & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareMessageState[param]
		: param;
}
export function SquareMessageThreadInfo(
	param?: PartialDeep<LINETypes.SquareMessageThreadInfo> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatThreadMid],
		[2, 2, param.threadRoot],
	];
}
export function SquareMessage(
	param?: PartialDeep<LINETypes.SquareMessage> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Message(param.message)],
		[8, 3, MIDType(param.fromType)],
		[10, 4, param.squareMessageRevision],
		[8, 5, SquareMessageState(param.state)],
		[12, 6, SquareMessageThreadInfo(param.threadInfo)],
	];
}
export function SendMessageRequest(
	param?: PartialDeep<LINETypes.SendMessageRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.squareChatMid],
		[12, 3, SquareMessage(param.squareMessage)],
	];
}
export function SendSquareThreadMessageRequest(
	param?: PartialDeep<LINETypes.SendSquareThreadMessageRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.chatMid],
		[11, 3, param.threadMid],
		[12, 4, SquareMessage(param.threadMessage)],
	];
}
export function SyncSquareMembersRequest(
	param?: PartialDeep<LINETypes.SyncSquareMembersRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareMid],
		[13, 2, [11, 10, param.squareMembers]],
	];
}
export function UnhideSquareMemberContentsRequest(
	param?: PartialDeep<LINETypes.UnhideSquareMemberContentsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareMemberMid],
	];
}
export function UnsendMessageRequest(
	param?: PartialDeep<LINETypes.UnsendMessageRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareChatMid],
		[11, 3, param.messageId],
		[11, 4, param.threadMid],
	];
}
export function SquareAuthorityAttribute(
	param: LINETypes.SquareAuthorityAttribute | undefined,
): LINETypes.SquareAuthorityAttribute & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareAuthorityAttribute[param]
		: param;
}
export function SquareAuthority(
	param?: PartialDeep<LINETypes.SquareAuthority> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareMid],
		[8, 2, SquareMemberRole(param.updateSquareProfile)],
		[8, 3, SquareMemberRole(param.inviteNewMember)],
		[8, 4, SquareMemberRole(param.approveJoinRequest)],
		[8, 5, SquareMemberRole(param.createPost)],
		[8, 6, SquareMemberRole(param.createOpenSquareChat)],
		[8, 7, SquareMemberRole(param.deleteSquareChatOrPost)],
		[8, 8, SquareMemberRole(param.removeSquareMember)],
		[8, 9, SquareMemberRole(param.grantRole)],
		[8, 10, SquareMemberRole(param.enableInvitationTicket)],
		[10, 11, param.revision],
		[8, 12, SquareMemberRole(param.createSquareChatAnnouncement)],
		[8, 13, SquareMemberRole(param.updateMaxChatMemberCount)],
		[8, 14, SquareMemberRole(param.useReadonlyDefaultChat)],
		[8, 15, SquareMemberRole(param.sendAllMention)],
	];
}
export function UpdateSquareAuthorityRequest(
	param?: PartialDeep<LINETypes.UpdateSquareAuthorityRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 2, [
			8,
			param.updateAttributes &&
			param.updateAttributes.map((e) => SquareAuthorityAttribute(e)),
		]],
		[12, 3, SquareAuthority(param.authority)],
	];
}
export function SquareChatMemberAttribute(
	param: LINETypes.SquareChatMemberAttribute | undefined,
): LINETypes.SquareChatMemberAttribute & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareChatMemberAttribute[param]
		: param;
}
export function SquareChatMembershipState(
	param: LINETypes.SquareChatMembershipState | undefined,
): LINETypes.SquareChatMembershipState & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareChatMembershipState[param]
		: param;
}
export function SquareChatMember(
	param?: PartialDeep<LINETypes.SquareChatMember> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareMemberMid],
		[11, 2, param.squareChatMid],
		[10, 3, param.revision],
		[8, 4, SquareChatMembershipState(param.membershipState)],
		[2, 5, param.notificationForMessage],
		[2, 6, param.notificationForNewMember],
	];
}
export function UpdateSquareChatMemberRequest(
	param?: PartialDeep<LINETypes.UpdateSquareChatMemberRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 2, [
			8,
			param.updatedAttrs &&
			param.updatedAttrs.map((e) => SquareChatMemberAttribute(e)),
		]],
		[12, 3, SquareChatMember(param.chatMember)],
	];
}
export function SquareChatAttribute(
	param: LINETypes.SquareChatAttribute | undefined,
): LINETypes.SquareChatAttribute & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareChatAttribute[param]
		: param;
}
export function UpdateSquareChatRequest(
	param?: PartialDeep<LINETypes.UpdateSquareChatRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 2, [
			8,
			param.updatedAttrs &&
			param.updatedAttrs.map((e) => SquareChatAttribute(e)),
		]],
		[12, 3, SquareChat(param.squareChat)],
	];
}
export function SquareFeatureSetAttribute(
	param: LINETypes.SquareFeatureSetAttribute | undefined,
): LINETypes.SquareFeatureSetAttribute & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareFeatureSetAttribute[param]
		: param;
}
export function SquareFeatureControlState(
	param: LINETypes.SquareFeatureControlState | undefined,
): LINETypes.SquareFeatureControlState & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareFeatureControlState[param]
		: param;
}
export function SquareFeature(
	param?: PartialDeep<LINETypes.SquareFeature> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, SquareFeatureControlState(param.controlState)],
		[8, 2, BooleanState(param.booleanValue)],
	];
}
export function SquareFeatureSet(
	param?: PartialDeep<LINETypes.SquareFeatureSet> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareMid],
		[10, 2, param.revision],
		[12, 11, SquareFeature(param.creatingSecretSquareChat)],
		[12, 12, SquareFeature(param.invitingIntoOpenSquareChat)],
		[12, 13, SquareFeature(param.creatingSquareChat)],
		[12, 14, SquareFeature(param.readonlyDefaultChat)],
		[12, 15, SquareFeature(param.showingAdvertisement)],
		[12, 16, SquareFeature(param.delegateJoinToPlug)],
		[12, 17, SquareFeature(param.delegateKickOutToPlug)],
		[12, 18, SquareFeature(param.disableUpdateJoinMethod)],
		[12, 19, SquareFeature(param.disableTransferAdmin)],
		[12, 20, SquareFeature(param.creatingLiveTalk)],
		[12, 21, SquareFeature(param.disableUpdateSearchable)],
		[12, 22, SquareFeature(param.summarizingMessages)],
		[12, 23, SquareFeature(param.creatingSquareThread)],
		[12, 24, SquareFeature(param.enableSquareThread)],
		[12, 25, SquareFeature(param.disableChangeRoleCoAdmin)],
	];
}
export function UpdateSquareFeatureSetRequest(
	param?: PartialDeep<LINETypes.UpdateSquareFeatureSetRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 2, [
			8,
			param.updateAttributes &&
			param.updateAttributes.map((e) => SquareFeatureSetAttribute(e)),
		]],
		[12, 3, SquareFeatureSet(param.squareFeatureSet)],
	];
}
export function SquareMemberRelation(
	param?: PartialDeep<LINETypes.SquareMemberRelation> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, SquareMemberRelationState(param.state)],
		[10, 2, param.revision],
	];
}
export function UpdateSquareMemberRelationRequest(
	param?: PartialDeep<LINETypes.UpdateSquareMemberRelationRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.squareMid],
		[11, 3, param.targetSquareMemberMid],
		[14, 4, [8, param.updatedAttrs]],
		[12, 5, SquareMemberRelation(param.relation)],
	];
}
export function SquareMemberAttribute(
	param: LINETypes.SquareMemberAttribute | undefined,
): LINETypes.SquareMemberAttribute & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareMemberAttribute[param]
		: param;
}
export function SquarePreferenceAttribute(
	param: LINETypes.SquarePreferenceAttribute | undefined,
): LINETypes.SquarePreferenceAttribute & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquarePreferenceAttribute[param]
		: param;
}
export function UpdateSquareMemberRequest(
	param?: PartialDeep<LINETypes.UpdateSquareMemberRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 2, [
			8,
			param.updatedAttrs &&
			param.updatedAttrs.map((e) => SquareMemberAttribute(e)),
		]],
		[14, 3, [
			8,
			param.updatedPreferenceAttrs &&
			param.updatedPreferenceAttrs.map((e) => SquarePreferenceAttribute(e)),
		]],
		[12, 4, SquareMember(param.squareMember)],
	];
}
export function UpdateSquareMembersRequest(
	param?: PartialDeep<LINETypes.UpdateSquareMembersRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 2, [
			8,
			param.updatedAttrs &&
			param.updatedAttrs.map((e) => SquareMemberAttribute(e)),
		]],
		[15, 3, [12, param.members && param.members.map((e) => SquareMember(e))]],
	];
}
export function SquareAttribute(
	param: LINETypes.SquareAttribute | undefined,
): LINETypes.SquareAttribute & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SquareAttribute[param]
		: param;
}
export function UpdateSquareRequest(
	param?: PartialDeep<LINETypes.UpdateSquareRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 2, [
			8,
			param.updatedAttrs && param.updatedAttrs.map((e) => SquareAttribute(e)),
		]],
		[12, 3, Square(param.square)],
	];
}
export function SquareUserSettings(
	param?: PartialDeep<LINETypes.SquareUserSettings> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, BooleanState(param.liveTalkNotification)],
	];
}
export function UpdateUserSettingsRequest(
	param?: PartialDeep<LINETypes.UpdateUserSettingsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		,
		[12, 2, SquareUserSettings(param.userSettings)],
	];
}
export function r80_EnumC34362b(
	param: LINETypes.r80_EnumC34362b | undefined,
): LINETypes.r80_EnumC34362b & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.r80_EnumC34362b[param]
		: param;
}
export function r80_EnumC34361a(
	param: LINETypes.r80_EnumC34361a | undefined,
): LINETypes.r80_EnumC34361a & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.r80_EnumC34361a[param]
		: param;
}
export function AuthenticatorAssertionResponse(
	param?: PartialDeep<LINETypes.AuthenticatorAssertionResponse> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.clientDataJSON],
		[11, 2, param.authenticatorData],
		[11, 3, param.signature],
		[11, 4, param.userHandle],
	];
}
export function AuthenticationExtensionsClientOutputs(
	param?:
		| PartialDeep<LINETypes.AuthenticationExtensionsClientOutputs>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[2, 91, param.lineAuthenSel],
	];
}
export function AuthPublicKeyCredential(
	param?: PartialDeep<LINETypes.AuthPublicKeyCredential> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.id],
		[11, 2, param.type],
		[12, 3, AuthenticatorAssertionResponse(param.response)],
		[12, 4, AuthenticationExtensionsClientOutputs(param.extensionResults)],
	];
}
export function AuthenticateWithPaakRequest(
	param?: PartialDeep<LINETypes.AuthenticateWithPaakRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
		[12, 2, AuthPublicKeyCredential(param.credential)],
	];
}
export function BulkFollowRequest(
	param?: PartialDeep<LINETypes.BulkFollowRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 1, [11, param.followTargetMids]],
		[14, 2, [11, param.unfollowTargetMids]],
		[2, 3, param.hasNext],
	];
}
export function t80_h(
	param: LINETypes.t80_h | undefined,
): LINETypes.t80_h & number | undefined {
	return typeof param === "string" ? LINETypes.enums.t80_h[param] : param;
}
export function GetRequest(
	param?: PartialDeep<LINETypes.GetRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.keyName],
		[8, 2, t80_h(param.ns)],
	];
}
export function BulkGetRequest(
	param?: PartialDeep<LINETypes.BulkGetRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 1, [12, param.requests && param.requests.map((e) => GetRequest(e))]],
	];
}
export function BuyMustbuyRequest(
	param?: PartialDeep<LINETypes.BuyMustbuyRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Ob1_O0(param.productType)],
		[11, 2, param.productId],
		[11, 3, param.serialNumber],
	];
}
export function CanCreateCombinationStickerRequest(
	param?: PartialDeep<LINETypes.CanCreateCombinationStickerRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 1, [11, param.packageIds]],
	];
}
export function Locale(
	param?: PartialDeep<LINETypes.Locale> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.language],
		[11, 2, param.country],
	];
}
export function CancelChatInvitationRequest(
	param?: PartialDeep<LINETypes.CancelChatInvitationRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.chatMid],
		[14, 3, [11, param.targetUserMids]],
	];
}
export function CancelPaakAuthRequest(
	param?: PartialDeep<LINETypes.CancelPaakAuthRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
	];
}
export function CancelPaakAuthenticationRequest(
	param?: PartialDeep<LINETypes.CancelPaakAuthenticationRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
	];
}
export function CancelPinCodeRequest(
	param?: PartialDeep<LINETypes.CancelPinCodeRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
	];
}
export function CancelReactionRequest(
	param?: PartialDeep<LINETypes.CancelReactionRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[10, 2, param.messageId],
	];
}
export function VerificationMethod(
	param: LINETypes.VerificationMethod | undefined,
): LINETypes.VerificationMethod & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.VerificationMethod[param]
		: param;
}
export function r80_n0(
	param: LINETypes.r80_n0 | undefined,
): LINETypes.r80_n0 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.r80_n0[param] : param;
}
export function T70_EnumC14390b(
	param: LINETypes.T70_EnumC14390b | undefined,
): LINETypes.T70_EnumC14390b & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.T70_EnumC14390b[param]
		: param;
}
export function AccountIdentifier(
	param?: PartialDeep<LINETypes.AccountIdentifier> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, T70_EnumC14390b(param.type)],
		[11, 2, param.identifier],
		[11, 11, param.countryCode],
	];
}
export function h80_t(
	param?: PartialDeep<LINETypes.h80_t> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.newDevicePublicKey],
		[11, 2, param.encryptedQrIdentifier],
	];
}
export function CheckIfEncryptedE2EEKeyReceivedRequest(
	param?:
		| PartialDeep<LINETypes.CheckIfEncryptedE2EEKeyReceivedRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
		[12, 2, h80_t(param.secureChannelData)],
	];
}
export function UserPhoneNumber(
	param?: PartialDeep<LINETypes.UserPhoneNumber> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.phoneNumber],
		[11, 2, param.countryCode],
	];
}
export function CheckIfPhonePinCodeMsgVerifiedRequest(
	param?:
		| PartialDeep<LINETypes.CheckIfPhonePinCodeMsgVerifiedRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, UserPhoneNumber(param.userPhoneNumber)],
	];
}
export function r80_EnumC34368h(
	param: LINETypes.r80_EnumC34368h | undefined,
): LINETypes.r80_EnumC34368h & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.r80_EnumC34368h[param]
		: param;
}
export function r80_EnumC34371k(
	param: LINETypes.r80_EnumC34371k | undefined,
): LINETypes.r80_EnumC34371k & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.r80_EnumC34371k[param]
		: param;
}
export function CheckUserAgeAfterApprovalWithDocomoV2Request(
	param?:
		| PartialDeep<LINETypes.CheckUserAgeAfterApprovalWithDocomoV2Request>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.accessToken],
		[11, 2, param.agprm],
	];
}
export function CheckUserAgeWithDocomoV2Request(
	param?: PartialDeep<LINETypes.CheckUserAgeWithDocomoV2Request> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authCode],
	];
}
export function CarrierCode(
	param: LINETypes.CarrierCode | undefined,
): LINETypes.CarrierCode & number | undefined {
	return typeof param === "string" ? LINETypes.enums.CarrierCode[param] : param;
}
export function IdentityProvider(
	param: LINETypes.IdentityProvider | undefined,
): LINETypes.IdentityProvider & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.IdentityProvider[param]
		: param;
}
export function IdentifierConfirmationRequest(
	param?: PartialDeep<LINETypes.IdentifierConfirmationRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[13, 1, [11, 11, param.metaData]],
		[2, 2, param.forceRegistration],
		[11, 3, param.verificationCode],
	];
}
export function IdentityCredentialRequest(
	param?: PartialDeep<LINETypes.IdentityCredentialRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[13, 1, [11, 11, param.metaData]],
		[8, 2, IdentityProvider(param.identityProvider)],
		[11, 3, param.cipherKeyId],
		[11, 4, param.cipherText],
		[12, 5, IdentifierConfirmationRequest(param.confirmationRequest)],
	];
}
export function ConnectEapAccountRequest(
	param?: PartialDeep<LINETypes.ConnectEapAccountRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
	];
}
export function Pb1_X2(
	param: LINETypes.Pb1_X2 | undefined,
): LINETypes.Pb1_X2 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_X2[param] : param;
}
export function ChatRoomAnnouncementContentMetadata(
	param?:
		| PartialDeep<LINETypes.ChatRoomAnnouncementContentMetadata>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.replace],
		[11, 2, param.sticonOwnership],
		[11, 3, param.postNotificationMetadata],
	];
}
export function ChatRoomAnnouncementContents(
	param?: PartialDeep<LINETypes.ChatRoomAnnouncementContents> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.displayFields],
		[11, 2, param.text],
		[11, 3, param.link],
		[11, 4, param.thumbnail],
		[12, 5, ChatRoomAnnouncementContentMetadata(param.contentMetadata)],
	];
}
export function Pb1_Z2(
	param: LINETypes.Pb1_Z2 | undefined,
): LINETypes.Pb1_Z2 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_Z2[param] : param;
}
export function CreateChatRequest(
	param?: PartialDeep<LINETypes.CreateChatRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[8, 2, Pb1_Z2(param.type)],
		[11, 3, param.name],
		[14, 4, [11, param.targetUserMids]],
		[11, 5, param.picturePath],
	];
}
export function Pb1_A3(
	param: LINETypes.Pb1_A3 | undefined,
): LINETypes.Pb1_A3 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_A3[param] : param;
}
export function Pb1_C13263z3(
	param?: PartialDeep<LINETypes.Pb1_C13263z3> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.blobHeader],
		[11, 2, param.blobPayload],
		[8, 3, Pb1_A3(param.reason)],
	];
}
export function CreateGroupCallUrlRequest(
	param?: PartialDeep<LINETypes.CreateGroupCallUrlRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.title],
	];
}
export function E2EEMetadata(
	param?: PartialDeep<LINETypes.E2EEMetadata> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 1, param.e2EEPublicKeyId],
	];
}
export function SingleValueMetadata(
	param?: PartialDeep<LINETypes.SingleValueMetadata> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function Pb1_W5(
	param?: PartialDeep<LINETypes.Pb1_W5> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, E2EEMetadata(param.e2ee)],
		[12, 2, SingleValueMetadata(param.singleValue)],
	];
}
export function Pb1_X5(
	param?: PartialDeep<LINETypes.Pb1_X5> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Pb1_W5(param.metadata)],
		[11, 2, param.blobPayload],
	];
}
export function Pb1_E3(
	param?: PartialDeep<LINETypes.Pb1_E3> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.blobHeader],
		[15, 2, [
			12,
			param.payloadDataList && param.payloadDataList.map((e) => Pb1_X5(e)),
		]],
	];
}
export function CreateMultiProfileRequest(
	param?: PartialDeep<LINETypes.CreateMultiProfileRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.displayName],
	];
}
export function h80_C25643c(
	param?: PartialDeep<LINETypes.h80_C25643c> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function Pb1_H3(
	param?: PartialDeep<LINETypes.Pb1_H3> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function DeleteGroupCallUrlRequest(
	param?: PartialDeep<LINETypes.DeleteGroupCallUrlRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.urlId],
	];
}
export function DeleteMultiProfileRequest(
	param?: PartialDeep<LINETypes.DeleteMultiProfileRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.profileId],
	];
}
export function DeleteOtherFromChatRequest(
	param?: PartialDeep<LINETypes.DeleteOtherFromChatRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.chatMid],
		[14, 3, [11, param.targetUserMids]],
	];
}
export function R70_c(
	param?: PartialDeep<LINETypes.R70_c> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function DeleteSafetyStatusRequest(
	param?: PartialDeep<LINETypes.DeleteSafetyStatusRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.disasterId],
	];
}
export function DeleteSelfFromChatRequest(
	param?: PartialDeep<LINETypes.DeleteSelfFromChatRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.chatMid],
		[10, 3, param.lastSeenMessageDeliveredTime],
		[11, 4, param.lastSeenMessageId],
		[10, 5, param.lastMessageDeliveredTime],
		[11, 6, param.lastMessageId],
	];
}
export function DetermineMediaMessageFlowRequest(
	param?: PartialDeep<LINETypes.DetermineMediaMessageFlowRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
	];
}
export function Q70_q(
	param: LINETypes.Q70_q | undefined,
): LINETypes.Q70_q & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Q70_q[param] : param;
}
export function DisconnectEapAccountRequest(
	param?: PartialDeep<LINETypes.DisconnectEapAccountRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Q70_q(param.eapType)],
	];
}
export function S70_b(
	param?: PartialDeep<LINETypes.S70_b> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function FetchOperationsRequest(
	param?: PartialDeep<LINETypes.FetchOperationsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.deviceId],
		[10, 2, param.offsetFrom],
	];
}
export function FetchPhonePinCodeMsgRequest(
	param?: PartialDeep<LINETypes.FetchPhonePinCodeMsgRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, UserPhoneNumber(param.userPhoneNumber)],
	];
}
export function Pb1_F0(
	param: LINETypes.Pb1_F0 | undefined,
): LINETypes.Pb1_F0 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_F0[param] : param;
}
export function FindChatByTicketRequest(
	param?: PartialDeep<LINETypes.FindChatByTicketRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.ticketId],
	];
}
export function FollowRequest(
	param?: PartialDeep<LINETypes.FollowRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Pb1_A4(param.followMid)],
	];
}
export function GetAccessTokenRequest(
	param?: PartialDeep<LINETypes.GetAccessTokenRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.fontId],
	];
}
export function GetAllChatMidsRequest(
	param?: PartialDeep<LINETypes.GetAllChatMidsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[2, 1, param.withMemberChats],
		[2, 2, param.withInvitedChats],
	];
}
export function Pb1_V7(
	param: LINETypes.Pb1_V7 | undefined,
): LINETypes.Pb1_V7 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_V7[param] : param;
}
export function m80_l(
	param?: PartialDeep<LINETypes.m80_l> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function m80_n(
	param?: PartialDeep<LINETypes.m80_n> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LatestProductsByAuthorRequest(
	param?: PartialDeep<LINETypes.LatestProductsByAuthorRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Ob1_O0(param.productType)],
		[10, 2, param.authorId],
		[8, 3, param.limit],
	];
}
export function Ob1_a2(
	param: LINETypes.Ob1_a2 | undefined,
): LINETypes.Ob1_a2 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Ob1_a2[param] : param;
}
export function AutoSuggestionShowcaseRequest(
	param?: PartialDeep<LINETypes.AutoSuggestionShowcaseRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Ob1_O0(param.productType)],
		[8, 2, Ob1_a2(param.suggestionType)],
	];
}
export function NZ0_C12208u(
	param?: PartialDeep<LINETypes.NZ0_C12208u> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function NZ0_C12214w(
	param?: PartialDeep<LINETypes.NZ0_C12214w> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function ZQ0_b(
	param?: PartialDeep<LINETypes.ZQ0_b> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function UEN(
	param?: PartialDeep<LINETypes.UEN> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 1, param.revision],
	];
}
export function Beacon(
	param?: PartialDeep<LINETypes.Beacon> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.hardwareId],
	];
}
export function Uf_C14856C(
	param?: PartialDeep<LINETypes.Uf_C14856C> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UEN(param.uen)],
		[12, 2, Beacon(param.beacon)],
	];
}
export function AdRequest(
	param?: PartialDeep<LINETypes.AdRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[13, 1, [11, 11, param.headers]],
		[13, 2, [11, 11, param.queryParams]],
	];
}
export function Uf_EnumC14873o(
	param: LINETypes.Uf_EnumC14873o | undefined,
): LINETypes.Uf_EnumC14873o & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.Uf_EnumC14873o[param]
		: param;
}
export function ContentRequest(
	param?: PartialDeep<LINETypes.ContentRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Uf_EnumC14873o(param.os)],
		[11, 2, param.appv],
		[11, 3, param.lineAcceptableLanguage],
		[11, 4, param.countryCode],
	];
}
export function BannerRequest(
	param?: PartialDeep<LINETypes.BannerRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[2, 1, param.test],
		[12, 2, Uf_C14856C(param.trigger)],
		[12, 3, AdRequest(param.ad)],
		[12, 4, ContentRequest(param.content)],
	];
}
export function Eh_C8933a(
	param?: PartialDeep<LINETypes.Eh_C8933a> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function GetBleDeviceRequest(
	param?: PartialDeep<LINETypes.GetBleDeviceRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.serviceUuid],
		[11, 2, param.psdi],
	];
}
export function GetBuddyChatBarRequest(
	param?: PartialDeep<LINETypes.GetBuddyChatBarRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.buddyMid],
		[10, 2, param.chatBarRevision],
		[11, 3, param.richMenuId],
	];
}
export function Pb1_D0(
	param: LINETypes.Pb1_D0 | undefined,
): LINETypes.Pb1_D0 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_D0[param] : param;
}
export function GetBuddyLiveRequest(
	param?: PartialDeep<LINETypes.GetBuddyLiveRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.mid],
	];
}
export function GetBuddyStatusBarV2Request(
	param?: PartialDeep<LINETypes.GetBuddyStatusBarV2Request> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.botMid],
		[10, 2, param.revision],
	];
}
export function GetCallStatusRequest(
	param?: PartialDeep<LINETypes.GetCallStatusRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.basicSearchId],
		[11, 2, param.otp],
	];
}
export function GetCampaignRequest(
	param?: PartialDeep<LINETypes.GetCampaignRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.campaignType],
	];
}
export function GetChallengeForPaakAuthRequest(
	param?: PartialDeep<LINETypes.GetChallengeForPaakAuthRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
	];
}
export function GetChallengeForPrimaryRegRequest(
	param?: PartialDeep<LINETypes.GetChallengeForPrimaryRegRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
	];
}
export function GetChannelContextRequest(
	param?: PartialDeep<LINETypes.GetChannelContextRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
	];
}
export function Pb1_Q2(
	param: LINETypes.Pb1_Q2 | undefined,
): LINETypes.Pb1_Q2 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_Q2[param] : param;
}
export function GetChatappRequest(
	param?: PartialDeep<LINETypes.GetChatappRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatappId],
		[11, 2, param.language],
	];
}
export function GetChatsRequest(
	param?: PartialDeep<LINETypes.GetChatsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [11, param.chatMids]],
		[2, 2, param.withMembers],
		[2, 3, param.withInvitees],
	];
}
export function jO0_EnumC27533B(
	param: LINETypes.jO0_EnumC27533B | undefined,
): LINETypes.jO0_EnumC27533B & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.jO0_EnumC27533B[param]
		: param;
}
export function jO0_EnumC27559z(
	param: LINETypes.jO0_EnumC27559z | undefined,
): LINETypes.jO0_EnumC27559z & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.jO0_EnumC27559z[param]
		: param;
}
export function GetCoinProductsRequest(
	param?: PartialDeep<LINETypes.GetCoinProductsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, jO0_EnumC27533B(param.appStoreCode)],
		[11, 2, param.country],
		[11, 3, param.language],
		[8, 4, jO0_EnumC27559z(param.pgCode)],
	];
}
export function GetCoinHistoryRequest(
	param?: PartialDeep<LINETypes.GetCoinHistoryRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, jO0_EnumC27533B(param.appStoreCode)],
		[11, 2, param.country],
		[11, 3, param.language],
		[11, 4, param.searchEndDate],
		[8, 5, param.offset],
		[8, 6, param.limit],
	];
}
export function GetContactCalendarEventTarget(
	param?: PartialDeep<LINETypes.GetContactCalendarEventTarget> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.targetUserMid],
	];
}
export function GetContactCalendarEventsRequest(
	param?: PartialDeep<LINETypes.GetContactCalendarEventsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [
			12,
			param.targetUsers &&
			param.targetUsers.map((e) => GetContactCalendarEventTarget(e)),
		]],
		[8, 2, Pb1_V7(param.syncReason)],
	];
}
export function GetContactV3Target(
	param?: PartialDeep<LINETypes.GetContactV3Target> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.targetUserMid],
	];
}
export function GetContactsV3Request(
	param?: PartialDeep<LINETypes.GetContactsV3Request> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [
			12,
			param.targetUsers && param.targetUsers.map((e) => GetContactV3Target(e)),
		]],
		[8, 2, Pb1_V7(param.syncReason)],
		[2, 3, param.checkUserStatusStrictly],
	];
}
export function Pb1_EnumC13221w3(
	param: LINETypes.Pb1_EnumC13221w3 | undefined,
): LINETypes.Pb1_EnumC13221w3 & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.Pb1_EnumC13221w3[param]
		: param;
}
export function SimCard(
	param?: PartialDeep<LINETypes.SimCard> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.countryCode],
		[11, 2, param.hni],
		[11, 3, param.carrierName],
	];
}
export function fN0_C24473e(
	param?: PartialDeep<LINETypes.fN0_C24473e> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function DestinationLIFFRequest(
	param?: PartialDeep<LINETypes.DestinationLIFFRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.originalUrl],
	];
}
export function vh_C37633d(
	param?: PartialDeep<LINETypes.vh_C37633d> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function Pb1_W4(
	param?: PartialDeep<LINETypes.Pb1_W4> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function Pb1_Y4(
	param?: PartialDeep<LINETypes.Pb1_Y4> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function GetExchangeKeyRequest(
	param?: PartialDeep<LINETypes.GetExchangeKeyRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
	];
}
export function GetFollowBlacklistRequest(
	param?: PartialDeep<LINETypes.GetFollowBlacklistRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.cursor],
	];
}
export function GetFollowersRequest(
	param?: PartialDeep<LINETypes.GetFollowersRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Pb1_A4(param.followMid)],
		[11, 2, param.cursor],
	];
}
export function GetFollowingsRequest(
	param?: PartialDeep<LINETypes.GetFollowingsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Pb1_A4(param.followMid)],
		[11, 2, param.cursor],
	];
}
export function VR0_l(
	param: LINETypes.VR0_l | undefined,
): LINETypes.VR0_l & number | undefined {
	return typeof param === "string" ? LINETypes.enums.VR0_l[param] : param;
}
export function GetFontMetasRequest(
	param?: PartialDeep<LINETypes.GetFontMetasRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, VR0_l(param.requestCause)],
	];
}
export function GetFriendDetailTarget(
	param?: PartialDeep<LINETypes.GetFriendDetailTarget> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.targetUserMid],
	];
}
export function GetFriendDetailsRequest(
	param?: PartialDeep<LINETypes.GetFriendDetailsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [
			12,
			param.targetUsers &&
			param.targetUsers.map((e) => GetFriendDetailTarget(e)),
		]],
		[8, 2, Pb1_V7(param.syncReason)],
	];
}
export function Pb1_F4(
	param: LINETypes.Pb1_F4 | undefined,
): LINETypes.Pb1_F4 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_F4[param] : param;
}
export function GetGnbBadgeStatusRequest(
	param?: PartialDeep<LINETypes.GetGnbBadgeStatusRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.uenRevision],
	];
}
export function GetGroupCallUrlInfoRequest(
	param?: PartialDeep<LINETypes.GetGroupCallUrlInfoRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.urlId],
	];
}
export function Pb1_C13042j5(
	param?: PartialDeep<LINETypes.Pb1_C13042j5> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function GetHomeFlexContentRequest(
	param?: PartialDeep<LINETypes.GetHomeFlexContentRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.supportedFlexVersion],
	];
}
export function Eg_C8928b(
	param?: PartialDeep<LINETypes.Eg_C8928b> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function GetHomeServicesRequest(
	param?: PartialDeep<LINETypes.GetHomeServicesRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [8, param.ids]],
	];
}
export function fN0_C24471c(
	param?: PartialDeep<LINETypes.fN0_C24471c> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function GetJoinedMembershipByBotMidRequest(
	param?: PartialDeep<LINETypes.GetJoinedMembershipByBotMidRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.botMid],
	];
}
export function GetJoinedMembershipRequest(
	param?: PartialDeep<LINETypes.GetJoinedMembershipRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.uniqueKey],
	];
}
export function Pb1_C13070l5(
	param?: PartialDeep<LINETypes.Pb1_C13070l5> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function LiffViewWithoutUserContextRequest(
	param?: PartialDeep<LINETypes.LiffViewWithoutUserContextRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.liffId],
	];
}
export function r80_EnumC34372l(
	param: LINETypes.r80_EnumC34372l | undefined,
): LINETypes.r80_EnumC34372l & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.r80_EnumC34372l[param]
		: param;
}
export function GetLoginActorContextRequest(
	param?: PartialDeep<LINETypes.GetLoginActorContextRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
	];
}
export function GetMappedProfileIdsRequest(
	param?: PartialDeep<LINETypes.GetMappedProfileIdsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [11, param.targetUserMids]],
	];
}
export function MessageBoxListRequest(
	param?: PartialDeep<LINETypes.MessageBoxListRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.minChatId],
		[11, 2, param.maxChatId],
		[2, 3, param.activeOnly],
		[8, 4, param.messageBoxCountLimit],
		[2, 5, param.withUnreadCount],
		[8, 6, param.lastMessagesPerMessageBoxCount],
		[2, 7, param.unreadOnly],
	];
}
export function GetModuleLayoutV4Request(
	param?: PartialDeep<LINETypes.GetModuleLayoutV4Request> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.etag],
	];
}
export function NZ0_G(
	param?: PartialDeep<LINETypes.NZ0_G> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.id],
		[11, 2, param.etag],
		[11, 3, param.recommendedModelId],
		[11, 4, param.deviceAdId],
		[2, 5, param.agreedWithTargetingAdByMid],
		[11, 6, param.deviceId],
	];
}
export function NZ0_E(
	param?: PartialDeep<LINETypes.NZ0_E> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.id],
		[11, 2, param.etag],
		[11, 3, param.recommendedModelId],
		[11, 4, param.deviceAdId],
		[2, 5, param.agreedWithTargetingAdByMid],
		[11, 6, param.deviceId],
	];
}
export function GetModulesRequestV2(
	param?: PartialDeep<LINETypes.GetModulesRequestV2> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.etag],
		[11, 2, param.deviceAdId],
	];
}
export function NZ0_EnumC12169g1(
	param: LINETypes.NZ0_EnumC12169g1 | undefined,
): LINETypes.NZ0_EnumC12169g1 & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.NZ0_EnumC12169g1[param]
		: param;
}
export function GetModulesRequestV3(
	param?: PartialDeep<LINETypes.GetModulesRequestV3> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.etag],
		[8, 2, NZ0_EnumC12169g1(param.tabIdentifier)],
		[11, 3, param.deviceAdId],
		[2, 4, param.agreedWithTargetingAdByMid],
	];
}
export function GetModulesV4WithStatusRequest(
	param?: PartialDeep<LINETypes.GetModulesV4WithStatusRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.etag],
		[11, 2, param.subTabId],
		[11, 3, param.deviceAdId],
		[2, 4, param.agreedWithTargetingAdByMid],
		[11, 5, param.deviceId],
	];
}
export function GetMyAssetInformationV2Request(
	param?: PartialDeep<LINETypes.GetMyAssetInformationV2Request> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[2, 1, param.refresh],
	];
}
export function GetMyChatappsRequest(
	param?: PartialDeep<LINETypes.GetMyChatappsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.language],
		[11, 2, param.continuationToken],
	];
}
export function GetMyDashboardRequest(
	param?: PartialDeep<LINETypes.GetMyDashboardRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, NZ0_EnumC12169g1(param.tabIdentifier)],
	];
}
export function GetNotificationSettingsRequest(
	param?: PartialDeep<LINETypes.GetNotificationSettingsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 1, [11, param.chatMids]],
		[8, 2, Pb1_V7(param.syncReason)],
	];
}
export function GetPasswordHashingParametersRequest(
	param?:
		| PartialDeep<LINETypes.GetPasswordHashingParametersRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
	];
}
export function GetPasswordHashingParametersForPwdRegRequest(
	param?:
		| PartialDeep<LINETypes.GetPasswordHashingParametersForPwdRegRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
	];
}
export function GetPasswordHashingParametersForPwdVerifRequest(
	param?:
		| PartialDeep<LINETypes.GetPasswordHashingParametersForPwdVerifRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, AccountIdentifier(param.accountIdentifier)],
	];
}
export function Device(
	param?: PartialDeep<LINETypes.Device> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.udid],
		[11, 2, param.deviceModel],
	];
}
export function GetPhoneVerifMethodForRegistrationRequest(
	param?:
		| PartialDeep<LINETypes.GetPhoneVerifMethodForRegistrationRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, Device(param.device)],
		[12, 3, UserPhoneNumber(param.userPhoneNumber)],
	];
}
export function GetPhoneVerifMethodV2Request(
	param?: PartialDeep<LINETypes.GetPhoneVerifMethodV2Request> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, Device(param.device)],
		[12, 3, UserPhoneNumber(param.userPhoneNumber)],
	];
}
export function Pb1_C13126p5(
	param?: PartialDeep<LINETypes.Pb1_C13126p5> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function GetPredefinedScenarioSetsRequest(
	param?: PartialDeep<LINETypes.GetPredefinedScenarioSetsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [11, param.deviceIds]],
	];
}
export function fN0_C24475g(
	param?: PartialDeep<LINETypes.fN0_C24475g> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function fN0_C24476h(
	param?: PartialDeep<LINETypes.fN0_C24476h> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function MessageBoxV2MessageId(
	param?: PartialDeep<LINETypes.MessageBoxV2MessageId> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 1, param.deliveredTime],
		[10, 2, param.messageId],
	];
}
export function GetPreviousMessagesV2Request(
	param?: PartialDeep<LINETypes.GetPreviousMessagesV2Request> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.messageBoxId],
		[12, 2, MessageBoxV2MessageId(param.endMessageId)],
		[8, 3, param.messagesCount],
		[2, 4, param.withReadCount],
		[2, 5, param.receivedOnly],
	];
}
export function GetPublishedMembershipsRequest(
	param?: PartialDeep<LINETypes.GetPublishedMembershipsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.basicSearchId],
	];
}
export function PurchaseEnabledRequest(
	param?: PartialDeep<LINETypes.PurchaseEnabledRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.uniqueKey],
	];
}
export function NZ0_S(
	param?: PartialDeep<LINETypes.NZ0_S> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function GetRecommendationDetailTarget(
	param?: PartialDeep<LINETypes.GetRecommendationDetailTarget> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.targetUserMid],
	];
}
export function GetRecommendationDetailsRequest(
	param?: PartialDeep<LINETypes.GetRecommendationDetailsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [
			12,
			param.targetUsers &&
			param.targetUsers.map((e) => GetRecommendationDetailTarget(e)),
		]],
		[8, 2, Pb1_V7(param.syncReason)],
	];
}
export function ConfigurationsParams(
	param?: PartialDeep<LINETypes.ConfigurationsParams> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.regionOfUsim],
		[11, 2, param.regionOfTelephone],
		[11, 3, param.regionOfLocale],
		[11, 4, param.carrier],
	];
}
export function RepairGroupMembers(
	param?: PartialDeep<LINETypes.RepairGroupMembers> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.numMembers],
		[2, 3, param.invalidGroup],
	];
}
export function GetRepairElementsRequest(
	param?: PartialDeep<LINETypes.GetRepairElementsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[2, 1, param.profile],
		[2, 2, param.settings],
		[12, 3, ConfigurationsParams(param.configurations)],
		[8, 4, param.numLocalJoinedGroups],
		[8, 5, param.numLocalInvitedGroups],
		[8, 6, param.numLocalFriends],
		[8, 7, param.numLocalRecommendations],
		[8, 8, param.numLocalBlockedFriends],
		[8, 9, param.numLocalBlockedRecommendations],
		[13, 10, [11, 12, map(RepairGroupMembers, param.localGroupMembers)]],
		[8, 11, Pb1_V7(param.syncReason)],
		[13, 12, [11, 8, param.localProfileMappings]],
	];
}
export function GetResponseStatusRequest(
	param?: PartialDeep<LINETypes.GetResponseStatusRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.botMid],
	];
}
export function WebLoginRequest(
	param?: PartialDeep<LINETypes.WebLoginRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.hookedFullUrl],
		[11, 2, param.sessionString],
		[2, 3, param.fromIAB],
		[11, 4, param.sourceApplication],
	];
}
export function LiffChatContext(
	param?: PartialDeep<LINETypes.LiffChatContext> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
	];
}
export function LiffSquareChatContext(
	param?: PartialDeep<LINETypes.LiffSquareChatContext> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.squareChatMid],
	];
}
export function Qj_C13595l(
	param?: PartialDeep<LINETypes.Qj_C13595l> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		,
		[12, 2, LiffChatContext(param.chat)],
		[12, 3, LiffSquareChatContext(param.squareChat)],
	];
}
export function Qj_EnumC13584a(
	param: LINETypes.Qj_EnumC13584a | undefined,
): LINETypes.Qj_EnumC13584a & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.Qj_EnumC13584a[param]
		: param;
}
export function SKAdNetwork(
	param?: PartialDeep<LINETypes.SKAdNetwork> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.identifiers],
		[11, 2, param.version],
	];
}
export function LiffAdvertisingId(
	param?: PartialDeep<LINETypes.LiffAdvertisingId> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.advertisingId],
		[2, 2, param.tracking],
		[8, 3, Qj_EnumC13584a(param.att)],
		[12, 4, SKAdNetwork(param.skAdNetwork)],
	];
}
export function LiffDeviceSetting(
	param?: PartialDeep<LINETypes.LiffDeviceSetting> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[2, 1, param.videoAutoPlayAllowed],
		[12, 2, LiffAdvertisingId(param.advertisingId)],
	];
}
export function LiffWebLoginRequest(
	param?: PartialDeep<LINETypes.LiffWebLoginRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.hookedFullUrl],
		[11, 2, param.sessionString],
		[12, 3, Qj_C13595l(param.context)],
		[12, 4, LiffDeviceSetting(param.deviceSetting)],
	];
}
export function GetSCCRequest(
	param?: PartialDeep<LINETypes.GetSCCRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.basicSearchId],
	];
}
export function Eh_C8935c(
	param?: PartialDeep<LINETypes.Eh_C8935c> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function NZ0_U(
	param?: PartialDeep<LINETypes.NZ0_U> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function SettingsAttributeEx(
	param: LINETypes.SettingsAttributeEx | undefined,
): LINETypes.SettingsAttributeEx & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.SettingsAttributeEx[param]
		: param;
}
export function GetSmartChannelRecommendationsRequest(
	param?:
		| PartialDeep<LINETypes.GetSmartChannelRecommendationsRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.maxResults],
		[11, 2, param.placement],
		[2, 3, param.testMode],
	];
}
export function GetSquareBotRequest(
	param?: PartialDeep<LINETypes.GetSquareBotRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.botMid],
	];
}
export function Ob1_C12606a0(
	param?: PartialDeep<LINETypes.Ob1_C12606a0> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function Ob1_K1(
	param: LINETypes.Ob1_K1 | undefined,
): LINETypes.Ob1_K1 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Ob1_K1[param] : param;
}
export function GetSubscriptionPlansRequest(
	param?: PartialDeep<LINETypes.GetSubscriptionPlansRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		,
		[8, 2, Ob1_K1(param.storeCode)],
	];
}
export function Ob1_C12618e0(
	param?: PartialDeep<LINETypes.Ob1_C12618e0> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		,
		[11, 2, param.continuationToken],
		[8, 3, param.limit],
		[8, 4, Ob1_O0(param.productType)],
	];
}
export function GetSubscriptionStatusRequest(
	param?: PartialDeep<LINETypes.GetSubscriptionStatusRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[2, 1, param.includeOtherOwnedSubscriptions],
	];
}
export function Ob1_C12630i0(
	param?: PartialDeep<LINETypes.Ob1_C12630i0> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function GetSuggestResourcesV2Request(
	param?: PartialDeep<LINETypes.GetSuggestResourcesV2Request> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Ob1_O0(param.productType)],
		[15, 2, [11, param.productIds]],
	];
}
export function GetTaiwanBankBalanceRequest(
	param?: PartialDeep<LINETypes.GetTaiwanBankBalanceRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.accessToken],
		[11, 2, param.authorizationCode],
		[11, 3, param.codeVerifier],
	];
}
export function GetTargetProfileTarget(
	param?: PartialDeep<LINETypes.GetTargetProfileTarget> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.targetUserMid],
	];
}
export function GetTargetProfilesRequest(
	param?: PartialDeep<LINETypes.GetTargetProfilesRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [
			12,
			param.targetUsers &&
			param.targetUsers.map((e) => GetTargetProfileTarget(e)),
		]],
		[8, 2, Pb1_V7(param.syncReason)],
	];
}
export function NZ0_C12150a0(
	param?: PartialDeep<LINETypes.NZ0_C12150a0> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function GetThaiBankBalanceRequest(
	param?: PartialDeep<LINETypes.GetThaiBankBalanceRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.deviceId],
	];
}
export function GetTotalCoinBalanceRequest(
	param?: PartialDeep<LINETypes.GetTotalCoinBalanceRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, jO0_EnumC27533B(param.appStoreCode)],
	];
}
export function ChannelIdWithLastUpdated(
	param?: PartialDeep<LINETypes.ChannelIdWithLastUpdated> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.channelId],
		[10, 2, param.lastUpdated],
	];
}
export function GetUserCollectionsRequest(
	param?: PartialDeep<LINETypes.GetUserCollectionsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 1, param.lastUpdatedTimeMillis],
		[2, 2, param.includeSummary],
		[8, 3, Ob1_O0(param.productType)],
	];
}
export function GetUserVectorRequest(
	param?: PartialDeep<LINETypes.GetUserVectorRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.majorVersion],
	];
}
export function GetUsersMappedByProfileRequest(
	param?: PartialDeep<LINETypes.GetUsersMappedByProfileRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.profileId],
		[8, 2, Pb1_V7(param.syncReason)],
	];
}
export function InviteFriendsRequest(
	param?: PartialDeep<LINETypes.InviteFriendsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.campaignId],
		[15, 2, [11, param.invitees]],
	];
}
export function InviteIntoChatRequest(
	param?: PartialDeep<LINETypes.InviteIntoChatRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.chatMid],
		[14, 3, [11, param.targetUserMids]],
	];
}
export function IsProductForCollectionsRequest(
	param?: PartialDeep<LINETypes.IsProductForCollectionsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Ob1_O0(param.productType)],
		[11, 2, param.productId],
	];
}
export function IsStickerAvailableForCombinationStickerRequest(
	param?:
		| PartialDeep<LINETypes.IsStickerAvailableForCombinationStickerRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.packageId],
	];
}
export function LiffViewRequest(
	param?: PartialDeep<LINETypes.LiffViewRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.liffId],
		[12, 2, Qj_C13595l(param.context)],
		[11, 3, param.lang],
		[12, 4, LiffDeviceSetting(param.deviceSetting)],
		[11, 5, param.msit],
		[2, 6, param.subsequentLiff],
		[11, 7, param.domain],
	];
}
export function IssueBirthdayGiftTokenRequest(
	param?: PartialDeep<LINETypes.IssueBirthdayGiftTokenRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.recipientUserMid],
	];
}
export function IssueV3TokenForPrimaryRequest(
	param?: PartialDeep<LINETypes.IssueV3TokenForPrimaryRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.udid],
		[11, 2, param.systemDisplayName],
		[11, 3, param.modelName],
	];
}
export function JoinChatByCallUrlRequest(
	param?: PartialDeep<LINETypes.JoinChatByCallUrlRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.urlId],
		[8, 2, param.reqSeq],
	];
}
export function KickoutFromGroupCallRequest(
	param?: PartialDeep<LINETypes.KickoutFromGroupCallRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
		[15, 2, [11, param.targetMids]],
	];
}
export function DeviceLinkRequest(
	param?: PartialDeep<LINETypes.DeviceLinkRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.deviceId],
	];
}
export function LookupAvailableEapRequest(
	param?: PartialDeep<LINETypes.LookupAvailableEapRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
	];
}
export function MapProfileToUsersRequest(
	param?: PartialDeep<LINETypes.MapProfileToUsersRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.profileId],
		[15, 2, [11, param.targetMids]],
	];
}
export function MigratePrimaryUsingQrCodeRequest(
	param?: PartialDeep<LINETypes.MigratePrimaryUsingQrCodeRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
		[11, 2, param.nonce],
	];
}
export function NotifyChatAdEntryRequest(
	param?: PartialDeep<LINETypes.NotifyChatAdEntryRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
		[11, 2, param.scenarioId],
		[11, 3, param.sdata],
	];
}
export function do0_EnumC23148f(
	param: LINETypes.do0_EnumC23148f | undefined,
): LINETypes.do0_EnumC23148f & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.do0_EnumC23148f[param]
		: param;
}
export function do0_EnumC23147e(
	param: LINETypes.do0_EnumC23147e | undefined,
): LINETypes.do0_EnumC23147e & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.do0_EnumC23147e[param]
		: param;
}
export function NotifyDeviceConnectionRequest(
	param?: PartialDeep<LINETypes.NotifyDeviceConnectionRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.deviceId],
		[11, 2, param.connectionId],
		[8, 3, do0_EnumC23148f(param.connectionType)],
		[8, 4, do0_EnumC23147e(param.code)],
		[11, 5, param.errorReason],
		[10, 6, param.startTime],
		[10, 7, param.endTime],
	];
}
export function NotifyDeviceDisconnectionRequest(
	param?: PartialDeep<LINETypes.NotifyDeviceDisconnectionRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.deviceId],
		[11, 2, param.connectionId],
		[10, 4, param.disconnectedTime],
	];
}
export function kf_p(
	param: LINETypes.kf_p | undefined,
): LINETypes.kf_p & number | undefined {
	return typeof param === "string" ? LINETypes.enums.kf_p[param] : param;
}
export function kf_o(
	param: LINETypes.kf_o | undefined,
): LINETypes.kf_o & number | undefined {
	return typeof param === "string" ? LINETypes.enums.kf_o[param] : param;
}
export function OATalkroomEventContext(
	param?: PartialDeep<LINETypes.OATalkroomEventContext> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 1, param.timestampMillis],
		[11, 2, param.botMid],
		[11, 3, param.userMid],
		[8, 4, kf_o(param.os)],
		[11, 5, param.osVersion],
		[11, 6, param.appVersion],
		[11, 7, param.region],
	];
}
export function kf_u(
	param: LINETypes.kf_u | undefined,
): LINETypes.kf_u & number | undefined {
	return typeof param === "string" ? LINETypes.enums.kf_u[param] : param;
}
export function RichmenuCoordinates(
	param?: PartialDeep<LINETypes.RichmenuCoordinates> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[4, 1, param.x],
		[4, 2, param.y],
	];
}
export function kf_r(
	param: LINETypes.kf_r | undefined,
): LINETypes.kf_r & number | undefined {
	return typeof param === "string" ? LINETypes.enums.kf_r[param] : param;
}
export function RichmenuEvent(
	param?: PartialDeep<LINETypes.RichmenuEvent> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, kf_u(param.type)],
		[11, 2, param.richmenuId],
		[12, 3, RichmenuCoordinates(param.coordinates)],
		[8, 4, param.areaIndex],
		[11, 5, param.clickUrl],
		[8, 6, kf_r(param.clickAction)],
	];
}
export function kf_x(
	param: LINETypes.kf_x | undefined,
): LINETypes.kf_x & number | undefined {
	return typeof param === "string" ? LINETypes.enums.kf_x[param] : param;
}
export function kf_w(
	param?: PartialDeep<LINETypes.kf_w> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function TalkroomEnterReferer(
	param?: PartialDeep<LINETypes.TalkroomEnterReferer> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.urlScheme],
		[8, 2, kf_x(param.type)],
		[12, 3, kf_w(param.content)],
	];
}
export function TalkroomEvent(
	param?: PartialDeep<LINETypes.TalkroomEvent> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		,
		[12, 2, TalkroomEnterReferer(param.referer)],
	];
}
export function kf_m(
	param?: PartialDeep<LINETypes.kf_m> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RichmenuEvent(param.richmenu)],
		[12, 2, TalkroomEvent(param.talkroom)],
	];
}
export function OATalkroomEvent(
	param?: PartialDeep<LINETypes.OATalkroomEvent> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.eventId],
		[8, 2, kf_p(param.type)],
		[12, 3, OATalkroomEventContext(param.context)],
		[12, 4, kf_m(param.content)],
	];
}
export function NotifyOATalkroomEventsRequest(
	param?: PartialDeep<LINETypes.NotifyOATalkroomEventsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [12, param.events && param.events.map((e) => OATalkroomEvent(e))]],
	];
}
export function do0_G(
	param: LINETypes.do0_G | undefined,
): LINETypes.do0_G & number | undefined {
	return typeof param === "string" ? LINETypes.enums.do0_G[param] : param;
}
export function do0_m0(
	param?: PartialDeep<LINETypes.do0_m0> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function do0_C23143a(
	param?: PartialDeep<LINETypes.do0_C23143a> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.bytes],
	];
}
export function do0_C23142E(
	param?: PartialDeep<LINETypes.do0_C23142E> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, do0_m0(param.voidResult)],
		[12, 2, do0_C23143a(param.binaryResult)],
	];
}
export function do0_F(
	param?: PartialDeep<LINETypes.do0_F> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.scenarioId],
		[11, 2, param.deviceId],
		[10, 3, param.revision],
		[10, 4, param.startTime],
		[10, 5, param.endTime],
		[8, 6, do0_G(param.code)],
		[11, 7, param.errorReason],
		[11, 8, param.bleNotificationPayload],
		[15, 9, [
			12,
			param.actionResults && param.actionResults.map((e) => do0_C23142E(e)),
		]],
		[11, 10, param.connectionId],
	];
}
export function NotifyScenarioExecutedRequest(
	param?: PartialDeep<LINETypes.NotifyScenarioExecutedRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 2, [
			12,
			param.scenarioResults && param.scenarioResults.map((e) => do0_F(e)),
		]],
	];
}
export function ApplicationType(
	param: LINETypes.ApplicationType | undefined,
): LINETypes.ApplicationType & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.ApplicationType[param]
		: param;
}
export function DeviceInfo(
	param?: PartialDeep<LINETypes.DeviceInfo> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.deviceName],
		[11, 2, param.systemName],
		[11, 3, param.systemVersion],
		[11, 4, param.model],
		[11, 5, param.webViewVersion],
		[8, 10, CarrierCode(param.carrierCode)],
		[11, 11, param.carrierName],
		[8, 20, ApplicationType(param.applicationType)],
	];
}
export function AuthSessionRequest(
	param?: PartialDeep<LINETypes.AuthSessionRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[13, 1, [11, 11, param.metaData]],
	];
}
export function OpenSessionRequest(
	param?: PartialDeep<LINETypes.OpenSessionRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[13, 1, [11, 11, param.metaData]],
	];
}
export function PermitLoginRequest(
	param?: PartialDeep<LINETypes.PermitLoginRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
		[13, 2, [11, 11, param.metaData]],
	];
}
export function Price(
	param?: PartialDeep<LINETypes.Price> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.currency],
		[11, 2, param.amount],
		[11, 3, param.priceString],
	];
}
export function PurchaseOrder(
	param?: PartialDeep<LINETypes.PurchaseOrder> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.shopId],
		[11, 2, param.productId],
		[11, 5, param.recipientMid],
		[12, 11, Price(param.price)],
		[2, 12, param.enableLinePointAutoExchange],
		[12, 21, Locale(param.locale)],
		[13, 31, [11, 11, param.presentAttributes]],
	];
}
export function PurchaseSubscriptionRequest(
	param?: PartialDeep<LINETypes.PurchaseSubscriptionRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.billingItemId],
		,
		[8, 3, Ob1_K1(param.storeCode)],
		[11, 4, param.storeOrderId],
		[2, 5, param.outsideAppPurchase],
		[2, 6, param.unavailableItemPurchase],
	];
}
export function PutE2eeKeyRequest(
	param?: PartialDeep<LINETypes.PutE2eeKeyRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
		[13, 2, [11, 11, param.e2eeKey]],
	];
}
export function ReactRequest(
	param?: PartialDeep<LINETypes.ReactRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[10, 2, param.messageId],
		[12, 3, ReactionType(param.reactionType)],
	];
}
export function RefreshAccessTokenRequest(
	param?: PartialDeep<LINETypes.RefreshAccessTokenRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.refreshToken],
	];
}
export function RSAEncryptedPassword(
	param?: PartialDeep<LINETypes.RSAEncryptedPassword> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.encrypted],
		[11, 2, param.keyName],
	];
}
export function RegisterCampaignRewardRequest(
	param?: PartialDeep<LINETypes.RegisterCampaignRewardRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.campaignId],
	];
}
export function Pb1_C13097n4(
	param?: PartialDeep<LINETypes.Pb1_C13097n4> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.version],
		[8, 2, param.keyId],
		[11, 4, param.keyData],
		[10, 5, param.createdTime],
	];
}
export function Pb1_W6(
	param?: PartialDeep<LINETypes.Pb1_W6> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[12, 2, Pb1_C13097n4(param.publicKey)],
		[11, 3, param.blobPayload],
	];
}
export function RegisterPrimaryCredentialRequest(
	param?: PartialDeep<LINETypes.RegisterPrimaryCredentialRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
	];
}
export function ReissueChatTicketRequest(
	param?: PartialDeep<LINETypes.ReissueChatTicketRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.groupMid],
	];
}
export function RejectChatInvitationRequest(
	param?: PartialDeep<LINETypes.RejectChatInvitationRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.chatMid],
	];
}
export function RemoveFollowerRequest(
	param?: PartialDeep<LINETypes.RemoveFollowerRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Pb1_A4(param.followMid)],
	];
}
export function RemoveFromFollowBlacklistRequest(
	param?: PartialDeep<LINETypes.RemoveFromFollowBlacklistRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Pb1_A4(param.followMid)],
	];
}
export function RemoveItemFromCollectionRequest(
	param?: PartialDeep<LINETypes.RemoveItemFromCollectionRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.collectionId],
		[11, 3, param.productId],
		[11, 4, param.itemId],
	];
}
export function RemoveProductFromSubscriptionSlotRequest(
	param?:
		| PartialDeep<LINETypes.RemoveProductFromSubscriptionSlotRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Ob1_O0(param.productType)],
		[11, 2, param.productId],
		,
		[14, 4, [11, param.productIds]],
	];
}
export function Pb1_EnumC13128p7(
	param: LINETypes.Pb1_EnumC13128p7 | undefined,
): LINETypes.Pb1_EnumC13128p7 & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.Pb1_EnumC13128p7[param]
		: param;
}
export function AbuseMessage(
	param?: PartialDeep<LINETypes.AbuseMessage> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 1, param.messageId],
		[11, 2, param.message],
		[11, 3, param.senderMid],
		[8, 4, ContentType(param.contentType)],
		[10, 5, param.createdTime],
		[13, 6, [11, 11, param.metadata]],
	];
}
export function AbuseReport(
	param?: PartialDeep<LINETypes.AbuseReport> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_EnumC13128p7(param.reportSource)],
		[8, 2, ApplicationType(param.applicationType)],
		[15, 3, [8, param.spammerReasons]],
		[15, 4, [
			12,
			param.abuseMessages && param.abuseMessages.map((e) => AbuseMessage(e)),
		]],
		[13, 5, [11, 11, param.metadata]],
	];
}
export function EvidenceId(
	param?: PartialDeep<LINETypes.EvidenceId> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.spaceId],
		[11, 2, param.objectId],
	];
}
export function AbuseReportLineMeeting(
	param?: PartialDeep<LINETypes.AbuseReportLineMeeting> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.reporteeMid],
		[15, 2, [8, param.spammerReasons]],
		[15, 3, [
			12,
			param.evidenceIds && param.evidenceIds.map((e) => EvidenceId(e)),
		]],
		[11, 4, param.chatMid],
	];
}
export function Pb1_C12938c(
	param?: PartialDeep<LINETypes.Pb1_C12938c> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AbuseReport(param.message)],
		[12, 2, AbuseReportLineMeeting(param.lineMeeting)],
	];
}
export function ReportAbuseExRequest(
	param?: PartialDeep<LINETypes.ReportAbuseExRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Pb1_C12938c(param.abuseReportEntry)],
	];
}
export function BeaconData(
	param?: PartialDeep<LINETypes.BeaconData> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.hwid],
		[8, 2, param.rssi],
		[8, 3, param.txPower],
		[10, 4, param.scannedTimestampMs],
	];
}
export function Geolocation(
	param?: PartialDeep<LINETypes.Geolocation> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[4, 1, param.longitude],
		[4, 2, param.latitude],
		[12, 3, GeolocationAccuracy(param.accuracy)],
		[4, 4, param.altitudeMeters],
		[4, 5, param.velocityMetersPerSecond],
		[4, 6, param.bearingDegrees],
		[15, 7, [
			12,
			param.beaconData && param.beaconData.map((e) => BeaconData(e)),
		]],
	];
}
export function Pb1_EnumC12917a6(
	param: LINETypes.Pb1_EnumC12917a6 | undefined,
): LINETypes.Pb1_EnumC12917a6 & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.Pb1_EnumC12917a6[param]
		: param;
}
export function Pb1_EnumC12998g3(
	param: LINETypes.Pb1_EnumC12998g3 | undefined,
): LINETypes.Pb1_EnumC12998g3 & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.Pb1_EnumC12998g3[param]
		: param;
}
export function WifiSignal(
	param?: PartialDeep<LINETypes.WifiSignal> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.ssid],
		[11, 3, param.bssid],
		[11, 4, param.wifiStandard],
		[4, 5, param.frequency],
		[10, 10, param.lastSeenTimestamp],
		[8, 11, param.rssi],
	];
}
export function ClientNetworkStatus(
	param?: PartialDeep<LINETypes.ClientNetworkStatus> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_EnumC12998g3(param.networkType)],
		[15, 2, [
			12,
			param.wifiSignals && param.wifiSignals.map((e) => WifiSignal(e)),
		]],
	];
}
export function Pb1_F6(
	param: LINETypes.Pb1_F6 | undefined,
): LINETypes.Pb1_F6 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_F6[param] : param;
}
export function PoiInfo(
	param?: PartialDeep<LINETypes.PoiInfo> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.poiId],
		[8, 2, Pb1_F6(param.poiRealm)],
	];
}
export function LocationDebugInfo(
	param?: PartialDeep<LINETypes.LocationDebugInfo> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, PoiInfo(param.poiInfo)],
	];
}
export function AvatarProfile(
	param?: PartialDeep<LINETypes.AvatarProfile> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.version],
		[10, 2, param.updatedMillis],
		[11, 3, param.thumbnail],
		[2, 4, param.usablePublicly],
	];
}
export function Pb1_N6(
	param: LINETypes.Pb1_N6 | undefined,
): LINETypes.Pb1_N6 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_N6[param] : param;
}
export function Pb1_O6(
	param: LINETypes.Pb1_O6 | undefined,
): LINETypes.Pb1_O6 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_O6[param] : param;
}
export function Profile(
	param?: PartialDeep<LINETypes.Profile> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.mid],
		[11, 3, param.userid],
		[11, 10, param.phone],
		[11, 11, param.email],
		[11, 12, param.regionCode],
		[11, 20, param.displayName],
		[11, 21, param.phoneticName],
		[11, 22, param.pictureStatus],
		[11, 23, param.thumbnailUrl],
		[11, 24, param.statusMessage],
		[2, 31, param.allowSearchByUserid],
		[2, 32, param.allowSearchByEmail],
		[11, 33, param.picturePath],
		[11, 34, param.musicProfile],
		[11, 35, param.videoProfile],
		[13, 36, [11, 11, param.statusMessageContentMetadata]],
		[12, 37, AvatarProfile(param.avatarProfile)],
		[2, 38, param.nftProfile],
		[8, 39, Pb1_N6(param.pictureSource)],
		[11, 40, param.profileId],
		[8, 41, Pb1_O6(param.profileType)],
		[10, 42, param.createdTimeMillis],
	];
}
export function Pb1_EnumC13009h0(
	param: LINETypes.Pb1_EnumC13009h0 | undefined,
): LINETypes.Pb1_EnumC13009h0 & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.Pb1_EnumC13009h0[param]
		: param;
}
export function PushRecvReport(
	param?: PartialDeep<LINETypes.PushRecvReport> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.pushTrackingId],
		[10, 2, param.recvTimestamp],
		[8, 3, param.battery],
		[8, 4, Pb1_EnumC13009h0(param.batteryMode)],
		[8, 5, Pb1_EnumC12998g3(param.clientNetworkType)],
		[11, 6, param.carrierCode],
		[10, 7, param.displayTimestamp],
	];
}
export function ReportRefreshedAccessTokenRequest(
	param?: PartialDeep<LINETypes.ReportRefreshedAccessTokenRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.accessToken],
	];
}
export function EmailConfirmationStatus(
	param: LINETypes.EmailConfirmationStatus | undefined,
): LINETypes.EmailConfirmationStatus & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.EmailConfirmationStatus[param]
		: param;
}
export function AccountMigrationPincodeType(
	param: LINETypes.AccountMigrationPincodeType | undefined,
): LINETypes.AccountMigrationPincodeType & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.AccountMigrationPincodeType[param]
		: param;
}
export function Pb1_I6(
	param: LINETypes.Pb1_I6 | undefined,
): LINETypes.Pb1_I6 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_I6[param] : param;
}
export function Pb1_S7(
	param: LINETypes.Pb1_S7 | undefined,
): LINETypes.Pb1_S7 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_S7[param] : param;
}
export function Pb1_M6(
	param: LINETypes.Pb1_M6 | undefined,
): LINETypes.Pb1_M6 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_M6[param] : param;
}
export function Pb1_gd(
	param: LINETypes.Pb1_gd | undefined,
): LINETypes.Pb1_gd & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_gd[param] : param;
}
export function Settings(
	param?: PartialDeep<LINETypes.Settings> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[2, 10, param.notificationEnable],
		[10, 11, param.notificationMuteExpiration],
		[2, 12, param.notificationNewMessage],
		[2, 13, param.notificationGroupInvitation],
		[2, 14, param.notificationShowMessage],
		[2, 15, param.notificationIncomingCall],
		[11, 16, param.notificationSoundMessage],
		[11, 17, param.notificationSoundGroup],
		[2, 18, param.notificationDisabledWithSub],
		[2, 19, param.notificationPayment],
		[2, 20, param.privacySyncContacts],
		[2, 21, param.privacySearchByPhoneNumber],
		[2, 22, param.privacySearchByUserid],
		[2, 23, param.privacySearchByEmail],
		[2, 24, param.privacyAllowSecondaryDeviceLogin],
		[2, 25, param.privacyProfileImagePostToMyhome],
		[2, 26, param.privacyReceiveMessagesFromNotFriend],
		[2, 27, param.privacyAgreeUseLineCoinToPaidCall],
		[2, 28, param.privacyAgreeUsePaidCall],
		[2, 29, param.privacyAllowFriendRequest],
		[11, 30, param.contactMyTicket],
		[8, 40, IdentityProvider(param.identityProvider)],
		[11, 41, param.identityIdentifier],
		[13, 42, [8, 11, param.snsAccounts]],
		[2, 43, param.phoneRegistration],
		[8, 44, EmailConfirmationStatus(param.emailConfirmationStatus)],
		[8, 45, AccountMigrationPincodeType(param.accountMigrationPincodeType)],
		[2, 46, param.enforcedInputAccountMigrationPincode],
		[8, 47, AccountMigrationPincodeType(param.securityCenterSettingsType)],
		[2, 48, param.allowUnregistrationSecondaryDevice],
		[2, 49, param.pwlessPrimaryCredentialRegistration],
		[11, 50, param.preferenceLocale],
		[13, 60, [8, 11, param.customModes]],
		[2, 61, param.e2eeEnable],
		[2, 62, param.hitokotoBackupRequested],
		[2, 63, param.privacyProfileMusicPostToMyhome],
		[2, 65, param.privacyAllowNearby],
		[10, 66, param.agreementNearbyTime],
		[10, 67, param.agreementSquareTime],
		[2, 68, param.notificationMention],
		[10, 69, param.botUseAgreementAcceptedAt],
		[10, 70, param.agreementShakeFunction],
		[10, 71, param.agreementMobileContactName],
		[2, 72, param.notificationThumbnail],
		[10, 73, param.agreementSoundToText],
		[11, 74, param.privacyPolicyVersion],
		[10, 75, param.agreementAdByWebAccess],
		[10, 76, param.agreementPhoneNumberMatching],
		[10, 77, param.agreementCommunicationInfo],
		[8, 78, Pb1_I6(param.privacySharePersonalInfoToFriends)],
		[10, 79, param.agreementThingsWirelessCommunication],
		[10, 80, param.agreementGdpr],
		[8, 81, Pb1_S7(param.privacyStatusMessageHistory)],
		[10, 82, param.agreementProvideLocation],
		[10, 83, param.agreementBeacon],
		[8, 85, Pb1_M6(param.privacyAllowProfileHistory)],
		[10, 86, param.agreementContentsSuggest],
		[10, 87, param.agreementContentsSuggestDataCollection],
		[8, 88, Pb1_gd(param.privacyAgeResult)],
		[2, 89, param.privacyAgeResultReceived],
		[10, 90, param.agreementOcrImageCollection],
		[2, 91, param.privacyAllowFollow],
		[2, 92, param.privacyShowFollowList],
		[2, 93, param.notificationBadgeTalkOnly],
		[10, 94, param.agreementIcna],
		[2, 95, param.notificationReaction],
		[10, 96, param.agreementMid],
		[2, 97, param.homeNotificationNewFriend],
		[2, 98, param.homeNotificationFavoriteFriendUpdate],
		[2, 99, param.homeNotificationGroupMemberUpdate],
		[2, 100, param.homeNotificationBirthday],
		[13, 101, [8, 2, param.eapAllowedToConnect]],
		[10, 102, param.agreementLineOutUse],
		[10, 103, param.agreementLineOutProvideInfo],
		[2, 104, param.notificationShowProfileImage],
		[10, 105, param.agreementPdpa],
		[11, 106, param.agreementLocationVersion],
		[2, 107, param.zhdPageAllowedToShow],
		[10, 108, param.agreementSnowAiAvatar],
		[2, 109, param.eapOnlyAccountTargetCountry],
		[10, 110, param.agreementLypPremiumAlbum],
		[10, 112, param.agreementLypPremiumAlbumVersion],
		[10, 113, param.agreementAlbumUsageData],
		[10, 114, param.agreementAlbumUsageDataVersion],
		[10, 115, param.agreementLypPremiumBackup],
		[10, 116, param.agreementLypPremiumBackupVersion],
		[10, 117, param.agreementOaAiAssistant],
		[10, 118, param.agreementOaAiAssistantVersion],
		[10, 119, param.agreementLypPremiumMultiProfile],
		[10, 120, param.agreementLypPremiumMultiProfileVersion],
	];
}
export function Pb1_od(
	param: LINETypes.Pb1_od | undefined,
): LINETypes.Pb1_od & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_od[param] : param;
}
export function T70_K(
	param: LINETypes.T70_K | undefined,
): LINETypes.T70_K & number | undefined {
	return typeof param === "string" ? LINETypes.enums.T70_K[param] : param;
}
export function ReqToSendPhonePinCodeRequest(
	param?: PartialDeep<LINETypes.ReqToSendPhonePinCodeRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, UserPhoneNumber(param.userPhoneNumber)],
		[8, 3, T70_K(param.verifMethod)],
	];
}
export function r80_g0(
	param: LINETypes.r80_g0 | undefined,
): LINETypes.r80_g0 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.r80_g0[param] : param;
}
export function CoinPurchaseReservation(
	param?: PartialDeep<LINETypes.CoinPurchaseReservation> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.productId],
		[11, 2, param.country],
		[11, 3, param.currency],
		[11, 4, param.price],
		[8, 5, jO0_EnumC27533B(param.appStoreCode)],
		[11, 6, param.language],
		[8, 7, jO0_EnumC27559z(param.pgCode)],
		[11, 8, param.redirectUrl],
	];
}
export function fN0_G(
	param: LINETypes.fN0_G | undefined,
): LINETypes.fN0_G & number | undefined {
	return typeof param === "string" ? LINETypes.enums.fN0_G[param] : param;
}
export function ReserveSubscriptionPurchaseRequest(
	param?: PartialDeep<LINETypes.ReserveSubscriptionPurchaseRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.billingItemId],
		[8, 2, fN0_G(param.storeCode)],
		[2, 3, param.addOaFriend],
		[11, 4, param.entryPoint],
		[11, 5, param.campaignId],
		[11, 6, param.invitationId],
	];
}
export function ReserveRequest(
	param?: PartialDeep<LINETypes.ReserveRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.uniqueKey],
	];
}
export function Pb1_C13155r7(
	param?: PartialDeep<LINETypes.Pb1_C13155r7> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.restoreClaim],
	];
}
export function Pb1_C13183t7(
	param?: PartialDeep<LINETypes.Pb1_C13183t7> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function RevokeTokensRequest(
	param?: PartialDeep<LINETypes.RevokeTokensRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [11, param.accessTokens]],
	];
}
export function StudentInformation(
	param?: PartialDeep<LINETypes.StudentInformation> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.schoolName],
		[11, 2, param.graduationDate],
	];
}
export function SaveStudentInformationRequest(
	param?: PartialDeep<LINETypes.SaveStudentInformationRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, StudentInformation(param.studentInformation)],
	];
}
export function SendEncryptedE2EEKeyRequest(
	param?: PartialDeep<LINETypes.SendEncryptedE2EEKeyRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
	];
}
export function SendPostbackRequest(
	param?: PartialDeep<LINETypes.SendPostbackRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.messageId],
		[11, 2, param.url],
		[11, 3, param.chatMID],
		[11, 4, param.originMID],
	];
}
export function SetChatHiddenStatusRequest(
	param?: PartialDeep<LINETypes.SetChatHiddenStatusRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.chatMid],
		[10, 3, param.lastMessageId],
		[2, 4, param.hidden],
	];
}
export function SetHashedPasswordRequest(
	param?: PartialDeep<LINETypes.SetHashedPasswordRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[11, 2, param.password],
	];
}
export function SetPasswordRequest(
	param?: PartialDeep<LINETypes.SetPasswordRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
		[11, 2, param.hashedPassword],
	];
}
export function Ob1_C12660s1(
	param?: PartialDeep<LINETypes.Ob1_C12660s1> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function StartPhotoboothRequest(
	param?: PartialDeep<LINETypes.StartPhotoboothRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
	];
}
export function SIMInfo(
	param?: PartialDeep<LINETypes.SIMInfo> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.phoneNumber],
		[11, 2, param.countryCode],
	];
}
export function StopBundleSubscriptionRequest(
	param?: PartialDeep<LINETypes.StopBundleSubscriptionRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		,
		[8, 2, Ob1_K1(param.storeCode)],
	];
}
export function Qj_e0(
	param: LINETypes.Qj_e0 | undefined,
): LINETypes.Qj_e0 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Qj_e0[param] : param;
}
export function ShareTargetPickerResultRequest(
	param?: PartialDeep<LINETypes.ShareTargetPickerResultRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.ott],
		[11, 2, param.liffId],
		[8, 3, Qj_e0(param.resultCode)],
		[11, 4, param.resultDescription],
	];
}
export function SubWindowResultRequest(
	param?: PartialDeep<LINETypes.SubWindowResultRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.msit],
		[11, 2, param.mstVerifier],
	];
}
export function Pb1_EnumC13029i6(
	param: LINETypes.Pb1_EnumC13029i6 | undefined,
): LINETypes.Pb1_EnumC13029i6 & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.Pb1_EnumC13029i6[param]
		: param;
}
export function ContactModification(
	param?: PartialDeep<LINETypes.ContactModification> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_EnumC13029i6(param.type)],
		[11, 2, param.luid],
		[15, 11, [11, param.phones]],
		[15, 12, [11, param.emails]],
		[15, 13, [11, param.userids]],
		[11, 14, param.mobileContactName],
		[11, 15, param.phoneticName],
	];
}
export function Pb1_J4(
	param: LINETypes.Pb1_J4 | undefined,
): LINETypes.Pb1_J4 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_J4[param] : param;
}
export function SyncRequest(
	param?: PartialDeep<LINETypes.SyncRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 1, param.lastRevision],
		[8, 2, param.count],
		[10, 3, param.lastGlobalRevision],
		[10, 4, param.lastIndividualRevision],
		[8, 5, Pb1_J4(param.fullSyncRequestReason)],
		[13, 6, [8, 10, param.lastPartialFullSyncs]],
	];
}
export function Pb1_G4(
	param: LINETypes.Pb1_G4 | undefined,
): LINETypes.Pb1_G4 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_G4[param] : param;
}
export function UnfollowRequest(
	param?: PartialDeep<LINETypes.UnfollowRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Pb1_A4(param.followMid)],
	];
}
export function DeviceUnlinkRequest(
	param?: PartialDeep<LINETypes.DeviceUnlinkRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.deviceId],
	];
}
export function ChannelNotificationSetting(
	param?: PartialDeep<LINETypes.ChannelNotificationSetting> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.channelId],
		[11, 2, param.name],
		[2, 3, param.notificationReceivable],
		[2, 4, param.messageReceivable],
		[2, 5, param.showDefault],
	];
}
export function ChannelSettings(
	param?: PartialDeep<LINETypes.ChannelSettings> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[2, 1, param.unapprovedMessageReceivable],
	];
}
export function GroupExtra(
	param?: PartialDeep<LINETypes.GroupExtra> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.creator],
		[2, 2, param.preventedJoinByTicket],
		[11, 3, param.invitationTicket],
		[13, 4, [11, 10, param.memberMids]],
		[13, 5, [11, 10, param.inviteeMids]],
		[2, 6, param.addFriendDisabled],
		[2, 7, param.ticketDisabled],
		[2, 8, param.autoName],
	];
}
export function Pb1_A6(
	param?: PartialDeep<LINETypes.Pb1_A6> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function Pb1_C13208v4(
	param?: PartialDeep<LINETypes.Pb1_C13208v4> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GroupExtra(param.groupExtra)],
		[12, 2, Pb1_A6(param.peerExtra)],
	];
}
export function Chat(
	param?: PartialDeep<LINETypes.Chat> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_Z2(param.type)],
		[11, 2, param.chatMid],
		[10, 3, param.createdTime],
		[2, 4, param.notificationDisabled],
		[10, 5, param.favoriteTimestamp],
		[11, 6, param.chatName],
		[11, 7, param.picturePath],
		[12, 8, Pb1_C13208v4(param.extra)],
	];
}
export function Pb1_O2(
	param: LINETypes.Pb1_O2 | undefined,
): LINETypes.Pb1_O2 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_O2[param] : param;
}
export function UpdateChatRequest(
	param?: PartialDeep<LINETypes.UpdateChatRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[12, 2, Chat(param.chat)],
		[8, 3, Pb1_O2(param.updatedAttribute)],
	];
}
export function ContactSetting(
	param: LINETypes.ContactSetting | undefined,
): LINETypes.ContactSetting & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.ContactSetting[param]
		: param;
}
export function Pb1_H6(
	param: LINETypes.Pb1_H6 | undefined,
): LINETypes.Pb1_H6 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.Pb1_H6[param] : param;
}
export function ExtendedProfileBirthday(
	param?: PartialDeep<LINETypes.ExtendedProfileBirthday> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.year],
		[8, 2, Pb1_H6(param.yearPrivacyLevelType)],
		[2, 3, param.yearEnabled],
		[11, 5, param.day],
		[8, 6, Pb1_H6(param.dayPrivacyLevelType)],
		[2, 7, param.dayEnabled],
	];
}
export function ExtendedProfile(
	param?: PartialDeep<LINETypes.ExtendedProfile> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ExtendedProfileBirthday(param.birthday)],
	];
}
export function Pb1_ad(
	param?: PartialDeep<LINETypes.Pb1_ad> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.title],
	];
}
export function UpdateGroupCallUrlRequest(
	param?: PartialDeep<LINETypes.UpdateGroupCallUrlRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.urlId],
		[12, 2, Pb1_ad(param.targetAttribute)],
	];
}
export function NotificationType(
	param: LINETypes.NotificationType | undefined,
): LINETypes.NotificationType & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.NotificationType[param]
		: param;
}
export function UpdatePasswordRequest(
	param?: PartialDeep<LINETypes.UpdatePasswordRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
		[11, 2, param.hashedPassword],
	];
}
export function ProfileContent(
	param?: PartialDeep<LINETypes.ProfileContent> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.value],
		[13, 2, [11, 11, param.meta]],
	];
}
export function UpdateProfileAttributesRequest(
	param?: PartialDeep<LINETypes.UpdateProfileAttributesRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[13, 1, [8, 12, map(ProfileContent, param.profileAttributes)]],
	];
}
export function vh_m(
	param: LINETypes.vh_m | undefined,
): LINETypes.vh_m & number | undefined {
	return typeof param === "string" ? LINETypes.enums.vh_m[param] : param;
}
export function UpdateSafetyStatusRequest(
	param?: PartialDeep<LINETypes.UpdateSafetyStatusRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.disasterId],
		[8, 2, vh_m(param.safetyStatus)],
		[11, 3, param.message],
	];
}
export function UsePhotoboothTicketRequest(
	param?: PartialDeep<LINETypes.UsePhotoboothTicketRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.chatMid],
		[11, 2, param.photoboothSessionId],
	];
}
export function r80_EnumC34376p(
	param: LINETypes.r80_EnumC34376p | undefined,
): LINETypes.r80_EnumC34376p & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.r80_EnumC34376p[param]
		: param;
}
export function VerifyAccountUsingHashedPwdRequest(
	param?: PartialDeep<LINETypes.VerifyAccountUsingHashedPwdRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, AccountIdentifier(param.accountIdentifier)],
		[11, 3, param.v1HashedPassword],
		[11, 4, param.clientHashedPassword],
	];
}
export function VerifyAssertionRequest(
	param?: PartialDeep<LINETypes.VerifyAssertionRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
		[11, 2, param.credentialId],
		[11, 3, param.assertionObject],
		[11, 4, param.clientDataJSON],
	];
}
export function VerifyAttestationRequest(
	param?: PartialDeep<LINETypes.VerifyAttestationRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.sessionId],
		[11, 2, param.attestationObject],
		[11, 3, param.clientDataJSON],
	];
}
export function BirthdayGiftAssociationVerifyRequest(
	param?:
		| PartialDeep<LINETypes.BirthdayGiftAssociationVerifyRequest>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.associationToken],
	];
}
export function T70_j1(
	param: LINETypes.T70_j1 | undefined,
): LINETypes.T70_j1 & number | undefined {
	return typeof param === "string" ? LINETypes.enums.T70_j1[param] : param;
}
export function SocialLogin(
	param?: PartialDeep<LINETypes.SocialLogin> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, T70_j1(param.type)],
		[11, 2, param.accessToken],
		[11, 3, param.countryCode],
	];
}
export function a80_EnumC16644b(
	param: LINETypes.a80_EnumC16644b | undefined,
): LINETypes.a80_EnumC16644b & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.a80_EnumC16644b[param]
		: param;
}
export function EapLogin(
	param?: PartialDeep<LINETypes.EapLogin> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, a80_EnumC16644b(param.type)],
		[11, 2, param.accessToken],
		[11, 3, param.countryCode],
	];
}
export function VerifyEapLoginRequest(
	param?: PartialDeep<LINETypes.VerifyEapLoginRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, EapLogin(param.eapLogin)],
	];
}
export function VerifyPhonePinCodeRequest(
	param?: PartialDeep<LINETypes.VerifyPhonePinCodeRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, UserPhoneNumber(param.userPhoneNumber)],
		[11, 3, param.pinCode],
	];
}
export function VerifyPinCodeRequest(
	param?: PartialDeep<LINETypes.VerifyPinCodeRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.pinCode],
	];
}
export function VerifyQrCodeRequest(
	param?: PartialDeep<LINETypes.VerifyQrCodeRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[13, 2, [11, 11, param.metaData]],
	];
}
export function acceptChatInvitationByTicket_args(
	param?: PartialDeep<LINETypes.acceptChatInvitationByTicket_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AcceptChatInvitationByTicketRequest(param.request)],
	];
}
export function acceptChatInvitation_args(
	param?: PartialDeep<LINETypes.acceptChatInvitation_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AcceptChatInvitationRequest(param.request)],
	];
}
export function SquareService_acceptSpeakers_args(
	param?: PartialDeep<LINETypes.SquareService_acceptSpeakers_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AcceptSpeakersRequest(param.request)],
	];
}
export function SquareService_acceptToChangeRole_args(
	param?:
		| PartialDeep<LINETypes.SquareService_acceptToChangeRole_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AcceptToChangeRoleRequest(param.request)],
	];
}
export function SquareService_acceptToListen_args(
	param?: PartialDeep<LINETypes.SquareService_acceptToListen_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AcceptToListenRequest(param.request)],
	];
}
export function SquareService_acceptToSpeak_args(
	param?: PartialDeep<LINETypes.SquareService_acceptToSpeak_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AcceptToSpeakRequest(param.request)],
	];
}
export function SquareService_acquireLiveTalk_args(
	param?: PartialDeep<LINETypes.SquareService_acquireLiveTalk_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AcquireLiveTalkRequest(param.request)],
	];
}
export function SquareService_cancelToSpeak_args(
	param?: PartialDeep<LINETypes.SquareService_cancelToSpeak_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CancelToSpeakRequest(param.request)],
	];
}
export function SquareService_fetchLiveTalkEvents_args(
	param?:
		| PartialDeep<LINETypes.SquareService_fetchLiveTalkEvents_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, FetchLiveTalkEventsRequest(param.request)],
	];
}
export function SquareService_findLiveTalkByInvitationTicket_args(
	param?:
		| PartialDeep<LINETypes.SquareService_findLiveTalkByInvitationTicket_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, FindLiveTalkByInvitationTicketRequest(param.request)],
	];
}
export function SquareService_forceEndLiveTalk_args(
	param?:
		| PartialDeep<LINETypes.SquareService_forceEndLiveTalk_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ForceEndLiveTalkRequest(param.request)],
	];
}
export function SquareService_getLiveTalkInfoForNonMember_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getLiveTalkInfoForNonMember_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetLiveTalkInfoForNonMemberRequest(param.request)],
	];
}
export function SquareService_getLiveTalkInvitationUrl_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getLiveTalkInvitationUrl_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetLiveTalkInvitationUrlRequest(param.request)],
	];
}
export function SquareService_getLiveTalkSpeakersForNonMember_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getLiveTalkSpeakersForNonMember_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetLiveTalkSpeakersForNonMemberRequest(param.request)],
	];
}
export function SquareService_getSquareInfoByChatMid_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareInfoByChatMid_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareInfoByChatMidRequest(param.request)],
	];
}
export function SquareService_inviteToChangeRole_args(
	param?:
		| PartialDeep<LINETypes.SquareService_inviteToChangeRole_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, InviteToChangeRoleRequest(param.request)],
	];
}
export function SquareService_inviteToListen_args(
	param?: PartialDeep<LINETypes.SquareService_inviteToListen_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, InviteToListenRequest(param.request)],
	];
}
export function SquareService_inviteToLiveTalk_args(
	param?:
		| PartialDeep<LINETypes.SquareService_inviteToLiveTalk_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, InviteToLiveTalkRequest(param.request)],
	];
}
export function SquareService_inviteToSpeak_args(
	param?: PartialDeep<LINETypes.SquareService_inviteToSpeak_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, InviteToSpeakRequest(param.request)],
	];
}
export function SquareService_joinLiveTalk_args(
	param?: PartialDeep<LINETypes.SquareService_joinLiveTalk_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, JoinLiveTalkRequest(param.request)],
	];
}
export function SquareService_kickOutLiveTalkParticipants_args(
	param?:
		| PartialDeep<LINETypes.SquareService_kickOutLiveTalkParticipants_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, KickOutLiveTalkParticipantsRequest(param.request)],
	];
}
export function SquareService_rejectSpeakers_args(
	param?: PartialDeep<LINETypes.SquareService_rejectSpeakers_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RejectSpeakersRequest(param.request)],
	];
}
export function SquareService_rejectToSpeak_args(
	param?: PartialDeep<LINETypes.SquareService_rejectToSpeak_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RejectToSpeakRequest(param.request)],
	];
}
export function SquareService_removeLiveTalkSubscription_args(
	param?:
		| PartialDeep<LINETypes.SquareService_removeLiveTalkSubscription_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RemoveLiveTalkSubscriptionRequest(param.request)],
	];
}
export function SquareService_reportLiveTalk_args(
	param?: PartialDeep<LINETypes.SquareService_reportLiveTalk_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReportLiveTalkRequest(param.request)],
	];
}
export function SquareService_reportLiveTalkSpeaker_args(
	param?:
		| PartialDeep<LINETypes.SquareService_reportLiveTalkSpeaker_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReportLiveTalkSpeakerRequest(param.request)],
	];
}
export function SquareService_requestToListen_args(
	param?: PartialDeep<LINETypes.SquareService_requestToListen_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RequestToListenRequest(param.request)],
	];
}
export function SquareService_requestToSpeak_args(
	param?: PartialDeep<LINETypes.SquareService_requestToSpeak_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RequestToSpeakRequest(param.request)],
	];
}
export function SquareService_updateLiveTalkAttrs_args(
	param?:
		| PartialDeep<LINETypes.SquareService_updateLiveTalkAttrs_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UpdateLiveTalkAttrsRequest(param.request)],
	];
}
export function acquireCallRoute_args(
	param?: PartialDeep<LINETypes.acquireCallRoute_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.to],
		[8, 3, Pb1_D4(param.callType)],
		[13, 4, [11, 11, param.fromEnvInfo]],
	];
}
export function acquireEncryptedAccessToken_args(
	param?: PartialDeep<LINETypes.acquireEncryptedAccessToken_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 2, Pb1_EnumC13222w4(param.featureType)],
	];
}
export function acquireGroupCallRoute_args(
	param?: PartialDeep<LINETypes.acquireGroupCallRoute_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.chatMid],
		[8, 3, Pb1_EnumC13237x5(param.mediaType)],
		[2, 4, param.isInitialHost],
		[15, 5, [11, param.capabilities]],
	];
}
export function acquireOACallRoute_args(
	param?: PartialDeep<LINETypes.acquireOACallRoute_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, AcquireOACallRouteRequest(param.request)],
	];
}
export function acquirePaidCallRoute_args(
	param?: PartialDeep<LINETypes.acquirePaidCallRoute_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 2, PaidCallType(param.paidCallType)],
		[11, 3, param.dialedNumber],
		[11, 4, param.language],
		[11, 5, param.networkCode],
		[2, 6, param.disableCallerId],
		[11, 7, param.referer],
		[11, 8, param.adSessionId],
	];
}
export function activateSubscription_args(
	param?: PartialDeep<LINETypes.activateSubscription_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ActivateSubscriptionRequest(param.request)],
	];
}
export function adTypeOptOutClickEvent_args(
	param?: PartialDeep<LINETypes.adTypeOptOutClickEvent_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AdTypeOptOutClickEventRequest(param.request)],
	];
}
export function addFriendByMid_args(
	param?: PartialDeep<LINETypes.addFriendByMid_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AddFriendByMidRequest(param.request)],
	];
}
export function addItemToCollection_args(
	param?: PartialDeep<LINETypes.addItemToCollection_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AddItemToCollectionRequest(param.request)],
	];
}
export function addOaFriend_args(
	param?: PartialDeep<LINETypes.addOaFriend_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, NZ0_C12155c(param.request)],
	];
}
export function addProductToSubscriptionSlot_args(
	param?: PartialDeep<LINETypes.addProductToSubscriptionSlot_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, AddProductToSubscriptionSlotRequest(param.req)],
	];
}
export function addThemeToSubscriptionSlot_args(
	param?: PartialDeep<LINETypes.addThemeToSubscriptionSlot_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, AddThemeToSubscriptionSlotRequest(param.req)],
	];
}
export function addToFollowBlacklist_args(
	param?: PartialDeep<LINETypes.addToFollowBlacklist_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, AddToFollowBlacklistRequest(param.addToFollowBlacklistRequest)],
	];
}
export function SquareService_agreeToTerms_args(
	param?: PartialDeep<LINETypes.SquareService_agreeToTerms_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AgreeToTermsRequest(param.request)],
	];
}
export function SquareService_approveSquareMembers_args(
	param?:
		| PartialDeep<LINETypes.SquareService_approveSquareMembers_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ApproveSquareMembersRequest(param.request)],
	];
}
export function SquareService_checkJoinCode_args(
	param?: PartialDeep<LINETypes.SquareService_checkJoinCode_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CheckJoinCodeRequest(param.request)],
	];
}
export function SquareService_createSquareChatAnnouncement_args(
	param?:
		| PartialDeep<LINETypes.SquareService_createSquareChatAnnouncement_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[
			12,
			1,
			CreateSquareChatAnnouncementRequest(
				param.createSquareChatAnnouncementRequest,
			),
		],
	];
}
export function SquareService_createSquareChat_args(
	param?:
		| PartialDeep<LINETypes.SquareService_createSquareChat_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CreateSquareChatRequest(param.request)],
	];
}
export function SquareService_createSquare_args(
	param?: PartialDeep<LINETypes.SquareService_createSquare_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CreateSquareRequest(param.request)],
	];
}
export function SquareService_deleteSquareChatAnnouncement_args(
	param?:
		| PartialDeep<LINETypes.SquareService_deleteSquareChatAnnouncement_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[
			12,
			1,
			DeleteSquareChatAnnouncementRequest(
				param.deleteSquareChatAnnouncementRequest,
			),
		],
	];
}
export function SquareService_deleteSquareChat_args(
	param?:
		| PartialDeep<LINETypes.SquareService_deleteSquareChat_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, DeleteSquareChatRequest(param.request)],
	];
}
export function SquareService_deleteSquare_args(
	param?: PartialDeep<LINETypes.SquareService_deleteSquare_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, DeleteSquareRequest(param.request)],
	];
}
export function SquareService_destroyMessage_args(
	param?: PartialDeep<LINETypes.SquareService_destroyMessage_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, DestroyMessageRequest(param.request)],
	];
}
export function SquareService_destroyMessages_args(
	param?: PartialDeep<LINETypes.SquareService_destroyMessages_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, DestroyMessagesRequest(param.request)],
	];
}
export function SquareService_fetchMyEvents_args(
	param?: PartialDeep<LINETypes.SquareService_fetchMyEvents_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, FetchMyEventsRequest(param.request)],
	];
}
export function SquareService_fetchSquareChatEvents_args(
	param?:
		| PartialDeep<LINETypes.SquareService_fetchSquareChatEvents_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, FetchSquareChatEventsRequest(param.request)],
	];
}
export function SquareService_findSquareByEmid_args(
	param?:
		| PartialDeep<LINETypes.SquareService_findSquareByEmid_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, FindSquareByEmidRequest(param.findSquareByEmidRequest)],
	];
}
export function SquareService_findSquareByInvitationTicket_args(
	param?:
		| PartialDeep<LINETypes.SquareService_findSquareByInvitationTicket_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, FindSquareByInvitationTicketRequest(param.request)],
	];
}
export function SquareService_findSquareByInvitationTicketV2_args(
	param?:
		| PartialDeep<LINETypes.SquareService_findSquareByInvitationTicketV2_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, FindSquareByInvitationTicketV2Request(param.request)],
	];
}
export function SquareService_getGoogleAdOptions_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getGoogleAdOptions_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetGoogleAdOptionsRequest(param.request)],
	];
}
export function SquareService_getInvitationTicketUrl_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getInvitationTicketUrl_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetInvitationTicketUrlRequest(param.request)],
	];
}
export function SquareService_getJoinableSquareChats_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getJoinableSquareChats_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetJoinableSquareChatsRequest(param.request)],
	];
}
export function SquareService_getJoinedSquareChats_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getJoinedSquareChats_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetJoinedSquareChatsRequest(param.request)],
	];
}
export function SquareService_getJoinedSquares_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getJoinedSquares_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetJoinedSquaresRequest(param.request)],
	];
}
export function SquareService_getMessageReactions_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getMessageReactions_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetMessageReactionsRequest(param.request)],
	];
}
export function SquareService_getNoteStatus_args(
	param?: PartialDeep<LINETypes.SquareService_getNoteStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetNoteStatusRequest(param.request)],
	];
}
export function SquareService_getPopularKeywords_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getPopularKeywords_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetPopularKeywordsRequest(param.request)],
	];
}
export function SquareService_getSquareAuthorities_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareAuthorities_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareAuthoritiesRequest(param.request)],
	];
}
export function SquareService_getSquareAuthority_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareAuthority_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareAuthorityRequest(param.request)],
	];
}
export function SquareService_getCategories_args(
	param?: PartialDeep<LINETypes.SquareService_getCategories_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareCategoriesRequest(param.request)],
	];
}
export function SquareService_getSquareChatAnnouncements_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareChatAnnouncements_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[
			12,
			1,
			GetSquareChatAnnouncementsRequest(
				param.getSquareChatAnnouncementsRequest,
			),
		],
	];
}
export function SquareService_getSquareChatEmid_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareChatEmid_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareChatEmidRequest(param.request)],
	];
}
export function SquareService_getSquareChatFeatureSet_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareChatFeatureSet_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareChatFeatureSetRequest(param.request)],
	];
}
export function SquareService_getSquareChatMember_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareChatMember_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareChatMemberRequest(param.request)],
	];
}
export function SquareService_getSquareChatMembers_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareChatMembers_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareChatMembersRequest(param.request)],
	];
}
export function SquareService_getSquareChat_args(
	param?: PartialDeep<LINETypes.SquareService_getSquareChat_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareChatRequest(param.request)],
	];
}
export function SquareService_getSquareChatStatus_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareChatStatus_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareChatStatusRequest(param.request)],
	];
}
export function SquareService_getSquareEmid_args(
	param?: PartialDeep<LINETypes.SquareService_getSquareEmid_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareEmidRequest(param.request)],
	];
}
export function SquareService_getSquareFeatureSet_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareFeatureSet_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareFeatureSetRequest(param.request)],
	];
}
export function SquareService_getSquareMemberRelation_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareMemberRelation_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareMemberRelationRequest(param.request)],
	];
}
export function SquareService_getSquareMemberRelations_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareMemberRelations_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareMemberRelationsRequest(param.request)],
	];
}
export function SquareService_getSquareMember_args(
	param?: PartialDeep<LINETypes.SquareService_getSquareMember_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareMemberRequest(param.request)],
	];
}
export function SquareService_getSquareMembersBySquare_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareMembersBySquare_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareMembersBySquareRequest(param.request)],
	];
}
export function SquareService_getSquareMembers_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareMembers_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareMembersRequest(param.request)],
	];
}
export function SquareService_getSquare_args(
	param?: PartialDeep<LINETypes.SquareService_getSquare_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareRequest(param.request)],
	];
}
export function SquareService_getSquareStatus_args(
	param?: PartialDeep<LINETypes.SquareService_getSquareStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareStatusRequest(param.request)],
	];
}
export function SquareService_getSquareThreadMid_args(
	param?:
		| PartialDeep<LINETypes.SquareService_getSquareThreadMid_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareThreadMidRequest(param.request)],
	];
}
export function SquareService_getSquareThread_args(
	param?: PartialDeep<LINETypes.SquareService_getSquareThread_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareThreadRequest(param.request)],
	];
}
export function SquareService_getUserSettings_args(
	param?: PartialDeep<LINETypes.SquareService_getUserSettings_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetUserSettingsRequest(param.request)],
	];
}
export function SquareService_hideSquareMemberContents_args(
	param?:
		| PartialDeep<LINETypes.SquareService_hideSquareMemberContents_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, HideSquareMemberContentsRequest(param.request)],
	];
}
export function SquareService_inviteIntoSquareChat_args(
	param?:
		| PartialDeep<LINETypes.SquareService_inviteIntoSquareChat_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, InviteIntoSquareChatRequest(param.request)],
	];
}
export function SquareService_inviteToSquare_args(
	param?: PartialDeep<LINETypes.SquareService_inviteToSquare_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, InviteToSquareRequest(param.request)],
	];
}
export function SquareService_joinSquareChat_args(
	param?: PartialDeep<LINETypes.SquareService_joinSquareChat_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, JoinSquareChatRequest(param.request)],
	];
}
export function SquareService_joinSquare_args(
	param?: PartialDeep<LINETypes.SquareService_joinSquare_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, JoinSquareRequest(param.request)],
	];
}
export function SquareService_joinSquareThread_args(
	param?:
		| PartialDeep<LINETypes.SquareService_joinSquareThread_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, JoinSquareThreadRequest(param.request)],
	];
}
export function SquareService_leaveSquareChat_args(
	param?: PartialDeep<LINETypes.SquareService_leaveSquareChat_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, LeaveSquareChatRequest(param.request)],
	];
}
export function SquareService_leaveSquare_args(
	param?: PartialDeep<LINETypes.SquareService_leaveSquare_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, LeaveSquareRequest(param.request)],
	];
}
export function SquareService_leaveSquareThread_args(
	param?:
		| PartialDeep<LINETypes.SquareService_leaveSquareThread_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, LeaveSquareThreadRequest(param.request)],
	];
}
export function SquareService_manualRepair_args(
	param?: PartialDeep<LINETypes.SquareService_manualRepair_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ManualRepairRequest(param.request)],
	];
}
export function SquareService_markAsRead_args(
	param?: PartialDeep<LINETypes.SquareService_markAsRead_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, MarkAsReadRequest(param.request)],
	];
}
export function SquareService_markChatsAsRead_args(
	param?: PartialDeep<LINETypes.SquareService_markChatsAsRead_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, MarkChatsAsReadRequest(param.request)],
	];
}
export function SquareService_markThreadsAsRead_args(
	param?:
		| PartialDeep<LINETypes.SquareService_markThreadsAsRead_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, MarkThreadsAsReadRequest(param.request)],
	];
}
export function SquareService_reactToMessage_args(
	param?: PartialDeep<LINETypes.SquareService_reactToMessage_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReactToMessageRequest(param.request)],
	];
}
export function SquareService_refreshSubscriptions_args(
	param?:
		| PartialDeep<LINETypes.SquareService_refreshSubscriptions_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RefreshSubscriptionsRequest(param.request)],
	];
}
export function SquareService_rejectSquareMembers_args(
	param?:
		| PartialDeep<LINETypes.SquareService_rejectSquareMembers_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RejectSquareMembersRequest(param.request)],
	];
}
export function SquareService_removeSubscriptions_args(
	param?:
		| PartialDeep<LINETypes.SquareService_removeSubscriptions_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RemoveSubscriptionsRequest(param.request)],
	];
}
export function SquareService_reportMessageSummary_args(
	param?:
		| PartialDeep<LINETypes.SquareService_reportMessageSummary_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReportMessageSummaryRequest(param.request)],
	];
}
export function SquareService_reportSquareChat_args(
	param?:
		| PartialDeep<LINETypes.SquareService_reportSquareChat_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReportSquareChatRequest(param.request)],
	];
}
export function SquareService_reportSquareMember_args(
	param?:
		| PartialDeep<LINETypes.SquareService_reportSquareMember_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReportSquareMemberRequest(param.request)],
	];
}
export function SquareService_reportSquareMessage_args(
	param?:
		| PartialDeep<LINETypes.SquareService_reportSquareMessage_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReportSquareMessageRequest(param.request)],
	];
}
export function SquareService_reportSquare_args(
	param?: PartialDeep<LINETypes.SquareService_reportSquare_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReportSquareRequest(param.request)],
	];
}
export function SquareService_searchSquareChatMembers_args(
	param?:
		| PartialDeep<LINETypes.SquareService_searchSquareChatMembers_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, SearchSquareChatMembersRequest(param.request)],
	];
}
export function SquareService_searchSquareChatMentionables_args(
	param?:
		| PartialDeep<LINETypes.SquareService_searchSquareChatMentionables_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, SearchSquareChatMentionablesRequest(param.request)],
	];
}
export function SquareService_searchSquareMembers_args(
	param?:
		| PartialDeep<LINETypes.SquareService_searchSquareMembers_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, SearchSquareMembersRequest(param.request)],
	];
}
export function SquareService_searchSquares_args(
	param?: PartialDeep<LINETypes.SquareService_searchSquares_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, SearchSquaresRequest(param.request)],
	];
}
export function SquareService_sendMessage_args(
	param?: PartialDeep<LINETypes.SquareService_sendMessage_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, SendMessageRequest(param.request)],
	];
}
export function SquareService_sendSquareThreadMessage_args(
	param?:
		| PartialDeep<LINETypes.SquareService_sendSquareThreadMessage_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, SendSquareThreadMessageRequest(param.request)],
	];
}
export function SquareService_syncSquareMembers_args(
	param?:
		| PartialDeep<LINETypes.SquareService_syncSquareMembers_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, SyncSquareMembersRequest(param.request)],
	];
}
export function SquareService_unhideSquareMemberContents_args(
	param?:
		| PartialDeep<LINETypes.SquareService_unhideSquareMemberContents_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UnhideSquareMemberContentsRequest(param.request)],
	];
}
export function SquareService_unsendMessage_args(
	param?: PartialDeep<LINETypes.SquareService_unsendMessage_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UnsendMessageRequest(param.request)],
	];
}
export function SquareService_updateSquareAuthority_args(
	param?:
		| PartialDeep<LINETypes.SquareService_updateSquareAuthority_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UpdateSquareAuthorityRequest(param.request)],
	];
}
export function SquareService_updateSquareChatMember_args(
	param?:
		| PartialDeep<LINETypes.SquareService_updateSquareChatMember_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UpdateSquareChatMemberRequest(param.request)],
	];
}
export function SquareService_updateSquareChat_args(
	param?:
		| PartialDeep<LINETypes.SquareService_updateSquareChat_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UpdateSquareChatRequest(param.request)],
	];
}
export function SquareService_updateSquareFeatureSet_args(
	param?:
		| PartialDeep<LINETypes.SquareService_updateSquareFeatureSet_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UpdateSquareFeatureSetRequest(param.request)],
	];
}
export function SquareService_updateSquareMemberRelation_args(
	param?:
		| PartialDeep<LINETypes.SquareService_updateSquareMemberRelation_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UpdateSquareMemberRelationRequest(param.request)],
	];
}
export function SquareService_updateSquareMember_args(
	param?:
		| PartialDeep<LINETypes.SquareService_updateSquareMember_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UpdateSquareMemberRequest(param.request)],
	];
}
export function SquareService_updateSquareMembers_args(
	param?:
		| PartialDeep<LINETypes.SquareService_updateSquareMembers_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UpdateSquareMembersRequest(param.request)],
	];
}
export function SquareService_updateSquare_args(
	param?: PartialDeep<LINETypes.SquareService_updateSquare_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UpdateSquareRequest(param.request)],
	];
}
export function SquareService_updateUserSettings_args(
	param?:
		| PartialDeep<LINETypes.SquareService_updateUserSettings_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UpdateUserSettingsRequest(param.request)],
	];
}
export function approveChannelAndIssueChannelToken_args(
	param?:
		| PartialDeep<LINETypes.approveChannelAndIssueChannelToken_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.channelId],
	];
}
export function authenticateUsingBankAccountEx_args(
	param?:
		| PartialDeep<LINETypes.authenticateUsingBankAccountEx_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, r80_EnumC34362b(param.type)],
		[11, 2, param.bankId],
		[11, 3, param.bankBranchId],
		[11, 4, param.realAccountNo],
		[8, 5, r80_EnumC34361a(param.accountProductCode)],
		[11, 6, param.authToken],
	];
}
export function authenticateWithPaak_args(
	param?: PartialDeep<LINETypes.authenticateWithPaak_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, AuthenticateWithPaakRequest(param.request)],
	];
}
export function blockContact_args(
	param?: PartialDeep<LINETypes.blockContact_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.id],
	];
}
export function blockRecommendation_args(
	param?: PartialDeep<LINETypes.blockRecommendation_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.targetMid],
	];
}
export function bulkFollow_args(
	param?: PartialDeep<LINETypes.bulkFollow_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, BulkFollowRequest(param.bulkFollowRequest)],
	];
}
export function bulkGetSetting_args(
	param?: PartialDeep<LINETypes.bulkGetSetting_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, BulkGetRequest(param.request)],
	];
}
export function bulkSetSetting_args(
	param?: PartialDeep<LINETypes.bulkSetSetting_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function buyMustbuyProduct_args(
	param?: PartialDeep<LINETypes.buyMustbuyProduct_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, BuyMustbuyRequest(param.request)],
	];
}
export function canCreateCombinationSticker_args(
	param?: PartialDeep<LINETypes.canCreateCombinationSticker_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, CanCreateCombinationStickerRequest(param.request)],
	];
}
export function canReceivePresent_args(
	param?: PartialDeep<LINETypes.canReceivePresent_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.shopId],
		[11, 3, param.productId],
		[12, 4, Locale(param.locale)],
		[11, 5, param.recipientMid],
	];
}
export function cancelChatInvitation_args(
	param?: PartialDeep<LINETypes.cancelChatInvitation_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CancelChatInvitationRequest(param.request)],
	];
}
export function cancelPaakAuth_args(
	param?: PartialDeep<LINETypes.cancelPaakAuth_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CancelPaakAuthRequest(param.request)],
	];
}
export function cancelPaakAuthentication_args(
	param?: PartialDeep<LINETypes.cancelPaakAuthentication_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CancelPaakAuthenticationRequest(param.request)],
	];
}
export function cancelPinCode_args(
	param?: PartialDeep<LINETypes.cancelPinCode_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CancelPinCodeRequest(param.request)],
	];
}
export function cancelReaction_args(
	param?: PartialDeep<LINETypes.cancelReaction_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CancelReactionRequest(param.cancelReactionRequest)],
	];
}
export function changeSubscription_args(
	param?: PartialDeep<LINETypes.changeSubscription_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function changeVerificationMethod_args(
	param?: PartialDeep<LINETypes.changeVerificationMethod_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.sessionId],
		[8, 3, VerificationMethod(param.method)],
	];
}
export function checkCanUnregisterEx_args(
	param?: PartialDeep<LINETypes.checkCanUnregisterEx_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, r80_n0(param.type)],
	];
}
export function checkEmailAssigned_args(
	param?: PartialDeep<LINETypes.checkEmailAssigned_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, AccountIdentifier(param.accountIdentifier)],
	];
}
export function checkIfEncryptedE2EEKeyReceived_args(
	param?:
		| PartialDeep<LINETypes.checkIfEncryptedE2EEKeyReceived_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CheckIfEncryptedE2EEKeyReceivedRequest(param.request)],
	];
}
export function checkIfPasswordSetVerificationEmailVerified_args(
	param?:
		| PartialDeep<LINETypes.checkIfPasswordSetVerificationEmailVerified_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
	];
}
export function checkIfPhonePinCodeMsgVerified_args(
	param?:
		| PartialDeep<LINETypes.checkIfPhonePinCodeMsgVerified_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CheckIfPhonePinCodeMsgVerifiedRequest(param.request)],
	];
}
export function checkOperationTimeEx_args(
	param?: PartialDeep<LINETypes.checkOperationTimeEx_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, r80_EnumC34368h(param.type)],
		[11, 2, param.lpAccountNo],
		[8, 3, r80_EnumC34371k(param.channelType)],
	];
}
export function checkUserAgeAfterApprovalWithDocomoV2_args(
	param?:
		| PartialDeep<LINETypes.checkUserAgeAfterApprovalWithDocomoV2_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CheckUserAgeAfterApprovalWithDocomoV2Request(param.request)],
	];
}
export function checkUserAgeWithDocomoV2_args(
	param?: PartialDeep<LINETypes.checkUserAgeWithDocomoV2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CheckUserAgeWithDocomoV2Request(param.request)],
	];
}
export function checkUserAge_args(
	param?: PartialDeep<LINETypes.checkUserAge_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 2, CarrierCode(param.carrier)],
		[11, 3, param.sessionId],
		[11, 4, param.verifier],
		[8, 5, param.standardAge],
	];
}
export function clearRingtone_args(
	param?: PartialDeep<LINETypes.clearRingtone_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.oid],
	];
}
export function confirmIdentifier_args(
	param?: PartialDeep<LINETypes.confirmIdentifier_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.authSessionId],
		[12, 3, IdentityCredentialRequest(param.request)],
	];
}
export function connectEapAccount_args(
	param?: PartialDeep<LINETypes.connectEapAccount_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ConnectEapAccountRequest(param.request)],
	];
}
export function createChatRoomAnnouncement_args(
	param?: PartialDeep<LINETypes.createChatRoomAnnouncement_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.chatRoomMid],
		[8, 3, Pb1_X2(param.type)],
		[12, 4, ChatRoomAnnouncementContents(param.contents)],
	];
}
export function createChat_args(
	param?: PartialDeep<LINETypes.createChat_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CreateChatRequest(param.request)],
	];
}
export function createCollectionForUser_args(
	param?: PartialDeep<LINETypes.createCollectionForUser_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function createCombinationSticker_args(
	param?: PartialDeep<LINETypes.createCombinationSticker_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function createE2EEKeyBackupEnforced_args(
	param?: PartialDeep<LINETypes.createE2EEKeyBackupEnforced_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, Pb1_C13263z3(param.request)],
	];
}
export function createGroupCallUrl_args(
	param?: PartialDeep<LINETypes.createGroupCallUrl_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, CreateGroupCallUrlRequest(param.request)],
	];
}
export function createLifetimeKeyBackup_args(
	param?: PartialDeep<LINETypes.createLifetimeKeyBackup_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, Pb1_E3(param.request)],
	];
}
export function createMultiProfile_args(
	param?: PartialDeep<LINETypes.createMultiProfile_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CreateMultiProfileRequest(param.request)],
	];
}
export function createRoomV2_args(
	param?: PartialDeep<LINETypes.createRoomV2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[15, 2, [11, param.contactIds]],
	];
}
export function createSession_args(
	param?: PartialDeep<LINETypes.createSession_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, h80_C25643c(param.request)],
	];
}
export function decryptFollowEMid_args(
	param?: PartialDeep<LINETypes.decryptFollowEMid_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.eMid],
	];
}
export function deleteE2EEKeyBackup_args(
	param?: PartialDeep<LINETypes.deleteE2EEKeyBackup_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, Pb1_H3(param.request)],
	];
}
export function deleteGroupCallUrl_args(
	param?: PartialDeep<LINETypes.deleteGroupCallUrl_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, DeleteGroupCallUrlRequest(param.request)],
	];
}
export function deleteMultiProfile_args(
	param?: PartialDeep<LINETypes.deleteMultiProfile_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, DeleteMultiProfileRequest(param.request)],
	];
}
export function deleteOtherFromChat_args(
	param?: PartialDeep<LINETypes.deleteOtherFromChat_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, DeleteOtherFromChatRequest(param.request)],
	];
}
export function deletePrimaryCredential_args(
	param?: PartialDeep<LINETypes.deletePrimaryCredential_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, R70_c(param.request)],
	];
}
export function deleteSafetyStatus_args(
	param?: PartialDeep<LINETypes.deleteSafetyStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, DeleteSafetyStatusRequest(param.req)],
	];
}
export function deleteSelfFromChat_args(
	param?: PartialDeep<LINETypes.deleteSelfFromChat_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, DeleteSelfFromChatRequest(param.request)],
	];
}
export function determineMediaMessageFlow_args(
	param?: PartialDeep<LINETypes.determineMediaMessageFlow_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, DetermineMediaMessageFlowRequest(param.request)],
	];
}
export function disconnectEapAccount_args(
	param?: PartialDeep<LINETypes.disconnectEapAccount_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, DisconnectEapAccountRequest(param.request)],
	];
}
export function editItemsInCollection_args(
	param?: PartialDeep<LINETypes.editItemsInCollection_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function enablePointForOneTimeKey_args(
	param?: PartialDeep<LINETypes.enablePointForOneTimeKey_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[2, 1, param.usePoint],
	];
}
export function establishE2EESession_args(
	param?: PartialDeep<LINETypes.establishE2EESession_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function existPinCode_args(
	param?: PartialDeep<LINETypes.existPinCode_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, S70_b(param.request)],
	];
}
export function fetchOperations_args(
	param?: PartialDeep<LINETypes.fetchOperations_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, FetchOperationsRequest(param.request)],
	];
}
export function fetchPhonePinCodeMsg_args(
	param?: PartialDeep<LINETypes.fetchPhonePinCodeMsg_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, FetchPhonePinCodeMsgRequest(param.request)],
	];
}
export function findBuddyContactsByQuery_args(
	param?: PartialDeep<LINETypes.findBuddyContactsByQuery_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.language],
		[11, 3, param.country],
		[11, 4, param.query],
		[8, 5, param.fromIndex],
		[8, 6, param.count],
		[8, 7, Pb1_F0(param.requestSource)],
	];
}
export function findChatByTicket_args(
	param?: PartialDeep<LINETypes.findChatByTicket_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, FindChatByTicketRequest(param.request)],
	];
}
export function findContactByUserTicket_args(
	param?: PartialDeep<LINETypes.findContactByUserTicket_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.ticketIdWithTag],
	];
}
export function findContactByUserid_args(
	param?: PartialDeep<LINETypes.findContactByUserid_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.searchId],
	];
}
export function findContactsByPhone_args(
	param?: PartialDeep<LINETypes.findContactsByPhone_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 2, [11, param.phones]],
	];
}
export function finishUpdateVerification_args(
	param?: PartialDeep<LINETypes.finishUpdateVerification_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.sessionId],
	];
}
export function follow_args(
	param?: PartialDeep<LINETypes.follow_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, FollowRequest(param.followRequest)],
	];
}
export function generateUserTicket_args(
	param?: PartialDeep<LINETypes.generateUserTicket_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 3, param.expirationTime],
		[8, 4, param.maxUseCount],
	];
}
export function getAccessToken_args(
	param?: PartialDeep<LINETypes.getAccessToken_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetAccessTokenRequest(param.request)],
	];
}
export function getAccountBalanceAsync_args(
	param?: PartialDeep<LINETypes.getAccountBalanceAsync_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.requestToken],
		[11, 2, param.accountId],
	];
}
export function getAcctVerifMethod_args(
	param?: PartialDeep<LINETypes.getAcctVerifMethod_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, AccountIdentifier(param.accountIdentifier)],
	];
}
export function getAllChatMids_args(
	param?: PartialDeep<LINETypes.getAllChatMids_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetAllChatMidsRequest(param.request)],
		[8, 2, Pb1_V7(param.syncReason)],
	];
}
export function getAllContactIds_args(
	param?: PartialDeep<LINETypes.getAllContactIds_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_V7(param.syncReason)],
	];
}
export function getAllowedRegistrationMethod_args(
	param?: PartialDeep<LINETypes.getAllowedRegistrationMethod_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[11, 2, param.countryCode],
	];
}
export function getApprovedChannels_args(
	param?: PartialDeep<LINETypes.getApprovedChannels_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 2, param.lastSynced],
		[11, 3, param.locale],
	];
}
export function getAssertionChallenge_args(
	param?: PartialDeep<LINETypes.getAssertionChallenge_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, m80_l(param.request)],
	];
}
export function getAttestationChallenge_args(
	param?: PartialDeep<LINETypes.getAttestationChallenge_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, m80_n(param.request)],
	];
}
export function getAuthRSAKey_args(
	param?: PartialDeep<LINETypes.getAuthRSAKey_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.authSessionId],
		[8, 3, IdentityProvider(param.identityProvider)],
	];
}
export function getAuthorsLatestProducts_args(
	param?: PartialDeep<LINETypes.getAuthorsLatestProducts_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, LatestProductsByAuthorRequest(param.latestProductsByAuthorRequest)],
	];
}
export function getAutoSuggestionShowcase_args(
	param?: PartialDeep<LINETypes.getAutoSuggestionShowcase_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, AutoSuggestionShowcaseRequest(param.autoSuggestionShowcaseRequest)],
	];
}
export function getBalanceSummaryV2_args(
	param?: PartialDeep<LINETypes.getBalanceSummaryV2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, NZ0_C12208u(param.request)],
	];
}
export function getBalanceSummaryV4WithPayV3_args(
	param?: PartialDeep<LINETypes.getBalanceSummaryV4WithPayV3_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, NZ0_C12214w(param.request)],
	];
}
export function getBalance_args(
	param?: PartialDeep<LINETypes.getBalance_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ZQ0_b(param.request)],
	];
}
export function getBankBranches_args(
	param?: PartialDeep<LINETypes.getBankBranches_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.financialCorpId],
		[11, 2, param.query],
		[8, 3, param.startNum],
		[8, 4, param.count],
	];
}
export function getBanners_args(
	param?: PartialDeep<LINETypes.getBanners_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, BannerRequest(param.request)],
	];
}
export function getBirthdayEffect_args(
	param?: PartialDeep<LINETypes.getBirthdayEffect_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Eh_C8933a(param.req)],
	];
}
export function getBleDevice_args(
	param?: PartialDeep<LINETypes.getBleDevice_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetBleDeviceRequest(param.request)],
	];
}
export function getBlockedContactIds_args(
	param?: PartialDeep<LINETypes.getBlockedContactIds_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_V7(param.syncReason)],
	];
}
export function getBlockedRecommendationIds_args(
	param?: PartialDeep<LINETypes.getBlockedRecommendationIds_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_V7(param.syncReason)],
	];
}
export function getBrowsingHistory_args(
	param?: PartialDeep<LINETypes.getBrowsingHistory_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function getBuddyChatBarV2_args(
	param?: PartialDeep<LINETypes.getBuddyChatBarV2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetBuddyChatBarRequest(param.request)],
	];
}
export function getBuddyDetailWithPersonal_args(
	param?: PartialDeep<LINETypes.getBuddyDetailWithPersonal_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.buddyMid],
		[14, 2, [
			8,
			param.attributeSet && param.attributeSet.map((e) => Pb1_D0(e)),
		]],
	];
}
export function getBuddyDetail_args(
	param?: PartialDeep<LINETypes.getBuddyDetail_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 4, param.buddyMid],
	];
}
export function getBuddyLive_args(
	param?: PartialDeep<LINETypes.getBuddyLive_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetBuddyLiveRequest(param.request)],
	];
}
export function getBuddyOnAir_args(
	param?: PartialDeep<LINETypes.getBuddyOnAir_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 4, param.buddyMid],
	];
}
export function getBuddyStatusBarV2_args(
	param?: PartialDeep<LINETypes.getBuddyStatusBarV2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetBuddyStatusBarV2Request(param.request)],
	];
}
export function getCallStatus_args(
	param?: PartialDeep<LINETypes.getCallStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetCallStatusRequest(param.request)],
	];
}
export function getCampaign_args(
	param?: PartialDeep<LINETypes.getCampaign_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetCampaignRequest(param.request)],
	];
}
export function getChallengeForPaakAuth_args(
	param?: PartialDeep<LINETypes.getChallengeForPaakAuth_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetChallengeForPaakAuthRequest(param.request)],
	];
}
export function getChallengeForPrimaryReg_args(
	param?: PartialDeep<LINETypes.getChallengeForPrimaryReg_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetChallengeForPrimaryRegRequest(param.request)],
	];
}
export function getChannelContext_args(
	param?: PartialDeep<LINETypes.getChannelContext_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetChannelContextRequest(param.request)],
	];
}
export function getChannelInfo_args(
	param?: PartialDeep<LINETypes.getChannelInfo_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.channelId],
		[11, 3, param.locale],
	];
}
export function getChannelNotificationSettings_args(
	param?:
		| PartialDeep<LINETypes.getChannelNotificationSettings_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.locale],
	];
}
export function getChatEffectMetaList_args(
	param?: PartialDeep<LINETypes.getChatEffectMetaList_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 1, [8, param.categories && param.categories.map((e) => Pb1_Q2(e))]],
	];
}
export function getChatRoomAnnouncementsBulk_args(
	param?: PartialDeep<LINETypes.getChatRoomAnnouncementsBulk_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 2, [11, param.chatRoomMids]],
		[8, 3, Pb1_V7(param.syncReason)],
	];
}
export function getChatRoomAnnouncements_args(
	param?: PartialDeep<LINETypes.getChatRoomAnnouncements_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.chatRoomMid],
	];
}
export function getChatRoomBGMs_args(
	param?: PartialDeep<LINETypes.getChatRoomBGMs_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 2, [11, param.chatRoomMids]],
		[8, 3, Pb1_V7(param.syncReason)],
	];
}
export function getChatapp_args(
	param?: PartialDeep<LINETypes.getChatapp_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetChatappRequest(param.request)],
	];
}
export function getChats_args(
	param?: PartialDeep<LINETypes.getChats_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetChatsRequest(param.request)],
		[8, 2, Pb1_V7(param.syncReason)],
	];
}
export function getCoinProducts_args(
	param?: PartialDeep<LINETypes.getCoinProducts_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetCoinProductsRequest(param.request)],
	];
}
export function getCoinPurchaseHistory_args(
	param?: PartialDeep<LINETypes.getCoinPurchaseHistory_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetCoinHistoryRequest(param.request)],
	];
}
export function getCoinUseAndRefundHistory_args(
	param?: PartialDeep<LINETypes.getCoinUseAndRefundHistory_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetCoinHistoryRequest(param.request)],
	];
}
export function getCommonDomains_args(
	param?: PartialDeep<LINETypes.getCommonDomains_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 1, param.lastSynced],
	];
}
export function getConfigurations_args(
	param?: PartialDeep<LINETypes.getConfigurations_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 2, param.revision],
		[11, 3, param.regionOfUsim],
		[11, 4, param.regionOfTelephone],
		[11, 5, param.regionOfLocale],
		[11, 6, param.carrier],
		[8, 7, Pb1_V7(param.syncReason)],
	];
}
export function getContactCalendarEvents_args(
	param?: PartialDeep<LINETypes.getContactCalendarEvents_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetContactCalendarEventsRequest(param.request)],
	];
}
export function getContactsV3_args(
	param?: PartialDeep<LINETypes.getContactsV3_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetContactsV3Request(param.request)],
	];
}
export function getCountries_args(
	param?: PartialDeep<LINETypes.getCountries_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 2, Pb1_EnumC13221w3(param.countryGroup)],
	];
}
export function getCountryInfo_args(
	param?: PartialDeep<LINETypes.getCountryInfo_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 11, SimCard(param.simCard)],
	];
}
export function getDataRetention_args(
	param?: PartialDeep<LINETypes.getDataRetention_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, fN0_C24473e(param.req)],
	];
}
export function getDestinationUrl_args(
	param?: PartialDeep<LINETypes.getDestinationUrl_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, DestinationLIFFRequest(param.request)],
	];
}
export function getDisasterCases_args(
	param?: PartialDeep<LINETypes.getDisasterCases_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, vh_C37633d(param.req)],
	];
}
export function getE2EEGroupSharedKey_args(
	param?: PartialDeep<LINETypes.getE2EEGroupSharedKey_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 2, param.keyVersion],
		[11, 3, param.chatMid],
		[8, 4, param.groupKeyId],
	];
}
export function getE2EEKeyBackupCertificates_args(
	param?: PartialDeep<LINETypes.getE2EEKeyBackupCertificates_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, Pb1_W4(param.request)],
	];
}
export function getE2EEKeyBackupInfo_args(
	param?: PartialDeep<LINETypes.getE2EEKeyBackupInfo_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, Pb1_Y4(param.request)],
	];
}
export function getE2EEPublicKey_args(
	param?: PartialDeep<LINETypes.getE2EEPublicKey_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.mid],
		[8, 3, param.keyVersion],
		[8, 4, param.keyId],
	];
}
export function getExchangeKey_args(
	param?: PartialDeep<LINETypes.getExchangeKey_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetExchangeKeyRequest(param.request)],
	];
}
export function getExtendedProfile_args(
	param?: PartialDeep<LINETypes.getExtendedProfile_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_V7(param.syncReason)],
	];
}
export function getFollowBlacklist_args(
	param?: PartialDeep<LINETypes.getFollowBlacklist_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, GetFollowBlacklistRequest(param.getFollowBlacklistRequest)],
	];
}
export function getFollowers_args(
	param?: PartialDeep<LINETypes.getFollowers_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, GetFollowersRequest(param.getFollowersRequest)],
	];
}
export function getFollowings_args(
	param?: PartialDeep<LINETypes.getFollowings_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, GetFollowingsRequest(param.getFollowingsRequest)],
	];
}
export function getFontMetas_args(
	param?: PartialDeep<LINETypes.getFontMetas_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetFontMetasRequest(param.request)],
	];
}
export function getFriendDetails_args(
	param?: PartialDeep<LINETypes.getFriendDetails_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetFriendDetailsRequest(param.request)],
	];
}
export function getFriendRequests_args(
	param?: PartialDeep<LINETypes.getFriendRequests_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_F4(param.direction)],
		[10, 2, param.lastSeenSeqId],
	];
}
export function getGnbBadgeStatus_args(
	param?: PartialDeep<LINETypes.getGnbBadgeStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetGnbBadgeStatusRequest(param.request)],
	];
}
export function getGroupCallUrlInfo_args(
	param?: PartialDeep<LINETypes.getGroupCallUrlInfo_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, GetGroupCallUrlInfoRequest(param.request)],
	];
}
export function getGroupCallUrls_args(
	param?: PartialDeep<LINETypes.getGroupCallUrls_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, Pb1_C13042j5(param.request)],
	];
}
export function getGroupCall_args(
	param?: PartialDeep<LINETypes.getGroupCall_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.chatMid],
	];
}
export function getHomeFlexContent_args(
	param?: PartialDeep<LINETypes.getHomeFlexContent_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetHomeFlexContentRequest(param.request)],
	];
}
export function getHomeServiceList_args(
	param?: PartialDeep<LINETypes.getHomeServiceList_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Eg_C8928b(param.request)],
	];
}
export function getHomeServices_args(
	param?: PartialDeep<LINETypes.getHomeServices_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetHomeServicesRequest(param.request)],
	];
}
export function getIncentiveStatus_args(
	param?: PartialDeep<LINETypes.getIncentiveStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, fN0_C24471c(param.req)],
	];
}
export function getInstantNews_args(
	param?: PartialDeep<LINETypes.getInstantNews_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.region],
		[12, 2, Location(param.location)],
	];
}
export function getJoinedMembershipByBotMid_args(
	param?: PartialDeep<LINETypes.getJoinedMembershipByBotMid_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetJoinedMembershipByBotMidRequest(param.request)],
	];
}
export function getJoinedMembership_args(
	param?: PartialDeep<LINETypes.getJoinedMembership_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetJoinedMembershipRequest(param.request)],
	];
}
export function getKeyBackupCertificatesV2_args(
	param?: PartialDeep<LINETypes.getKeyBackupCertificatesV2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, Pb1_C13070l5(param.request)],
	];
}
export function getLFLSuggestion_args(
	param?: PartialDeep<LINETypes.getLFLSuggestion_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function getLastE2EEGroupSharedKey_args(
	param?: PartialDeep<LINETypes.getLastE2EEGroupSharedKey_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 2, param.keyVersion],
		[11, 3, param.chatMid],
	];
}
export function getLastE2EEPublicKeys_args(
	param?: PartialDeep<LINETypes.getLastE2EEPublicKeys_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.chatMid],
	];
}
export function getLiffViewWithoutUserContext_args(
	param?: PartialDeep<LINETypes.getLiffViewWithoutUserContext_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, LiffViewWithoutUserContextRequest(param.request)],
	];
}
export function getLineCardIssueForm_args(
	param?: PartialDeep<LINETypes.getLineCardIssueForm_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, r80_EnumC34372l(param.resolutionType)],
	];
}
export function getLoginActorContext_args(
	param?: PartialDeep<LINETypes.getLoginActorContext_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetLoginActorContextRequest(param.request)],
	];
}
export function getMappedProfileIds_args(
	param?: PartialDeep<LINETypes.getMappedProfileIds_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetMappedProfileIdsRequest(param.request)],
	];
}
export function getMaskedEmail_args(
	param?: PartialDeep<LINETypes.getMaskedEmail_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, AccountIdentifier(param.accountIdentifier)],
	];
}
export function getMessageBoxes_args(
	param?: PartialDeep<LINETypes.getMessageBoxes_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, MessageBoxListRequest(param.messageBoxListRequest)],
		[8, 3, Pb1_V7(param.syncReason)],
	];
}
export function getMessageReadRange_args(
	param?: PartialDeep<LINETypes.getMessageReadRange_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 2, [11, param.chatIds]],
		[8, 3, Pb1_V7(param.syncReason)],
	];
}
export function getModuleLayoutV4_args(
	param?: PartialDeep<LINETypes.getModuleLayoutV4_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetModuleLayoutV4Request(param.request)],
	];
}
export function getModuleWithStatus_args(
	param?: PartialDeep<LINETypes.getModuleWithStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, NZ0_G(param.request)],
	];
}
export function getModule_args(
	param?: PartialDeep<LINETypes.getModule_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, NZ0_E(param.request)],
	];
}
export function getModulesV2_args(
	param?: PartialDeep<LINETypes.getModulesV2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetModulesRequestV2(param.request)],
	];
}
export function getModulesV3_args(
	param?: PartialDeep<LINETypes.getModulesV3_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetModulesRequestV3(param.request)],
	];
}
export function getModulesV4WithStatus_args(
	param?: PartialDeep<LINETypes.getModulesV4WithStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetModulesV4WithStatusRequest(param.request)],
	];
}
export function getMusicSubscriptionStatus_args(
	param?: PartialDeep<LINETypes.getMusicSubscriptionStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function getMyAssetInformationV2_args(
	param?: PartialDeep<LINETypes.getMyAssetInformationV2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetMyAssetInformationV2Request(param.request)],
	];
}
export function getMyChatapps_args(
	param?: PartialDeep<LINETypes.getMyChatapps_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetMyChatappsRequest(param.request)],
	];
}
export function getMyDashboard_args(
	param?: PartialDeep<LINETypes.getMyDashboard_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetMyDashboardRequest(param.request)],
	];
}
export function getNewlyReleasedBuddyIds_args(
	param?: PartialDeep<LINETypes.getNewlyReleasedBuddyIds_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 3, param.country],
	];
}
export function getNotificationSettings_args(
	param?: PartialDeep<LINETypes.getNotificationSettings_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetNotificationSettingsRequest(param.request)],
	];
}
export function getOwnedProductSummaries_args(
	param?: PartialDeep<LINETypes.getOwnedProductSummaries_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.shopId],
		[8, 3, param.offset],
		[8, 4, param.limit],
		[12, 5, Locale(param.locale)],
	];
}
export function getPasswordHashingParameter_args(
	param?: PartialDeep<LINETypes.getPasswordHashingParameter_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetPasswordHashingParametersRequest(param.request)],
	];
}
export function getPasswordHashingParametersForPwdReg_args(
	param?:
		| PartialDeep<LINETypes.getPasswordHashingParametersForPwdReg_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetPasswordHashingParametersForPwdRegRequest(param.request)],
	];
}
export function getPasswordHashingParametersForPwdVerif_args(
	param?:
		| PartialDeep<LINETypes.getPasswordHashingParametersForPwdVerif_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetPasswordHashingParametersForPwdVerifRequest(param.request)],
	];
}
export function getPaymentUrlByKey_args(
	param?: PartialDeep<LINETypes.getPaymentUrlByKey_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.key],
	];
}
export function getPhoneVerifMethodForRegistration_args(
	param?:
		| PartialDeep<LINETypes.getPhoneVerifMethodForRegistration_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetPhoneVerifMethodForRegistrationRequest(param.request)],
	];
}
export function getPhoneVerifMethodV2_args(
	param?: PartialDeep<LINETypes.getPhoneVerifMethodV2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetPhoneVerifMethodV2Request(param.request)],
	];
}
export function getPhotoboothBalance_args(
	param?: PartialDeep<LINETypes.getPhotoboothBalance_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, Pb1_C13126p5(param.request)],
	];
}
export function getPredefinedScenarioSets_args(
	param?: PartialDeep<LINETypes.getPredefinedScenarioSets_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetPredefinedScenarioSetsRequest(param.request)],
	];
}
export function getPrefetchableBanners_args(
	param?: PartialDeep<LINETypes.getPrefetchableBanners_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, BannerRequest(param.request)],
	];
}
export function getPremiumStatusForUpgrade_args(
	param?: PartialDeep<LINETypes.getPremiumStatusForUpgrade_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, fN0_C24475g(param.req)],
	];
}
export function getPremiumStatus_args(
	param?: PartialDeep<LINETypes.getPremiumStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, fN0_C24476h(param.req)],
	];
}
export function getPreviousMessagesV2WithRequest_args(
	param?:
		| PartialDeep<LINETypes.getPreviousMessagesV2WithRequest_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, GetPreviousMessagesV2Request(param.request)],
		[8, 3, Pb1_V7(param.syncReason)],
	];
}
export function getProductByVersion_args(
	param?: PartialDeep<LINETypes.getProductByVersion_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.shopId],
		[11, 3, param.productId],
		[10, 4, param.productVersion],
		[12, 5, Locale(param.locale)],
	];
}
export function getProductLatestVersionForUser_args(
	param?:
		| PartialDeep<LINETypes.getProductLatestVersionForUser_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function getProductSummariesInSubscriptionSlots_args(
	param?:
		| PartialDeep<LINETypes.getProductSummariesInSubscriptionSlots_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function getProductV2_args(
	param?: PartialDeep<LINETypes.getProductV2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function getProductValidationScheme_args(
	param?: PartialDeep<LINETypes.getProductValidationScheme_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.shopId],
		[11, 3, param.productId],
		[10, 4, param.productVersion],
	];
}
export function getProductsByAuthor_args(
	param?: PartialDeep<LINETypes.getProductsByAuthor_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function getProfile_args(
	param?: PartialDeep<LINETypes.getProfile_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_V7(param.syncReason)],
	];
}
export function getPromotedBuddyContacts_args(
	param?: PartialDeep<LINETypes.getPromotedBuddyContacts_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.language],
		[11, 3, param.country],
	];
}
export function getPublishedMemberships_args(
	param?: PartialDeep<LINETypes.getPublishedMemberships_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetPublishedMembershipsRequest(param.request)],
	];
}
export function getPurchaseEnabledStatus_args(
	param?: PartialDeep<LINETypes.getPurchaseEnabledStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, PurchaseEnabledRequest(param.request)],
	];
}
export function getPurchasedProducts_args(
	param?: PartialDeep<LINETypes.getPurchasedProducts_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.shopId],
		[8, 3, param.offset],
		[8, 4, param.limit],
		[12, 5, Locale(param.locale)],
	];
}
export function getQuickMenu_args(
	param?: PartialDeep<LINETypes.getQuickMenu_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, NZ0_S(param.request)],
	];
}
export function getReceivedPresents_args(
	param?: PartialDeep<LINETypes.getReceivedPresents_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.shopId],
		[8, 3, param.offset],
		[8, 4, param.limit],
		[12, 5, Locale(param.locale)],
	];
}
export function getRecentFriendRequests_args(
	param?: PartialDeep<LINETypes.getRecentFriendRequests_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_V7(param.syncReason)],
	];
}
export function getRecommendationDetails_args(
	param?: PartialDeep<LINETypes.getRecommendationDetails_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetRecommendationDetailsRequest(param.request)],
	];
}
export function getRecommendationIds_args(
	param?: PartialDeep<LINETypes.getRecommendationIds_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_V7(param.syncReason)],
	];
}
export function getRecommendationList_args(
	param?: PartialDeep<LINETypes.getRecommendationList_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function getRepairElements_args(
	param?: PartialDeep<LINETypes.getRepairElements_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetRepairElementsRequest(param.request)],
	];
}
export function getResourceFile_args(
	param?: PartialDeep<LINETypes.getResourceFile_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [];
}
export function getResponseStatus_args(
	param?: PartialDeep<LINETypes.getResponseStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetResponseStatusRequest(param.request)],
	];
}
export function getReturnUrlWithRequestTokenForAutoLogin_args(
	param?:
		| PartialDeep<LINETypes.getReturnUrlWithRequestTokenForAutoLogin_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, WebLoginRequest(param.webLoginRequest)],
	];
}
export function getReturnUrlWithRequestTokenForMultiLiffLogin_args(
	param?:
		| PartialDeep<LINETypes.getReturnUrlWithRequestTokenForMultiLiffLogin_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, LiffWebLoginRequest(param.request)],
	];
}
export function getRoomsV2_args(
	param?: PartialDeep<LINETypes.getRoomsV2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 2, [11, param.roomIds]],
	];
}
export function getSCC_args(
	param?: PartialDeep<LINETypes.getSCC_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSCCRequest(param.request)],
	];
}
export function getSeasonalEffects_args(
	param?: PartialDeep<LINETypes.getSeasonalEffects_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Eh_C8935c(param.req)],
	];
}
export function getSecondAuthMethod_args(
	param?: PartialDeep<LINETypes.getSecondAuthMethod_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
	];
}
export function getSentPresents_args(
	param?: PartialDeep<LINETypes.getSentPresents_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.shopId],
		[8, 3, param.offset],
		[8, 4, param.limit],
		[12, 5, Locale(param.locale)],
	];
}
export function getServiceShortcutMenu_args(
	param?: PartialDeep<LINETypes.getServiceShortcutMenu_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, NZ0_U(param.request)],
	];
}
export function getSessionContentBeforeMigCompletion_args(
	param?:
		| PartialDeep<LINETypes.getSessionContentBeforeMigCompletion_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
	];
}
export function getSettingsAttributes2_args(
	param?: PartialDeep<LINETypes.getSettingsAttributes2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 2, [
			8,
			param.attributesToRetrieve &&
			param.attributesToRetrieve.map((e) => SettingsAttributeEx(e)),
		]],
	];
}
export function getSettings_args(
	param?: PartialDeep<LINETypes.getSettings_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_V7(param.syncReason)],
	];
}
export function getSmartChannelRecommendations_args(
	param?:
		| PartialDeep<LINETypes.getSmartChannelRecommendations_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSmartChannelRecommendationsRequest(param.request)],
	];
}
export function getSquareBot_args(
	param?: PartialDeep<LINETypes.getSquareBot_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetSquareBotRequest(param.req)],
	];
}
export function getStudentInformation_args(
	param?: PartialDeep<LINETypes.getStudentInformation_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, Ob1_C12606a0(param.req)],
	];
}
export function getSubscriptionPlans_args(
	param?: PartialDeep<LINETypes.getSubscriptionPlans_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, GetSubscriptionPlansRequest(param.req)],
	];
}
export function getSubscriptionSlotHistory_args(
	param?: PartialDeep<LINETypes.getSubscriptionSlotHistory_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, Ob1_C12618e0(param.req)],
	];
}
export function getSubscriptionStatus_args(
	param?: PartialDeep<LINETypes.getSubscriptionStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, GetSubscriptionStatusRequest(param.req)],
	];
}
export function getSuggestDictionarySetting_args(
	param?: PartialDeep<LINETypes.getSuggestDictionarySetting_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, Ob1_C12630i0(param.req)],
	];
}
export function getSuggestResourcesV2_args(
	param?: PartialDeep<LINETypes.getSuggestResourcesV2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, GetSuggestResourcesV2Request(param.req)],
	];
}
export function getTaiwanBankBalance_args(
	param?: PartialDeep<LINETypes.getTaiwanBankBalance_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetTaiwanBankBalanceRequest(param.request)],
	];
}
export function getTargetProfiles_args(
	param?: PartialDeep<LINETypes.getTargetProfiles_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetTargetProfilesRequest(param.request)],
	];
}
export function getTargetingPopup_args(
	param?: PartialDeep<LINETypes.getTargetingPopup_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, NZ0_C12150a0(param.request)],
	];
}
export function getThaiBankBalance_args(
	param?: PartialDeep<LINETypes.getThaiBankBalance_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetThaiBankBalanceRequest(param.request)],
	];
}
export function getTotalCoinBalance_args(
	param?: PartialDeep<LINETypes.getTotalCoinBalance_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetTotalCoinBalanceRequest(param.request)],
	];
}
export function getUpdatedChannelIds_args(
	param?: PartialDeep<LINETypes.getUpdatedChannelIds_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [
			12,
			param.channelIds &&
			param.channelIds.map((e) => ChannelIdWithLastUpdated(e)),
		]],
	];
}
export function getUserCollections_args(
	param?: PartialDeep<LINETypes.getUserCollections_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetUserCollectionsRequest(param.request)],
	];
}
export function getUserProfile_args(
	param?: PartialDeep<LINETypes.getUserProfile_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, AccountIdentifier(param.accountIdentifier)],
	];
}
export function getUserVector_args(
	param?: PartialDeep<LINETypes.getUserVector_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetUserVectorRequest(param.request)],
	];
}
export function getUsersMappedByProfile_args(
	param?: PartialDeep<LINETypes.getUsersMappedByProfile_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetUsersMappedByProfileRequest(param.request)],
	];
}
export function getWebLoginDisallowedUrlForMultiLiffLogin_args(
	param?:
		| PartialDeep<LINETypes.getWebLoginDisallowedUrlForMultiLiffLogin_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, LiffWebLoginRequest(param.request)],
	];
}
export function getWebLoginDisallowedUrl_args(
	param?: PartialDeep<LINETypes.getWebLoginDisallowedUrl_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, WebLoginRequest(param.webLoginRequest)],
	];
}
export function inviteFriends_args(
	param?: PartialDeep<LINETypes.inviteFriends_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, InviteFriendsRequest(param.request)],
	];
}
export function inviteIntoChat_args(
	param?: PartialDeep<LINETypes.inviteIntoChat_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, InviteIntoChatRequest(param.request)],
	];
}
export function inviteIntoGroupCall_args(
	param?: PartialDeep<LINETypes.inviteIntoGroupCall_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.chatMid],
		[15, 3, [11, param.memberMids]],
		[8, 4, Pb1_EnumC13237x5(param.mediaType)],
	];
}
export function inviteIntoRoom_args(
	param?: PartialDeep<LINETypes.inviteIntoRoom_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.roomId],
		[15, 3, [11, param.contactIds]],
	];
}
export function isProductForCollections_args(
	param?: PartialDeep<LINETypes.isProductForCollections_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, IsProductForCollectionsRequest(param.request)],
	];
}
export function isStickerAvailableForCombinationSticker_args(
	param?:
		| PartialDeep<LINETypes.isStickerAvailableForCombinationSticker_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, IsStickerAvailableForCombinationStickerRequest(param.request)],
	];
}
export function isUseridAvailable_args(
	param?: PartialDeep<LINETypes.isUseridAvailable_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.searchId],
	];
}
export function issueChannelToken_args(
	param?: PartialDeep<LINETypes.issueChannelToken_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.channelId],
	];
}
export function issueLiffView_args(
	param?: PartialDeep<LINETypes.issueLiffView_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, LiffViewRequest(param.request)],
	];
}
export function issueRequestTokenWithAuthScheme_args(
	param?:
		| PartialDeep<LINETypes.issueRequestTokenWithAuthScheme_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.channelId],
		[11, 2, param.otpId],
		[15, 3, [11, param.authScheme]],
		[11, 4, param.returnUrl],
	];
}
export function issueSubLiffView_args(
	param?: PartialDeep<LINETypes.issueSubLiffView_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, LiffViewRequest(param.request)],
	];
}
export function issueTokenForAccountMigrationSettings_args(
	param?:
		| PartialDeep<LINETypes.issueTokenForAccountMigrationSettings_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[2, 2, param.enforce],
	];
}
export function issueToken_args(
	param?: PartialDeep<LINETypes.issueToken_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, IssueBirthdayGiftTokenRequest(param.request)],
	];
}
export function issueV3TokenForPrimary_args(
	param?: PartialDeep<LINETypes.issueV3TokenForPrimary_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, IssueV3TokenForPrimaryRequest(param.request)],
	];
}
export function issueWebAuthDetailsForSecondAuth_args(
	param?:
		| PartialDeep<LINETypes.issueWebAuthDetailsForSecondAuth_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
	];
}
export function joinChatByCallUrl_args(
	param?: PartialDeep<LINETypes.joinChatByCallUrl_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, JoinChatByCallUrlRequest(param.request)],
	];
}
export function kickoutFromGroupCall_args(
	param?: PartialDeep<LINETypes.kickoutFromGroupCall_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, KickoutFromGroupCallRequest(param.kickoutFromGroupCallRequest)],
	];
}
export function leaveRoom_args(
	param?: PartialDeep<LINETypes.leaveRoom_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.roomId],
	];
}
export function linkDevice_args(
	param?: PartialDeep<LINETypes.linkDevice_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, DeviceLinkRequest(param.request)],
	];
}
export function lookupAvailableEap_args(
	param?: PartialDeep<LINETypes.lookupAvailableEap_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, LookupAvailableEapRequest(param.request)],
	];
}
export function lookupPaidCall_args(
	param?: PartialDeep<LINETypes.lookupPaidCall_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.dialedNumber],
		[11, 3, param.language],
		[11, 4, param.referer],
	];
}
export function mapProfileToUsers_args(
	param?: PartialDeep<LINETypes.mapProfileToUsers_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, MapProfileToUsersRequest(param.request)],
	];
}
export function migratePrimaryUsingEapAccountWithTokenV3_args(
	param?:
		| PartialDeep<LINETypes.migratePrimaryUsingEapAccountWithTokenV3_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
	];
}
export function migratePrimaryUsingPhoneWithTokenV3_args(
	param?:
		| PartialDeep<LINETypes.migratePrimaryUsingPhoneWithTokenV3_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
	];
}
export function migratePrimaryUsingQrCode_args(
	param?: PartialDeep<LINETypes.migratePrimaryUsingQrCode_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, MigratePrimaryUsingQrCodeRequest(param.request)],
	];
}
export function negotiateE2EEPublicKey_args(
	param?: PartialDeep<LINETypes.negotiateE2EEPublicKey_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.mid],
	];
}
export function notifyChatAdEntry_args(
	param?: PartialDeep<LINETypes.notifyChatAdEntry_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, NotifyChatAdEntryRequest(param.request)],
	];
}
export function notifyDeviceConnection_args(
	param?: PartialDeep<LINETypes.notifyDeviceConnection_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, NotifyDeviceConnectionRequest(param.request)],
	];
}
export function notifyDeviceDisconnection_args(
	param?: PartialDeep<LINETypes.notifyDeviceDisconnection_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, NotifyDeviceDisconnectionRequest(param.request)],
	];
}
export function notifyInstalled_args(
	param?: PartialDeep<LINETypes.notifyInstalled_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.udidHash],
		[11, 3, param.applicationTypeWithExtensions],
	];
}
export function notifyOATalkroomEvents_args(
	param?: PartialDeep<LINETypes.notifyOATalkroomEvents_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, NotifyOATalkroomEventsRequest(param.request)],
	];
}
export function notifyProductEvent_args(
	param?: PartialDeep<LINETypes.notifyProductEvent_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.shopId],
		[11, 3, param.productId],
		[10, 4, param.productVersion],
		[10, 5, param.productEvent],
	];
}
export function notifyRegistrationComplete_args(
	param?: PartialDeep<LINETypes.notifyRegistrationComplete_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.udidHash],
		[11, 3, param.applicationTypeWithExtensions],
	];
}
export function notifyScenarioExecuted_args(
	param?: PartialDeep<LINETypes.notifyScenarioExecuted_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, NotifyScenarioExecutedRequest(param.request)],
	];
}
export function notifyUpdated_args(
	param?: PartialDeep<LINETypes.notifyUpdated_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 2, param.lastRev],
		[12, 3, DeviceInfo(param.deviceInfo)],
		[11, 4, param.udidHash],
		[11, 5, param.oldUdidHash],
	];
}
export function openAuthSession_args(
	param?: PartialDeep<LINETypes.openAuthSession_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, AuthSessionRequest(param.request)],
	];
}
export function openSession_args(
	param?: PartialDeep<LINETypes.openSession_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, OpenSessionRequest(param.request)],
	];
}
export function permitLogin_args(
	param?: PartialDeep<LINETypes.permitLogin_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, PermitLoginRequest(param.request)],
	];
}
export function placePurchaseOrderForFreeProduct_args(
	param?:
		| PartialDeep<LINETypes.placePurchaseOrderForFreeProduct_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, PurchaseOrder(param.purchaseOrder)],
	];
}
export function placePurchaseOrderWithLineCoin_args(
	param?:
		| PartialDeep<LINETypes.placePurchaseOrderWithLineCoin_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, PurchaseOrder(param.purchaseOrder)],
	];
}
export function postPopupButtonEvents_args(
	param?: PartialDeep<LINETypes.postPopupButtonEvents_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.buttonId],
		[13, 2, [11, 2, param.checkboxes]],
	];
}
export function purchaseSubscription_args(
	param?: PartialDeep<LINETypes.purchaseSubscription_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, PurchaseSubscriptionRequest(param.req)],
	];
}
export function putE2eeKey_args(
	param?: PartialDeep<LINETypes.putE2eeKey_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, PutE2eeKeyRequest(param.request)],
	];
}
export function react_args(
	param?: PartialDeep<LINETypes.react_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReactRequest(param.reactRequest)],
	];
}
export function refresh_args(
	param?: PartialDeep<LINETypes.refresh_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RefreshAccessTokenRequest(param.request)],
	];
}
export function registerBarcodeAsync_args(
	param?: PartialDeep<LINETypes.registerBarcodeAsync_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.requestToken],
		[11, 2, param.barcodeRequestId],
		[11, 3, param.barcode],
		[12, 4, RSAEncryptedPassword(param.password)],
	];
}
export function registerCampaignReward_args(
	param?: PartialDeep<LINETypes.registerCampaignReward_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RegisterCampaignRewardRequest(param.request)],
	];
}
export function registerE2EEGroupKey_args(
	param?: PartialDeep<LINETypes.registerE2EEGroupKey_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 2, param.keyVersion],
		[11, 3, param.chatMid],
		[15, 4, [11, param.members]],
		[15, 5, [8, param.keyIds]],
		[15, 6, [11, param.encryptedSharedKeys]],
	];
}
export function registerE2EEPublicKeyV2_args(
	param?: PartialDeep<LINETypes.registerE2EEPublicKeyV2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Pb1_W6(param.request)],
	];
}
export function registerE2EEPublicKey_args(
	param?: PartialDeep<LINETypes.registerE2EEPublicKey_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[12, 2, Pb1_C13097n4(param.publicKey)],
	];
}
export function registerPrimaryCredential_args(
	param?: PartialDeep<LINETypes.registerPrimaryCredential_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RegisterPrimaryCredentialRequest(param.request)],
	];
}
export function registerPrimaryUsingEapAccount_args(
	param?:
		| PartialDeep<LINETypes.registerPrimaryUsingEapAccount_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
	];
}
export function registerPrimaryUsingPhoneWithTokenV3_args(
	param?:
		| PartialDeep<LINETypes.registerPrimaryUsingPhoneWithTokenV3_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.authSessionId],
	];
}
export function registerUserid_args(
	param?: PartialDeep<LINETypes.registerUserid_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.searchId],
	];
}
export function reissueChatTicket_args(
	param?: PartialDeep<LINETypes.reissueChatTicket_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReissueChatTicketRequest(param.request)],
	];
}
export function rejectChatInvitation_args(
	param?: PartialDeep<LINETypes.rejectChatInvitation_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RejectChatInvitationRequest(param.request)],
	];
}
export function removeChatRoomAnnouncement_args(
	param?: PartialDeep<LINETypes.removeChatRoomAnnouncement_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.chatRoomMid],
		[10, 3, param.announcementSeq],
	];
}
export function removeFollower_args(
	param?: PartialDeep<LINETypes.removeFollower_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, RemoveFollowerRequest(param.removeFollowerRequest)],
	];
}
export function removeFriendRequest_args(
	param?: PartialDeep<LINETypes.removeFriendRequest_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_F4(param.direction)],
		[11, 2, param.midOrEMid],
	];
}
export function removeFromFollowBlacklist_args(
	param?: PartialDeep<LINETypes.removeFromFollowBlacklist_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[
			12,
			2,
			RemoveFromFollowBlacklistRequest(param.removeFromFollowBlacklistRequest),
		],
	];
}
export function removeIdentifier_args(
	param?: PartialDeep<LINETypes.removeIdentifier_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.authSessionId],
		[12, 3, IdentityCredentialRequest(param.request)],
	];
}
export function removeItemFromCollection_args(
	param?: PartialDeep<LINETypes.removeItemFromCollection_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RemoveItemFromCollectionRequest(param.request)],
	];
}
export function removeLinePayAccount_args(
	param?: PartialDeep<LINETypes.removeLinePayAccount_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.accountId],
	];
}
export function removeProductFromSubscriptionSlot_args(
	param?:
		| PartialDeep<LINETypes.removeProductFromSubscriptionSlot_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, RemoveProductFromSubscriptionSlotRequest(param.req)],
	];
}
export function reportAbuseEx_args(
	param?: PartialDeep<LINETypes.reportAbuseEx_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, ReportAbuseExRequest(param.request)],
	];
}
export function reportDeviceState_args(
	param?: PartialDeep<LINETypes.reportDeviceState_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[13, 2, [8, 2, param.booleanState]],
		[13, 3, [8, 11, param.stringState]],
	];
}
export function reportLocation_args(
	param?: PartialDeep<LINETypes.reportLocation_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Geolocation(param.location)],
		[8, 2, Pb1_EnumC12917a6(param.trigger)],
		[12, 3, ClientNetworkStatus(param.networkStatus)],
		[10, 4, param.measuredAt],
		[10, 6, param.clientCurrentTimestamp],
		[12, 7, LocationDebugInfo(param.debugInfo)],
	];
}
export function reportNetworkStatus_args(
	param?: PartialDeep<LINETypes.reportNetworkStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, Pb1_EnumC12917a6(param.trigger)],
		[12, 2, ClientNetworkStatus(param.networkStatus)],
		[10, 3, param.measuredAt],
		[10, 4, param.scanCompletionTimestamp],
	];
}
export function reportProfile_args(
	param?: PartialDeep<LINETypes.reportProfile_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 2, param.syncOpRevision],
		[12, 3, Profile(param.profile)],
	];
}
export function reportPushRecvReports_args(
	param?: PartialDeep<LINETypes.reportPushRecvReports_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[15, 2, [
			12,
			param.pushRecvReports &&
			param.pushRecvReports.map((e) => PushRecvReport(e)),
		]],
	];
}
export function reportRefreshedAccessToken_args(
	param?: PartialDeep<LINETypes.reportRefreshedAccessToken_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReportRefreshedAccessTokenRequest(param.request)],
	];
}
export function reportSettings_args(
	param?: PartialDeep<LINETypes.reportSettings_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 2, param.syncOpRevision],
		[12, 3, Settings(param.settings)],
	];
}
export function requestCleanupUserProvidedData_args(
	param?:
		| PartialDeep<LINETypes.requestCleanupUserProvidedData_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[14, 1, [8, param.dataTypes && param.dataTypes.map((e) => Pb1_od(e))]],
	];
}
export function requestToSendPasswordSetVerificationEmail_args(
	param?:
		| PartialDeep<LINETypes.requestToSendPasswordSetVerificationEmail_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[11, 2, param.email],
		[12, 3, AccountIdentifier(param.accountIdentifier)],
	];
}
export function requestToSendPhonePinCode_args(
	param?: PartialDeep<LINETypes.requestToSendPhonePinCode_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReqToSendPhonePinCodeRequest(param.request)],
	];
}
export function requestTradeNumber_args(
	param?: PartialDeep<LINETypes.requestTradeNumber_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.requestToken],
		[8, 2, r80_g0(param.requestType)],
		[11, 3, param.amount],
		[11, 4, param.name],
	];
}
export function resendIdentifierConfirmation_args(
	param?: PartialDeep<LINETypes.resendIdentifierConfirmation_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.authSessionId],
		[12, 3, IdentityCredentialRequest(param.request)],
	];
}
export function resendPinCode_args(
	param?: PartialDeep<LINETypes.resendPinCode_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.sessionId],
	];
}
export function reserveCoinPurchase_args(
	param?: PartialDeep<LINETypes.reserveCoinPurchase_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, CoinPurchaseReservation(param.request)],
	];
}
export function reserveSubscriptionPurchase_args(
	param?: PartialDeep<LINETypes.reserveSubscriptionPurchase_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReserveSubscriptionPurchaseRequest(param.request)],
	];
}
export function reserve_args(
	param?: PartialDeep<LINETypes.reserve_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ReserveRequest(param.request)],
	];
}
export function restoreE2EEKeyBackup_args(
	param?: PartialDeep<LINETypes.restoreE2EEKeyBackup_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, Pb1_C13155r7(param.request)],
	];
}
export function retrieveRequestTokenWithDocomoV2_args(
	param?:
		| PartialDeep<LINETypes.retrieveRequestTokenWithDocomoV2_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, Pb1_C13183t7(param.request)],
	];
}
export function retrieveRequestToken_args(
	param?: PartialDeep<LINETypes.retrieveRequestToken_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 2, CarrierCode(param.carrier)],
	];
}
export function revokeTokens_args(
	param?: PartialDeep<LINETypes.revokeTokens_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, RevokeTokensRequest(param.request)],
	];
}
export function saveStudentInformation_args(
	param?: PartialDeep<LINETypes.saveStudentInformation_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, SaveStudentInformationRequest(param.req)],
	];
}
export function sendChatChecked_args(
	param?: PartialDeep<LINETypes.sendChatChecked_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.seq],
		[11, 2, param.chatMid],
		[11, 3, param.lastMessageId],
		[3, 4, param.sessionId],
	];
}
export function sendChatRemoved_args(
	param?: PartialDeep<LINETypes.sendChatRemoved_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.seq],
		[11, 2, param.chatMid],
		[11, 3, param.lastMessageId],
		[3, 4, param.sessionId],
	];
}
export function sendEncryptedE2EEKey_args(
	param?: PartialDeep<LINETypes.sendEncryptedE2EEKey_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, SendEncryptedE2EEKeyRequest(param.request)],
	];
}
export function sendMessage_args(
	param?: PartialDeep<LINETypes.sendMessage_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.seq],
		[12, 2, Message(param.message)],
	];
}
export function sendPostback_args(
	param?: PartialDeep<LINETypes.sendPostback_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, SendPostbackRequest(param.request)],
	];
}
export function setChatHiddenStatus_args(
	param?: PartialDeep<LINETypes.setChatHiddenStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, SetChatHiddenStatusRequest(param.setChatHiddenStatusRequest)],
	];
}
export function setHashedPassword_args(
	param?: PartialDeep<LINETypes.setHashedPassword_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, SetHashedPasswordRequest(param.request)],
	];
}
export function setIdentifier_args(
	param?: PartialDeep<LINETypes.setIdentifier_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.authSessionId],
		[12, 3, IdentityCredentialRequest(param.request)],
	];
}
export function setNotificationsEnabled_args(
	param?: PartialDeep<LINETypes.setNotificationsEnabled_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[8, 2, MIDType(param.type)],
		[11, 3, param.target],
		[2, 4, param.enablement],
	];
}
export function setPassword_args(
	param?: PartialDeep<LINETypes.setPassword_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, SetPasswordRequest(param.request)],
	];
}
export function shouldShowWelcomeStickerBanner_args(
	param?:
		| PartialDeep<LINETypes.shouldShowWelcomeStickerBanner_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, Ob1_C12660s1(param.request)],
	];
}
export function startPhotobooth_args(
	param?: PartialDeep<LINETypes.startPhotobooth_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, StartPhotoboothRequest(param.request)],
	];
}
export function startUpdateVerification_args(
	param?: PartialDeep<LINETypes.startUpdateVerification_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.region],
		[8, 3, CarrierCode(param.carrier)],
		[11, 4, param.phone],
		[11, 5, param.udidHash],
		[12, 6, DeviceInfo(param.deviceInfo)],
		[11, 7, param.networkCode],
		[11, 8, param.locale],
		[12, 9, SIMInfo(param.simInfo)],
	];
}
export function stopBundleSubscription_args(
	param?: PartialDeep<LINETypes.stopBundleSubscription_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, StopBundleSubscriptionRequest(param.request)],
	];
}
export function storeShareTargetPickerResult_args(
	param?: PartialDeep<LINETypes.storeShareTargetPickerResult_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ShareTargetPickerResultRequest(param.request)],
	];
}
export function storeSubWindowResult_args(
	param?: PartialDeep<LINETypes.storeSubWindowResult_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, SubWindowResultRequest(param.request)],
	];
}
export function syncContacts_args(
	param?: PartialDeep<LINETypes.syncContacts_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[15, 2, [
			12,
			param.localContacts &&
			param.localContacts.map((e) => ContactModification(e)),
		]],
	];
}
export function sync_args(
	param?: PartialDeep<LINETypes.sync_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, SyncRequest(param.request)],
	];
}
export function tryFriendRequest_args(
	param?: PartialDeep<LINETypes.tryFriendRequest_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.midOrEMid],
		[8, 2, Pb1_G4(param.method)],
		[11, 3, param.friendRequestParams],
	];
}
export function unblockContact_args(
	param?: PartialDeep<LINETypes.unblockContact_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.id],
		[11, 3, param.reference],
	];
}
export function unblockRecommendation_args(
	param?: PartialDeep<LINETypes.unblockRecommendation_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.targetMid],
	];
}
export function unfollow_args(
	param?: PartialDeep<LINETypes.unfollow_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, UnfollowRequest(param.unfollowRequest)],
	];
}
export function unlinkDevice_args(
	param?: PartialDeep<LINETypes.unlinkDevice_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, DeviceUnlinkRequest(param.request)],
	];
}
export function unsendMessage_args(
	param?: PartialDeep<LINETypes.unsendMessage_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.seq],
		[11, 2, param.messageId],
	];
}
export function updateAndGetNearby_args(
	param?: PartialDeep<LINETypes.updateAndGetNearby_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[4, 2, param.latitude],
		[4, 3, param.longitude],
		[12, 4, GeolocationAccuracy(param.accuracy)],
		[12, 5, ClientNetworkStatus(param.networkStatus)],
		[4, 6, param.altitudeMeters],
		[4, 7, param.velocityMetersPerSecond],
		[4, 8, param.bearingDegrees],
		[10, 9, param.measuredAtTimestamp],
		[10, 10, param.clientCurrentTimestamp],
	];
}
export function updateChannelNotificationSetting_args(
	param?:
		| PartialDeep<LINETypes.updateChannelNotificationSetting_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [
			12,
			param.setting && param.setting.map((e) => ChannelNotificationSetting(e)),
		]],
	];
}
export function updateChannelSettings_args(
	param?: PartialDeep<LINETypes.updateChannelSettings_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, ChannelSettings(param.channelSettings)],
	];
}
export function updateChatRoomBGM_args(
	param?: PartialDeep<LINETypes.updateChatRoomBGM_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.chatRoomMid],
		[11, 3, param.chatRoomBGMInfo],
	];
}
export function updateChat_args(
	param?: PartialDeep<LINETypes.updateChat_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UpdateChatRequest(param.request)],
	];
}
export function updateContactSetting_args(
	param?: PartialDeep<LINETypes.updateContactSetting_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[11, 2, param.mid],
		[8, 3, ContactSetting(param.flag)],
		[11, 4, param.value],
	];
}
export function updateExtendedProfileAttribute_args(
	param?:
		| PartialDeep<LINETypes.updateExtendedProfileAttribute_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		,
		[12, 3, ExtendedProfile(param.extendedProfile)],
	];
}
export function updateGroupCallUrl_args(
	param?: PartialDeep<LINETypes.updateGroupCallUrl_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, UpdateGroupCallUrlRequest(param.request)],
	];
}
export function updateIdentifier_args(
	param?: PartialDeep<LINETypes.updateIdentifier_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.authSessionId],
		[12, 3, IdentityCredentialRequest(param.request)],
	];
}
export function updateNotificationToken_args(
	param?: PartialDeep<LINETypes.updateNotificationToken_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.token],
		[8, 3, NotificationType(param.type)],
	];
}
export function updatePassword_args(
	param?: PartialDeep<LINETypes.updatePassword_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UpdatePasswordRequest(param.request)],
	];
}
export function updateProfileAttributes_args(
	param?: PartialDeep<LINETypes.updateProfileAttributes_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[12, 2, UpdateProfileAttributesRequest(param.request)],
	];
}
export function updateSafetyStatus_args(
	param?: PartialDeep<LINETypes.updateSafetyStatus_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, UpdateSafetyStatusRequest(param.req)],
	];
}
export function updateSettingsAttributes2_args(
	param?: PartialDeep<LINETypes.updateSettingsAttributes2_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[8, 1, param.reqSeq],
		[12, 3, Settings(param.settings)],
		[14, 4, [
			8,
			param.attributesToUpdate &&
			param.attributesToUpdate.map((e) => SettingsAttributeEx(e)),
		]],
	];
}
export function updateUserGeneralSettings_args(
	param?: PartialDeep<LINETypes.updateUserGeneralSettings_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[13, 1, [8, 11, param.settings]],
	];
}
export function usePhotoboothTicket_args(
	param?: PartialDeep<LINETypes.usePhotoboothTicket_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, UsePhotoboothTicketRequest(param.request)],
	];
}
export function validateEligibleFriends_args(
	param?: PartialDeep<LINETypes.validateEligibleFriends_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[15, 1, [11, param.friends]],
		[8, 2, r80_EnumC34376p(param.type)],
	];
}
export function validateProduct_args(
	param?: PartialDeep<LINETypes.validateProduct_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.shopId],
		[11, 3, param.productId],
		[10, 4, param.productVersion],
	];
}
export function validateProfile_args(
	param?: PartialDeep<LINETypes.validateProfile_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[11, 2, param.displayName],
	];
}
export function verifyAccountUsingHashedPwd_args(
	param?: PartialDeep<LINETypes.verifyAccountUsingHashedPwd_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, VerifyAccountUsingHashedPwdRequest(param.request)],
	];
}
export function verifyAssertion_args(
	param?: PartialDeep<LINETypes.verifyAssertion_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, VerifyAssertionRequest(param.request)],
	];
}
export function verifyAttestation_args(
	param?: PartialDeep<LINETypes.verifyAttestation_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, VerifyAttestationRequest(param.request)],
	];
}
export function verifyBirthdayGiftAssociationToken_args(
	param?:
		| PartialDeep<LINETypes.verifyBirthdayGiftAssociationToken_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 2, BirthdayGiftAssociationVerifyRequest(param.req)],
	];
}
export function verifyEapAccountForRegistration_args(
	param?:
		| PartialDeep<LINETypes.verifyEapAccountForRegistration_args>
		| undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, Device(param.device)],
		[12, 3, SocialLogin(param.socialLogin)],
	];
}
export function verifyEapLogin_args(
	param?: PartialDeep<LINETypes.verifyEapLogin_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, VerifyEapLoginRequest(param.request)],
	];
}
export function verifyPhoneNumber_args(
	param?: PartialDeep<LINETypes.verifyPhoneNumber_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.sessionId],
		[11, 3, param.pinCode],
		[11, 4, param.udidHash],
		[11, 5, param.migrationPincodeSessionId],
		[11, 6, param.oldUdidHash],
	];
}
export function verifyPhonePinCode_args(
	param?: PartialDeep<LINETypes.verifyPhonePinCode_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, VerifyPhonePinCodeRequest(param.request)],
	];
}
export function verifyPinCode_args(
	param?: PartialDeep<LINETypes.verifyPinCode_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, VerifyPinCodeRequest(param.request)],
	];
}
export function verifyQrCode_args(
	param?: PartialDeep<LINETypes.verifyQrCode_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, VerifyQrCodeRequest(param.request)],
	];
}
export function verifyQrcode_args(
	param?: PartialDeep<LINETypes.verifyQrcode_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 2, param.verifier],
		[11, 3, param.pinCode],
	];
}
export function verifySocialLogin_args(
	param?: PartialDeep<LINETypes.verifySocialLogin_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.authSessionId],
		[12, 2, Device(param.device)],
		[12, 3, SocialLogin(param.socialLogin)],
	];
}
export function wakeUpLongPolling_args(
	param?: PartialDeep<LINETypes.wakeUpLongPolling_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[10, 2, param.clientRevision],
	];
}

export function F61_EnumC10204a0(
	param: LINETypes.F61_EnumC10204a0 | undefined,
): LINETypes.F61_EnumC10204a0 & number | undefined {
	return typeof param === "string"
		? LINETypes.enums.F61_EnumC10204a0[param]
		: param;
}
export function GetUserFriendIdsRequest(
	param?: PartialDeep<LINETypes.GetUserFriendIdsRequest> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[11, 1, param.userPageToken],
		[8, 2, F61_EnumC10204a0(param.blockStatus)],
	];
}
export function getUserFriendIds_args(
	param?: PartialDeep<LINETypes.getUserFriendIds_args> | undefined,
): NestedArray {
	return typeof param === "undefined" ? [] : [
		[12, 1, GetUserFriendIdsRequest(param.request)],
	];
}
