import { assert, assertEquals } from "@std/assert";
import {
	decodeLegyHeaders,
	encodeLegyHeaders,
	LegyEncryptedTransport,
	xxhash32,
} from "./legy.ts";
import { Buffer } from "node:buffer";

Deno.test("LEGY header codec round-trips headers and body", () => {
	const body = Buffer.from([1, 2, 3]);
	const encoded = Buffer.concat([
		encodeLegyHeaders({ "x-lt": "token", "x-lpqs": "/S4" }),
		body,
	]);
	const decoded = decodeLegyHeaders(encoded);
	assertEquals(decoded.headers, { "x-lt": "token", "x-lpqs": "/S4" });
	assertEquals([...decoded.data], [1, 2, 3]);
});

Deno.test("xxhash32 matches canonical empty input", () => {
	assertEquals(xxhash32(new Uint8Array()), 0x02cc5d05);
});

// The transport rebuilds the request it sends, so anything the caller set on
// the original has to be carried over explicitly. Dropping the signal made
// every encrypted call unabortable: the timeout set in
// packages/linejs/base/request/mod.ts applied to a request that was never the
// one on the wire.
Deno.test("LEGY transport forwards the caller's abort signal", async () => {
	const controller = new AbortController();
	const { captured } = await roundTrip({ signal: controller.signal });

	assertEquals(captured.signal.aborted, false);
	controller.abort();
	assertEquals(captured.signal.aborted, true);
});

Deno.test("LEGY transport keeps method, headers and body encryption", async () => {
	const plaintext = new Uint8Array([1, 2, 3, 4]);
	const { captured, body } = await roundTrip({ body: plaintext });

	assertEquals(captured.url, "https://gf.line.naver.jp/enc");
	assertEquals(captured.method, "POST");
	assertEquals(captured.headers.get("x-line-application"), "TEST\t1.0");
	assertEquals(captured.headers.get("x-le"), "7");
	assertEquals(captured.headers.get("x-lap"), "5");
	assertEquals(captured.headers.get("x-lcs")?.startsWith("0008"), true);
	assertEquals(captured.headers.get("user-agent"), "Line/1.0");
	assertEquals(captured.headers.get("content-type"), "application/x-thrift");
	// x-lhm carries the inner method, so the outer POST never hides it.
	assertEquals(captured.headers.get("x-lhm"), "POST");
	assertEquals(captured.headers.get("x-line-access"), null);
	// AES-128-CBC output plus the 4-byte LEGY hmac appended for `x-le: 7`.
	assertEquals(body.length % 16, 4);
	assertEquals(Buffer.from(body).includes(Buffer.from(plaintext)), false);
});

async function roundTrip(
	init: { signal?: AbortSignal; body?: Uint8Array } = {},
): Promise<{ captured: Request; body: Uint8Array }> {
	const transport = new LegyEncryptedTransport();
	let captured: Request | undefined;
	let body: Uint8Array | undefined;
	const request = new Request("https://legy.line-apps.com/S4", {
		method: "POST",
		headers: { "content-type": "application/x-thrift" },
		signal: init.signal,
		body: (init.body ?? new Uint8Array([0])).slice().buffer,
	});
	await transport.fetch(request, async (sent) => {
		captured = sent;
		body = new Uint8Array(await sent.arrayBuffer());
		return new Response(new Uint8Array());
	}, { application: "TEST\t1.0", userAgent: "Line/1.0" });
	assert(captured && body);
	return { captured, body };
}
