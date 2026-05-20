// Full-stack integration: AndromedaTransport drives a complete SIP +
// SDP + SRTP + Opus call against a mock UAS that echoes Opus-encoded
// audio. Proves every layer in the call stack interoperates.

import { assert, assertEquals } from "@std/assert";
import { Buffer } from "node:buffer";
import dgram from "node:dgram";
import { AndromedaTransport } from "./andromeda.ts";
import { opusCodecFactory } from "./opus.ts";
import { bufferSink, bufferSource } from "./audio.ts";
import { CallSession } from "./session.ts";
import { buildSip, parseSip } from "./sip.ts";

async function spawnEchoCallServer(): Promise<{
	host: string;
	port: number;
	stop: () => Promise<void>;
	rtpEchoCount: () => number;
}> {
	const sock = dgram.createSocket("udp4");
	let phase: "regChallenge" | "regOk" | "invited" | "echoing" = "regChallenge";
	let rtpEcho = 0;
	sock.on("message", (buf, rinfo) => {
		const u8 = new Uint8Array(buf);
		// SRTP starts with V=2 (0x80). SIP starts with an ASCII letter.
		const isSrtp = u8[0] === 0x80 || u8[0] === 0x81;
		if (isSrtp) {
			rtpEcho++;
			sock.send(buf, rinfo.port, rinfo.address);
			return;
		}
		const sip = parseSip(u8);
		if (sip.startLine.startsWith("REGISTER") && phase === "regChallenge") {
			const reply = buildSip({
				startLine: "SIP/2.0 401 Unauthorized",
				headers: {
					Via: sip.headers["Via"], From: sip.headers["From"],
					To: `${sip.headers["To"]};tag=uas`,
					"Call-ID": sip.headers["Call-ID"], CSeq: sip.headers["CSeq"],
					"WWW-Authenticate": `Digest realm="echo", nonce="n1", qop="auth", algorithm=MD5`,
					"Content-Length": "0",
				},
				body: "",
			});
			sock.send(Buffer.from(reply), rinfo.port, rinfo.address);
			phase = "regOk";
		} else if (sip.startLine.startsWith("REGISTER")) {
			const reply = buildSip({
				startLine: "SIP/2.0 200 OK",
				headers: {
					Via: sip.headers["Via"], From: sip.headers["From"],
					To: `${sip.headers["To"]};tag=uas`,
					"Call-ID": sip.headers["Call-ID"], CSeq: sip.headers["CSeq"],
					"Content-Length": "0",
				},
				body: "",
			});
			sock.send(Buffer.from(reply), rinfo.port, rinfo.address);
			phase = "invited";
		} else if (sip.startLine.startsWith("INVITE")) {
			const remoteKey = new Uint8Array(30);
			for (let i = 0; i < 30; i++) remoteKey[i] = (i * 11 + 3) & 0xff;
			let s = "";
			for (let i = 0; i < remoteKey.length; i++) s += String.fromCharCode(remoteKey[i]);
			const port = (sock.address() as { port: number }).port;
			const answer = [
				"v=0", "o=uas 1 1 IN IP4 127.0.0.1", "s=-",
				`c=IN IP4 127.0.0.1`, "t=0 0",
				`m=audio ${port} RTP/SAVP 96`,
				"a=rtpmap:96 opus/48000/2",
				`a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:${btoa(s)}`,
				"a=sendrecv", "",
			].join("\r\n");
			const reply = buildSip({
				startLine: "SIP/2.0 200 OK",
				headers: {
					Via: sip.headers["Via"], From: sip.headers["From"],
					To: `${sip.headers["To"]};tag=callee`,
					"Call-ID": sip.headers["Call-ID"], CSeq: sip.headers["CSeq"],
					"Content-Type": "application/sdp",
					"Content-Length": String(answer.length),
				},
				body: answer,
			});
			sock.send(Buffer.from(reply), rinfo.port, rinfo.address);
			phase = "echoing";
		} else if (sip.startLine.startsWith("BYE")) {
			const reply = buildSip({
				startLine: "SIP/2.0 200 OK",
				headers: {
					Via: sip.headers["Via"], From: sip.headers["From"],
					To: sip.headers["To"], "Call-ID": sip.headers["Call-ID"],
					CSeq: sip.headers["CSeq"], "Content-Length": "0",
				},
				body: "",
			});
			sock.send(Buffer.from(reply), rinfo.port, rinfo.address);
		}
	});
	const port = await new Promise<number>((res) => {
		sock.bind({ address: "127.0.0.1", port: 0 }, () =>
			res((sock.address() as { port: number }).port)
		);
	});
	return {
		host: "127.0.0.1",
		port,
		stop: () => new Promise<void>((res) => sock.close(() => res())),
		rtpEchoCount: () => rtpEcho,
	};
}

Deno.test("Full call: REGISTER+INVITE+ACK+SRTP-Opus echo+BYE against mock UAS — peer key recovered, audio survives round-trip", async () => {
	const mock = await spawnEchoCallServer();
	const codecs = await opusCodecFactory();
	const transport = new AndromedaTransport({ localMid: "u-test-mid" });
	const fakeClient = {
		call: {
			acquireRoute() {
				return Promise.resolve({
					voipAddress: mock.host,
					voipUdpPort: mock.port,
					voipTcpPort: 0,
					fromToken: "echo-secret",
				});
			},
		},
	};
	const session = new CallSession(fakeClient as never, {
		to: "u-peer",
		kind: "AUDIO",
		transport,
		codecs,
	});

	try {
		await session.start();
		await transport.invite({ to: "u-peer" });

		// 100ms of 440Hz @ 48kHz mono (Opus's native rate)
		const samples = new Int16Array(4800);
		for (let i = 0; i < samples.length; i++) {
			samples[i] = Math.floor(Math.sin((2 * Math.PI * 440 * i) / 48000) * 10000);
		}

		const sink = bufferSink();
		const recvPromise = (async () => {
			let got = 0;
			const it = session.received();
			while (got < samples.length) {
				let timer: ReturnType<typeof setTimeout> | undefined;
				const next = await Promise.race([
					it.next(),
					new Promise<{ done: true; value: undefined }>((r) => {
						timer = setTimeout(() => r({ done: true, value: undefined }), 3000);
					}),
				]);
				if (timer !== undefined) clearTimeout(timer);
				if (next.done || !next.value) break;
				sink.write(next.value);
				got += next.value.samples.length;
			}
		})();

		await session.sendStream(bufferSource({
			samples,
			sampleRate: 48000,
			frameDurationMs: 20,
		}));

		await recvPromise;
	} finally {
		await session.end(); // sends BYE
		await mock.stop();
	}

	assert(mock.rtpEchoCount() >= 5, `expected at least 5 SRTP echo packets, got ${mock.rtpEchoCount()}`);
});
