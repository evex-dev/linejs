import { assert, assertEquals } from "@std/assert";
import {
	buildRtcpBye,
	buildRtcpCompound,
	nowNtp,
	parseRtcp,
} from "./rtcp.ts";

Deno.test("nowNtp returns a value above the 1900-epoch threshold", () => {
	const t = nowNtp();
	// Anything after 2024 means sec > 3914006400
	assert(t.sec > 3_914_006_400);
});

Deno.test("buildRtcpCompound (SR + SDES) is parseable", () => {
	const out = buildRtcpCompound({
		senderSsrc: 0x1234abcd,
		sender: {
			ntpSec: 0xdeadbeef,
			ntpFrac: 0xfeedface,
			rtpTimestamp: 1000,
			packetCount: 5,
			octetCount: 800,
		},
		cname: "user@host",
		tool: "linejs",
	});
	const parsed = parseRtcp(out);
	assertEquals(parsed.length, 2);
	assertEquals(parsed[0].packetType, 200); // SR
	assertEquals(parsed[0].senderSsrc, 0x1234abcd);
	assertEquals(parsed[0].senderInfo?.packetCount, 5);
	assertEquals(parsed[0].senderInfo?.octetCount, 800);
	assertEquals(parsed[1].packetType, 202); // SDES
	assertEquals(parsed[1].cname, "user@host");
});

Deno.test("buildRtcpCompound (RR with one report block)", () => {
	const out = buildRtcpCompound({
		senderSsrc: 1,
		reports: [{
			ssrc: 0xabcdef01,
			fractionLost: 5,
			cumulativeLost: 100,
			highestSeq: 9999,
			jitter: 50,
			lastSr: 0xaaaaaaaa,
			delaySinceLastSr: 0xbbbb,
		}],
		cname: "anon",
	});
	const parsed = parseRtcp(out);
	assertEquals(parsed[0].packetType, 201); // RR
	assertEquals(parsed[0].count, 1);
	const r = parsed[0].reports[0];
	assertEquals(r.ssrc, 0xabcdef01);
	assertEquals(r.fractionLost, 5);
	assertEquals(r.cumulativeLost, 100);
	assertEquals(r.highestSeq, 9999);
	assertEquals(r.jitter, 50);
	assertEquals(r.lastSr, 0xaaaaaaaa);
	assertEquals(r.delaySinceLastSr, 0xbbbb);
});

Deno.test("buildRtcpBye + parseRtcp recovers reason", () => {
	const bye = buildRtcpBye(0x55667788, "hangup");
	const parsed = parseRtcp(bye);
	assertEquals(parsed[0].packetType, 203);
	assertEquals(parsed[0].senderSsrc, 0x55667788);
	assertEquals(parsed[0].byeReason, "hangup");
});

Deno.test("parseRtcp ignores garbage past last valid packet", () => {
	const sr = buildRtcpCompound({
		senderSsrc: 1,
		sender: { ntpSec: 1, ntpFrac: 0, rtpTimestamp: 1, packetCount: 1, octetCount: 1 },
		cname: "x",
	});
	const garbage = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
	const combined = new Uint8Array(sr.length + garbage.length);
	combined.set(sr, 0);
	combined.set(garbage, sr.length);
	const parsed = parseRtcp(combined);
	assertEquals(parsed.length, 2); // SR + SDES, garbage rejected
});
