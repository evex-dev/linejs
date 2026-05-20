import { assertEquals } from "@std/assert";
import {
	buildSip,
	digestResponse,
	getStatusCode,
	newBranch,
	parseDigestChallenge,
	parseSip,
} from "./sip.ts";

Deno.test("buildSip + parseSip round-trip", () => {
	const msg = {
		startLine: "REGISTER sip:cscf.example.com SIP/2.0",
		headers: { "Call-ID": "abc@host", "CSeq": "1 REGISTER" },
		body: "",
	};
	const bytes = buildSip(msg);
	const parsed = parseSip(bytes);
	assertEquals(parsed.startLine, msg.startLine);
	assertEquals(parsed.headers["Call-ID"], "abc@host");
	assertEquals(parsed.headers["CSeq"], "1 REGISTER");
	assertEquals(parsed.body, "");
});

Deno.test("parseSip handles header values containing colons", () => {
	const bytes = buildSip({
		startLine: "SIP/2.0 401 Unauthorized",
		headers: { "WWW-Authenticate": `Digest realm="r", nonce="n:x:y"` },
		body: "",
	});
	const parsed = parseSip(bytes);
	assertEquals(parsed.headers["WWW-Authenticate"], `Digest realm="r", nonce="n:x:y"`);
});

Deno.test("parseDigestChallenge extracts realm/nonce/qop/algorithm", () => {
	const d = parseDigestChallenge(
		`Digest realm="line", nonce="abc123", qop="auth", algorithm=MD5, opaque="o-1"`,
	);
	assertEquals(d.realm, "line");
	assertEquals(d.nonce, "abc123");
	assertEquals(d.qop, "auth");
	assertEquals(d.algorithm, "MD5");
	assertEquals(d.opaque, "o-1");
});

Deno.test("digestResponse — RFC 2617 §3.5.1 example (qop=auth)", async () => {
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
	assertEquals(m?.[1], "6629fae49393a05397450978507c4ef1");
});

Deno.test("getStatusCode parses SIP response line", () => {
	assertEquals(getStatusCode("SIP/2.0 401 Unauthorized"), 401);
	assertEquals(getStatusCode("SIP/2.0 200 OK"), 200);
	assertEquals(getStatusCode("INVITE sip:x SIP/2.0"), null);
});

Deno.test("newBranch starts with RFC 3261 magic cookie", () => {
	const b = newBranch();
	assertEquals(b.startsWith("z9hG4bK"), true);
});
