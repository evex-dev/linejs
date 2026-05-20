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
