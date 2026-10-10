import { assert, assertEquals, assertRejects, assertThrows } from "@std/assert";
import {
	bufferSink,
	bufferSource,
	decodeWavSync,
	defaultCodecFactory,
	packetizeNativeGroupOpusPairs,
	type PcmFrame,
	resampleLinear,
	streamSink,
	streamSource,
} from "./audio.ts";

Deno.test("bufferSource chunks 1s @ 16kHz mono into 20ms frames", async () => {
	const samples = new Int16Array(16000); // 1 second
	samples.fill(1234);
	const src = bufferSource({ samples, sampleRate: 16000 });
	const frames: PcmFrame[] = [];
	for await (const f of src.frames()) frames.push(f);
	assertEquals(frames.length, 50); // 1s / 20ms = 50 frames
	assertEquals(frames[0].samples.length, 320); // 16000 * 0.02
	assertEquals(frames[0].sampleRate, 16000);
	assertEquals(frames[0].channels, 1);
	assertEquals(frames[0].samples[0], 1234);
});

Deno.test("bufferSource frameDurationMs respected", async () => {
	const src = bufferSource({
		samples: new Int16Array(4800),
		sampleRate: 48000,
		frameDurationMs: 10,
	});
	const frames: PcmFrame[] = [];
	for await (const f of src.frames()) frames.push(f);
	assertEquals(frames.length, 10);
	assertEquals(frames[0].samples.length, 480);
});

Deno.test("bufferSource respects abort signal", async () => {
	const src = bufferSource({
		samples: new Int16Array(48000),
		sampleRate: 48000,
	});
	const ctrl = new AbortController();
	let n = 0;
	for await (const _ of src.frames({ signal: ctrl.signal })) {
		n++;
		if (n === 3) ctrl.abort();
	}
	assertEquals(n, 3);
});

Deno.test("streamSource forwards frames from a ReadableStream", async () => {
	const f1: PcmFrame = {
		samples: new Int16Array([1, 2]),
		sampleRate: 48000,
		channels: 1,
	};
	const f2: PcmFrame = {
		samples: new Int16Array([3, 4]),
		sampleRate: 48000,
		channels: 1,
	};
	const stream = new ReadableStream<PcmFrame>({
		start(c) {
			c.enqueue(f1);
			c.enqueue(f2);
			c.close();
		},
	});
	const collected: PcmFrame[] = [];
	for await (const f of streamSource(stream).frames()) collected.push(f);
	assertEquals(collected.length, 2);
	assertEquals(Array.from(collected[0].samples), [1, 2]);
});

Deno.test("bufferSink collects every write", () => {
	const sink = bufferSink();
	sink.write({ samples: new Int16Array([1]), sampleRate: 48000, channels: 1 });
	sink.write({ samples: new Int16Array([2]), sampleRate: 48000, channels: 1 });
	assertEquals(sink.frames.length, 2);
});

Deno.test("streamSink writes through to underlying WritableStream", async () => {
	const written: PcmFrame[] = [];
	const ws = new WritableStream<PcmFrame>({
		write(f) {
			written.push(f);
		},
	});
	const sink = streamSink(ws);
	await sink.write({
		samples: new Int16Array([1]),
		sampleRate: 48000,
		channels: 1,
	});
	await sink.end?.();
	assertEquals(written.length, 1);
});

Deno.test("packetizeNativeGroupOpusPairs combines prefixed 20ms Opus frames", () => {
	const packets = [
		new Uint8Array([0x00, 0x78, 0x11, 0x12]),
		new Uint8Array([0x00, 0x78, 0x21, 0x22]),
		new Uint8Array([0x00, 0x78, 0x31]),
		new Uint8Array([0x00, 0x78, 0x41]),
		new Uint8Array([0x00, 0x78, 0x51]),
		new Uint8Array([0x00, 0x78, 0x61]),
	];

	const grouped = packetizeNativeGroupOpusPairs(packets);

	assertEquals(grouped.length, 3);
	assertEquals(Array.from(grouped[0]), [
		0x00,
		0x7b,
		0x02,
		0x11,
		0x12,
		0x21,
		0x22,
	]);
	assertEquals(Array.from(grouped[1]), [0x00, 0x7b, 0x02, 0x31, 0x41]);
	assertEquals(Array.from(grouped[2]), [0x10, 0x7b, 0x02, 0x51, 0x61]);
});

Deno.test("packetizeNativeGroupOpusPairs writes VBR frame-size headers", () => {
	const grouped = packetizeNativeGroupOpusPairs([
		new Uint8Array([0x00, 0x78, 0x11, 0x12, 0x13]),
		new Uint8Array([0x00, 0x78, 0x21]),
	]);

	assertEquals(Array.from(grouped[0]), [
		0x00,
		0x7b,
		0x82,
		0x03,
		0x11,
		0x12,
		0x13,
		0x21,
	]);
});

Deno.test("group CELT EAS2 puts MSB-first activity before CBR/VBR frames", () => {
	const frame = (bytes: number[]) => new Uint8Array([0, 0xf8, ...bytes]);
	const packets = [
		frame([1, 2]),
		frame([3, 4]),
		frame([5]),
		frame([6, 7]),
		frame([8]),
		frame([9]),
	];
	assertEquals(
		packetizeNativeGroupOpusPairs(packets, {
			frameActivity: [true, false, false, true, true, true],
		}),
		[
			new Uint8Array([0, 0xfb, 2, 0x80, 1, 2, 3, 4]),
			new Uint8Array([0, 0xfb, 0x82, 0x40, 1, 5, 6, 7]),
			new Uint8Array([0x10, 0xfb, 2, 0xc0, 8, 9]),
		],
	);
});

Deno.test("group VBR two-byte sizes preserve frame boundaries", () => {
	for (const size of [252, 253, 255, 256, 1275]) {
		const left = new Uint8Array(size + 1).fill(0x11);
		left[0] = 0x78;
		const [packet] = packetizeNativeGroupOpusPairs([
			left,
			new Uint8Array([0x78, 0x22]),
		], { inputPrefixBytes: 0 });
		assertEquals(packet[2], 0x82);
		const decodedSize = packet[3] + 4 * packet[4];
		assertEquals(decodedSize, size);
		assertEquals(packet.subarray(5, 5 + decodedSize), left.subarray(1));
		assertEquals(packet.subarray(5 + decodedSize), new Uint8Array([0x22]));
	}
});

Deno.test("group packetizer rejects unsupported layouts and missing CELT activity", () => {
	const f = new Uint8Array([0xf8, 1]);
	const opts = { inputPrefixBytes: 0, frameActivity: [true, false] };
	assertThrows(
		() => packetizeNativeGroupOpusPairs([f], opts),
		Error,
		"complete pairs",
	);
	assertThrows(
		() => packetizeNativeGroupOpusPairs([f, f], { inputPrefixBytes: 0 }),
		Error,
		"CELT frameActivity required",
	);
	assertThrows(
		() => packetizeNativeGroupOpusPairs([f, f], { ...opts, frameActivity: [] }),
		Error,
		"invalid frameActivity",
	);
	assertThrows(
		() => packetizeNativeGroupOpusPairs([f, new Uint8Array([0x78, 1])], opts),
		Error,
		"matching TOC",
	);
	for (const toc of [0xf9, 0xfa, 0xfb]) {
		const p = new Uint8Array([toc, 1]);
		assertThrows(
			() => packetizeNativeGroupOpusPairs([p, p], opts),
			Error,
			"code-0",
		);
	}
	for (const toc of [0xfc, 0xf0, 0x70, 0x00]) {
		const p = new Uint8Array([toc, 1]);
		assertThrows(
			() => packetizeNativeGroupOpusPairs([p, p], opts),
			Error,
			"mono 20ms",
		);
	}
	for (
		const p of [new Uint8Array(), new Uint8Array([0xf8]), new Uint8Array(1277)]
	) {
		assertThrows(
			() => packetizeNativeGroupOpusPairs([p, p], opts),
			Error,
			"invalid Opus frame size",
		);
	}
});

Deno.test("resampleLinear: identity when rates match", () => {
	const s = new Int16Array([1, 2, 3, 4]);
	const out = resampleLinear(s, 48000, 48000, 1);
	assertEquals(out, s);
});

Deno.test("resampleLinear: 48k → 24k halves length", () => {
	const s = new Int16Array([0, 100, 200, 300, 400, 500, 600, 700]);
	const out = resampleLinear(s, 48000, 24000, 1);
	assertEquals(out.length, 4);
});

Deno.test("resampleLinear: 16k → 48k triples length", () => {
	const s = new Int16Array([100, 200, 300, 400]);
	const out = resampleLinear(s, 16000, 48000, 1);
	assertEquals(out.length, 12);
	// First sample preserved, interpolation between
	assertEquals(out[0], 100);
});

Deno.test("decodeWavSync: minimal 16-bit PCM mono WAV", () => {
	// hand-built RIFF/WAVE header + 4 PCM samples (8 bytes)
	const samples = [10, 20, 30, 40];
	const dataLen = samples.length * 2;
	const buf = new Uint8Array(44 + dataLen);
	const dv = new DataView(buf.buffer);
	// RIFF
	buf.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
	dv.setUint32(4, 36 + dataLen, true);
	buf.set([0x57, 0x41, 0x56, 0x45], 8); // "WAVE"
	// fmt
	buf.set([0x66, 0x6d, 0x74, 0x20], 12); // "fmt "
	dv.setUint32(16, 16, true);
	dv.setUint16(20, 1, true); // PCM
	dv.setUint16(22, 1, true); // mono
	dv.setUint32(24, 16000, true); // 16kHz
	dv.setUint32(28, 32000, true);
	dv.setUint16(32, 2, true);
	dv.setUint16(34, 16, true); // 16-bit
	// data
	buf.set([0x64, 0x61, 0x74, 0x61], 36); // "data"
	dv.setUint32(40, dataLen, true);
	for (let i = 0; i < samples.length; i++) {
		dv.setInt16(44 + i * 2, samples[i], true);
	}
	const out = decodeWavSync(buf);
	assertEquals(out.sampleRate, 16000);
	assertEquals(out.channels, 1);
	assertEquals(Array.from(out.samples), samples);
});

Deno.test("decodeWavSync: accepts streamed WAV with placeholder data size", () => {
	const samples = [10, 20, 30, 40];
	const dataLen = samples.length * 2;
	const buf = new Uint8Array(44 + dataLen);
	const dv = new DataView(buf.buffer);
	buf.set([0x52, 0x49, 0x46, 0x46], 0);
	dv.setUint32(4, 0xffffffff, true);
	buf.set([0x57, 0x41, 0x56, 0x45], 8);
	buf.set([0x66, 0x6d, 0x74, 0x20], 12);
	dv.setUint32(16, 16, true);
	dv.setUint16(20, 1, true);
	dv.setUint16(22, 1, true);
	dv.setUint32(24, 48000, true);
	dv.setUint32(28, 96000, true);
	dv.setUint16(32, 2, true);
	dv.setUint16(34, 16, true);
	buf.set([0x64, 0x61, 0x74, 0x61], 36);
	dv.setUint32(40, 0xffffffff, true);
	for (let i = 0; i < samples.length; i++) {
		dv.setInt16(44 + i * 2, samples[i], true);
	}
	const out = decodeWavSync(buf);
	assertEquals(out.sampleRate, 48000);
	assertEquals(out.channels, 1);
	assertEquals(Array.from(out.samples), samples);
});

Deno.test("decodeWavSync: rejects non-PCM (e.g. μ-law audioFormat=7)", () => {
	const buf = new Uint8Array(44);
	const dv = new DataView(buf.buffer);
	buf.set([0x52, 0x49, 0x46, 0x46], 0);
	dv.setUint32(4, 36, true);
	buf.set([0x57, 0x41, 0x56, 0x45], 8);
	buf.set([0x66, 0x6d, 0x74, 0x20], 12);
	dv.setUint32(16, 16, true);
	dv.setUint16(20, 7, true); // μ-law
	dv.setUint16(22, 1, true);
	dv.setUint32(24, 8000, true);
	dv.setUint32(28, 8000, true);
	dv.setUint16(32, 1, true);
	dv.setUint16(34, 8, true);
	buf.set([0x64, 0x61, 0x74, 0x61], 36);
	dv.setUint32(40, 0, true);
	assertThrows(() => decodeWavSync(buf), Error, "not PCM");
});

Deno.test("defaultCodecFactory throws on use (caller must plug in Opus)", () => {
	assertThrows(
		() => defaultCodecFactory.newEncoder({ sampleRate: 48000, channels: 1 }),
		Error,
		"no audio encoder configured",
	);
	assertThrows(
		() => defaultCodecFactory.newDecoder({ sampleRate: 48000, channels: 1 }),
		Error,
		"no audio decoder configured",
	);
});

Deno.test("end-to-end: bufferSource → bufferSink piped manually", async () => {
	const samples = new Int16Array(1600); // 100ms @ 16kHz
	for (let i = 0; i < samples.length; i++) samples[i] = i & 0xff;
	const src = bufferSource({ samples, sampleRate: 16000 });
	const sink = bufferSink();
	for await (const f of src.frames()) await sink.write(f);
	assertEquals(sink.frames.length, 5); // 100ms / 20ms
	// Reassemble + verify
	const reassembled = new Int16Array(1600);
	let o = 0;
	for (const f of sink.frames) {
		reassembled.set(f.samples, o);
		o += f.samples.length;
	}
	assertEquals(reassembled, samples);
});

Deno.test("stub assertions: streamSource cancels when aborted", async () => {
	let cancelled = false;
	const stream = new ReadableStream<PcmFrame>({
		pull(c) {
			c.enqueue({
				samples: new Int16Array([0]),
				sampleRate: 48000,
				channels: 1,
			});
		},
		cancel() {
			cancelled = true;
		},
	});
	const ctrl = new AbortController();
	let n = 0;
	for await (const _ of streamSource(stream).frames({ signal: ctrl.signal })) {
		if (++n === 2) ctrl.abort();
		if (n > 10) break;
	}
	assert(cancelled);
});
