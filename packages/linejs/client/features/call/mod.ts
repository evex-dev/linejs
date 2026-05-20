// Call control-plane wrappers + CallSession glue.
import type { Client } from "../../mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import type { CodecFactory } from "./audio.ts";
import { defaultCodecFactory } from "./audio.ts";
import { CallSession, type CallSessionOpts, type CallTransport } from "./session.ts";

export type { CallSession, CallSessionEvents, CallSessionOpts, CallSessionState, CallTransport } from "./session.ts";
export {
	type AudioDecoder,
	type AudioEncoder,
	type AudioSink,
	type AudioSource,
	bufferSink,
	bufferSource,
	type CodecFactory,
	decodeWavSync,
	defaultCodecFactory,
	type FileDecoder,
	type PcmFrame,
	resampleLinear,
	streamSink,
	streamSource,
} from "./audio.ts";
export { stubTransport } from "./session.ts";
export { AndromedaTransport, type AndromedaTransportOpts } from "./andromeda.ts";
export {
	buildFrameHeader as planetBuildFrameHeader,
	buildRelReq as planetBuildRelReq,
	buildSetupReq as planetBuildSetupReq,
	CASSINI_MSG,
	type CassiniHeader,
	type CassiniMsgType,
	decodeMpKey as planetDecodeMpKey,
	deriveSessionKeys as planetDeriveSessionKeys,
	makeChunkHdr as planetMakeChunkHdr,
	packCassini,
	parseChunkHdr as planetParseChunkHdr,
	parseFrameHeader as planetParseFrameHeader,
	type PlanetFixedHdr,
	type PlanetSessionKeys,
	PlanetTransport,
	type PlanetTransportOpts,
	SETUP_TAG,
	type TLV,
	unpackCassini,
} from "./planet/mod.ts";
export { opusCodecFactory } from "./opus.ts";
export {
	buildRtcpBye,
	buildRtcpCompound,
	nowNtp as rtcpNowNtp,
	parseRtcp,
	type ParsedRtcp,
	type ReportBlock,
	type SenderInfo,
} from "./rtcp.ts";
export {
	buildBindingRequestAsync,
	parseStun,
	readMappedAddress,
	type StunMessage,
} from "./stun.ts";
export {
	DEFAULT_STUN_HOSTS,
	formatCandidate,
	gatherHost,
	gatherIceCandidates,
	gatherSrflx,
	type IceCandidate,
	type IceCandidateType,
	icePriority,
	parseCandidate,
} from "./ice.ts";
export {
	buildAudioOffer,
	buildAudioOfferMikey,
	buildSdp,
	cryptoAttr,
	keyMgmtMikeyAttr,
	parseSdp,
	readCrypto,
	readKeyMgmt,
	readRtpmap,
	type SdpMedia,
	type SdpSession,
} from "./sdp.ts";
export {
	buildMikeyPke,
	type MikeyParsed,
	type MikeyPkeOpts,
	mikeyFromBase64,
	mikeyToBase64,
	parseMikey,
} from "./mikey.ts";
export {
	buildRtp,
	deriveSrtpContext,
	parseRtp,
	type SrtpCryptoContext,
	srtpDecrypt,
	srtpEncrypt,
	SRTP_KEYING_LEN,
} from "./srtp.ts";
export {
	buildSip,
	digestResponse,
	getStatusCode,
	newBranch,
	parseDigestChallenge,
	parseSip,
	randomCallId,
	type SipMessage,
} from "./sip.ts";

export type CallType = "AUDIO" | "VIDEO" | "FACEPLAY";

export interface CallClient {
	acquireRoute(opts: {
		to: string;
		callType?: CallType;
		fromEnvInfo?: Record<string, string>;
	}): Promise<LINETypes.CallRoute>;

	acquireGroupRoute(
		...args: Parameters<
			import("../../../base/service/call/mod.ts").CallService["acquireGroupCallRoute"]
		>
	): ReturnType<
		import("../../../base/service/call/mod.ts").CallService["acquireGroupCallRoute"]
	>;

	acquireOARoute(
		...args: Parameters<
			import("../../../base/service/call/mod.ts").CallService["acquireOACallRoute"]
		>
	): ReturnType<
		import("../../../base/service/call/mod.ts").CallService["acquireOACallRoute"]
	>;

	getGroupCall(chatMid: string): Promise<unknown>;

	createGroupCallUrl(
		...args: Parameters<
			import("../../../base/service/call/mod.ts").CallService["createGroupCallUrl"]
		>
	): ReturnType<
		import("../../../base/service/call/mod.ts").CallService["createGroupCallUrl"]
	>;
	getGroupCallUrl(
		ticket: string,
	): ReturnType<
		import("../../../base/service/call/mod.ts").CallService["getGroupCallUrlInfo"]
	>;
	listGroupCallUrls(): ReturnType<
		import("../../../base/service/call/mod.ts").CallService["getGroupCallUrls"]
	>;
	updateGroupCallUrl(
		...args: Parameters<
			import("../../../base/service/call/mod.ts").CallService["updateGroupCallUrl"]
		>
	): ReturnType<
		import("../../../base/service/call/mod.ts").CallService["updateGroupCallUrl"]
	>;
	deleteGroupCallUrl(
		...args: Parameters<
			import("../../../base/service/call/mod.ts").CallService["deleteGroupCallUrl"]
		>
	): ReturnType<
		import("../../../base/service/call/mod.ts").CallService["deleteGroupCallUrl"]
	>;
	joinChatByUrl(ticket: string): Promise<unknown>;
	invite(
		...args: Parameters<
			import("../../../base/service/call/mod.ts").CallService["inviteIntoGroupCall"]
		>
	): ReturnType<
		import("../../../base/service/call/mod.ts").CallService["inviteIntoGroupCall"]
	>;
	kick(
		...args: Parameters<
			import("../../../base/service/call/mod.ts").CallService["kickoutFromGroupCall"]
		>
	): ReturnType<
		import("../../../base/service/call/mod.ts").CallService["kickoutFromGroupCall"]
	>;

	readonly service: import("../../../base/service/call/mod.ts").CallService;
	startSession(opts: CallSessionOpts): CallSession;
	setCodecFactory(factory: CodecFactory): void;
}

class ClientCall implements CallClient {
	#client: Client;
	#codecs: CodecFactory = defaultCodecFactory;
	constructor(client: Client) {
		this.#client = client;
	}
	get service() {
		return this.#client.base.call;
	}
	startSession(opts: CallSessionOpts): CallSession {
		return new CallSession(this.#client, { codecs: this.#codecs, ...opts });
	}
	setCodecFactory(factory: CodecFactory): void {
		this.#codecs = factory;
	}

	acquireRoute(opts: {
		to: string;
		callType?: CallType;
		fromEnvInfo?: Record<string, string>;
	}) {
		return this.service.acquireCallRoute({
			to: opts.to,
			callType: opts.callType ?? "AUDIO",
			fromEnvInfo: opts.fromEnvInfo,
		} as never);
	}
	acquireGroupRoute(
		...args: Parameters<typeof this.service.acquireGroupCallRoute>
	) {
		return this.service.acquireGroupCallRoute(...args);
	}
	acquireOARoute(...args: Parameters<typeof this.service.acquireOACallRoute>) {
		return this.service.acquireOACallRoute(...args);
	}
	getGroupCall(chatMid: string) {
		return this.service.getGroupCall({ chatMid } as never);
	}
	createGroupCallUrl(
		...args: Parameters<typeof this.service.createGroupCallUrl>
	) {
		return this.service.createGroupCallUrl(...args);
	}
	getGroupCallUrl(ticket: string) {
		return this.service.getGroupCallUrlInfo({ groupCallUrlTicket: ticket } as never);
	}
	listGroupCallUrls() {
		return this.service.getGroupCallUrls({} as never);
	}
	updateGroupCallUrl(
		...args: Parameters<typeof this.service.updateGroupCallUrl>
	) {
		return this.service.updateGroupCallUrl(...args);
	}
	deleteGroupCallUrl(
		...args: Parameters<typeof this.service.deleteGroupCallUrl>
	) {
		return this.service.deleteGroupCallUrl(...args);
	}
	joinChatByUrl(ticket: string) {
		return this.service.joinChatByCallUrl({ groupCallUrlTicket: ticket } as never);
	}
	invite(...args: Parameters<typeof this.service.inviteIntoGroupCall>) {
		return this.service.inviteIntoGroupCall(...args);
	}
	kick(...args: Parameters<typeof this.service.kickoutFromGroupCall>) {
		return this.service.kickoutFromGroupCall(...args);
	}
}

export function createCallClient(client: Client): CallClient {
	return new ClientCall(client);
}

export interface IncomingCallEvent {
	callMid: string;
	from: string;
	kind?: string;
	raw: LINETypes.Operation;
}

export interface CancelCallEvent {
	callMid: string;
	from: string;
	reason?: string;
	raw: LINETypes.Operation;
}

export function parseIncomingCall(op: LINETypes.Operation): IncomingCallEvent {
	return {
		callMid: (op as { param1?: string }).param1 ?? "",
		from: (op as { param2?: string }).param2 ?? "",
		kind: (op as { param3?: string }).param3,
		raw: op,
	};
}

export function parseCancelCall(op: LINETypes.Operation): CancelCallEvent {
	return {
		callMid: (op as { param1?: string }).param1 ?? "",
		from: (op as { param2?: string }).param2 ?? "",
		reason: (op as { param3?: string }).param3,
		raw: op,
	};
}
