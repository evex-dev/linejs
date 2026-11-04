import { assert, test } from "vite-plus/test";
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
						encryptedData: Buffer.from(new Uint8Array(rawData.length + 32)),
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
	obs.uploadObjectForService = ((opts: { data: Blob; obsPath: string }) => {
		fake.records.push({ size: opts.data.size, obsPath: opts.obsPath });
		return Promise.resolve({
			objId: "OBJ-1",
			headers: new Headers(),
		});
	}) as never;
	return { obs, fake };
}

test("uploadMediaByE2EE — without preview, legacy: full edata uploaded twice (#103)", async () => {
	const { obs, fake } = makeObs();
	const big = new Blob([new Uint8Array(100_000)]);
	await obs.uploadMediaByE2EE({
		data: big,
		oType: "image",
		to: "u-recipient",
	});
	assert.deepEqual(fake.records.length, 2);
	// Both uploads carry the same (full) encrypted blob:
	assert.deepEqual(fake.records[0].size, fake.records[1].size);
	assert.isOk(fake.records[1].obsPath.endsWith("__ud-preview"));
});

test("uploadMediaByE2EE — with preview, preview upload uses small blob (#103)", async () => {
	const { obs, fake } = makeObs();
	const big = new Blob([new Uint8Array(100_000)]);
	const thumb = new Blob([new Uint8Array(2_000)]);
	await obs.uploadMediaByE2EE({
		data: big,
		oType: "image",
		to: "u-recipient",
		preview: thumb,
	});
	assert.deepEqual(fake.records.length, 2);
	// Main upload ≫ preview upload.
	assert.isOk(fake.records[0].size > fake.records[1].size);
	assert.isOk(fake.records[1].obsPath.endsWith("__ud-preview"));
	// Main upload did NOT pass a keyMaterial (generated fresh inside);
	// the preview call MUST reuse the returned base64 keyMaterial.
	assert.deepEqual(fake.e2eeCalls.length, 2);
	assert.deepEqual(fake.e2eeCalls[0].keyMaterial, undefined);
	assert.deepEqual(fake.e2eeCalls[1].keyMaterial, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
});

test("uploadMediaByE2EE — file type → no preview upload at all", async () => {
	const { obs, fake } = makeObs();
	const doc = new Blob([new Uint8Array(50_000)]);
	await obs.uploadMediaByE2EE({
		data: doc,
		oType: "file",
		to: "u-recipient",
		filename: "report.pdf",
	});
	assert.deepEqual(fake.records.length, 1);
});

/** contentMetadata of the one sendMessage the upload ends with. */
function sentMetadata(fake: ReturnType<typeof fakeClient>): Record<string, string> {
	assert.deepEqual(fake.sendMessageCalls.length, 1);
	return (
		fake.sendMessageCalls[0] as {
			contentMetadata: Record<string, string>;
		}
	).contentMetadata;
}

test("uploadMediaByE2EE — a video carries its length as DURATION", async () => {
	const { obs, fake } = makeObs();
	await obs.uploadMediaByE2EE({
		data: new Blob([new Uint8Array(1_000)]),
		oType: "video",
		to: "u-recipient",
		durationMs: 4200.4,
	});
	assert.deepEqual(sentMetadata(fake).DURATION, "4200");
});

test("uploadMediaByE2EE — no DURATION when omitted, none on an image", async () => {
	const video = makeObs();
	await video.obs.uploadMediaByE2EE({
		data: new Blob([new Uint8Array(1_000)]),
		oType: "video",
		to: "u-recipient",
	});
	assert.deepEqual(sentMetadata(video.fake).DURATION, undefined);

	const image = makeObs();
	await image.obs.uploadMediaByE2EE({
		data: new Blob([new Uint8Array(1_000)]),
		oType: "image",
		to: "u-recipient",
		durationMs: 4200,
	});
	assert.deepEqual(sentMetadata(image.fake).DURATION, undefined);
});

test("uploadMediaByE2EE — a non-positive or non-finite duration is dropped", async () => {
	for (const durationMs of [0, -1, NaN, Infinity]) {
		const { obs, fake } = makeObs();
		await obs.uploadMediaByE2EE({
			data: new Blob([new Uint8Array(1_000)]),
			oType: "video",
			to: "u-recipient",
			durationMs,
		});
		assert.deepEqual(sentMetadata(fake).DURATION, undefined);
	}
});

test("uploadMediaByE2EE — rounded zero and unsafe durations are omitted", async () => {
	for (const durationMs of [
		0.1,
		0.49,
		Number.MIN_VALUE,
		-Infinity,
		Number.MAX_SAFE_INTEGER + 1,
		1e21,
		Number.MAX_VALUE,
	]) {
		const { obs, fake } = makeObs();
		await obs.uploadMediaByE2EE({
			data: new Blob(["video"]),
			oType: "video",
			to: "u-recipient",
			durationMs,
		});
		assert.deepEqual(sentMetadata(fake).DURATION, undefined, `durationMs=${durationMs}`);
	}
});

test("uploadMediaByE2EE — rounds valid durations to positive integer milliseconds", async () => {
	for (const [durationMs, expected] of [
		[0.5, "1"],
		[1, "1"],
		[4200.5, "4201"],
		[Number.MAX_SAFE_INTEGER, "9007199254740991"],
	] as const) {
		const { obs, fake } = makeObs();
		await obs.uploadMediaByE2EE({
			data: new Blob(["video"]),
			oType: "video",
			to: "u-recipient",
			durationMs,
		});
		assert.deepEqual(sentMetadata(fake).DURATION, expected);
	}
});

test("uploadMediaByE2EE — duration does not change non-video metadata", async () => {
	for (const oType of ["audio", "file", "image", "gif"] as const) {
		const withDuration = makeObs();
		const withoutDuration = makeObs();
		const options = { data: new Blob(["media"]), oType, to: "u-recipient" };
		await withDuration.obs.uploadMediaByE2EE({ ...options, durationMs: 4200 });
		await withoutDuration.obs.uploadMediaByE2EE(options);
		assert.deepEqual(sentMetadata(withDuration.fake), sentMetadata(withoutDuration.fake));
	}
});

test("uploadMediaByE2EE — video duration preserves encrypted preview and message metadata", async () => {
	const { obs, fake } = makeObs();
	await obs.uploadMediaByE2EE({
		data: new Blob([new Uint8Array(1000)], { type: "video/mp4" }),
		oType: "video",
		to: "c-group",
		filename: "clip.mp4",
		preview: new Blob([new Uint8Array(20)]),
		durationMs: 4200,
	});
	const metadata = sentMetadata(fake);
	assert.deepEqual(metadata, {
		SID: "emv",
		OID: "OBJ-1",
		FILE_SIZE: "1032",
		e2eeVersion: "2",
		DURATION: "4200",
		MEDIA_CONTENT_INFO: JSON.stringify({
			category: "original",
			fileSize: 1032,
			extension: "mp4",
			animated: false,
		}),
	});
	assert.deepEqual(
		fake.records.map((record) => record.size),
		[1032, 52],
	);
	assert.isOk(fake.records[0].obsPath.startsWith("talk/emv/reqid-"));
	assert.deepEqual(fake.records[1].obsPath, "talk/emv/OBJ-1__ud-preview");
	assert.deepEqual(fake.e2eeCalls[1].keyMaterial, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
	const message = fake.sendMessageCalls[0] as {
		to: string;
		contentType: number;
		chunks: Uint8Array[];
	};
	assert.deepEqual(message.to, "c-group");
	assert.deepEqual(message.contentType, 2);
	assert.deepEqual(message.chunks, [new Uint8Array()]);
});
