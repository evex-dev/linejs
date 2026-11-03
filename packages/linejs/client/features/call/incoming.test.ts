import { assert, test } from "vite-plus/test";
import { parseIncomingAudioCall } from "./incoming.ts";
import { generateEphemeralKeypair, sha256 } from "./planet/crypto.ts";

const caller = `u${"1".repeat(32)}`;
const self = `u${"2".repeat(32)}`;

test("incoming audio binds native operation identity, CID and credential", () => {
	const params = {
		k: "CA",
		n: "synthetic-token",
		vs: "synthetic-call",
		vfz: "JP",
		vtz: "JP",
		h: "127.0.0.1",
		p: "9000",
		vc: JSON.stringify({
			mpkey: btoa(String.fromCharCode(...generateEphemeralKeypair().publicKey)),
		}),
	};
	const operation = {
		type: "NOTIFIED_RECEIVED_CALL",
		param1: caller,
		param2: params.n,
		param3: JSON.stringify(params),
		createdTime: 1,
	};
	const call = parseIncomingAudioCall(operation, self);
	assert.isOk(call);
	assert.deepEqual(call.callId, params.vs);
	assert.deepEqual(call.callerMid, caller);
	assert.deepEqual(call.localMid, self);
	assert.deepEqual(call.route.toMid, caller);
	assert.deepEqual(
		call.credential,
		sha256(new TextEncoder().encode([caller, self, params.n, params.vs].join("::"))),
	);
	for (const patch of [
		{ k: "CV" },
		{ k: undefined },
		{ g: "group" },
		{ sei: "group" },
		{ n: "other" },
		{ vs: "" },
		{ p: "0" },
		{ h: "bad/host" },
		{ vc: "{}" },
		{ vc: "not-json" },
	]) {
		assert.deepEqual(
			parseIncomingAudioCall(
				{
					...operation,
					param3: JSON.stringify({ ...params, ...patch }),
				},
				self,
			),
			undefined,
		);
	}
	assert.deepEqual(parseIncomingAudioCall(operation, caller), undefined);
	assert.deepEqual(parseIncomingAudioCall(operation, ""), undefined);
	assert.deepEqual(
		parseIncomingAudioCall({ ...operation, param1: `c${"1".repeat(32)}` }, self),
		undefined,
	);
	assert.deepEqual(parseIncomingAudioCall({ ...operation, type: "CANCEL_CALL" }, self), undefined);
});
