import { assert, assertEquals, assertThrows } from "@std/assert";
import { opusCodecFactory } from "./opus.ts";
import { packetizeNativeGroupOpusPairs } from "./audio.ts";

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

Deno.test("group EAS2 depacketization preserves stock Opus decode for CBR and VBR", async () => {
	const factory = await opusCodecFactory();
	for (const vbr of [false, true]) {
		const enc = factory.newEncoder({
			sampleRate: 48000,
			channels: 1,
			frameDurationMs: 20,
			signal: "music",
			bitrate: 128000,
			vbr,
		});
		const reference = factory.newDecoder({ sampleRate: 48000, channels: 1 });
		const grouped = factory.newDecoder({ sampleRate: 48000, channels: 1 });
		try {
			const packets: Uint8Array[] = [];
			const expected: number[] = [];
			for (let f = 0; f < 4; f++) {
				const samples = Int16Array.from(
					{ length: 960 },
					(_, i) =>
						Math.round(
							6000 * Math.sin(2 * Math.PI * 440 * (i + f * 960) / 48000),
						),
				);
				const packet = enc.encode({ samples, sampleRate: 48000, channels: 1 });
				assert(packet);
				assertEquals(packet[0], 0xf8); // mono CELT 20ms, one frame
				packets.push(packet);
				expected.push(...reference.decode(packet)!.samples);
			}
			const actual: number[] = [];
			for (
				const payload of packetizeNativeGroupOpusPairs(packets, {
					inputPrefixBytes: 0,
					frameActivity: [true, true, true, true],
				})
			) {
				assertEquals(payload[3], 0xc0);
				// Depacketize EAS2 first: strip native prefix and the CELT SAD bitmap.
				// Passing EAS2 straight into a stock Opus decoder tests the wrong format.
				const opus = new Uint8Array(payload.length - 2);
				opus.set(payload.subarray(1, 3));
				opus.set(payload.subarray(4), 2);
				const frame = grouped.decode(opus);
				assert(frame);
				assertEquals(frame.samples.length, 1920);
				actual.push(...frame.samples);
			}
			assertEquals(actual, expected);
		} finally {
			enc.close?.();
			reference.close?.();
			grouped.close?.();
		}
	}
});

Deno.test("opusCodecFactory rejects an oversized code-2 frame and accepts variable PCM length", async () => {
	const factory = await opusCodecFactory();
	const dec = factory.newDecoder({ sampleRate: 48000, channels: 1 });
	try {
		// Synthetic structural fixture, not captured speech: 107 declared, 68 remaining.
		const malformed = new Uint8Array(70);
		malformed.set([0x7a, 107]);
		assertThrows(() => dec.decode(malformed), Error, "Invalid packet");
		const frame = dec.decode(new Uint8Array([0x7a, 0]));
		assert(frame);
		assertEquals(frame.samples.length, 1920);
	} finally {
		dec.close?.();
	}
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

Deno.test("opusCodecFactory: can force narrowband SILK 10ms packets", async () => {
	const factory = await opusCodecFactory();
	const enc = factory.newEncoder({
		sampleRate: 48000,
		channels: 1,
		frameDurationMs: 10,
		bandwidth: "narrowband",
		signal: "voice",
	});

	const pcm = new Int16Array(480);
	for (let i = 0; i < pcm.length; i++) {
		pcm[i] = Math.floor(Math.sin((2 * Math.PI * 440 * i) / 48000) * 4000);
	}
	const packet = enc.encode({ samples: pcm, sampleRate: 48000, channels: 1 });
	assert(packet !== null);
	assertEquals(packet[0] >> 3, 0);

	enc.close?.();
});

Deno.test("opusCodecFactory: can force CBR voice packets", async () => {
	const factory = await opusCodecFactory();
	const enc = factory.newEncoder({
		sampleRate: 48000,
		channels: 1,
		frameDurationMs: 40,
		bitrate: 16000,
		bandwidth: "fullband",
		signal: "voice",
		vbr: false,
	});

	const pcm = new Int16Array(1920);
	for (let i = 0; i < pcm.length; i++) {
		pcm[i] = Math.floor(Math.sin((2 * Math.PI * 440 * i) / 48000) * 5000);
	}
	const packet = enc.encode({ samples: pcm, sampleRate: 48000, channels: 1 });
	assert(packet !== null);
	assertEquals(packet[0], 0x7b);
	assertEquals(packet.length, 80);

	enc.close?.();
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
