import { assert, assertEquals } from "@std/assert";
import { Buffer } from "node:buffer";
import { createSocket, type RemoteInfo, type Socket } from "node:dgram";
import {
	aesCtrEncrypt,
	buildDirectionLabel,
	buildPlanetCtrIv,
	deriveCallKeys,
	derivePlanetMediaKeys,
	type EphemeralKeypair,
	generateEphemeralKeypair,
	hmacTag,
	type TransportKeys,
} from "./crypto.ts";
import {
	buildFrameHeader,
	makeChunkHdr,
	type PlanetFixedHdr,
} from "./framing.ts";
import {
	CC_MSG,
	packCcConnReq,
	packCcSetupRsp,
	packNativeSetupOffer,
	packPlanetCcMsg,
	packPlanetMsg,
	type PlanetSetupOfferMaterial,
	wrapCcMsg,
} from "./schema.ts";
import { PlanetTransport } from "./transport.ts";
import { deriveSrtpContext, parseRtp, srtpDecrypt } from "../srtp.ts";

type CallRouteLike = Parameters<PlanetTransport["connect"]>[0]["route"];

const HEADER_LEN = 6;
const BOOTSTRAP_PREFIX_LEN = 51;
const BOOTSTRAP_SEC_HEADER_LEN = 5;

function bytesToBase64(bytes: Uint8Array): string {
	let raw = "";
	for (const b of bytes) raw += String.fromCharCode(b);
	return btoa(raw);
}

function makeRoute(peer = generateEphemeralKeypair(), port = 9): CallRouteLike {
	return {
		voipAddress: "127.0.0.1",
		voipUdpPort: port,
		voipAddress6: "",
		toMid: "u-peer",
		fromToken: "from-token",
		fromZone: "JP",
		toZone: "JP",
		commParam: JSON.stringify({ mpkey: bytesToBase64(peer.publicKey) }),
		stid: "stid",
		stnpk: "stnpk",
	} as unknown as CallRouteLike;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
	const len = parts.reduce((n, p) => n + p.length, 0);
	const out = new Uint8Array(len);
	let off = 0;
	for (const p of parts) {
		out.set(p, off);
		off += p.length;
	}
	return out;
}

function buildBootstrapSecHeader(plaintextLen: number): Uint8Array {
	return new Uint8Array([
		0,
		0,
		0,
		0x28 | ((plaintextLen >>> 8) & 0x07),
		plaintextLen & 0xff,
	]);
}

function buildBootstrapFrameHeader(
	totalLen: number,
	sequence: number,
): Uint8Array {
	const chunkLogical = ((((totalLen - 4) << 5) | 0x1d) & 0xffff) >>> 0;
	const chunk = makeChunkHdr(chunkLogical);
	return new Uint8Array([
		chunk & 0xff,
		(chunk >>> 8) & 0xff,
		(sequence >>> 8) & 0xff,
		sequence & 0xff,
		0x06,
		0x02,
	]);
}

function buildRegularFrameHeader(
	totalLen: number,
	sequence: number,
): Uint8Array {
	const bodyLen = totalLen - HEADER_LEN;
	const chunkLogical = ((((totalLen - 4) << 5) | 0x0d) & 0xffff) >>> 0;
	return buildFrameHeader(
		chunkLogical,
		{
			type: 0,
			flagA: false,
			length: bodyLen & 0x7ff,
			flagB: false,
			sequence: sequence & 0x7fff,
		} satisfies PlanetFixedHdr,
	);
}

function buildServerWire(
	keys: TransportKeys,
	plaintext: Uint8Array,
	sequence: number,
	opts: { bootstrap?: { label: number; seed: Uint8Array; pub: Uint8Array } } =
		{},
): Uint8Array {
	const ct = aesCtrEncrypt(
		keys.encKey,
		buildPlanetCtrIv(keys.ctrBase, sequence),
		plaintext,
	);
	const tagLen = 16;
	if (opts.bootstrap) {
		const prefix = concatBytes([
			buildDirectionLabel(opts.bootstrap.label),
			opts.bootstrap.seed,
			opts.bootstrap.pub,
		]);
		assertEquals(prefix.length, BOOTSTRAP_PREFIX_LEN);
		const sec = buildBootstrapSecHeader(plaintext.length);
		assertEquals(sec.length, BOOTSTRAP_SEC_HEADER_LEN);
		const totalLen = HEADER_LEN + prefix.length + sec.length + ct.length +
			tagLen;
		const hdr = buildBootstrapFrameHeader(totalLen, sequence);
		const macInput = concatBytes([hdr, prefix, sec, ct]);
		return concatBytes([macInput, hmacTag(keys.macKey, macInput)]);
	}
	const totalLen = HEADER_LEN + ct.length + tagLen;
	const hdr = buildRegularFrameHeader(totalLen, sequence);
	const macInput = concatBytes([hdr, ct]);
	return concatBytes([macInput, hmacTag(keys.macKey, macInput)]);
}

function buildControlPlain(opts: {
	bodyTag: number;
	bodyBytes: Uint8Array;
	msgId: number;
	sessId: Uint8Array;
	locNonce: bigint;
	cid: string;
	srcChanId: bigint;
	dstChanId?: bigint;
}): Uint8Array {
	const tranId = new Uint8Array(16);
	tranId.fill(opts.msgId & 0xff);
	return packPlanetMsg(
		{
			userId: "u-server",
			msgId: opts.msgId,
			sessId: opts.sessId,
			tranId,
			tranSeq: opts.msgId,
			locNonce: opts.locNonce,
			rmtNonce: 0n,
		},
		{
			kind: "cc",
			data: packPlanetCcMsg(
				{
					cid: opts.cid,
					srcChanId: opts.srcChanId,
					dstChanId: opts.dstChanId ?? 0n,
				},
				wrapCcMsg(opts.bodyTag, opts.bodyBytes),
			),
		},
	);
}

function extractBootstrapClientPub(wire: Uint8Array): Uint8Array {
	return wire.subarray(
		HEADER_LEN + 2 + 16,
		HEADER_LEN + 2 + 16 + 33,
	);
}

function isRtpLike(wire: Uint8Array): boolean {
	return wire.length >= 12 && (wire[0] & 0xc0) === 0x80;
}

async function bindUdpServer(): Promise<Socket> {
	const server = createSocket("udp4");
	await new Promise<void>((resolve) =>
		server.bind({ address: "127.0.0.1", port: 0 }, () => resolve())
	);
	return server;
}

async function sendUdp(
	server: Socket,
	packet: Uint8Array,
	rinfo: RemoteInfo,
): Promise<void> {
	await new Promise<void>((resolve, reject) =>
		server.send(
			Buffer.from(packet),
			rinfo.port,
			rinfo.address,
			(err) => err ? reject(err) : resolve(),
		)
	);
}

function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	label: string,
): Promise<T> {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(
			() => reject(new Error(`${label} timeout`)),
			timeoutMs,
		);
		promise.then(
			(value) => {
				clearTimeout(timeout);
				resolve(value);
			},
			(err) => {
				clearTimeout(timeout);
				reject(err);
			},
		);
	});
}

Deno.test("PlanetTransport.close does not send REL before SETUP/INVITE", async () => {
	let sends = 0;
	const transport = new PlanetTransport({
		localMid: "u-local",
		wireSend() {
			sends++;
		},
	});

	await transport.connect({ route: makeRoute() });
	await transport.close();

	assertEquals(sends, 0);
});

Deno.test("PlanetTransport retains generated media offer material for SRTP setup", async () => {
	let sends = 0;
	const transport = new PlanetTransport({
		localMid: "u-local",
		timeoutMs: 1,
		wireSend() {
			sends++;
		},
	});

	await transport.connect({ route: makeRoute() });
	try {
		await transport.invite({ to: "u-peer" });
	} catch (e) {
		assert(e instanceof Error);
		assert(e.message.includes("PLANET reply timeout"));
	}

	const media = transport.localMediaOffer;
	assert(media);
	assertEquals(sends, 1);
	assertEquals(media.keypair.publicKey.length, 33);
	assertEquals(media.keypair.privateKey.length, 32);
	assertEquals(media.material.mediaPubKey.length, 33);
	assertEquals(media.material.mediaNonce.length, 16);
	assertEquals(media.material.mediaSecret.length, 30);
	assertEquals(media.offer.length, 311);
});

Deno.test("PlanetTransport handles inbound bootstrap answer and sends decryptable SRTP media", async () => {
	const routePeer = generateEphemeralKeypair();
	const server = await bindUdpServer();
	const addr = server.address();
	const port = typeof addr === "string" ? 0 : addr.port;
	const route = makeRoute(routePeer, port);
	const transport = new PlanetTransport({
		localMid: "u-local",
		timeoutMs: 1000,
	});

	const peerMedia = generateEphemeralKeypair();
	const peerMaterial: PlanetSetupOfferMaterial = {
		mediaPubKey: peerMedia.publicKey,
		mediaKeyId: 0x33445566,
		mediaNonce: new Uint8Array(16).fill(0x23),
		mediaSecret: new Uint8Array(30).fill(0x42),
	};
	const sessId = new Uint8Array(16).fill(0x7a);
	const replySeed = new Uint8Array(16).fill(0x34);
	const replyLabel = 0x4567;
	const cid = "test-call";
	const setupRspPlain = buildControlPlain({
		bodyTag: CC_MSG.SETUP_RSP,
		bodyBytes: packCcSetupRsp({
			result: 0,
			aliveRptInterval: 5,
			noAnsToSec: 30,
		}),
		msgId: 1,
		sessId,
		locNonce: 0x123456n,
		cid,
		srcChanId: 0x1001n,
	});
	const connReqPlain = buildControlPlain({
		bodyTag: CC_MSG.CONN_REQ,
		bodyBytes: packCcConnReq({
			answer: packNativeSetupOffer(peerMaterial),
			mChanId: 0x2002n,
			netType: 1,
			unavailToSec: 120,
			oCapas: [1, 2, 3],
			features: [],
		}),
		msgId: 2,
		sessId,
		locNonce: 0x123456n,
		cid,
		srcChanId: 0x1001n,
		dstChanId: 0x2002n,
	});

	let setupHandled = false;
	let serverMessages = 0;
	let serverError: unknown;
	let resolveMedia!: (packet: Uint8Array) => void;
	const mediaWire = new Promise<Uint8Array>((resolve) => {
		resolveMedia = resolve;
	});
	server.on("message", (buf: Buffer, rinfo: RemoteInfo) => {
		try {
			serverMessages++;
			const wire = new Uint8Array(buf);
			if (isRtpLike(wire)) {
				resolveMedia(wire);
				return;
			}
			if (setupHandled) return;
			setupHandled = true;
			const clientPub = extractBootstrapClientPub(wire);
			const serverKeys = deriveCallKeys({
				mpkey: clientPub,
				local: routePeer,
				bootstrapSeed: replySeed,
				sendLabel: replyLabel,
				recvLabel: replyLabel,
			}).send;
			const setupRspWire = buildServerWire(
				serverKeys,
				setupRspPlain,
				0x5101,
				{
					bootstrap: {
						label: replyLabel,
						seed: replySeed,
						pub: routePeer.publicKey,
					},
				},
			);
			const connReqWire = buildServerWire(serverKeys, connReqPlain, 0x5102);
			void sendUdp(server, setupRspWire, rinfo).then(() =>
				new Promise((resolve) => setTimeout(resolve, 5))
			).then(() => sendUdp(server, connReqWire, rinfo));
		} catch (e) {
			serverError = e;
		}
	});

	try {
		await transport.connect({ route });
		const invite = await transport.inviteDetailed({ to: "u-peer" }).catch(
			(e) => {
				throw new Error(
					`invite failed after ${serverMessages} server messages: ${
						serverError instanceof Error
							? serverError.message
							: String(serverError ?? e)
					}`,
				);
			},
		);
		assertEquals(invite.setupRsp?.result, 0);
		const answer = await transport.waitForAnswerDetailed({ timeoutMs: 1000 });
		assert(answer.mediaReady);
		assertEquals(answer.connRspSent, true);

		const localMedia = transport.localMediaOffer;
		assert(localMedia);
		const peerKeys = derivePlanetMediaKeys({
			local: {
				privateKey: peerMedia.privateKey,
				publicKey: peerMaterial.mediaPubKey,
				mediaKeyId: peerMaterial.mediaKeyId,
				mediaNonce: peerMaterial.mediaNonce,
			},
			peer: {
				publicKey: localMedia.material.mediaPubKey,
				mediaKeyId: localMedia.material.mediaKeyId,
				mediaNonce: localMedia.material.mediaNonce,
			},
		});
		const peerRecv = await deriveSrtpContext(peerKeys.recvKeying);
		const opus = new Uint8Array([0xf8, 0xff, 0xfe]);
		await transport.send(opus);
		const receivedWire = await withTimeout(mediaWire, 1000, "media");
		const rtp = await srtpDecrypt(peerRecv, receivedWire);
		assertEquals(parseRtp(rtp).payload, opus);
	} finally {
		await transport.close();
		await new Promise<void>((resolve) => server.close(() => resolve()));
	}
});
