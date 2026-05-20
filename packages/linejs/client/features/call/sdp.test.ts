import { assert, assertEquals } from "@std/assert";
import {
	buildAudioOffer,
	buildSdp,
	cryptoAttr,
	parseSdp,
	readCrypto,
	readRtpmap,
} from "./sdp.ts";

Deno.test("buildSdp + parseSdp round-trip", () => {
	const text = buildSdp({
		o: "linejs 1 1 IN IP4 1.2.3.4",
		s: "-",
		c: "IN IP4 1.2.3.4",
		t: "0 0",
		attrs: ["sendrecv"],
		media: [{
			type: "audio",
			port: 5004,
			proto: "RTP/SAVP",
			formats: ["96"],
			attrs: ["rtpmap:96 opus/48000/2", "ptime:20"],
		}],
	});
	const parsed = parseSdp(text);
	assertEquals(parsed.v, "0");
	assertEquals(parsed.media[0].port, 5004);
	assertEquals(parsed.media[0].proto, "RTP/SAVP");
	assertEquals(parsed.media[0].formats, ["96"]);
});

Deno.test("readRtpmap extracts payload-type → codec mapping", () => {
	const sdp = parseSdp(
		"v=0\r\nm=audio 5004 RTP/SAVP 96 0\r\na=rtpmap:96 opus/48000/2\r\na=rtpmap:0 PCMU/8000\r\n",
	);
	const map = readRtpmap(sdp.media[0]);
	assertEquals(map[0], { pt: 96, name: "opus", rate: 48000, channels: 2 });
	assertEquals(map[1], { pt: 0, name: "PCMU", rate: 8000, channels: undefined });
});

Deno.test("readCrypto pulls inline keys (RFC 4568)", () => {
	const sdp = parseSdp(
		"v=0\r\nm=audio 5004 RTP/SAVP 96\r\na=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:" +
			"d0RmdmcmVCspeEc3QGZiNWpVLFJhQX1cfHAwJSoj" + "\r\n",
	);
	const cr = readCrypto(sdp.media[0]);
	assertEquals(cr.length, 1);
	assertEquals(cr[0].tag, 1);
	assertEquals(cr[0].suite, "AES_CM_128_HMAC_SHA1_80");
	// 30 raw bytes (16-byte key + 14-byte salt for AES_CM_128_HMAC_SHA1_80)
	assertEquals(cr[0].key.length, 30);
});

Deno.test("cryptoAttr round-trips through readCrypto", () => {
	const key = new Uint8Array(30);
	for (let i = 0; i < 30; i++) key[i] = i;
	const attr = cryptoAttr({ tag: 1, suite: "AES_CM_128_HMAC_SHA1_80", key });
	const sdp = parseSdp(`m=audio 5004 RTP/SAVP 96\r\na=${attr}\r\n`);
	const back = readCrypto(sdp.media[0])[0];
	assertEquals(Array.from(back.key), Array.from(key));
});

Deno.test("buildAudioOffer produces a parseable Opus/RTP-SAVP offer", () => {
	const key = new Uint8Array(30);
	const offer = buildAudioOffer({
		host: "10.0.0.1",
		port: 10000,
		crypto: { suite: "AES_CM_128_HMAC_SHA1_80", key },
	});
	const sdp = parseSdp(offer);
	assertEquals(sdp.media[0].type, "audio");
	assertEquals(sdp.media[0].port, 10000);
	assertEquals(sdp.media[0].proto, "RTP/SAVP");
	const m = readRtpmap(sdp.media[0]);
	assertEquals(m[0].name, "opus");
	assertEquals(m[0].rate, 48000);
	const cr = readCrypto(sdp.media[0]);
	assertEquals(cr[0].suite, "AES_CM_128_HMAC_SHA1_80");
	// fmtp + sendrecv + ptime survived
	assert(sdp.media[0].attrs.some((a) => a.startsWith("fmtp:")));
	assert(sdp.media[0].attrs.includes("sendrecv"));
	assert(sdp.media[0].attrs.includes("ptime:20"));
});

Deno.test("parseSdp tolerates LF-only and trailing blanks", () => {
	const text = "v=0\nm=audio 5004 RTP/SAVP 96\na=rtpmap:96 opus/48000/2\n";
	const sdp = parseSdp(text);
	assertEquals(sdp.media.length, 1);
	assertEquals(sdp.media[0].formats, ["96"]);
});
