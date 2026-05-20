// Minimal SDP (RFC 4566) build/parse, scoped to LINE's needs.

export interface SdpSession {
	v?: string;
	o?: string;
	s?: string;
	c?: string;
	t?: string;
	attrs: string[];
	media: SdpMedia[];
}

export interface SdpMedia {
	type: string;
	port: number;
	proto: string;
	formats: string[];
	c?: string;
	attrs: string[];
}

export function buildSdp(s: SdpSession): string {
	const lines: string[] = [];
	lines.push(`v=${s.v ?? "0"}`);
	if (s.o) lines.push(`o=${s.o}`);
	lines.push(`s=${s.s ?? "-"}`);
	if (s.c) lines.push(`c=${s.c}`);
	lines.push(`t=${s.t ?? "0 0"}`);
	for (const a of s.attrs) lines.push(`a=${a}`);
	for (const m of s.media) {
		lines.push(`m=${m.type} ${m.port} ${m.proto} ${m.formats.join(" ")}`);
		if (m.c) lines.push(`c=${m.c}`);
		for (const a of m.attrs) lines.push(`a=${a}`);
	}
	return lines.join("\r\n") + "\r\n";
}

export function parseSdp(text: string): SdpSession {
	const out: SdpSession = { attrs: [], media: [] };
	let current: SdpMedia | null = null;
	for (const raw of text.split(/\r?\n/)) {
		if (!raw) continue;
		const eq = raw.indexOf("=");
		if (eq < 0) continue;
		const k = raw.slice(0, eq);
		const v = raw.slice(eq + 1);
		if (k === "m") {
			const [type, port, proto, ...formats] = v.split(/\s+/);
			current = { type, port: Number(port), proto, formats, attrs: [] };
			out.media.push(current);
		} else if (current) {
			if (k === "c") current.c = v;
			else if (k === "a") current.attrs.push(v);
		} else {
			if (k === "v") out.v = v;
			else if (k === "o") out.o = v;
			else if (k === "s") out.s = v;
			else if (k === "c") out.c = v;
			else if (k === "t") out.t = v;
			else if (k === "a") out.attrs.push(v);
		}
	}
	return out;
}

/** Pull `a=rtpmap:<pt> name/rate[/channels]` entries off an SdpMedia. */
export function readRtpmap(m: SdpMedia): {
	pt: number;
	name: string;
	rate: number;
	channels?: number;
}[] {
	const out = [];
	for (const a of m.attrs) {
		const x = a.match(/^rtpmap:(\d+)\s+([^/]+)\/(\d+)(?:\/(\d+))?/);
		if (x) {
			out.push({
				pt: Number(x[1]),
				name: x[2],
				rate: Number(x[3]),
				channels: x[4] ? Number(x[4]) : undefined,
			});
		}
	}
	return out;
}

/** Pull `a=crypto:N <suite> inline:<key>[|...]` (RFC 4568). */
export function readCrypto(m: SdpMedia): {
	tag: number;
	suite: string;
	key: Uint8Array;
}[] {
	const out = [];
	for (const a of m.attrs) {
		const x = a.match(/^crypto:(\d+)\s+(\S+)\s+inline:([A-Za-z0-9+/=]+)/);
		if (x) {
			out.push({
				tag: Number(x[1]),
				suite: x[2],
				key: base64Decode(x[3]),
			});
		}
	}
	return out;
}

function base64Decode(s: string): Uint8Array {
	const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

function base64Encode(b: Uint8Array): string {
	let s = "";
	for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
	return btoa(s);
}

/** Build a `a=crypto:` line per RFC 4568. */
export function cryptoAttr(opts: {
	tag: number;
	suite: string;
	key: Uint8Array;
}): string {
	return `crypto:${opts.tag} ${opts.suite} inline:${base64Encode(opts.key)}`;
}

/** Build a LINE-style audio SDP offer: Opus on RTP/SAVP with crypto. */
export function buildAudioOffer(opts: {
	host: string;
	port: number;
	opusPayloadType?: number;
	crypto: { suite: string; key: Uint8Array };
	username?: string;
	sessionId?: number;
	sessionVer?: number;
}): string {
	const pt = opts.opusPayloadType ?? 96;
	const user = opts.username ?? "linejs";
	const sid = opts.sessionId ?? Math.floor(Date.now() / 1000);
	const sver = opts.sessionVer ?? sid;
	return buildSdp({
		o: `${user} ${sid} ${sver} IN IP4 ${opts.host}`,
		s: "-",
		c: `IN IP4 ${opts.host}`,
		t: "0 0",
		attrs: [],
		media: [{
			type: "audio",
			port: opts.port,
			proto: "RTP/SAVP",
			formats: [String(pt)],
			attrs: [
				`rtpmap:${pt} opus/48000/2`,
				`fmtp:${pt} useinbandfec=1;usedtx=1;stereo=0`,
				cryptoAttr({ tag: 1, suite: opts.crypto.suite, key: opts.crypto.key }),
				"sendrecv",
				"ptime:20",
			],
		}],
	});
}
