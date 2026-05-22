import { assert, assertEquals } from "@std/assert";
import { opusCodecFactory } from "./opus.ts";

Deno.test("opusCodecFactory: encodes + decodes a 20ms 48kHz mono frame", async () => {
	const factory = await opusCodecFactory();
	const enc = factory.newEncoder({ sampleRate: 48000, channels: 1 });
	const dec = factory.newDecoder({ sampleRate: 48000, channels: 1 });

	const pcm = new Int16Array(960); // 20ms @ 48kHz
	for (let i = 0; i < pcm.length; i++) {
		pcm[i] = Math.floor(Math.sin((2 * Math.PI * 440 * i) / 48000) * 10000);
	}
	const packet = enc.encode({ samples: pcm, sampleRate: 48000, channels: 1 });
	assert(packet !== null);
	assert(packet.length > 0, "encoded packet should be non-empty");
	assert(packet.length < pcm.byteLength, "Opus should compress vs PCM");

	const frame = dec.decode(packet);
	assert(frame !== null, "decode should yield a frame");
	assertEquals(frame.sampleRate, 48000);
	assertEquals(frame.channels, 1);
	assertEquals(frame.samples.length, 960);
	// Opus is lossy — verify rough fidelity by comparing RMS, not byte equality
	let rmsIn = 0, rmsOut = 0;
	for (let i = 0; i < pcm.length; i++) rmsIn += pcm[i] * pcm[i];
	for (let i = 0; i < frame.samples.length; i++) {
		rmsOut += frame.samples[i] * frame.samples[i];
	}
	rmsIn = Math.sqrt(rmsIn / pcm.length);
	rmsOut = Math.sqrt(rmsOut / frame.samples.length);
	// RMS within ±30%
	assert(
		rmsOut > rmsIn * 0.7 && rmsOut < rmsIn * 1.3,
		`RMS drift too large: in=${rmsIn} out=${rmsOut}`,
	);

	enc.close?.();
	dec.close?.();
});

Deno.test("opusCodecFactory.newEncoder.encode returns null on partial frame", async () => {
	const factory = await opusCodecFactory();
	const enc = factory.newEncoder({ sampleRate: 48000, channels: 1 });
	const partial = new Int16Array(100);
	const r = enc.encode({ samples: partial, sampleRate: 48000, channels: 1 });
	assertEquals(r, null);
	enc.close?.();
});

Deno.test("opusCodecFactory: encodes 10ms mono frames", async () => {
	const factory = await opusCodecFactory();
	const enc = factory.newEncoder({
		sampleRate: 48000,
		channels: 1,
		frameDurationMs: 10,
	});
	const dec = factory.newDecoder({ sampleRate: 48000, channels: 1 });

	const pcm = new Int16Array(480); // 10ms @ 48kHz
	for (let i = 0; i < pcm.length; i++) {
		pcm[i] = Math.floor(Math.sin((2 * Math.PI * 440 * i) / 48000) * 4000);
	}
	const packet = enc.encode({ samples: pcm, sampleRate: 48000, channels: 1 });
	assert(packet !== null);

	const frame = dec.decode(packet);
	assert(frame !== null);
	assertEquals(frame.samples.length, 480);

	enc.close?.();
	dec.close?.();
});

Deno.test("opusCodecFactory: uses all interleaved stereo samples", async () => {
	const factory = await opusCodecFactory();
	const enc = factory.newEncoder({ sampleRate: 48000, channels: 2 });
	const dec = factory.newDecoder({ sampleRate: 48000, channels: 2 });

	const pcm = new Int16Array(960 * 2);
	for (let i = 0; i < 960; i++) {
		pcm[i * 2] = Math.floor(Math.sin((2 * Math.PI * 440 * i) / 48000) * 3000);
		pcm[i * 2 + 1] = Math.floor(
			Math.sin((2 * Math.PI * 660 * i) / 48000) * 3000,
		);
	}
	const packet = enc.encode({ samples: pcm, sampleRate: 48000, channels: 2 });
	assert(packet !== null);

	const frame = dec.decode(packet);
	assert(frame !== null);
	assertEquals(frame.samples.length, 960 * 2);

	enc.close?.();
	dec.close?.();
});
