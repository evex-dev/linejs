import { assertEquals, assertRejects } from "@std/assert";
import { Buffer } from "node:buffer";
import { InternalError } from "../core/mod.ts";
import { LineObs } from "./mod.ts";

/** Serves `responses` in order and records what was asked for, so a test can
 *  assert both the error and that the follow-up request never fired. */
function stubClient(responses: Response[]) {
	const urls: string[] = [];
	const decryptedSizes: number[] = [];
	const client = {
		authToken: "token",
		request: {
			systemType: "TEST\t0.0.0\tTEST\t0",
			getHeader: () => ({}),
		},
		fetch(url: string) {
			urls.push(url);
			const response = responses.shift();
			if (!response) {
				return Promise.reject(new Error(`unexpected fetch: ${url}`));
			}
			return Promise.resolve(response);
		},
		e2ee: {
			decryptE2EEDataMessage() {
				return Promise.resolve({
					keyMaterial: Buffer.alloc(32),
					fileName: "photo.jpg",
				});
			},
			decryptByKeyMaterial(rawData: Buffer) {
				decryptedSizes.push(rawData.length);
				return Buffer.alloc(0);
			},
		},
	};
	return { client, urls, decryptedSizes };
}

Deno.test("downloadObjectForService — a 404 is an ObsError, not a blob", async () => {
	const { client, urls } = stubClient([new Response(null, { status: 404 })]);
	const obs = new LineObs(client as never);

	const error = await assertRejects(
		() =>
			obs.downloadObjectForService({
				obsPath: "talk/emi",
				oid: "OBJ-1",
			}),
		InternalError,
	);

	assertEquals(error.name, "ObsError");
	assertEquals(error.message, "Object download failed: HTTP 404");
	assertEquals(error.data.status, 404);
	assertEquals(urls.length, 1);
});

// An object past LINE's retention window (contentMetadata.FILE_EXPIRE_TIMESTAMP)
// answers 404 with an empty body. That body used to reach the decryptor as if
// it were the ciphertext, so the caller saw "E2EEMediaError: encrypted data too
// short (0 bytes) to contain HMAC" and had no way to tell an expired object
// from a wrong key.
Deno.test("downloadMediaByE2EE — an expired object fails before the decryptor", async () => {
	const { client, decryptedSizes } = stubClient([
		new Response(null, { status: 404 }),
	]);
	const obs = new LineObs(client as never);

	const error = await assertRejects(
		() =>
			obs.downloadMediaByE2EE({
				id: "1",
				to: "u-recipient",
				chunks: [new Uint8Array()],
				contentMetadata: { OID: "OBJ-1", SID: "emi" },
			} as never),
		InternalError,
	);

	assertEquals(error.message, "Object download failed: HTTP 404");
	assertEquals(decryptedSizes, []);
});

// An unsent message keeps its id but no object, so obs answers the data url
// with an error page. Reading the metadata afterwards is pointless work on a
// download that has already failed.
Deno.test("downloadMessageData — a 410 stops before the metadata request", async () => {
	const { client, urls } = stubClient([
		new Response("<html><body>expired</body></html>", {
			status: 410,
			headers: { "content-type": "text/html" },
		}),
	]);
	const obs = new LineObs(client as never);

	const error = await assertRejects(
		() => obs.downloadMessageData({ messageId: "1" }),
		InternalError,
	);

	// The error page itself stays out of the message: obs embeds signed urls.
	assertEquals(error.message, "Message data download failed: HTTP 410");
	assertEquals(error.data.status, 410);
	assertEquals(urls.length, 1);
});

// `r.json()` on an empty 403 body raised "SyntaxError: Unexpected end of JSON
// input", which pointed at the parser rather than at the refused request.
Deno.test("getMessageObsMetadata — an empty 403 is an ObsError, not a SyntaxError", async () => {
	const { client } = stubClient([new Response(null, { status: 403 })]);
	const obs = new LineObs(client as never);

	const error = await assertRejects(
		() => obs.getMessageObsMetadata({ messageId: "1" }),
		InternalError,
	);

	assertEquals(error.name, "ObsError");
	assertEquals(error.message, "Message metadata request failed: HTTP 403");
	assertEquals(error.data.status, 403);
});

Deno.test("downloadMessageData — a 2xx download still yields the file", async () => {
	const { client, urls } = stubClient([
		new Response(new Uint8Array([1, 2, 3]), {
			headers: { "content-type": "image/jpeg" },
		}),
		new Response(JSON.stringify({ name: "photo.jpg" }), {
			headers: { "content-type": "application/json" },
		}),
	]);
	const obs = new LineObs(client as never);

	const file = await obs.downloadMessageData({ messageId: "1" });

	assertEquals(file.name, "photo.jpg");
	assertEquals(file.size, 3);
	assertEquals(file.type, "image/jpeg");
	assertEquals(urls.length, 2);
});

// Only a non-2xx status throws, so a preview that legitimately answers with an
// empty body keeps working.
Deno.test("downloadObjectForService — an empty 2xx body is still returned", async () => {
	const { client } = stubClient([new Response(null, { status: 204 })]);
	const obs = new LineObs(client as never);

	const blob = await obs.downloadObjectForService({
		obsPath: "talk/emi",
		oid: "OBJ-1",
	});

	assertEquals(blob.size, 0);
});
