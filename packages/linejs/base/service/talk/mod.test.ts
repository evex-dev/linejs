import { assertEquals, assertRejects, assertStrictEquals } from "@std/assert";
import { InternalError } from "../../core/mod.ts";
import {
	type NestedArray,
	Protocols,
} from "../../thrift/readwrite/declares.ts";
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
	return readThrift(
		writeThrift(value as NestedArray, "react", Protocols[4]),
		Protocols[4],
	).data;
}

// `InternalError.data` defaults to `{}`, and throw sites such as the
// client-closed guard never fill in a code. Reading `.toString()` off it threw
// "Cannot read properties of undefined" from inside this handler, so the caller
// got a TypeError about the retry decision instead of the error that stopped
// the send.
Deno.test("sendMessage rethrows an error that carries no code", async () => {
	const failure = new InternalError(
		"ClientClosed",
		"Request aborted: client has been disabled (logged out)",
	);
	const stub = makeStubClient(() => Promise.reject(failure));
	const talk = new TalkService(stub.client as never);

	const error = await assertRejects(() =>
		talk.sendMessage({ to: "u0", text: "hi" })
	);

	assertStrictEquals(error, failure);
	assertEquals(stub.calls.length, 1);
	assertEquals(stub.encryptedFor, []);
});

Deno.test("sendMessage retries with E2EE when the server asks for it", async () => {
	const stub = makeStubClient((call) =>
		call === 1
			? Promise.reject(
				new InternalError("RequestError", "e2ee required", {
					code: "E2EE_RETRY_ENCRYPT",
				}),
			)
			: Promise.resolve({ id: "1" })
	);
	const talk = new TalkService(stub.client as never);

	await talk.sendMessage({ to: "u0", text: "hi" });

	assertEquals(
		stub.calls.map((call) => call.methodName),
		["sendMessage", "sendMessage"],
	);
	assertEquals(stub.encryptedFor, ["u0"]);
});

Deno.test("sendMessage rethrows a non-E2EE code without retrying", async () => {
	const failure = new InternalError("RequestError", "not found", {
		code: "NOT_FOUND",
	});
	const stub = makeStubClient(() => Promise.reject(failure));
	const talk = new TalkService(stub.client as never);

	const error = await assertRejects(() =>
		talk.sendMessage({ to: "u0", text: "hi" })
	);

	assertStrictEquals(error, failure);
	assertEquals(stub.calls.length, 1);
	assertEquals(stub.encryptedFor, []);
});

// `reqSeq` was hardcoded to 0, so every reaction of a session carried the
// sequence number of the first one.
Deno.test("react takes its sequence number from the talk bucket", async () => {
	const stub = makeStubClient(() => Promise.resolve({}));
	const talk = new TalkService(stub.client as never);

	await talk.react({ id: 42n, reaction: "NICE" });

	assertEquals(stub.reqseqBuckets, [undefined]);
	assertEquals(
		stub.calls.map((call) => call.methodName),
		["react"],
	);
	assertEquals(decodeReactRequest(stub.calls[0]!.value), {
		1: { 1: 7, 2: 42, 3: { 1: 2 } },
	});
});

Deno.test("react uses a caller-supplied sequence number", async () => {
	const stub = makeStubClient(() => Promise.resolve({}));
	const talk = new TalkService(stub.client as never);

	await talk.react({ id: 42n, reaction: "NICE", reqSeq: 1234 });

	// The caller owns the sequence; the client's own one is left untouched.
	assertEquals(stub.reqseqBuckets, []);
	assertEquals(decodeReactRequest(stub.calls[0]!.value), {
		1: { 1: 1234, 2: 42, 3: { 1: 2 } },
	});
});
