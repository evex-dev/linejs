/**
 * Drive a SIP+SRTP call against LINE cscf using a CallRoute captured
 * via Frida from the LINE Android app (since the /V4 endpoint is
 * session-bound and can't be reached from a fresh linejs session).
 *
 * Usage:
 *   1. While LINE Android is running, run capture_route_runner.py to
 *      install the fh8.o3.c hook and capture a real CallRoute into
 *      scripts/_frida_work/callroute.json.
 *   2. Run this script — it consumes that JSON and drives the full
 *      REGISTER → INVITE → SRTP/Opus exchange.
 */
import { AndromedaTransport, opusCodecFactory } from "@evex/linejs/call";
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
	callFlowType: raw.callFlowType === "PLANET" || raw.callFlowType === "2" ? "PLANET" : "NEW",
	voipAddress: str("voipAddress"),
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
	voipAddress6: str("voipAddress6"),
	w2pGw: str("w2pGw"),
	drCall: bool("drCall"),
	stnpk: str("stnpk"),
	capabilities: raw.capabilities ? raw.capabilities.split(",") : [],
};

const localMid = Deno.env.get("LOCAL_MID");
if (!localMid) throw new Error("set LOCAL_MID env (your own mid)");
const peerMid = route.toMid || Deno.env.get("PEER_MID");
if (!peerMid) throw new Error("captured CallRoute has no toMid — set PEER_MID env");

const t = new AndromedaTransport({ localMid });
console.log(`[call] connecting to ${route.voipAddress}:${route.voipUdpPort}`);
await t.connect({ route });
console.log("[call] REGISTER done — sending INVITE");
const inv = await t.invite({ to: peerMid });
console.log(`[call] INVITE 200 OK — remoteKey=${inv.remoteKey.length}B mix=${inv.mix.host}:${inv.mix.port}`);

const factory = await opusCodecFactory();
const enc = factory.newEncoder({ sampleRate: 48000, channels: 1 });
const SR = 48000;
const FRAME = 960;
const SECONDS = Number(Deno.env.get("DURATION_S") ?? "5");
for (let f = 0; f < SECONDS * 50; f++) {
	const pcm = new Int16Array(FRAME);
	for (let i = 0; i < FRAME; i++) {
		const tt = (f * FRAME + i) / SR;
		pcm[i] = Math.round(Math.sin(2 * Math.PI * 440 * tt) * 16000);
	}
	const packet = enc.encode({ samples: pcm, sampleRate: 48000, channels: 1 });
	if (packet) await t.send(packet);
	await new Promise((r) => setTimeout(r, 20));
}
console.log(`[call] sent ${SECONDS}s of tone — ending`);
await t.close();
console.log("[call] done");
