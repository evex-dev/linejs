import { assertEquals } from "@std/assert";
import { createCallClient, parseCancelCall, parseIncomingCall } from "./call.ts";

function fakeBaseClient() {
	const calls: { method: string; args: unknown[] }[] = [];
	const record = (method: string) => (...args: unknown[]) => {
		calls.push({ method, args });
		return Promise.resolve({ ok: true, method });
	};
	const base = {
		call: {
			acquireCallRoute: record("acquireCallRoute"),
			acquireGroupCallRoute: record("acquireGroupCallRoute"),
			acquireOACallRoute: record("acquireOACallRoute"),
			getGroupCall: record("getGroupCall"),
			createGroupCallUrl: record("createGroupCallUrl"),
			getGroupCallUrlInfo: record("getGroupCallUrlInfo"),
			getGroupCallUrls: record("getGroupCallUrls"),
			updateGroupCallUrl: record("updateGroupCallUrl"),
			deleteGroupCallUrl: record("deleteGroupCallUrl"),
			joinChatByCallUrl: record("joinChatByCallUrl"),
			inviteIntoGroupCall: record("inviteIntoGroupCall"),
			kickoutFromGroupCall: record("kickoutFromGroupCall"),
		},
	};
	return { client: { base } as never, calls, base };
}

Deno.test("call.acquireRoute defaults callType=AUDIO", async () => {
	const { client, calls } = fakeBaseClient();
	const cc = createCallClient(client);
	await cc.acquireRoute({ to: "u-peer" });
	assertEquals(calls[0].method, "acquireCallRoute");
	assertEquals(
		(calls[0].args[0] as { callType: string }).callType,
		"AUDIO",
	);
	assertEquals((calls[0].args[0] as { to: string }).to, "u-peer");
});

Deno.test("call.acquireRoute respects explicit callType", async () => {
	const { client, calls } = fakeBaseClient();
	await createCallClient(client).acquireRoute({ to: "u-peer", callType: "VIDEO" });
	assertEquals((calls[0].args[0] as { callType: string }).callType, "VIDEO");
});

Deno.test("call.getGroupCall + URL CRUD route to right base methods", async () => {
	const { client, calls } = fakeBaseClient();
	const cc = createCallClient(client);
	await cc.getGroupCall("c-chat");
	await cc.getGroupCallUrl("ticket-1");
	await cc.listGroupCallUrls();
	await cc.joinChatByUrl("ticket-2");
	assertEquals(calls.map((c) => c.method), [
		"getGroupCall",
		"getGroupCallUrlInfo",
		"getGroupCallUrls",
		"joinChatByCallUrl",
	]);
	assertEquals(
		(calls[1].args[0] as { groupCallUrlTicket: string }).groupCallUrlTicket,
		"ticket-1",
	);
});

Deno.test("parseIncomingCall pulls callMid/from/kind out of Operation params", () => {
	const e = parseIncomingCall({
		param1: "ccall-1",
		param2: "u-caller",
		param3: "VIDEO",
		type: "NOTIFIED_RECEIVED_CALL",
	} as never);
	assertEquals(e.callMid, "ccall-1");
	assertEquals(e.from, "u-caller");
	assertEquals(e.kind, "VIDEO");
});

Deno.test("parseCancelCall pulls fields out of CANCEL_CALL op", () => {
	const e = parseCancelCall({
		param1: "ccall-1",
		param2: "u-caller",
		param3: "DECLINED",
		type: "CANCEL_CALL",
	} as never);
	assertEquals(e.callMid, "ccall-1");
	assertEquals(e.from, "u-caller");
	assertEquals(e.reason, "DECLINED");
});

Deno.test("parseIncomingCall handles missing param2/param3", () => {
	const e = parseIncomingCall({
		param1: "ccall-1",
		type: "NOTIFIED_RECEIVED_CALL",
	} as never);
	assertEquals(e.callMid, "ccall-1");
	assertEquals(e.from, "");
	assertEquals(e.kind, undefined);
});
