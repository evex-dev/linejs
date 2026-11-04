// Call control-plane wrappers + CallSession glue.
import type { Client } from "../../mod.ts";
import type * as LINETypes from "@evex-dev/linejs-types";
import type { DeviceDetails } from "../../../base/mod.ts";
import type { CodecFactory } from "./audio.ts";
import { defaultCodecFactory } from "./audio.ts";
import { type IncomingAudioCall, parseIncomingAudioCall } from "./incoming.ts";
import { type PlanetIncomingIdentity, PlanetTransport } from "./planet/transport.ts";
export {
	type IncomingAudioCall,
	type IncomingCallRoute,
	parseIncomingAudioCall,
} from "./incoming.ts";
export type { PlanetIncomingIdentity } from "./planet/transport.ts";

export interface AnswerIncomingOptions {
	/** Stable base64-encoded 32-byte installation ID, generated and stored by the application. */
	deviceId: string;
	signal?: AbortSignal;
	timeoutMs?: number;
}
import { CallSession, type CallSessionOpts, type CallTransport } from "./session.ts";

export type {
	CallSession,
	CallSessionEvents,
	CallSessionOpts,
	CallSessionState,
	CallTransport,
} from "./session.ts";
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
	type NativeGroupOpusPacketizeOptions,
	packetizeNativeGroupOpusPairs,
	type PcmFrame,
	resampleLinear,
	streamSink,
	streamSource,
} from "./audio.ts";
export { stubTransport } from "./session.ts";
export { AndromedaTransport, type AndromedaTransportOpts } from "./andromeda.ts";
export {
	buildExchangeAppStrData as planetBuildExchangeAppStrData,
	buildFrameHeader as planetBuildFrameHeader,
	buildRelReq as planetBuildRelReq,
	buildSetupReq as planetBuildSetupReq,
	type CassiniBody,
	type CassiniEnvelope,
	type CassiniHeader,
	decodeMpKey as planetDecodeMpKey,
	decodeNativeSetupOffer as planetDecodeNativeSetupOffer,
	decodePlanetMsg as planetDecodePlanetMsg,
	deriveCallKeys as planetDeriveCallKeys,
	type EphemeralKeypair,
	generateEphemeralKeypair as planetGenerateEphemeralKeypair,
	makeChunkHdr as planetMakeChunkHdr,
	packCassini,
	parseChunkHdr as planetParseChunkHdr,
	parseFrameHeader as planetParseFrameHeader,
	type PlanetAnswerResult,
	type PlanetEndReason,
	type PlanetFixedHdr,
	type PlanetInviteResult,
	type PlanetLocalMediaOffer,
	PlanetTransport,
	type PlanetTransportOpts,
	type TransportKeys,
	unpackCassini,
} from "./planet/mod.ts";
export { opusCodecFactory } from "./opus.ts";
export {
	buildRtcpBye,
	buildRtcpCompound,
	nowNtp as rtcpNowNtp,
	type ParsedRtcp,
	parseRtcp,
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
	mikeyFromBase64,
	type MikeyParsed,
	type MikeyPkeOpts,
	mikeyToBase64,
	parseMikey,
} from "./mikey.ts";
export {
	buildRtp,
	deriveSrtpContext,
	parseRtp,
	SRTP_KEYING_LEN,
	type SrtpCryptoContext,
	srtpDecrypt,
	srtpEncrypt,
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

export function defaultCallFromEnvInfo(deviceDetails: DeviceDetails): Record<string, string> {
	const devname = (() => {
		switch (deviceDetails.device) {
			case "ANDROID":
			case "ANDROIDSECONDARY":
				return "Android";
			case "IOS":
				return "iPhone";
			case "IOSIPAD":
				return "iPad";
			case "DESKTOPWIN":
				return "Windows";
			case "DESKTOPMAC":
				return "Mac";
			case "WATCHOS":
				return "Watch";
			case "WEAROS":
				return "Wear OS";
			default:
				return deviceDetails.systemName || deviceDetails.device;
		}
	})();
	return { devname };
}

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
	): ReturnType<import("../../../base/service/call/mod.ts").CallService["acquireGroupCallRoute"]>;

	acquireOARoute(
		...args: Parameters<
			import("../../../base/service/call/mod.ts").CallService["acquireOACallRoute"]
		>
	): ReturnType<import("../../../base/service/call/mod.ts").CallService["acquireOACallRoute"]>;

	getGroupCall(chatMid: string): Promise<unknown>;

	createGroupCallUrl(
		...args: Parameters<
			import("../../../base/service/call/mod.ts").CallService["createGroupCallUrl"]
		>
	): ReturnType<import("../../../base/service/call/mod.ts").CallService["createGroupCallUrl"]>;
	getGroupCallUrl(
		ticket: string,
	): ReturnType<import("../../../base/service/call/mod.ts").CallService["getGroupCallUrlInfo"]>;
	listGroupCallUrls(): ReturnType<
		import("../../../base/service/call/mod.ts").CallService["getGroupCallUrls"]
	>;
	updateGroupCallUrl(
		...args: Parameters<
			import("../../../base/service/call/mod.ts").CallService["updateGroupCallUrl"]
		>
	): ReturnType<import("../../../base/service/call/mod.ts").CallService["updateGroupCallUrl"]>;
	deleteGroupCallUrl(
		...args: Parameters<
			import("../../../base/service/call/mod.ts").CallService["deleteGroupCallUrl"]
		>
	): ReturnType<import("../../../base/service/call/mod.ts").CallService["deleteGroupCallUrl"]>;
	joinChatByUrl(ticket: string): Promise<unknown>;
	invite(
		...args: Parameters<
			import("../../../base/service/call/mod.ts").CallService["inviteIntoGroupCall"]
		>
	): ReturnType<import("../../../base/service/call/mod.ts").CallService["inviteIntoGroupCall"]>;
	kick(
		...args: Parameters<
			import("../../../base/service/call/mod.ts").CallService["kickoutFromGroupCall"]
		>
	): ReturnType<import("../../../base/service/call/mod.ts").CallService["kickoutFromGroupCall"]>;

	readonly service: import("../../../base/service/call/mod.ts").CallService;
	startSession(opts: CallSessionOpts): CallSession;
	/** Explicitly answer an authenticated event. Unsupported calls fail before network I/O. */
	answerIncoming(event: IncomingCallEvent, opts: AnswerIncomingOptions): Promise<PlanetTransport>;
	setCodecFactory(factory: CodecFactory): void;
}

class ClientCall implements CallClient {
	#client: Client;
	#codecs: CodecFactory = defaultCodecFactory;
	#incomingBusy = false;
	#lastIncomingId?: string;
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

	async answerIncoming(
		event: IncomingCallEvent,
		opts: AnswerIncomingOptions,
	): Promise<PlanetTransport> {
		if (opts.timeoutMs !== undefined && (!Number.isFinite(opts.timeoutMs) || opts.timeoutMs <= 0))
			throw new Error("incoming timeout must be positive and finite");
		const localMid = this.#client.base.profile?.mid ?? "";
		// Reparse raw input rather than trusting application-mutated event aliases.
		const incoming = parseIncomingAudioCall(event.raw, localMid);
		if (!incoming) throw new Error("unsupported incoming audio operation");
		if (this.#incomingBusy || this.#lastIncomingId === incoming.callId) {
			throw new Error("incoming call already handled or busy");
		}
		opts.signal?.throwIfAborted();
		const details = this.#client.base.deviceDetails;
		const identity: PlanetIncomingIdentity = {
			deviceId: opts.deviceId,
			userAgent: {
				osName: details.systemName,
				osVersion: details.systemVersion,
				deviceName: defaultCallFromEnvInfo(details).devname,
				appReleaseInfo: [
					details.device,
					details.appVersion,
					details.systemName,
					details.systemVersion,
				].join("	"),
			},
		};
		const transport = new PlanetTransport({
			localMid,
			timeoutMs: opts.timeoutMs ?? 10000,
			keepaliveIntervalMs: 10000,
		});
		this.#incomingBusy = true;
		this.#lastIncomingId = incoming.callId;
		try {
			await transport.connect({ route: incoming.route });
			opts.signal?.throwIfAborted();
			await transport.verifyIncomingDetailed(incoming, identity, opts.signal);
			await transport.acceptIncomingDetailed();
			void transport.ended
				.then(() => transport.close())
				.catch((error) => {
					try {
						this.#client.base.log("CallCloseError", { error });
					} catch {
						/* logging must not reject cleanup */
					}
				})
				.finally(() => {
					this.#incomingBusy = false;
				});
			return transport;
		} catch (error) {
			try {
				await transport.close();
			} finally {
				this.#incomingBusy = false;
			}
			throw error;
		}
	}

	acquireRoute(opts: { to: string; callType?: CallType; fromEnvInfo?: Record<string, string> }) {
		return this.service.acquireCallRoute({
			to: opts.to,
			callType: opts.callType ?? "AUDIO",
			fromEnvInfo: opts.fromEnvInfo ?? defaultCallFromEnvInfo(this.#client.base.deviceDetails),
		} as never);
	}
	acquireGroupRoute(...args: Parameters<typeof this.service.acquireGroupCallRoute>) {
		return this.service.acquireGroupCallRoute(...args);
	}
	acquireOARoute(...args: Parameters<typeof this.service.acquireOACallRoute>) {
		return this.service.acquireOACallRoute(...args);
	}
	getGroupCall(chatMid: string) {
		return this.service.getGroupCall({ chatMid } as never);
	}
	createGroupCallUrl(...args: Parameters<typeof this.service.createGroupCallUrl>) {
		return this.service.createGroupCallUrl(...args);
	}
	getGroupCallUrl(ticket: string) {
		return this.service.getGroupCallUrlInfo({ groupCallUrlTicket: ticket } as never);
	}
	listGroupCallUrls() {
		return this.service.getGroupCallUrls({} as never);
	}
	updateGroupCallUrl(...args: Parameters<typeof this.service.updateGroupCallUrl>) {
		return this.service.updateGroupCallUrl(...args);
	}
	deleteGroupCallUrl(...args: Parameters<typeof this.service.deleteGroupCallUrl>) {
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
	/** Validated native audio metadata, bound to the logged-in local profile. */
	audio?: IncomingAudioCall;
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

export function parseIncomingCall(op: LINETypes.Operation, localMid = ""): IncomingCallEvent {
	const audio = parseIncomingAudioCall(op, localMid);
	return {
		audio,
		callMid: audio?.callId ?? (op as { param1?: string }).param1 ?? "",
		from: audio?.callerMid ?? (op as { param2?: string }).param2 ?? "",
		kind: audio ? "AUDIO" : (op as { param3?: string }).param3,
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
