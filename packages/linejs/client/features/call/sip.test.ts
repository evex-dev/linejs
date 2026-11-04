import { assert, test } from "vite-plus/test";
import {
	buildSip,
	digestResponse,
	getStatusCode,
	newBranch,
	parseDigestChallenge,
	parseSip,
} from "./sip.ts";

test("buildSip + parseSip round-trip", () => {
	const msg = {
		startLine: "REGISTER sip:cscf.example.com SIP/2.0",
		headers: { "Call-ID": "abc@host", CSeq: "1 REGISTER" },
		body: "",
	};
	const bytes = buildSip(msg);
	const parsed = parseSip(bytes);
	assert.deepEqual(parsed.startLine, msg.startLine);
	assert.deepEqual(parsed.headers["Call-ID"], "abc@host");
	assert.deepEqual(parsed.headers["CSeq"], "1 REGISTER");
	assert.deepEqual(parsed.body, "");
});

test("parseSip handles header values containing colons", () => {
	const bytes = buildSip({
		startLine: "SIP/2.0 401 Unauthorized",
		headers: { "WWW-Authenticate": `Digest realm="r", nonce="n:x:y"` },
		body: "",
	});
	const parsed = parseSip(bytes);
	assert.deepEqual(parsed.headers["WWW-Authenticate"], `Digest realm="r", nonce="n:x:y"`);
});

test("parseDigestChallenge extracts realm/nonce/qop/algorithm", () => {
	const d = parseDigestChallenge(
		`Digest realm="line", nonce="abc123", qop="auth", algorithm=MD5, opaque="o-1"`,
	);
	assert.deepEqual(d.realm, "line");
	assert.deepEqual(d.nonce, "abc123");
	assert.deepEqual(d.qop, "auth");
	assert.deepEqual(d.algorithm, "MD5");
	assert.deepEqual(d.opaque, "o-1");
});

test("digestResponse — RFC 2617 §3.5.1 example (qop=auth)", async () => {
	// classic RFC test vector
	const h = await digestResponse({
		username: "Mufasa",
		password: "Circle Of Life",
		realm: "testrealm@host.com",
		nonce: "dcd98b7102dd2f0e8b11d0f600bfb0c093",
		uri: "/dir/index.html",
		method: "GET",
		qop: "auth",
		cnonce: "0a4f113b",
		nc: "00000001",
	});
	// response = 6629fae49393a05397450978507c4ef1
	const m = h.match(/response="([^"]+)"/);
	assert.deepEqual(m?.[1], "6629fae49393a05397450978507c4ef1");
});

test("getStatusCode parses SIP response line", () => {
	assert.deepEqual(getStatusCode("SIP/2.0 401 Unauthorized"), 401);
	assert.deepEqual(getStatusCode("SIP/2.0 200 OK"), 200);
	assert.deepEqual(getStatusCode("INVITE sip:x SIP/2.0"), null);
});

test("newBranch starts with RFC 3261 magic cookie", () => {
	const b = newBranch();
	assert.deepEqual(b.startsWith("z9hG4bK"), true);
});
