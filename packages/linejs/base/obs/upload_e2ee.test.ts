import { assert, assertEquals } from "@std/assert";
import { Buffer } from "node:buffer";
import { LineObs } from "./mod.ts";

/** Per-call record of (data.size, obsPath) so tests can assert which
 *  blob was uploaded as the main object vs the preview. */
type UploadRecord = { size: number; obsPath: string };

function fakeClient() {
	const e2eeCalls: { rawSize: number; keyMaterial?: string }[] = [];
	const sendMessageCalls: unknown[] = [];
	return {
		records: [] as UploadRecord[],
		e2eeCalls,
		sendMessageCalls,
		mock: {
			e2ee: {
				encryptByKeyMaterial(rawData: Buffer, keyMaterial?: Buffer) {
					e2eeCalls.push({
						rawSize: rawData.length,
						keyMaterial: keyMaterial?.toString("base64"),
					});
					return Promise.resolve({
						keyMaterial: keyMaterial
							? keyMaterial.toString("base64")
							: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
						encryptedData: Buffer.from(
							new Uint8Array(rawData.length + 32),
						),
					});
				},
				encryptE2EEMessage() {
					return Promise.resolve([new Uint8Array()]);
				},
			},
			talk: {
				sendMessage(args: unknown) {
					sendMessageCalls.push(args);
					return Promise.resolve({ id: "m-1" });
				},
			},
		},
	};
}

function makeObs(): {
	obs: LineObs;
	fake: ReturnType<typeof fakeClient>;
} {
	const fake = fakeClient();
	const obs = new LineObs(fake.mock as never);
	// Intercept uploadObjectForService to record what was sent.
	obs.uploadObjectForService = ((opts: {
		data: Blob;
		obsPath: string;
	}) => {
		fake.records.push({ size: opts.data.size, obsPath: opts.obsPath });
		return Promise.resolve({
			objId: "OBJ-1",
			headers: new Headers(),
		});
	}) as never;
	return { obs, fake };
}

Deno.test("uploadMediaByE2EE — without preview, legacy: full edata uploaded twice (#103)", async () => {
	const { obs, fake } = makeObs();
	const big = new Blob([new Uint8Array(100_000)]);
	await obs.uploadMediaByE2EE({
		data: big,
		oType: "image",
		to: "u-recipient",
	});
	assertEquals(fake.records.length, 2);
	// Both uploads carry the same (full) encrypted blob:
	assertEquals(fake.records[0].size, fake.records[1].size);
	assert(fake.records[1].obsPath.endsWith("__ud-preview"));
});

Deno.test("uploadMediaByE2EE — with preview, preview upload uses small blob (#103)", async () => {
	const { obs, fake } = makeObs();
	const big = new Blob([new Uint8Array(100_000)]);
	const thumb = new Blob([new Uint8Array(2_000)]);
	await obs.uploadMediaByE2EE({
		data: big,
		oType: "image",
		to: "u-recipient",
		preview: thumb,
	});
	assertEquals(fake.records.length, 2);
	// Main upload ≫ preview upload.
	assert(fake.records[0].size > fake.records[1].size);
	assert(fake.records[1].obsPath.endsWith("__ud-preview"));
	// Main upload did NOT pass a keyMaterial (generated fresh inside);
	// the preview call MUST reuse the returned base64 keyMaterial.
	assertEquals(fake.e2eeCalls.length, 2);
	assertEquals(fake.e2eeCalls[0].keyMaterial, undefined);
	assertEquals(
		fake.e2eeCalls[1].keyMaterial,
		"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
	);
});

Deno.test("uploadMediaByE2EE — file type → no preview upload at all", async () => {
	const { obs, fake } = makeObs();
	const doc = new Blob([new Uint8Array(50_000)]);
	await obs.uploadMediaByE2EE({
		data: doc,
		oType: "file",
		to: "u-recipient",
		filename: "report.pdf",
	});
	assertEquals(fake.records.length, 1);
});

/** contentMetadata of the one sendMessage the upload ends with. */
function sentMetadata(
	fake: ReturnType<typeof fakeClient>,
): Record<string, string> {
	assertEquals(fake.sendMessageCalls.length, 1);
	return (fake.sendMessageCalls[0] as {
		contentMetadata: Record<string, string>;
	}).contentMetadata;
}

Deno.test("uploadMediaByE2EE — a video carries its length as DURATION", async () => {
	const { obs, fake } = makeObs();
	await obs.uploadMediaByE2EE({
		data: new Blob([new Uint8Array(1_000)]),
		oType: "video",
		to: "u-recipient",
		durationMs: 4200.4,
	});
	assertEquals(sentMetadata(fake).DURATION, "4200");
});

Deno.test("uploadMediaByE2EE — no DURATION when omitted, none on an image", async () => {
	const video = makeObs();
	await video.obs.uploadMediaByE2EE({
		data: new Blob([new Uint8Array(1_000)]),
		oType: "video",
		to: "u-recipient",
	});
	assertEquals(sentMetadata(video.fake).DURATION, undefined);

	const image = makeObs();
	await image.obs.uploadMediaByE2EE({
		data: new Blob([new Uint8Array(1_000)]),
		oType: "image",
		to: "u-recipient",
		durationMs: 4200,
	});
	assertEquals(sentMetadata(image.fake).DURATION, undefined);
});

Deno.test("uploadMediaByE2EE — a non-positive or non-finite duration is dropped", async () => {
	for (const durationMs of [0, -1, NaN, Infinity]) {
		const { obs, fake } = makeObs();
		await obs.uploadMediaByE2EE({
			data: new Blob([new Uint8Array(1_000)]),
			oType: "video",
			to: "u-recipient",
			durationMs,
		});
		assertEquals(sentMetadata(fake).DURATION, undefined);
	}
});
