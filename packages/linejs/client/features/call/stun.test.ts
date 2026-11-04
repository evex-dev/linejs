import { assert, test } from "vite-plus/test";
import dgram from "node:dgram";
import { Buffer } from "node:buffer";
import { buildBindingRequestAsync, parseStun, readMappedAddress } from "./stun.ts";

test("buildBindingRequest + parseStun round-trip", async () => {
	const txId = new Uint8Array(12);
	for (let i = 0; i < 12; i++) txId[i] = i + 1;
	const req = await buildBindingRequestAsync({
		transactionId: txId,
		username: "iceuser",
		password: "icepw",
		priority: 0x6e0001ff,
		iceControlling: 0xabcd_1234_5678_9abcn,
	});
	const parsed = parseStun(req);
	assert.deepEqual(parsed.method, 0x001); // Binding
	assert.deepEqual(parsed.class, 0); // request
	assert.deepEqual(parsed.transactionId.length, 12);
	assert.deepEqual(Array.from(parsed.transactionId), Array.from(txId));
	// USERNAME = 0x6, PRIORITY = 0x24, ICE-CONTROLLING = 0x802a, MI = 0x8, FP = 0x8028
	assert.isOk(parsed.attrs.has(0x06));
	assert.isOk(parsed.attrs.has(0x24));
	assert.isOk(parsed.attrs.has(0x802a));
	assert.isOk(parsed.attrs.has(0x8028));
});

test("STUN live probe against stun.l.google.com:19302 — discovers XOR-MAPPED-ADDRESS", async () => {
	const sock = dgram.createSocket("udp4");
	await new Promise<void>((r) => sock.bind({ address: "0.0.0.0", port: 0 }, () => r()));
	const respPromise = new Promise<Uint8Array>((res, rj) => {
		const t = setTimeout(() => rj(new Error("STUN timeout")), 5000);
		sock.once("message", (buf) => {
			clearTimeout(t);
			res(new Uint8Array(buf));
		});
	});
	const req = await buildBindingRequestAsync({});
	await new Promise<void>((res, rj) =>
		sock.send(Buffer.from(req), 19302, "stun.l.google.com", (e) => (e ? rj(e) : res())),
	);
	try {
		const resp = await respPromise;
		const msg = parseStun(resp);
		assert.deepEqual(msg.method, 0x001);
		const addr = readMappedAddress(msg);
		assert.isOk(addr !== undefined, "expected XOR-MAPPED-ADDRESS");
		assert.deepEqual(addr!.family, 4);
		assert.isOk(addr!.host.split(".").length === 4);
		assert.isOk(addr!.port > 0 && addr!.port < 65536);
	} finally {
		sock.close();
	}
});
