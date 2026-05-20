// SIP-over-UDP transport for LINE call media plane.
// Uses node:dgram for UDP (works in Node and Deno without flags).

import { Buffer } from "node:buffer";
import type { Socket as DgramSocket } from "node:dgram";
import type * as LINETypes from "@evex/linejs-types";
import type { CallTransport } from "./session.ts";
import {
	buildSip,
	digestResponse,
	getStatusCode,
	newBranch,
	parseDigestChallenge,
	parseSip,
	randomCallId,
} from "./sip.ts";
import {
	buildAudioOffer,
	buildAudioOfferMikey,
	parseSdp,
	readCrypto,
	readKeyMgmt,
} from "./sdp.ts";
import { buildMikeyPke, mikeyFromBase64, mikeyToBase64, parseMikey } from "./mikey.ts";
import {
	buildRtp,
	deriveSrtpContext,
	parseRtp,
	type SrtpCryptoContext,
	srtpDecrypt,
	srtpEncrypt,
	SRTP_KEYING_LEN,
} from "./srtp.ts";

export interface AndromedaTransportOpts {
	localMid: string;
	userAgent?: string;
	timeoutMs?: number;
}

type UdpSocket = DgramSocket;

/** Endpoint extracted from a CallRoute. SIP signaling + media live on
 *  the same UDP host:port for LINE; SRTP packets flow back over RTP-
 *  established socket pairs after the SDP answer. */
interface CallRouteEndpoint {
	host: string;
	port: number;
	tcpPort?: number;
	host6?: string;
	fromToken: string;
	stnpk?: Uint8Array;
}

/** Decode a base64 string to Uint8Array. */
function b64decode(s: string): Uint8Array {
	const bin = atob(s);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

/** Resolve the SIP/SRTP endpoint + credentials from a CallRoute. */
function routeEndpoint(r: LINETypes.CallRoute): CallRouteEndpoint {
	if (!r.voipAddress) throw new Error("CallRoute: no voipAddress");
	if (!r.voipUdpPort) throw new Error("CallRoute: no voipUdpPort");
	return {
		host: r.voipAddress,
		port: r.voipUdpPort,
		tcpPort: r.voipTcpPort,
		host6: r.voipAddress6 || undefined,
		fromToken: r.fromToken,
		stnpk: r.stnpk ? b64decode(r.stnpk) : undefined,
	};
}

export class AndromedaTransport implements CallTransport {
	#opts: AndromedaTransportOpts;
	#sock?: UdpSocket;
	#route?: LINETypes.CallRoute;
	#cseq = 0;
	#pending: ((msg: Uint8Array) => void)[] = [];
	#sipFrom?: string;
	#sipFromTag?: string;
	#callId?: string;
	#localKey?: Uint8Array;
	#remoteKey?: Uint8Array;
	#srtpSend?: SrtpCryptoContext;
	#srtpRecv?: SrtpCryptoContext;
	#rtp?: {
		host: string;
		port: number;
		ssrc: number;
		seq: number;
		timestamp: number;
	};
	#rtpQueue: Uint8Array[] = [];
	#rtpWaiters: ((b: Uint8Array | null) => void)[] = [];

	constructor(opts: AndromedaTransportOpts) {
		this.#opts = opts;
	}

	async connect(opts: { route: LINETypes.CallRoute }): Promise<void> {
		this.#route = opts.route;
		const dgram = await import("node:dgram");
		const sock: UdpSocket = dgram.createSocket("udp4");
		this.#sock = sock;
		await new Promise<void>((res) => sock.bind({ address: "0.0.0.0", port: 0 }, () => res()));
		sock.on("message", (buf, rinfo) => {
			const u8 = new Uint8Array(buf);
			// Route SIP (text, starts with method/SIP/2.0) vs RTP (binary, v=2)
			const isSip = u8.length > 4 &&
				(u8[0] === 0x53 /* S */ ||
					/[A-Z]/.test(String.fromCharCode(u8[0])) && u8.includes(0x20));
			if (isSip) {
				const w = this.#pending.shift();
				if (w) w(u8);
			} else if (this.#rtp && rinfo.port === this.#rtp.port) {
				this.#enqueueRtp(u8);
			} else {
				const w = this.#pending.shift();
				if (w) w(u8);
			}
		});
		await this.register();
	}

	#enqueueRtp(p: Uint8Array) {
		const w = this.#rtpWaiters.shift();
		if (w) w(p);
		else this.#rtpQueue.push(p);
	}
	#takeRtp(): Promise<Uint8Array | null> {
		if (this.#rtpQueue.length) return Promise.resolve(this.#rtpQueue.shift()!);
		return new Promise((res) => this.#rtpWaiters.push(res));
	}

	async close(): Promise<void> {
		await new Promise<void>((res) => this.#sock?.close(() => res()));
	}

	async send(opusPacket: Uint8Array): Promise<void> {
		if (!this.#srtpSend || !this.#rtp) {
			throw new Error("AndromedaTransport.send: call not established (INVITE first)");
		}
		const rtp = buildRtp({
			payloadType: 96,
			seq: this.#rtp.seq++ & 0xffff,
			timestamp: (this.#rtp.timestamp += 960) >>> 0, // 20ms @ 48kHz
			ssrc: this.#rtp.ssrc,
			payload: opusPacket,
		});
		const wire = await srtpEncrypt(this.#srtpSend, rtp);
		await new Promise<void>((res, rj) => {
			this.#sock!.send(wire, this.#rtp!.port, this.#rtp!.host, (e) => e ? rj(e) : res());
		});
	}

	async *receive(): AsyncIterable<Uint8Array> {
		if (!this.#srtpRecv) {
			throw new Error("AndromedaTransport.receive: call not established (INVITE first)");
		}
		while (true) {
			const wire = await this.#takeRtp();
			if (!wire) return;
			try {
				const rtp = await srtpDecrypt(this.#srtpRecv, wire);
				yield parseRtp(rtp).payload;
			} catch { /* drop bad packet */ }
		}
	}

	/** REGISTER against cscf. Returns final SIP status (200 = registered). */
	async register(): Promise<number> {
		const ep = routeEndpoint(this.#route!);
		const token = ep.fromToken;
		const target = `sip:${ep.host}`;
		const callId = this.#callId ?? randomCallId(this.#opts.localMid);
		const fromTag = this.#sipFromTag ?? newBranch().slice(7, 15);
		this.#callId = callId;
		this.#sipFromTag = fromTag;
		this.#sipFrom = `<sip:${this.#opts.localMid}@${ep.host}>`;
		const ua = this.#opts.userAgent ?? "Line/26.6.2";

		const baseHeaders = (cseq: number, auth?: string): Record<string, string> => ({
			"Via": `SIP/2.0/UDP ${this.#opts.localMid}.invalid;branch=${newBranch()};rport`,
			"Max-Forwards": "70",
			"From": `<sip:${this.#opts.localMid}@${ep.host}>;tag=${fromTag}`,
			"To": `<sip:${this.#opts.localMid}@${ep.host}>`,
			"Call-ID": callId,
			"CSeq": `${cseq} REGISTER`,
			"User-Agent": ua,
			"Contact": `<sip:${this.#opts.localMid}@invalid:0>`,
			"Expires": "300",
			"Content-Length": "0",
			...(auth ? { "Authorization": auth } : {}),
		});

		const dst = { host: ep.host, port: ep.port };
		this.#cseq++;
		await this.#sendTo(dst, {
			startLine: `REGISTER ${target} SIP/2.0`,
			headers: baseHeaders(this.#cseq),
			body: "",
		});
		const challenge = parseSip(await this.#receive());
		const status = getStatusCode(challenge.startLine);
		if (status === 200) return 200;
		if (status !== 401 && status !== 407) {
			throw new Error(`REGISTER unexpected status: ${challenge.startLine}`);
		}
		const wwwAuth = challenge.headers["WWW-Authenticate"] ??
			challenge.headers["Proxy-Authenticate"] ?? "";
		const d = parseDigestChallenge(wwwAuth);
		const auth = await digestResponse({
			username: this.#opts.localMid,
			password: token,
			realm: d.realm ?? ep.host,
			nonce: d.nonce ?? "",
			uri: target,
			method: "REGISTER",
			qop: d.qop || undefined,
			opaque: d.opaque,
			algorithm: d.algorithm,
		});

		this.#cseq++;
		await this.#sendTo(dst, {
			startLine: `REGISTER ${target} SIP/2.0`,
			headers: baseHeaders(this.#cseq, auth),
			body: "",
		});
		const final = parseSip(await this.#receive());
		return getStatusCode(final.startLine) ?? 0;
	}

	/**
	 * INVITE the peer via cscf. Returns the SDP answer from the 200 OK,
	 * and configures the SRTP send/receive contexts for media exchange.
	 * When `stnpk` is set on the route, the SDP offer uses MIKEY-PKE
	 * (LINE's actual wire format) instead of SDES `a=crypto:`.
	 */
	async invite(opts: {
		to: string;
		localHost?: string;
		localPort?: number;
		/** Optional RSA private key (SPKI/PKCS8) used to decrypt a MIKEY
		 *  answer from the peer. Required to fully complete a MIKEY-PKE
		 *  call; without it the answer's KEMAC is opaque. */
		decryptKey?: Uint8Array;
	}): Promise<{ status: number; remoteKey: Uint8Array; mix: { host: string; port: number } }> {
		const ep = routeEndpoint(this.#route!);

		// Generate local SRTP key (16-byte key + 14-byte salt = 30 bytes)
		const localKey = new Uint8Array(SRTP_KEYING_LEN);
		crypto.getRandomValues(localKey);
		this.#localKey = localKey;

		const localHost = opts.localHost ?? "0.0.0.0";
		const localPort = opts.localPort ?? 0;
		const stnpk = ep.stnpk;
		const offerSdp = stnpk
			? buildAudioOfferMikey({
				host: localHost,
				port: localPort,
				mikeyBase64: mikeyToBase64(
					await buildMikeyPke({
						peerPublicKey: stnpk,
						tgk: localKey,
						initiatorId: this.#opts.localMid,
						responderId: opts.to,
					}),
				),
				username: this.#opts.localMid,
			})
			: buildAudioOffer({
				host: localHost,
				port: localPort,
				crypto: { suite: "AES_CM_128_HMAC_SHA1_80", key: localKey },
				username: this.#opts.localMid,
			});

		const target = `sip:${opts.to}@${ep.host}`;
		this.#cseq++;
		const ua = this.#opts.userAgent ?? "Line/26.6.2";
		await this.#sendTo({ host: ep.host, port: ep.port }, {
			startLine: `INVITE ${target} SIP/2.0`,
			headers: {
				"Via": `SIP/2.0/UDP ${this.#opts.localMid}.invalid;branch=${newBranch()};rport`,
				"Max-Forwards": "70",
				"From": `${this.#sipFrom};tag=${this.#sipFromTag}`,
				"To": `<${target}>`,
				"Call-ID": this.#callId!,
				"CSeq": `${this.#cseq} INVITE`,
				"User-Agent": ua,
				"Contact": `<sip:${this.#opts.localMid}@invalid:0>`,
				"Content-Type": "application/sdp",
				"Content-Length": String(offerSdp.length),
			},
			body: offerSdp,
		});

		// Read responses until we get a final (not 1xx).
		let response = parseSip(await this.#receive());
		while (true) {
			const status = getStatusCode(response.startLine) ?? 0;
			if (status >= 200) break;
			response = parseSip(await this.#receive());
		}
		const finalStatus = getStatusCode(response.startLine) ?? 0;
		if (finalStatus !== 200) {
			throw new Error(`INVITE failed: ${response.startLine}`);
		}
		// Parse SDP answer — handle both SDES (a=crypto:) and MIKEY (a=key-mgmt:mikey)
		const answer = parseSdp(response.body);
		const audio = answer.media.find((m) => m.type === "audio");
		if (!audio) throw new Error("INVITE: no audio in SDP answer");
		let remoteKey: Uint8Array | null = null;
		const sdes = readCrypto(audio)[0];
		if (sdes) {
			remoteKey = sdes.key;
		} else {
			const km = readKeyMgmt(audio);
			if (km && km.proto === "mikey") {
				const mk = parseMikey(mikeyFromBase64(km.data));
				if (!mk.kemacEncrypted) throw new Error("INVITE: MIKEY answer has no KEMAC");
				if (!opts.decryptKey) {
					throw new Error(
						"INVITE: peer sent MIKEY-PKE answer but no decryptKey supplied",
					);
				}
				remoteKey = await decryptMikeyKemac(mk, opts.decryptKey);
			}
		}
		if (!remoteKey) throw new Error("INVITE: no crypto/key-mgmt in SDP answer");
		this.#remoteKey = remoteKey;
		this.#srtpSend = await deriveSrtpContext(localKey);
		this.#srtpRecv = await deriveSrtpContext(remoteKey);
		// SRTP flows to the SDP-answer's connection address + media port.
		const answerC = audio.c ?? answer.c ?? "";
		const ansHost = answerC.split(/\s+/)[2] ?? ep.host;
		this.#rtp = {
			host: ansHost,
			port: audio.port || ep.port,
			ssrc: Math.floor(Math.random() * 0xffffffff) >>> 0,
			seq: Math.floor(Math.random() * 0x10000),
			timestamp: Math.floor(Math.random() * 0x10000),
		};

		// ACK to complete the 3-way handshake
		this.#cseq++;
		await this.#sendTo({ host: ep.host, port: ep.port }, {
			startLine: `ACK ${target} SIP/2.0`,
			headers: {
				"Via": `SIP/2.0/UDP ${this.#opts.localMid}.invalid;branch=${newBranch()};rport`,
				"Max-Forwards": "70",
				"From": `${this.#sipFrom};tag=${this.#sipFromTag}`,
				"To": response.headers["To"] ?? `<${target}>`,
				"Call-ID": this.#callId!,
				"CSeq": `${this.#cseq} ACK`,
				"User-Agent": ua,
				"Content-Length": "0",
			},
			body: "",
		});

		return {
			status: finalStatus,
			remoteKey,
			mix: { host: this.#rtp.host, port: this.#rtp.port },
		};
	}

	#sendTo(
		dst: { host: string; port: number },
		msg: { startLine: string; headers: Record<string, string>; body: string },
	) {
		return new Promise<void>((res, rj) => {
			this.#sock!.send(buildSip(msg), dst.port, dst.host, (e) => e ? rj(e) : res());
		});
	}

	#receive(): Promise<Uint8Array> {
		const timeout = this.#opts.timeoutMs ?? 5000;
		return new Promise<Uint8Array>((res, rj) => {
			const t = setTimeout(() => rj(new Error("SIP receive timeout")), timeout);
			this.#pending.push((buf) => { clearTimeout(t); res(buf); });
		});
	}
}

/** Decrypt a peer's MIKEY-PKE KEMAC to recover the SRTP master key. */
async function decryptMikeyKemac(
	parsed: ReturnType<typeof parseMikey>,
	pkcs8PrivateKey: Uint8Array,
): Promise<Uint8Array> {
	if (!parsed.pkeBody) throw new Error("MIKEY answer: missing PKE body");
	if (!parsed.kemacEncrypted) throw new Error("MIKEY answer: missing KEMAC");
	const priv = await crypto.subtle.importKey(
		"pkcs8",
		toArrayBuffer(pkcs8PrivateKey),
		{ name: "RSA-OAEP", hash: "SHA-1" },
		false,
		["decrypt"],
	);
	const envKey = new Uint8Array(
		await crypto.subtle.decrypt({ name: "RSA-OAEP" }, priv, toArrayBuffer(parsed.pkeBody)),
	);
	// Derive encr_key from envKey, then AES-CTR decrypt the KEMAC body
	const info = new Uint8Array(8);
	new DataView(info.buffer).setUint32(0, parsed.csbId, false);
	new DataView(info.buffer).setUint32(4, 0, false); // label 0 = encr
	const { createHmac, createCipheriv } = await import("node:crypto");
	const macKey = createHmac("sha1", Buffer.from(envKey)).update(Buffer.from(info)).digest();
	const encrKey = new Uint8Array(macKey).subarray(0, 16);
	const iv = new Uint8Array(16);
	const c = createCipheriv("aes-128-ctr", Buffer.from(encrKey), Buffer.from(iv));
	const inner = Buffer.concat([c.update(Buffer.from(parsed.kemacEncrypted)), c.final()]);
	// Skip the KEY_DATA payload header (5 bytes) to get the 30-byte TGK
	return new Uint8Array(inner.subarray(5, 5 + 30));
}

/** Strict ArrayBuffer slice — avoids the SharedArrayBuffer ambiguity on
 *  Uint8Array.buffer when calling WebCrypto. */
function toArrayBuffer(u: Uint8Array): ArrayBuffer {
	const ab = new ArrayBuffer(u.byteLength);
	new Uint8Array(ab).set(u);
	return ab;
}
