import { assert, test } from "vite-plus/test";
import { assertRejects } from "../../../test/assert.ts";
import { BaseClient, InternalError } from "../../core/mod.ts";
import { type NestedArray, Protocols } from "../../thrift/readwrite/declares.ts";
import { readThrift } from "../../thrift/readwrite/read.ts";
import { writeThrift } from "../../thrift/readwrite/write.ts";
import { TalkService } from "./mod.ts";

interface RequestCall {
	value: unknown;
	methodName: string;
}

function makeStubClient(respond: (call: number) => Promise<unknown>) {
	const calls: RequestCall[] = [];
	const encryptedFor: string[] = [];
	const reqseqBuckets: (string | undefined)[] = [];
	return {
		calls,
		encryptedFor,
		reqseqBuckets,
		client: {
			getReqseq: (name?: string) => {
				reqseqBuckets.push(name);
				return Promise.resolve(7);
			},
			e2ee: {
				encryptE2EEMessage: (to: string) => {
					encryptedFor.push(to);
					return Promise.resolve([new Uint8Array([1, 2, 3])]);
				},
			},
			request: {
				request(value: unknown, methodName: string) {
					calls.push({ value, methodName });
					return respond(calls.length);
				},
			},
		},
	};
}

function decodeReactRequest(value: unknown) {
	return readThrift(writeThrift(value as NestedArray, "react", Protocols[4]), Protocols[4]).data;
}

// `sendMessage_args` is already a NestedArray, so read the fields without
// round-tripping: the stub's Uint8Array chunks cannot be re-encoded.
function sendMessageField(value: unknown, fieldId: number): unknown {
	const message = (value as NestedArray)[1]![2] as NestedArray;
	return message.find((entry) => (entry as number[])[1] === fieldId)?.[2];
}

// `InternalError.data` defaults to `{}`, and throw sites such as the
// client-closed guard never fill in a code. Reading `.toString()` off it threw
// "Cannot read properties of undefined" from inside this handler, so the caller
// got a TypeError about the retry decision instead of the error that stopped
// the send.
test("sendMessage rethrows an error that carries no code", async () => {
	const failure = new InternalError(
		"ClientClosed",
		"Request aborted: client has been disabled (logged out)",
	);
	const stub = makeStubClient(() => Promise.reject(failure));
	const talk = new TalkService(stub.client as never);

	const error = await assertRejects(() => talk.sendMessage({ to: "u0", text: "hi" }));

	assert.strictEqual(error, failure);
	assert.deepEqual(stub.calls.length, 1);
	assert.deepEqual(stub.encryptedFor, []);
});

test("concurrent reactions allocate distinct persisted sequences on a fresh client", async () => {
	const base = new BaseClient({ device: "IOSIPAD" });
	const sequences: number[] = [];
	base.request.request = ((value: unknown) => {
		const decoded = decodeReactRequest(value);
		sequences.push(decoded[1][1]);
		return Promise.resolve();
	}) as typeof base.request.request;
	await Promise.all(
		Array.from({ length: 5 }, () => base.talk.react({ id: 42n, reaction: "NICE" })),
	);
	assert.deepEqual(sequences, [0, 1, 2, 3, 4]);
	assert.deepEqual(JSON.parse(String(await base.storage.get("reqseq"))), {
		talk: 5,
	});
});

test("sendMessage retries with E2EE when the server asks for it", async () => {
	const stub = makeStubClient((call) =>
		call === 1
			? Promise.reject(
					new InternalError("RequestError", "e2ee required", {
						code: "E2EE_RETRY_ENCRYPT",
					}),
				)
			: Promise.resolve({ id: "1" }),
	);
	const talk = new TalkService(stub.client as never);

	await talk.sendMessage({ to: "u0", text: "hi" });

	assert.deepEqual(
		stub.calls.map((call) => call.methodName),
		["sendMessage", "sendMessage"],
	);
	assert.deepEqual(stub.encryptedFor, ["u0"]);
});

test("sendMessage rethrows a non-E2EE code without retrying", async () => {
	const failure = new InternalError("RequestError", "not found", {
		code: "NOT_FOUND",
	});
	const stub = makeStubClient(() => Promise.reject(failure));
	const talk = new TalkService(stub.client as never);

	const error = await assertRejects(() => talk.sendMessage({ to: "u0", text: "hi" }));

	assert.strictEqual(error, failure);
	assert.deepEqual(stub.calls.length, 1);
	assert.deepEqual(stub.encryptedFor, []);
});

// `reqSeq` was hardcoded to 0, so every reaction of a session carried the
// sequence number of the first one.
test("react takes its sequence number from the talk bucket", async () => {
	const stub = makeStubClient(() => Promise.resolve({}));
	const talk = new TalkService(stub.client as never);

	await talk.react({ id: 42n, reaction: "NICE" });

	assert.deepEqual(stub.reqseqBuckets, [undefined]);
	assert.deepEqual(
		stub.calls.map((call) => call.methodName),
		["react"],
	);
	assert.deepEqual(decodeReactRequest(stub.calls[0]!.value), {
		1: { 1: 7, 2: 42, 3: { 1: 2 } },
	});
});

test("react uses a caller-supplied sequence number", async () => {
	const stub = makeStubClient(() => Promise.resolve({}));
	const talk = new TalkService(stub.client as never);

	await talk.react({ id: 42n, reaction: "NICE", reqSeq: 1234 });

	// The caller owns the sequence; the client's own one is left untouched.
	assert.deepEqual(stub.reqseqBuckets, []);
	assert.deepEqual(decodeReactRequest(stub.calls[0]!.value), {
		1: { 1: 1234, 2: 42, 3: { 1: 2 } },
	});
});

// The CLI forwards an unset `--content-type` as `contentType: undefined`, and
// spreading that over the defaults dropped the field from the thrift body while
// contentMetadata still claimed `contentType: "0"`. /S4 rejects that mismatch
// with E2EE_INVALID_VERSION / "not allowed contentType", so a plain
// `line chats send u... "text"` never left the device.
test("sendMessage keeps an explicit contentType on the wire when the caller passes undefined", async () => {
	const stub = makeStubClient(() => Promise.resolve({ id: "1" }));
	await new TalkService(stub.client as never).sendMessage({
		to: "u0",
		text: "hi",
		e2ee: true,
		contentType: undefined,
		contentMetadata: undefined,
	});

	assert.strictEqual(sendMessageField(stub.calls[0].value, 15), 0);
	assert.deepEqual(sendMessageField(stub.calls[0].value, 18), [
		11,
		11,
		{ e2eeVersion: "2", contentType: "0", e2eeMark: "2" },
	]);
});

for (const code of [undefined, null, 5]) {
	test(`sendMessage preserves non-E2EE error code ${code}`, async () => {
		const failure = new InternalError("RequestError", "original", { code });
		const stub = makeStubClient(() => Promise.reject(failure));
		const error = await assertRejects(() =>
			new TalkService(stub.client as never).sendMessage({
				to: "u0",
				text: "hi",
			}),
		);
		assert.strictEqual(error, failure);
		assert.deepEqual(stub.calls.length, 1);
	});
}

for (const e2ee of [false, true]) {
	test(`sendMessage does not retry indefinitely with explicit e2ee=${e2ee}`, async () => {
		const failure = new InternalError("RequestError", "original", {
			code: "E2EE_RETRY_ENCRYPT",
		});
		const stub = makeStubClient(() => Promise.reject(failure));
		const error = await assertRejects(() =>
			new TalkService(stub.client as never).sendMessage({
				to: "u0",
				text: "hi",
				e2ee,
			}),
		);
		assert.strictEqual(error, failure);
		assert.deepEqual(stub.calls.length, 1);
	});
}

test("react preserves an explicit zero sequence and a large message ID", async () => {
	const stub = makeStubClient(() => Promise.resolve({}));
	await new TalkService(stub.client as never).react({
		id: 9007199254740993n,
		reaction: "NICE",
		reqSeq: 0,
	});
	assert.deepEqual(stub.reqseqBuckets, []);
	assert.deepEqual(decodeReactRequest(stub.calls[0].value), {
		1: { 1: 0, 2: 9007199254740993n, 3: { 1: 2 } },
	});
});

test("sequence allocation recovers from failed persistence without reusing an allocated ID", async () => {
	const base = new BaseClient({ device: "IOSIPAD" });
	const set = base.storage.set.bind(base.storage);
	base.storage.set = () => Promise.reject(new Error("storage unavailable"));
	await assertRejects(() => base.getReqseq(), Error, "storage unavailable");
	base.storage.set = set;
	assert.deepEqual(await base.getReqseq(), 1);
	assert.deepEqual(await base.getReqseq("square"), 0);
	assert.deepEqual(JSON.parse(String(await base.storage.get("reqseq"))), {
		talk: 2,
		square: 1,
	});
});
