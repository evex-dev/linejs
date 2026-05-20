/**
 * Drive only SIP REGISTER → 401 Digest → 200 OK against LINE cscf
 * using a captured CallRoute. This verifies the SIP+Digest layer
 * against the real cscf without touching MIKEY/SRTP.
 */
import { AndromedaTransport } from "@evex/linejs/call";
import type { CallRoute } from "@evex/linejs-types";

const ROUTE_PATH = Deno.args[0] ?? "../../scripts/_frida_work/callroute.json";
const raw = JSON.parse(await Deno.readTextFile(ROUTE_PATH)) as Record<string, string>;

function str(k: string, dflt = ""): string { return raw[k] ?? dflt; }
function num(k: string, dflt = 0): number {
	const v = raw[k];
	return v === undefined ? dflt : Number(v);
}
function bool(k: string): boolean { return raw[k] === "true"; }

const route: CallRoute = {
	fromToken: str("fromToken"),
	callFlowType: raw.callFlowType === "PLANET" ? "PLANET" : "NEW",
	voipAddress: str("voipAddress").split(",")[0],
	voipUdpPort: num("voipUdpPort"),
	voipTcpPort: num("voipTcpPort"),
	fromZone: str("fromZone"),
	toZone: str("toZone"),
	fakeCall: bool("fakeCall"),
	ringbackTone: str("ringbackTone"),
	toMid: str("toMid"),
	tunneling: str("tunneling"),
	commParam: str("commParam"),
	stid: str("stid"),
	encFromMid: str("encFromMid"),
	encToMid: str("encToMid"),
	switchableToVideo: bool("switchableToVideo"),
	voipAddress6: str("voipAddress6").split(",")[0],
	w2pGw: str("w2pGw"),
	drCall: bool("drCall"),
	stnpk: str("stnpk"),
	capabilities: raw.capabilities ? raw.capabilities.split(",") : [],
};

const localMid = str("fromMid");
if (!localMid) throw new Error("missing fromMid in callroute.json");

console.log(`[sip] cscf = ${route.voipAddress}:${route.voipUdpPort}`);
console.log(`[sip] localMid = ${localMid}`);
console.log(`[sip] sip-password = ${route.fromToken}`);

const t = new AndromedaTransport({ localMid, timeoutMs: 10000 });
try {
	await t.connect({ route });
	console.log("[sip] REGISTER completed (200 OK)");
} catch (e) {
	console.log("[sip] REGISTER failed:", (e as Error).message);
} finally {
	await t.close();
}
