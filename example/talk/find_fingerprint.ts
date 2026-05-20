/** Try to derive 0x18b156dc467aee80 (the bootstrap fingerprint observed
 *  in msg_pack#1's 13-byte body) from CallRoute fields + local data. */
import {
	createHash,
	createHmac,
	hkdfSync,
} from "node:crypto";
import { decodeMpKey } from "../../packages/linejs/client/features/call/planet/mod.ts";

const TARGET = "18b156dc467aee80";

const mpkeyB64 = "AhLRU30XuXFenT3Z8ZapU+2YPTPzrYA2ZObDqRzy+hr3";
const mpkey = decodeMpKey(mpkeyB64);
const fromToken = "mexhVpNEQt";
const mid = "uc84586474703a6172e9d051eabbcb627";
const peerMid = "u9dfba8dc9529aeb6063ee013a5933184";
const callUuid16Hex = "b0c2a74ce7cd4502a0fa32586da90e54";
const callUuid16 = new Uint8Array(callUuid16Hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));

// Plus observed subscription/session ids (target derivation candidates)
const subscriptionId = 290579788n;  // 0x114F7CCC
const sessionId = 7642030284661133203n; // 0x6a0df20e00010f93

function bytes(s: string): Uint8Array {
	return new TextEncoder().encode(s);
}
function concat(...arrs: Uint8Array[]): Uint8Array {
	let total = 0;
	for (const a of arrs) total += a.length;
	const o = new Uint8Array(total);
	let i = 0;
	for (const a of arrs) { o.set(a, i); i += a.length; }
	return o;
}
function hex8LE(v: bigint): Uint8Array {
	const o = new Uint8Array(8);
	let x = v;
	for (let i = 0; i < 8; i++) { o[i] = Number(x & 0xffn); x >>= 8n; }
	return o;
}
function tryMatch(label: string, bytes: Uint8Array) {
	for (let i = 0; i + 8 <= bytes.length; i++) {
		const slice = bytes.subarray(i, i + 8);
		// match in LE order (since fixed64 was little-endian)
		const hexLE = [...slice].map((b) => b.toString(16).padStart(2, "0")).join("");
		const hexBE = [...slice].reverse().map((b) => b.toString(16).padStart(2, "0")).join("");
		if (hexLE === TARGET || hexBE === TARGET) {
			console.log(`MATCH @ ${label}[${i}..${i + 7}]: LE=${hexLE} BE=${hexBE}`);
			return true;
		}
	}
	return false;
}

const sha256 = (d: Uint8Array) => new Uint8Array(createHash("sha256").update(d).digest());
const sha512 = (d: Uint8Array) => new Uint8Array(createHash("sha512").update(d).digest());
const sha1 = (d: Uint8Array) => new Uint8Array(createHash("sha1").update(d).digest());
const md5 = (d: Uint8Array) => new Uint8Array(createHash("md5").update(d).digest());

const candidates: Record<string, Uint8Array> = {
	"mpkey": mpkey,
	"mid_bytes": bytes(mid),
	"peerMid_bytes": bytes(peerMid),
	"fromToken_bytes": bytes(fromToken),
	"call_uuid_16": callUuid16,
	"mpkey || mid": concat(mpkey, bytes(mid)),
	"mid || peerMid": concat(bytes(mid), bytes(peerMid)),
	"mpkey || fromToken": concat(mpkey, bytes(fromToken)),
	"sha256(mpkey)": sha256(mpkey),
	"sha512(mpkey)": sha512(mpkey),
	"sha1(mpkey)": sha1(mpkey),
	"sha256(mid)": sha256(bytes(mid)),
	"sha256(call_uuid_16)": sha256(callUuid16),
	"sha256(mpkey||mid)": sha256(concat(mpkey, bytes(mid))),
	"sha256(mpkey||call_uuid_16)": sha256(concat(mpkey, callUuid16)),
	"sha256(mid||call_uuid_16)": sha256(concat(bytes(mid), callUuid16)),
	"sha256(fromToken)": sha256(bytes(fromToken)),
	"md5(mpkey)": md5(mpkey),
	"md5(mid)": md5(bytes(mid)),
	"md5(call_uuid_16)": md5(callUuid16),
	"hkdf(mpkey,salt=mid,info=peer,32)": new Uint8Array(
		hkdfSync("sha256", mpkey, bytes(mid), bytes(peerMid), 32),
	),
	"hkdf(mid,salt=mpkey,info=peer,32)": new Uint8Array(
		hkdfSync("sha256", bytes(mid), mpkey, bytes(peerMid), 32),
	),
	"hmac_sha256(mpkey, mid)": new Uint8Array(
		createHmac("sha256", mpkey).update(mid).digest(),
	),
	"hmac_sha256(mid, mpkey)": new Uint8Array(
		createHmac("sha256", bytes(mid)).update(mpkey).digest(),
	),
	"hmac_sha256(fromToken, mid||peerMid)": new Uint8Array(
		createHmac("sha256", bytes(fromToken)).update(concat(bytes(mid), bytes(peerMid))).digest(),
	),
	// also try subscription/session ids as material
	"sub_id_LE || session_id_LE": concat(hex8LE(subscriptionId), hex8LE(sessionId)),
	"sub_id_LE || mpkey": concat(hex8LE(subscriptionId), mpkey),
	"sha256(sub_id||session_id)": sha256(concat(hex8LE(subscriptionId), hex8LE(sessionId))),
};

console.log(`Target: 0x${TARGET}\n`);
let found = false;
for (const [label, data] of Object.entries(candidates)) {
	if (tryMatch(label, data)) found = true;
}
if (!found) {
	console.log("\nNo direct match found. Bootstrap fingerprint not derived from these.");
	console.log("(Likely stored from prior server-issued data — login session or push token.)");
}
