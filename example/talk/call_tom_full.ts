/**
 * End-to-end LINE call as a library, no Frida required.
 *
 *   1. Login linejs as tomtwo (DESKTOP_WIN/SECONDARY)
 *   2. acquireCallRoute(tom) -> CallRoute
 *   3. PlanetTransport.connect(CallRoute)
 *      - Derive ephemeral P-256 keypair
 *      - ECDH(my_priv, peer_pub_from_mpkey)
 *      - HKDF chain -> session keys
 *   4. PlanetTransport.invite() -> Cassini setup_req
 *   5. Stream Opus audio over SRTP for 5 seconds (440 Hz tone)
 *   6. Close (Cassini rel_req)
 */
import { loginWithAuthToken } from "@evex/linejs";
import { FileStorage } from "@evex/linejs/storage";
import { opusCodecFactory, PlanetTransport } from "@evex/linejs/call";

const PEER_MID = "u9dfba8dc9529aeb6063ee013a5933184"; // tom

const client = await loginWithAuthToken(
	await Deno.readTextFile("../creds/v2_7_smoke.auth"),
	{
		device: "DESKTOPWIN",
		storage: new FileStorage("../creds/v2_7_smoke_storage.json"),
	},
);

console.log("[step 1] acquireCallRoute");
const route = await client.call.acquireRoute({ to: PEER_MID, callType: "AUDIO" });
console.log(`  cscf: ${route.voipAddress6 || route.voipAddress}:${route.voipUdpPort}`);
console.log(`  fakeCall: ${route.fakeCall}`);
console.log(`  mpkey (peer pub): ${(JSON.parse(route.commParam) as { mpkey: string }).mpkey}`);

if (route.fakeCall) {
	console.error("[warn] route.fakeCall=true — cscf will likely not respond");
}

console.log("[step 2] PlanetTransport.connect");
const transport = new PlanetTransport({
	localMid: "uc84586474703a6172e9d051eabbcb627",
	deviceInfo: "Android..36..Pixel 6a",
	timeoutMs: 8000,
});
await transport.connect({ route });

console.log("[step 3] PlanetTransport.invite (Cassini SETUP)");
try {
	const reply = await transport.invite({ to: PEER_MID });
	console.log("[step 3.5] got SETUP_RSP:", reply);
} catch (e) {
	console.error("[step 3 FAIL]", (e as Error).message);
	await transport.close();
	Deno.exit(1);
}

console.log("[step 4] streaming 5s of 440 Hz audio");
const codec = await opusCodecFactory();
const enc = codec.newEncoder({ sampleRate: 48000, channels: 1 });
const SR = 48000, FRAME = 960;
for (let f = 0; f < 5 * 50; f++) {
	const pcm = new Int16Array(FRAME);
	for (let i = 0; i < FRAME; i++) {
		const t = (f * FRAME + i) / SR;
		pcm[i] = Math.round(Math.sin(2 * Math.PI * 440 * t) * 16000);
	}
	enc.encode({ samples: pcm, sampleRate: 48000, channels: 1 });
	// Note: media plane (SRTP) flows through a separate AndromedaTransport;
	// here we only validate the PLANET signaling path actually reaches cscf.
	await new Promise((r) => setTimeout(r, 20));
}

console.log("[step 5] close (Cassini REL)");
await transport.close();
console.log("[done]");
