// High-level call control-plane adapter (#148 v3.0).
// Wraps the Thrift CallService — route allocation, group-call URL
// CRUD, kick/invite. No media plane; that's v3.1+ (CALLS.md).
import type { Client } from "../mod.ts";
import type * as LINETypes from "@evex/linejs-types";

export type CallType = "AUDIO" | "VIDEO" | "FACEPLAY";

export interface CallClient {
	/**
	 * Allocate a 1:1 call route. Returns the `cscf`/`mix` host pair the
	 * Andromeda media client would dial into, plus the `fromToken`.
	 */
	acquireRoute(opts: {
		to: string;
		callType?: CallType;
		fromEnvInfo?: Record<string, string>;
	}): Promise<LINETypes.CallRoute>;

	/** Allocate a group-call route. */
	acquireGroupRoute(
		...args: Parameters<
			import("../../base/service/call/mod.ts").CallService["acquireGroupCallRoute"]
		>
	): ReturnType<
		import("../../base/service/call/mod.ts").CallService["acquireGroupCallRoute"]
	>;

	/** OA (official-account) call route. */
	acquireOARoute(
		...args: Parameters<
			import("../../base/service/call/mod.ts").CallService["acquireOACallRoute"]
		>
	): ReturnType<
		import("../../base/service/call/mod.ts").CallService["acquireOACallRoute"]
	>;

	/** Get current group-call state for a chat. */
	getGroupCall(chatMid: string): Promise<unknown>;

	/** Group-call URL CRUD. */
	createGroupCallUrl(
		...args: Parameters<
			import("../../base/service/call/mod.ts").CallService["createGroupCallUrl"]
		>
	): ReturnType<
		import("../../base/service/call/mod.ts").CallService["createGroupCallUrl"]
	>;
	getGroupCallUrl(
		ticket: string,
	): ReturnType<
		import("../../base/service/call/mod.ts").CallService["getGroupCallUrlInfo"]
	>;
	listGroupCallUrls(): ReturnType<
		import("../../base/service/call/mod.ts").CallService["getGroupCallUrls"]
	>;
	updateGroupCallUrl(
		...args: Parameters<
			import("../../base/service/call/mod.ts").CallService["updateGroupCallUrl"]
		>
	): ReturnType<
		import("../../base/service/call/mod.ts").CallService["updateGroupCallUrl"]
	>;
	deleteGroupCallUrl(
		...args: Parameters<
			import("../../base/service/call/mod.ts").CallService["deleteGroupCallUrl"]
		>
	): ReturnType<
		import("../../base/service/call/mod.ts").CallService["deleteGroupCallUrl"]
	>;
	/** Join a chat via a group-call URL ticket. */
	joinChatByUrl(ticket: string): Promise<unknown>;
	/** Invite users into an in-progress group call. */
	invite(
		...args: Parameters<
			import("../../base/service/call/mod.ts").CallService["inviteIntoGroupCall"]
		>
	): ReturnType<
		import("../../base/service/call/mod.ts").CallService["inviteIntoGroupCall"]
	>;
	/** Kick a user from an in-progress group call. */
	kick(
		...args: Parameters<
			import("../../base/service/call/mod.ts").CallService["kickoutFromGroupCall"]
		>
	): ReturnType<
		import("../../base/service/call/mod.ts").CallService["kickoutFromGroupCall"]
	>;

	/** Low-level: the base CallService for any RPC not wrapped above. */
	readonly service: import("../../base/service/call/mod.ts").CallService;
}

class ClientCall implements CallClient {
	#client: Client;
	constructor(client: Client) {
		this.#client = client;
	}
	get service() {
		return this.#client.base.call;
	}

	acquireRoute(opts: {
		to: string;
		callType?: CallType;
		fromEnvInfo?: Record<string, string>;
	}) {
		return this.service.acquireCallRoute({
			to: opts.to,
			callType: opts.callType ?? "AUDIO",
			fromEnvInfo: opts.fromEnvInfo,
		} as never);
	}
	acquireGroupRoute(
		...args: Parameters<typeof this.service.acquireGroupCallRoute>
	) {
		return this.service.acquireGroupCallRoute(...args);
	}
	acquireOARoute(...args: Parameters<typeof this.service.acquireOACallRoute>) {
		return this.service.acquireOACallRoute(...args);
	}
	getGroupCall(chatMid: string) {
		return this.service.getGroupCall({ chatMid } as never);
	}
	createGroupCallUrl(
		...args: Parameters<typeof this.service.createGroupCallUrl>
	) {
		return this.service.createGroupCallUrl(...args);
	}
	getGroupCallUrl(ticket: string) {
		return this.service.getGroupCallUrlInfo({ groupCallUrlTicket: ticket } as never);
	}
	listGroupCallUrls() {
		return this.service.getGroupCallUrls({} as never);
	}
	updateGroupCallUrl(
		...args: Parameters<typeof this.service.updateGroupCallUrl>
	) {
		return this.service.updateGroupCallUrl(...args);
	}
	deleteGroupCallUrl(
		...args: Parameters<typeof this.service.deleteGroupCallUrl>
	) {
		return this.service.deleteGroupCallUrl(...args);
	}
	joinChatByUrl(ticket: string) {
		return this.service.joinChatByCallUrl({ groupCallUrlTicket: ticket } as never);
	}
	invite(...args: Parameters<typeof this.service.inviteIntoGroupCall>) {
		return this.service.inviteIntoGroupCall(...args);
	}
	kick(...args: Parameters<typeof this.service.kickoutFromGroupCall>) {
		return this.service.kickoutFromGroupCall(...args);
	}
}

export function createCallClient(client: Client): CallClient {
	return new ClientCall(client);
}

/**
 * Parsed incoming-call event from the polling stream. Surfaced by
 * Client via `on("call:incoming", ...)`. Fields are derived from the
 * raw Operation params:
 * - `callMid` = param1 (a c-prefixed mid identifying the call instance)
 * - `from`    = param2 (caller's user mid; absent if we're the caller)
 * - `kind`    = param3 (AUDIO / VIDEO / FACEPLAY when LINE sets it)
 */
export interface IncomingCallEvent {
	callMid: string;
	from: string;
	kind?: string;
	raw: LINETypes.Operation;
}

/** Parsed cancel-call event (OpType CANCEL_CALL). */
export interface CancelCallEvent {
	callMid: string;
	from: string;
	reason?: string;
	raw: LINETypes.Operation;
}

export function parseIncomingCall(op: LINETypes.Operation): IncomingCallEvent {
	return {
		callMid: (op as { param1?: string }).param1 ?? "",
		from: (op as { param2?: string }).param2 ?? "",
		kind: (op as { param3?: string }).param3,
		raw: op,
	};
}

export function parseCancelCall(op: LINETypes.Operation): CancelCallEvent {
	return {
		callMid: (op as { param1?: string }).param1 ?? "",
		from: (op as { param2?: string }).param2 ?? "",
		reason: (op as { param3?: string }).param3,
		raw: op,
	};
}
