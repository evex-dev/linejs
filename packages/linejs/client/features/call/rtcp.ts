// Minimal RTCP (RFC 3550 §6) — Sender Report, Receiver Report, SDES,
// BYE. Enough to satisfy mid-call SR/RR exchange and keep the pjsip-
// based peer's QoS state happy.

const PT_SR = 200;
const PT_RR = 201;
const PT_SDES = 202;
const PT_BYE = 203;

const SDES_CNAME = 1;
const SDES_TOOL = 6;

export interface SenderInfo {
	ntpSec: number;
	ntpFrac: number;
	rtpTimestamp: number;
	packetCount: number;
	octetCount: number;
}

export interface ReportBlock {
	ssrc: number;
	fractionLost: number;
	cumulativeLost: number;
	highestSeq: number;
	jitter: number;
	lastSr: number;
	delaySinceLastSr: number;
}

/** Build a compound RTCP packet: SR/RR + SDES. */
export function buildRtcpCompound(opts: {
	senderSsrc: number;
	sender?: SenderInfo;
	reports?: ReportBlock[];
	cname?: string;
	tool?: string;
}): Uint8Array {
	const reports = opts.reports ?? [];
	const cname = opts.cname ?? "anon@invalid";
	const tool = opts.tool;
	const sr = opts.sender
		? buildSr(opts.senderSsrc, opts.sender, reports)
		: buildRr(opts.senderSsrc, reports);
	const sdes = buildSdes(opts.senderSsrc, cname, tool);
	const out = new Uint8Array(sr.length + sdes.length);
	out.set(sr, 0);
	out.set(sdes, sr.length);
	return out;
}

function buildSr(senderSsrc: number, s: SenderInfo, reports: ReportBlock[]): Uint8Array {
	const headerLen = 4 + 24 + reports.length * 24;
	const out = new Uint8Array(headerLen);
	const dv = new DataView(out.buffer);
	out[0] = 0x80 | (reports.length & 0x1f); // V=2, P=0, RC
	out[1] = PT_SR;
	dv.setUint16(2, headerLen / 4 - 1, false);
	dv.setUint32(4, senderSsrc >>> 0, false);
	dv.setUint32(8, s.ntpSec >>> 0, false);
	dv.setUint32(12, s.ntpFrac >>> 0, false);
	dv.setUint32(16, s.rtpTimestamp >>> 0, false);
	dv.setUint32(20, s.packetCount >>> 0, false);
	dv.setUint32(24, s.octetCount >>> 0, false);
	writeReports(dv, 28, reports);
	return out;
}

function buildRr(senderSsrc: number, reports: ReportBlock[]): Uint8Array {
	const headerLen = 4 + 4 + reports.length * 24;
	const out = new Uint8Array(headerLen);
	const dv = new DataView(out.buffer);
	out[0] = 0x80 | (reports.length & 0x1f);
	out[1] = PT_RR;
	dv.setUint16(2, headerLen / 4 - 1, false);
	dv.setUint32(4, senderSsrc >>> 0, false);
	writeReports(dv, 8, reports);
	return out;
}

function writeReports(dv: DataView, off: number, reports: ReportBlock[]) {
	for (const r of reports) {
		dv.setUint32(off, r.ssrc >>> 0, false);
		dv.setUint8(off + 4, r.fractionLost & 0xff);
		dv.setUint8(off + 5, (r.cumulativeLost >>> 16) & 0xff);
		dv.setUint8(off + 6, (r.cumulativeLost >>> 8) & 0xff);
		dv.setUint8(off + 7, r.cumulativeLost & 0xff);
		dv.setUint32(off + 8, r.highestSeq >>> 0, false);
		dv.setUint32(off + 12, r.jitter >>> 0, false);
		dv.setUint32(off + 16, r.lastSr >>> 0, false);
		dv.setUint32(off + 20, r.delaySinceLastSr >>> 0, false);
		off += 24;
	}
}

function buildSdes(ssrc: number, cname: string, tool?: string): Uint8Array {
	const cnameBytes = new TextEncoder().encode(cname);
	const toolBytes = tool ? new TextEncoder().encode(tool) : null;
	let itemsLen = 2 + cnameBytes.length; // type(1) + len(1) + value
	if (toolBytes) itemsLen += 2 + toolBytes.length;
	itemsLen += 1; // null terminator
	// pad to 4-byte boundary
	const itemsPad = (4 - (itemsLen % 4)) % 4;
	const chunkLen = 4 + itemsLen + itemsPad; // SSRC + items
	const headerLen = 4 + chunkLen;
	const out = new Uint8Array(headerLen);
	const dv = new DataView(out.buffer);
	out[0] = 0x80 | 0x01; // V=2, SC=1 source
	out[1] = PT_SDES;
	dv.setUint16(2, headerLen / 4 - 1, false);
	dv.setUint32(4, ssrc >>> 0, false);
	let o = 8;
	out[o++] = SDES_CNAME;
	out[o++] = cnameBytes.length;
	out.set(cnameBytes, o);
	o += cnameBytes.length;
	if (toolBytes) {
		out[o++] = SDES_TOOL;
		out[o++] = toolBytes.length;
		out.set(toolBytes, o);
		o += toolBytes.length;
	}
	out[o++] = 0; // end of items
	// padding remains 0
	return out;
}

export function buildRtcpBye(ssrc: number, reason?: string): Uint8Array {
	const reasonBytes = reason ? new TextEncoder().encode(reason) : null;
	const reasonLen = reasonBytes ? 1 + reasonBytes.length : 0;
	const reasonPad = reasonLen > 0 ? (4 - ((reasonLen) % 4)) % 4 : 0;
	const headerLen = 4 + 4 + reasonLen + reasonPad;
	const out = new Uint8Array(headerLen);
	const dv = new DataView(out.buffer);
	out[0] = 0x80 | 0x01;
	out[1] = PT_BYE;
	dv.setUint16(2, headerLen / 4 - 1, false);
	dv.setUint32(4, ssrc >>> 0, false);
	if (reasonBytes) {
		out[8] = reasonBytes.length;
		out.set(reasonBytes, 9);
	}
	return out;
}

export interface ParsedRtcp {
	packetType: number;
	count: number;
	senderSsrc?: number;
	senderInfo?: SenderInfo;
	reports: ReportBlock[];
	cname?: string;
	byeReason?: string;
}

export function parseRtcp(buf: Uint8Array): ParsedRtcp[] {
	const out: ParsedRtcp[] = [];
	let off = 0;
	const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
	while (off + 4 <= buf.length) {
		const v = (buf[off] >> 6) & 0x03;
		if (v !== 2) break;
		const rc = buf[off] & 0x1f;
		const pt = buf[off + 1];
		const len = dv.getUint16(off + 2, false);
		const totalLen = (len + 1) * 4;
		if (off + totalLen > buf.length) break;
		const block: ParsedRtcp = { packetType: pt, count: rc, reports: [] };
		if (pt === PT_SR) {
			block.senderSsrc = dv.getUint32(off + 4, false);
			block.senderInfo = {
				ntpSec: dv.getUint32(off + 8, false),
				ntpFrac: dv.getUint32(off + 12, false),
				rtpTimestamp: dv.getUint32(off + 16, false),
				packetCount: dv.getUint32(off + 20, false),
				octetCount: dv.getUint32(off + 24, false),
			};
			let ro = off + 28;
			for (let i = 0; i < rc; i++) {
				block.reports.push(readReportBlock(dv, ro));
				ro += 24;
			}
		} else if (pt === PT_RR) {
			block.senderSsrc = dv.getUint32(off + 4, false);
			let ro = off + 8;
			for (let i = 0; i < rc; i++) {
				block.reports.push(readReportBlock(dv, ro));
				ro += 24;
			}
		} else if (pt === PT_SDES) {
			block.senderSsrc = dv.getUint32(off + 4, false);
			let so = off + 8;
			while (so < off + totalLen && buf[so] !== 0) {
				const itemType = buf[so];
				const itemLen = buf[so + 1];
				if (itemType === SDES_CNAME) {
					block.cname = new TextDecoder().decode(buf.subarray(so + 2, so + 2 + itemLen));
				}
				so += 2 + itemLen;
			}
		} else if (pt === PT_BYE) {
			block.senderSsrc = dv.getUint32(off + 4, false);
			if (rc > 0 && off + 4 + rc * 4 + 1 < buf.length) {
				const ro = off + 4 + rc * 4;
				const reasonLen = buf[ro];
				if (reasonLen > 0) {
					block.byeReason = new TextDecoder().decode(buf.subarray(ro + 1, ro + 1 + reasonLen));
				}
			}
		}
		out.push(block);
		off += totalLen;
	}
	return out;
}

function readReportBlock(dv: DataView, off: number): ReportBlock {
	return {
		ssrc: dv.getUint32(off, false),
		fractionLost: dv.getUint8(off + 4),
		cumulativeLost: (dv.getUint8(off + 5) << 16) | (dv.getUint8(off + 6) << 8) | dv.getUint8(off + 7),
		highestSeq: dv.getUint32(off + 8, false),
		jitter: dv.getUint32(off + 12, false),
		lastSr: dv.getUint32(off + 16, false),
		delaySinceLastSr: dv.getUint32(off + 20, false),
	};
}

/** NTP timestamp for SR (RFC 3550 §6.4). */
export function nowNtp(): { sec: number; frac: number } {
	const ms = Date.now();
	const sec = Math.floor(ms / 1000) + 2208988800;
	const frac = Math.floor(((ms % 1000) / 1000) * 0x100000000);
	return { sec: sec >>> 0, frac: frac >>> 0 };
}
