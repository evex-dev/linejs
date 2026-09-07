import { assertEquals, assertRejects, assertStrictEquals } from "@std/assert";
import { InternalError } from "../../core/mod.ts";
import { TalkService } from "./mod.ts";

interface RequestCall {
	value: unknown;
	methodName: string;
}

function makeStubClient(respond: (call: number) => Promise<unknown>) {
	const calls: RequestCall[] = [];
	const encryptedFor: string[] = [];
	return {
		calls,
		encryptedFor,
		client: {
			getReqseq: () => Promise.resolve(7),
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
