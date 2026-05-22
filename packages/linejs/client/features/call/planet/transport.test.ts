import { assert, assertEquals } from "@std/assert";
import { generateEphemeralKeypair } from "./crypto.ts";
import { PlanetTransport } from "./transport.ts";

type CallRouteLike = Parameters<PlanetTransport["connect"]>[0]["route"];

function bytesToBase64(bytes: Uint8Array): string {
	let raw = "";
	for (const b of bytes) raw += String.fromCharCode(b);
	return btoa(raw);
}

function makeRoute(): CallRouteLike {
	const peer = generateEphemeralKeypair();
	return {
		voipAddress: "127.0.0.1",
		voipUdpPort: 9,
		voipAddress6: "",
		toMid: "u-peer",
		fromToken: "from-token",
		fromZone: "JP",
		toZone: "JP",
		commParam: JSON.stringify({ mpkey: bytesToBase64(peer.publicKey) }),
		stid: "stid",
		stnpk: "stnpk",
	} as unknown as CallRouteLike;
}

Deno.test("PlanetTransport.close does not send REL before SETUP/INVITE", async () => {
	let sends = 0;
	const transport = new PlanetTransport({
		localMid: "u-local",
		wireSend() {
			sends++;
		},
	});

	await transport.connect({ route: makeRoute() });
	await transport.close();

	assertEquals(sends, 0);
});

Deno.test("PlanetTransport retains generated media offer material for SRTP setup", async () => {
	let sends = 0;
	const transport = new PlanetTransport({
		localMid: "u-local",
		timeoutMs: 1,
		wireSend() {
			sends++;
		},
	});

	await transport.connect({ route: makeRoute() });
	try {
		await transport.invite({ to: "u-peer" });
	} catch (e) {
		assert(e instanceof Error);
		assert(e.message.includes("PLANET reply timeout"));
	}

	const media = transport.localMediaOffer;
	assert(media);
	assertEquals(sends, 1);
	assertEquals(media.keypair.publicKey.length, 33);
	assertEquals(media.keypair.privateKey.length, 32);
	assertEquals(media.material.mediaPubKey.length, 33);
	assertEquals(media.material.mediaNonce.length, 16);
	assertEquals(media.material.mediaSecret.length, 30);
	assertEquals(media.offer.length, 311);
});
