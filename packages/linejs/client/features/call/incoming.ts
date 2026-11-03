import type * as LINETypes from "@evex-dev/linejs-types";
import { decodeMpKey, sha256 } from "./planet/crypto.ts";

/** The route supplied by an authenticated incoming operation, not acquireRoute. */
export type IncomingCallRoute = Pick<
	LINETypes.CallRoute,
	| "voipAddress"
	| "voipAddress6"
	| "voipUdpPort"
	| "commParam"
	| "fromToken"
	| "fromZone"
	| "toZone"
	| "toMid"
>;

/** Ordinary one-to-one audio only. Treat the route and credential as secrets. */
export interface IncomingAudioCall {
	callId: string;
	callerMid: string;
	localMid: string;
	createdAt: number;
	route: IncomingCallRoute;
	credential: Uint8Array;
}

function object(value: unknown): Record<string, unknown> | undefined {
	return value !== null && typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: undefined;
}
function jsonObject(value: unknown): Record<string, unknown> | undefined {
	if (typeof value !== "string" || value.length > 32768) return;
	try {
		return object(JSON.parse(value));
	} catch {
		return;
	}
}
function token(value: unknown): value is string {
	return typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);
}
function hosts(value: unknown): value is string {
	return (
		typeof value === "string" &&
		value.length <= 1024 &&
		value.split(",").every((h) => /^[A-Za-z0-9:.\-]{1,253}$/.test(h))
	);
}
function absent(value: unknown): boolean {
	return value === undefined || value === "";
}

/**
 * Parse only operations from the authenticated client's event stream. This is
 * shape validation, not authentication of arbitrary JSON received over HTTP.
 * The local MID must come from that client's logged-in profile.
 */
export function parseIncomingAudioCall(
	value: unknown,
	localMid: string,
): IncomingAudioCall | undefined {
	const op = object(value);
	const userMid = /^u[0-9a-f]{32}$/;
	if (
		!op ||
		(op.type !== "NOTIFIED_RECEIVED_CALL" && op.type !== 50) ||
		typeof op.param1 !== "string" ||
		!userMid.test(op.param1) ||
		!userMid.test(localMid) ||
		op.param1 === localMid ||
		!token(op.param2)
	)
		return;
	const p = jsonObject(op.param3);
	if (
		!p ||
		p.k !== "CA" ||
		!absent(p.g) ||
		!absent(p.sei) ||
		p.n !== op.param2 ||
		!token(p.vs) ||
		!token(p.vfz) ||
		!token(p.vtz) ||
		!hosts(p.h) ||
		(!absent(p.hv6) && !hosts(p.hv6))
	)
		return;
	if (typeof p.p !== "number" && (typeof p.p !== "string" || !/^\d{1,5}$/.test(p.p))) return;
	const port = Number(p.p);
	if (!Number.isInteger(port) || port < 1 || port > 65535) return;
	const comm = jsonObject(p.vc);
	if (!comm || typeof comm.mpkey !== "string") return;
	try {
		decodeMpKey(comm.mpkey);
	} catch {
		return;
	}
	if (typeof op.createdTime !== "number" && typeof op.createdTime !== "bigint") return;
	const createdAt = Number(op.createdTime);
	if (!Number.isSafeInteger(createdAt) || createdAt <= 0) return;
	return {
		callId: p.vs,
		callerMid: op.param1,
		localMid,
		createdAt,
		route: {
			voipAddress: p.h,
			voipAddress6: typeof p.hv6 === "string" ? p.hv6 : "",
			voipUdpPort: port,
			commParam: p.vc as string,
			fromToken: op.param2,
			fromZone: p.vfz,
			toZone: p.vtz,
			toMid: op.param1,
		},
		credential: sha256(new TextEncoder().encode([op.param1, localMid, op.param2, p.vs].join("::"))),
	};
}
