// Minimal SIP message + RFC 2617 Digest auth.

export interface SipMessage {
	startLine: string;
	headers: Record<string, string>;
	body: string;
}

export function buildSip(msg: SipMessage): Uint8Array {
	const headerLines = Object.entries(msg.headers).map(([k, v]) => `${k}: ${v}`);
	const head = [msg.startLine, ...headerLines, "", msg.body].join("\r\n");
	return new TextEncoder().encode(head);
}

export function parseSip(bytes: Uint8Array): SipMessage {
	const text = new TextDecoder().decode(bytes);
	const headEnd = text.indexOf("\r\n\r\n");
	const head = headEnd < 0 ? text : text.slice(0, headEnd);
	const body = headEnd < 0 ? "" : text.slice(headEnd + 4);
	const [startLine, ...headerLines] = head.split("\r\n");
	const headers: Record<string, string> = {};
	for (const line of headerLines) {
		const c = line.indexOf(":");
		if (c < 0) continue;
		headers[line.slice(0, c).trim()] = line.slice(c + 1).trim();
	}
	return { startLine, headers, body };
}

/** Parse e.g. `Digest realm="X", nonce="Y", qop="auth", algorithm=MD5`. */
export function parseDigestChallenge(value: string): Record<string, string> {
	const m = value.match(/^Digest\s+(.+)$/i);
	const body = m ? m[1] : value;
	const out: Record<string, string> = {};
	for (const pair of body.match(/(\w+)\s*=\s*"([^"]*)"|(\w+)\s*=\s*([^,\s]+)/g) ?? []) {
		const eq = pair.indexOf("=");
		const k = pair.slice(0, eq).trim();
		let v = pair.slice(eq + 1).trim();
		if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
		out[k] = v;
	}
	return out;
}

async function md5Hex(s: string): Promise<string> {
	const { createHash } = await import("node:crypto");
	return createHash("md5").update(s).digest("hex");
}

export interface DigestParams {
	username: string;
	password: string;
	realm: string;
	nonce: string;
	uri: string;
	method: string;
	qop?: string;
	cnonce?: string;
	nc?: string;
	opaque?: string;
	algorithm?: string;
}

export async function digestResponse(p: DigestParams): Promise<string> {
	const ha1 = await md5Hex(`${p.username}:${p.realm}:${p.password}`);
	const ha2 = await md5Hex(`${p.method}:${p.uri}`);
	const response = p.qop
		? await md5Hex(
			`${ha1}:${p.nonce}:${p.nc ?? "00000001"}:${p.cnonce ?? "0a4f113b"}:${p.qop}:${ha2}`,
		)
		: await md5Hex(`${ha1}:${p.nonce}:${ha2}`);
	const parts = [
		`username="${p.username}"`,
		`realm="${p.realm}"`,
		`nonce="${p.nonce}"`,
		`uri="${p.uri}"`,
		`response="${response}"`,
	];
	if (p.algorithm) parts.push(`algorithm=${p.algorithm}`);
	if (p.qop) {
		parts.push(`qop=${p.qop}`);
		parts.push(`nc=${p.nc ?? "00000001"}`);
		parts.push(`cnonce="${p.cnonce ?? "0a4f113b"}"`);
	}
	if (p.opaque) parts.push(`opaque="${p.opaque}"`);
	return `Digest ${parts.join(", ")}`;
}

let branchCounter = 0;
export function newBranch(): string {
	branchCounter++;
	return `z9hG4bK-${Date.now().toString(36)}-${branchCounter}`;
}

export function randomCallId(host = "invalid"): string {
	const r = Array.from(crypto.getRandomValues(new Uint8Array(8)))
		.map((b) => b.toString(16).padStart(2, "0")).join("");
	return `${r}@${host}`;
}

export function getStatusCode(startLine: string): number | null {
	const m = startLine.match(/^SIP\/2\.0\s+(\d{3})\b/);
	return m ? Number(m[1]) : null;
}
