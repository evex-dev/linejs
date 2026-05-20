/** Send our PLANET SETUP frame to cscf and capture ANY response, even
 *  if it doesn't parse as a Cassini envelope. Shows whether cscf
 *  silently drops our packet or replies (and we just can't decrypt). */
import { Buffer } from "node:buffer";
import { createSocket } from "node:dgram";
import { loginWithAuthToken } from "@evex/linejs";
import { FileStorage } from "@evex/linejs/storage";
import {
	buildFrameHeader,
	type PlanetFixedHdr,
} from "../../packages/linejs/client/features/call/planet/framing.ts";
import {
	aesCtrEncrypt,
	buildCtrIv,
	decodeMpKey,
	deriveCallKeys,
	generateEphemeralKeypair,
	hmacTag,
	newSessionId,
} from "../../packages/linejs/client/features/call/planet/crypto.ts";
import {
	buildSetupReq,
	type CassiniSession,
} from "../../packages/linejs/client/features/call/planet/cassini.ts";

const PEER = "u9dfba8dc9529aeb6063ee013a5933184";
const SELF = "uc84586474703a6172e9d051eabbcb627";

const client = await loginWithAuthToken(
	await Deno.readTextFile("../creds/v2_7_smoke.auth"),
	{ device: "DESKTOPWIN", storage: new FileStorage("../creds/v2_7_smoke_storage.json") },
);
console.log("[step] acquireCallRoute");
const route = await client.call.acquireRoute({ to: PEER, callType: "AUDIO" });
const cscfHost = route.voipAddress6?.split(",")[0] ?? route.voipAddress.split(",")[0];
const cscfPort = route.voipUdpPort;
console.log(`[cscf] ${cscfHost}:${cscfPort}  fakeCall=${route.fakeCall}`);

const mpkey = decodeMpKey((JSON.parse(route.commParam) as { mpkey: string }).mpkey);
const local = generateEphemeralKeypair();
const sessionId = newSessionId();
const keys = deriveCallKeys({
	mpkey, local, sessionId, sendLabel: 0x329aba33, recvLabel: 0x8bd74aaa,
});
console.log("[keys] derived");

// Build a setup_req payload (subscription/session ids = 0 since we don't
// have the bootstrap-derived values yet; this is the test we want to
// observe).
const callUuid16 = new Uint8Array(16);
crypto.getRandomValues(callUuid16);
const session: CassiniSession = {
	fromMid: SELF,
	callUuid16,
	callUuidString: crypto.randomUUID(),
	subscriptionId: 0n,
	sessionId: 0n,
};
const setup = buildSetupReq({ session, msgId: 1, counter: 1n, deviceInfo: "linejs/2.7" });
console.log(`[setup] payload=${setup.length}B`);

const seq = 0x01d0;
const iv = buildCtrIv(keys.send.ivNonce, seq);
const ct = aesCtrEncrypt(keys.send.encKey, iv, setup);
const tag = hmacTag(keys.send.macKey, ct);
const enc = new Uint8Array(ct.length + tag.length);
enc.set(ct, 0); enc.set(tag, ct.length);

const fixed: PlanetFixedHdr = {
	type: 0, flagA: false, length: enc.length & 0x7ff, flagB: false, sequence: seq & 0x7fff,
};
const HEADER_LEN = 6;
const totalLen = HEADER_LEN + enc.length;
const chunkLogical = (((totalLen - 4) << 5) | 0xd) & 0xffff;
const hdr = buildFrameHeader(chunkLogical, fixed);
const datagram = new Uint8Array(hdr.length + enc.length);
datagram.set(hdr, 0); datagram.set(enc, hdr.length);
console.log(`[datagram] ${datagram.length}B  first16: ${[...datagram.subarray(0, 16)].map(b => b.toString(16).padStart(2, '0')).join(" ")}`);

const sock = createSocket(cscfHost.includes(":") ? "udp6" : "udp4");
await new Promise<void>((res) => sock.bind({ address: cscfHost.includes(":") ? "::" : "0.0.0.0", port: 0 }, () => res()));
console.log("[sock] bound");

let received = 0;
sock.on("message", (buf, rinfo) => {
	received++;
	console.log(`[RX #${received}] ${buf.length}B from ${rinfo.address}:${rinfo.port}`);
	console.log(`  first 64B: ${buf.subarray(0, 64).toString("hex")}`);
});

console.log("[send] datagram → cscf");
await new Promise<void>((res, rj) => sock.send(Buffer.from(datagram), cscfPort, cscfHost, (e) => e ? rj(e) : res()));
console.log("[sent] waiting 8s for any response...");

// Also retransmit a few times in case packet loss
for (let i = 1; i <= 3; i++) {
	await new Promise((r) => setTimeout(r, 1500));
	console.log(`[retx ${i}]`);
	sock.send(Buffer.from(datagram), cscfPort, cscfHost, () => {});
}

await new Promise((r) => setTimeout(r, 4000));
console.log(`[result] received ${received} response(s)`);
sock.close();
