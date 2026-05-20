import { assert, assertEquals } from "@std/assert";
import { Buffer } from "node:buffer";
import dgram from "node:dgram";
import { AndromedaTransport } from "./andromeda.ts";
import { buildSip, parseSip } from "./sip.ts";

async function spawnMockCscf(): Promise<{
	host: string;
	port: number;
	stop: () => Promise<void>;
	registers: { hadAuth: boolean; raw: string }[];
}> {
	const sock = dgram.createSocket("udp4");
	const registers: { hadAuth: boolean; raw: string }[] = [];
	let phase: "challenge" | "ok" = "challenge";
	sock.on("message", (buf, rinfo) => {
		const sip = parseSip(new Uint8Array(buf));
		const hadAuth = !!sip.headers["Authorization"];
		registers.push({ hadAuth, raw: buf.toString() });
		const reply = phase === "challenge"
			? buildSip({
				startLine: "SIP/2.0 401 Unauthorized",
				headers: {
					Via: sip.headers["Via"],
					From: sip.headers["From"],
					To: `${sip.headers["To"]};tag=mockserver`,
					"Call-ID": sip.headers["Call-ID"],
					CSeq: sip.headers["CSeq"],
					"WWW-Authenticate":
						`Digest realm="mock", nonce="abcd1234", qop="auth", algorithm=MD5`,
					"Content-Length": "0",
				},
				body: "",
			})
			: buildSip({
				startLine: "SIP/2.0 200 OK",
				headers: {
					Via: sip.headers["Via"],
					From: sip.headers["From"],
					To: `${sip.headers["To"]};tag=mockserver`,
					"Call-ID": sip.headers["Call-ID"],
					CSeq: sip.headers["CSeq"],
					"Content-Length": "0",
				},
				body: "",
			});
		sock.send(Buffer.from(reply), rinfo.port, rinfo.address);
		if (phase === "challenge") phase = "ok";
	});
	const port = await new Promise<number>((res) => {
		sock.bind({ address: "127.0.0.1", port: 0 }, () => {
			res((sock.address() as { port: number }).port);
		});
	});
	return {
		host: "127.0.0.1",
		port,
		stop: () => new Promise<void>((res) => sock.close(() => res())),
		registers,
	};
}

Deno.test("AndromedaTransport.register: 401 → digest → 200 against mock cscf", async () => {
	const mock = await spawnMockCscf();
	const t = new AndromedaTransport({ localMid: "u-test-mid" });
	try {
		await t.connect({
			route: {
				cscf: { host: mock.host, port: mock.port } as never,
				fromToken: "secret-pw",
			} as never,
		});
		assertEquals(mock.registers.length, 2);
		assertEquals(mock.registers[0].hadAuth, false);
		assertEquals(mock.registers[1].hadAuth, true);
		assert(/response="[0-9a-f]{32}"/.test(mock.registers[1].raw));
		assert(/realm="mock"/.test(mock.registers[1].raw));
	} finally {
		await t.close();
		await mock.stop();
	}
});

async function spawnMockUas(): Promise<{
	host: string;
	port: number;
	stop: () => Promise<void>;
	exchanges: string[];
}> {
	const sock = dgram.createSocket("udp4");
	const exchanges: string[] = [];
	let phase: "challenge" | "ok" | "invited" | "acked" = "challenge";
	sock.on("message", (buf, rinfo) => {
		const sip = parseSip(new Uint8Array(buf));
		exchanges.push(sip.startLine);
		if (sip.startLine.startsWith("REGISTER") && phase === "challenge") {
			const reply = buildSip({
				startLine: "SIP/2.0 401 Unauthorized",
				headers: {
					Via: sip.headers["Via"],
					From: sip.headers["From"],
					To: `${sip.headers["To"]};tag=mock`,
					"Call-ID": sip.headers["Call-ID"],
					CSeq: sip.headers["CSeq"],
					"WWW-Authenticate": `Digest realm="mock", nonce="n1", qop="auth", algorithm=MD5`,
					"Content-Length": "0",
				},
				body: "",
			});
			sock.send(Buffer.from(reply), rinfo.port, rinfo.address);
			phase = "ok";
		} else if (sip.startLine.startsWith("REGISTER")) {
			const reply = buildSip({
				startLine: "SIP/2.0 200 OK",
				headers: {
					Via: sip.headers["Via"],
					From: sip.headers["From"],
					To: `${sip.headers["To"]};tag=mock`,
					"Call-ID": sip.headers["Call-ID"],
					CSeq: sip.headers["CSeq"],
					"Content-Length": "0",
				},
				body: "",
			});
			sock.send(Buffer.from(reply), rinfo.port, rinfo.address);
			phase = "invited";
		} else if (sip.startLine.startsWith("INVITE")) {
			// answer SDP — fake remote key (30 bytes base64'd by ourselves)
			const remoteKey = new Uint8Array(30);
			for (let i = 0; i < 30; i++) remoteKey[i] = (i + 99) & 0xff;
			let b64 = "";
			for (let i = 0; i < remoteKey.length; i++) b64 += String.fromCharCode(remoteKey[i]);
			const keyB64 = btoa(b64);
			const answer = [
				"v=0",
				"o=mock 1 1 IN IP4 127.0.0.1",
				"s=-",
				"c=IN IP4 127.0.0.1",
				"t=0 0",
				"m=audio 5004 RTP/SAVP 96",
				"a=rtpmap:96 opus/48000/2",
				`a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:${keyB64}`,
				"a=sendrecv",
				"",
			].join("\r\n");
			const reply = buildSip({
				startLine: "SIP/2.0 200 OK",
				headers: {
					Via: sip.headers["Via"],
					From: sip.headers["From"],
					To: `${sip.headers["To"]};tag=callee`,
					"Call-ID": sip.headers["Call-ID"],
					CSeq: sip.headers["CSeq"],
					"Content-Type": "application/sdp",
					"Content-Length": String(answer.length),
				},
				body: answer,
			});
			sock.send(Buffer.from(reply), rinfo.port, rinfo.address);
			phase = "acked";
		}
	});
	const port = await new Promise<number>((res) => {
		sock.bind({ address: "127.0.0.1", port: 0 }, () => {
			res((sock.address() as { port: number }).port);
		});
	});
	return {
		host: "127.0.0.1",
		port,
		stop: () => new Promise<void>((res) => sock.close(() => res())),
		exchanges,
	};
}

Deno.test("AndromedaTransport.invite: REGISTER + INVITE + ACK against mock UAS", async () => {
	const mock = await spawnMockUas();
	const t = new AndromedaTransport({ localMid: "u-test-mid" });
	try {
		await t.connect({
			route: {
				cscf: { host: mock.host, port: mock.port } as never,
				mix: { host: mock.host, port: mock.port } as never,
				fromToken: "secret-pw",
			} as never,
		});
		const res = await t.invite({ to: "u-peer" });
		assertEquals(res.status, 200);
		assertEquals(res.remoteKey.length, 30);
		// allow the ACK datagram to arrive at the mock
		await new Promise((r) => setTimeout(r, 50));
		const verbs = mock.exchanges.map((l) => l.split(" ")[0]);
		assertEquals(verbs, ["REGISTER", "REGISTER", "INVITE", "ACK"]);
	} finally {
		await t.close();
		await mock.stop();
	}
});

Deno.test("AndromedaTransport.register: throws on missing cscf", async () => {
	const t = new AndromedaTransport({ localMid: "u-test-mid" });
	let err: unknown;
	try {
		await t.connect({ route: { fromToken: "x" } as never });
	} catch (e) {
		err = e;
	}
	await t.close().catch(() => {});
	assert(err instanceof Error);
	assertEquals(/no cscf/.test((err as Error).message), true);
});
