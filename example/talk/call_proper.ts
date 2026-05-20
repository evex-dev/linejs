/**
 * Send a byte-correct PLANET SETUP using the new full protobuf-c schema.
 * Listens for any cscf response (decrypts or raw-logs) for diagnosis.
 */
import { Buffer } from "node:buffer";
import { createSocket } from "node:dgram";
import { loginWithAuthToken } from "@evex/linejs";
import { FileStorage } from "@evex/linejs/storage";
import {
	buildFrameHeader,
	type PlanetFixedHdr,
} from "../../packages/linejs/client/features/call/planet/framing.ts";
import {
	aesCtrDecrypt,
	aesCtrEncrypt,
	buildCtrIv,
	decodeMpKey,
	deriveCallKeys,
	generateEphemeralKeypair,
	hmacTag,
	newSessionId,
	tagEquals,
} from "../../packages/linejs/client/features/call/planet/crypto.ts";
import {
	CC_MSG,
	decodeFields,
	packCcSetupReq,
	packPlanetCcHdr,
	packPlanetCcMsg,
	packPlanetMsg,
	packPlanetMsgHdr,
	wrapCcMsg,
} from "../../packages/linejs/client/features/call/planet/schema.ts";
import { parseFrameHeader } from "../../packages/linejs/client/features/call/planet/framing.ts";

const PEER = "u9dfba8dc9529aeb6063ee013a5933184";
const SELF = "uc84586474703a6172e9d051eabbcb627";

const client = await loginWithAuthToken(
	await Deno.readTextFile("../creds/v2_7_smoke.auth"),
	{ device: "DESKTOPWIN", storage: new FileStorage("../creds/v2_7_smoke_storage.json") },
);
const route = await client.call.acquireRoute({ to: PEER, callType: "AUDIO" });
const cscfHost = route.voipAddress6?.split(",")[0] ?? route.voipAddress.split(",")[0];
const cscfPort = route.voipUdpPort;
const commParam = JSON.parse(route.commParam) as { mpkey: string };
console.log(`[cscf] [${cscfHost}]:${cscfPort}  fakeCall=${route.fakeCall}`);
console.log(`[mpkey] ${commParam.mpkey}`);

const peerPub = decodeMpKey(commParam.mpkey);
const local = generateEphemeralKeypair();
const sessId = newSessionId();
const callKeys = deriveCallKeys({
	mpkey: peerPub, local, sessionId: sessId,
	sendLabel: 0x329aba33, recvLabel: 0x8bd74aaa,
});
console.log(`[keys] ECDH+HKDF derived  ourPub: ${[...callKeys.ourPub].slice(0, 8).map(b=>b.toString(16).padStart(2,'0')).join('')}…`);

// Build cc_setup_req with all relevant fields
const fromTokenBytes = new TextEncoder().encode(route.fromToken);
const ourPubB64 = btoa(String.fromCharCode(...callKeys.ourPub));
const setup = packCcSetupReq({
	initiator: SELF,
	responder: PEER,
	iZone: route.fromZone,
	rZone: route.toZone,
	devId: "DESKTOP_WIN",
	offer: new TextEncoder().encode("AUDIO"),
	credential: fromTokenBytes,
	fakeCall: route.fakeCall,
	svcKey: ourPubB64,
	stid: route.stid,
});
const ccBody = wrapCcMsg(CC_MSG.SETUP_REQ, setup);
const ccHdr = packPlanetCcHdr({
	cid: crypto.randomUUID(),
	srcChanId: BigInt(Math.floor(Math.random() * 0xffffffff)),
	dstChanId: 0n,
});
const ccMsg = packPlanetCcMsg(
	{ cid: crypto.randomUUID(), srcChanId: 0n, dstChanId: 0n },
	ccBody,
);

// Outer envelope with full planet_msg_hdr
const tranId = new Uint8Array(16);
crypto.getRandomValues(tranId);
const locNonce = BigInt(Math.floor(Math.random() * 0xffffffff));
// Try rmt_nonce = 0 (server should assign on first contact)
const planetMsg = packPlanetMsg(
	{
		userId: SELF,
		msgId: 0x100,
		sessId,
		tranId,
		tranSeq: 1,
		locNonce,
		rmtNonce: 0n,
	},
	{ kind: "cc", data: ccMsg },
);
console.log(`[planet_msg] ${planetMsg.length}B`);

// Encrypt with our send key
const seq = 0x01d0;
const iv = buildCtrIv(callKeys.send.ivNonce, seq);
const ct = aesCtrEncrypt(callKeys.send.encKey, iv, planetMsg);
const tag = hmacTag(callKeys.send.macKey, ct);
const body = new Uint8Array(ct.length + tag.length);
body.set(ct, 0); body.set(tag, ct.length);

// Frame
const HDR_LEN = 6;
const total = HDR_LEN + body.length;
const chunkLogical = (((total - 4) << 5) | 0xd) & 0xffff;
const fixed: PlanetFixedHdr = {
	type: 0, flagA: false, length: body.length & 0x7ff, flagB: false, sequence: seq & 0x7fff,
};
const hdr = buildFrameHeader(chunkLogical, fixed);
const datagram = new Uint8Array(hdr.length + body.length);
datagram.set(hdr, 0);
datagram.set(body, hdr.length);

console.log(`[wire] ${datagram.length}B first 16: ${[...datagram.slice(0, 16)].map(b=>b.toString(16).padStart(2,'0')).join(' ')}`);

const sock = createSocket("udp6");
await new Promise<void>((res) => sock.bind({ address: "::", port: 0 }, () => res()));

let rxCount = 0;
sock.on("message", (buf, rinfo) => {
	rxCount++;
	console.log(`[RX #${rxCount}] ${buf.length}B from [${rinfo.address}]:${rinfo.port}`);
	console.log(`  hex: ${buf.subarray(0, 64).toString("hex")}`);
	try {
		const { fixed: rxFixed } = parseFrameHeader(new Uint8Array(buf));
		const rxBody = new Uint8Array(buf.subarray(6));
		const rxTag = rxBody.subarray(rxBody.length - 16);
		const rxCt = rxBody.subarray(0, rxBody.length - 16);
		const expected = hmacTag(callKeys.recv.macKey, rxCt);
		const tagOk = tagEquals(rxTag, expected);
		console.log(`  parsed seq=${rxFixed.sequence} HMAC_match=${tagOk}`);
		if (tagOk) {
			const rxIv = buildCtrIv(callKeys.recv.ivNonce, rxFixed.sequence);
			const pt = aesCtrDecrypt(callKeys.recv.encKey, rxIv, rxCt);
			console.log(`  decrypted ${pt.length}B`);
			const fields = decodeFields(pt);
			for (const f of fields) console.log(`    field ${f.tag}/${f.wireType}: ${typeof f.value === "bigint" ? f.value : (f.value as Uint8Array).length + "B"}`);
		}
	} catch (e) { console.log(`  parse_err ${(e as Error).message}`); }
});

console.log(`[send] → [${cscfHost}]:${cscfPort}`);
await new Promise<void>((res, rj) => sock.send(Buffer.from(datagram), cscfPort, cscfHost, e => e ? rj(e) : res()));
for (let i = 1; i <= 4; i++) {
	await new Promise(r => setTimeout(r, 1500));
	sock.send(Buffer.from(datagram), cscfPort, cscfHost, () => {});
	console.log(`[retx ${i}]`);
}
await new Promise(r => setTimeout(r, 4000));
console.log(`[result] received ${rxCount}`);
sock.close();
