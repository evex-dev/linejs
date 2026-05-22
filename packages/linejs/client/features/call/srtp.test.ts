import { assert, assertEquals, assertRejects } from "@std/assert";
import {
	buildRtp,
	deriveSrtpContext,
	parseRtp,
	SRTP_KEYING_LEN,
	srtpDecrypt,
	srtpEncrypt,
} from "./srtp.ts";

Deno.test("buildRtp + parseRtp round-trip", () => {
	const payload = new Uint8Array([1, 2, 3, 4, 5]);
	const pkt = buildRtp({
		payloadType: 96,
		seq: 0x1234,
		timestamp: 0xdeadbeef,
		ssrc: 0xfeedface,
		payload,
		marker: true,
	});
	const p = parseRtp(pkt);
	assertEquals(p.payloadType, 96);
	assertEquals(p.marker, true);
	assertEquals(p.seq, 0x1234);
	assertEquals(p.timestamp, 0xdeadbeef);
	assertEquals(p.ssrc, 0xfeedface);
	assertEquals(Array.from(p.payload), Array.from(payload));
});

Deno.test("SRTP preserves RTP extension headers while encrypting payload", async () => {
	const keying = new Uint8Array(SRTP_KEYING_LEN).fill(9);
	const ctxA = await deriveSrtpContext(keying);
	const ctxB = await deriveSrtpContext(keying);
	const payload = new Uint8Array([1, 2, 3, 4, 5, 6]);
	const rtp = buildRtp({
		payloadType: 96,
		seq: 0x215,
		timestamp: 960,
		ssrc: 202,
		payload,
		extensionProfile: 0x0240,
	});
	const encrypted = await srtpEncrypt(ctxA, rtp);
	assertEquals(
		Array.from(encrypted.subarray(0, 16)),
		Array.from(rtp.subarray(0, 16)),
	);
	let differs = 0;
	for (let i = 16; i < rtp.length; i++) {
		if (encrypted[i] !== rtp[i]) differs++;
	}
	assert(differs > 0);
	const decrypted = await srtpDecrypt(ctxB, encrypted);
	assertEquals(Array.from(decrypted), Array.from(rtp));
	assertEquals(Array.from(parseRtp(decrypted).payload), Array.from(payload));
});

Deno.test("deriveSrtpContext: enforces 30-byte master keying", async () => {
	await assertRejects(
		() => deriveSrtpContext(new Uint8Array(29)),
		Error,
		"30 bytes",
	);
});

Deno.test("deriveSrtpContext: keys differ for {RTP encr, auth, salt} labels", async () => {
	const k = new Uint8Array(SRTP_KEYING_LEN);
	for (let i = 0; i < k.length; i++) k[i] = i;
	const c = await deriveSrtpContext(k);
	assertEquals(c.cipherKey.length, 16);
	assertEquals(c.authKey.length, 20);
	assertEquals(c.cipherSalt.length, 14);
	// keys must differ (the labels differ → different KDF output)
	assert(c.cipherKey.toString() !== c.authKey.toString().slice(0, 32));
	assert(c.cipherKey.toString() !== c.cipherSalt.toString().slice(0, 28));
});

Deno.test("srtpEncrypt → srtpDecrypt round-trip recovers plaintext", async () => {
	const keying = new Uint8Array(SRTP_KEYING_LEN);
	for (let i = 0; i < keying.length; i++) keying[i] = (i * 7) & 0xff;
	const ctxA = await deriveSrtpContext(keying);
	const ctxB = await deriveSrtpContext(keying);
	const opusPayload = new Uint8Array(80);
	for (let i = 0; i < opusPayload.length; i++) opusPayload[i] = (i * 13) & 0xff;
	const rtp = buildRtp({
		payloadType: 96,
		seq: 0x1234,
		timestamp: 1000,
		ssrc: 0xabcdef01,
		payload: opusPayload,
	});
	const encrypted = await srtpEncrypt(ctxA, rtp);
	// 12-byte header preserved, payload encrypted, 10-byte tag appended
	assertEquals(encrypted.length, rtp.length + 10);
	assertEquals(encrypted[0], rtp[0]);
	assertEquals(encrypted[1], rtp[1]);
	// Payload bytes should be different (encrypted)
	let differs = 0;
	for (let i = 12; i < rtp.length; i++) {
		if (encrypted[i] !== rtp[i]) differs++;
	}
	assert(differs > 60, "payload should be substantially different");

	const decrypted = await srtpDecrypt(ctxB, encrypted);
	assertEquals(decrypted.length, rtp.length);
	assertEquals(Array.from(decrypted), Array.from(rtp));
});

Deno.test("srtpDecrypt rejects tampered packet", async () => {
	const keying = new Uint8Array(SRTP_KEYING_LEN);
	const ctx = await deriveSrtpContext(keying);
	const rtp = buildRtp({
		payloadType: 96,
		seq: 100,
		timestamp: 1000,
		ssrc: 1,
		payload: new Uint8Array([1, 2, 3, 4]),
	});
	const encrypted = await srtpEncrypt(ctx, rtp);
	// Flip a byte in the payload
	encrypted[14] ^= 0x01;
	await assertRejects(
		() => srtpDecrypt(ctx, encrypted),
		Error,
		"auth tag mismatch",
	);
});

Deno.test("srtpDecrypt rejects tampered tag", async () => {
	const keying = new Uint8Array(SRTP_KEYING_LEN).fill(7);
	const ctx = await deriveSrtpContext(keying);
	const rtp = buildRtp({
		payloadType: 96,
		seq: 1,
		timestamp: 1,
		ssrc: 1,
		payload: new Uint8Array(20),
	});
	const enc = await srtpEncrypt(ctx, rtp);
	enc[enc.length - 1] ^= 0xff;
	await assertRejects(() => srtpDecrypt(ctx, enc), Error, "auth tag mismatch");
});
