import { assert, assertEquals, assertRejects } from "@std/assert";
import { CallSession, type CallTransport } from "./session.ts";
import type {
	AudioDecoder,
	AudioEncoder,
	CodecFactory,
	PcmFrame,
} from "./audio.ts";
import { bufferSink, bufferSource } from "./audio.ts";

function fakeClient() {
	const acquired: unknown[] = [];
	const fakeRoute = {
		fromToken: "tok",
		callFlowType: "NEW",
		voipAddress: "1.2.3.4",
		voipUdpPort: 9000,
	};
	return {
		acquired,
		client: {
			call: {
				acquireRoute(opts: unknown) {
					acquired.push(opts);
					return Promise.resolve(fakeRoute);
				},
			},
		} as never,
		fakeRoute,
	};
}

function recordingTransport(): CallTransport & { sent: Uint8Array[]; closed: boolean } {
	const sent: Uint8Array[] = [];
	let closed = false;
	const incoming: Uint8Array[] = [];
	return {
		sent,
		get closed() { return closed; },
		set closed(v) { closed = v; },
		connect() { return Promise.resolve(); },
		close() { closed = true; return Promise.resolve(); },
		send(p) { sent.push(p); },
		async *receive() {
			for (const p of incoming) yield p;
		},
	};
}

function passthroughCodecs(): CodecFactory {
	// 1 PCM frame → 1 fake packet that just encodes sample count + first sample
	return {
		newEncoder(): AudioEncoder {
			return {
				encode(f: PcmFrame) {
					const buf = new Uint8Array(8);
					new DataView(buf.buffer).setUint32(0, f.samples.length, false);
					new DataView(buf.buffer).setInt16(4, f.samples[0] ?? 0, false);
					return buf;
				},
			};
		},
		newDecoder(): AudioDecoder {
			return {
				decode(p: Uint8Array) {
					const dv = new DataView(p.buffer, p.byteOffset, p.byteLength);
					const n = dv.getUint32(0, false);
					const v = dv.getInt16(4, false);
					const samples = new Int16Array(n);
					samples.fill(v);
					return { samples, sampleRate: 48000, channels: 1 };
				},
			};
		},
	};
}

Deno.test("CallSession.start → acquiring → connecting → in-call state transitions", async () => {
	const { client, acquired } = fakeClient();
	const session = new CallSession(client, {
		to: "u-peer",
		kind: "AUDIO",
		transport: recordingTransport(),
	});
	const states: string[] = [];
	session.on("state", (s) => states.push(s));
	const route = await session.start();
	assertEquals(states, ["acquiring", "connecting", "in-call"]);
	assertEquals(session.state, "in-call");
	assertEquals(session.peer, "u-peer");
	assertEquals((acquired[0] as { to: string }).to, "u-peer");
	assertEquals((acquired[0] as { callType: string }).callType, "AUDIO");
	assert(route);
});

Deno.test("CallSession.start is idempotent", async () => {
	const { client } = fakeClient();
	const session = new CallSession(client, { to: "u-p", transport: recordingTransport() });
	const r1 = await session.start();
	const r2 = await session.start();
	assertEquals(r1, r2);
});

Deno.test("CallSession.sendStream pumps PCM through codec → transport", async () => {
	const { client } = fakeClient();
	const transport = recordingTransport();
	const session = new CallSession(client, {
		to: "u-p",
		transport,
		codecs: passthroughCodecs(),
	});
	await session.start();
	const samples = new Int16Array(1600); // 100ms @ 16kHz
	samples.fill(42);
	await session.sendStream(bufferSource({ samples, sampleRate: 16000 }));
	assertEquals(transport.sent.length, 5);
	// each fake-encoded packet starts with the frame's sample count (320)
	const dv = new DataView(transport.sent[0].buffer);
	assertEquals(dv.getUint32(0, false), 320);
	assertEquals(dv.getInt16(4, false), 42);
});

Deno.test("CallSession.sendStream rejects when not in-call", async () => {
	const { client } = fakeClient();
	const session = new CallSession(client, { to: "u-p", transport: recordingTransport() });
	await assertRejects(
		() => session.sendStream(bufferSource({ samples: new Int16Array(0), sampleRate: 48000 })),
		Error,
		"not in-call",
	);
});

Deno.test("CallSession.received yields decoded peer PCM frames", async () => {
	const { client } = fakeClient();
	// Build a transport that emits 3 fake packets
	const transport: CallTransport = {
		connect() { return Promise.resolve(); },
		close() { return Promise.resolve(); },
		send() {},
		async *receive() {
			for (const v of [10, 20, 30]) {
				const buf = new Uint8Array(8);
				new DataView(buf.buffer).setUint32(0, 5, false);
				new DataView(buf.buffer).setInt16(4, v, false);
				yield buf;
			}
		},
	};
	const session = new CallSession(client, {
		to: "u-p",
		transport,
		codecs: passthroughCodecs(),
	});
	await session.start();
	const collected: number[] = [];
	for await (const f of session.received()) collected.push(f.samples[0]);
	assertEquals(collected, [10, 20, 30]);
});

Deno.test("CallSession.receiveInto pipes to AudioSink + closes on stream end", async () => {
	const { client } = fakeClient();
	const transport: CallTransport = {
		connect() { return Promise.resolve(); },
		close() { return Promise.resolve(); },
		send() {},
		async *receive() {
			const buf = new Uint8Array(8);
			new DataView(buf.buffer).setUint32(0, 2, false);
			new DataView(buf.buffer).setInt16(4, 99, false);
			yield buf;
		},
	};
	const session = new CallSession(client, {
		to: "u-p",
		transport,
		codecs: passthroughCodecs(),
	});
	await session.start();
	const sink = bufferSink();
	await session.receiveInto(sink);
	assertEquals(sink.frames.length, 1);
	assertEquals(sink.frames[0].samples[0], 99);
});

Deno.test("CallSession.end transitions to ending → ended + emits 'ended'", async () => {
	const { client } = fakeClient();
	const transport = recordingTransport();
	const session = new CallSession(client, { to: "u-p", transport });
	await session.start();
	const states: string[] = [];
	session.on("state", (s) => states.push(s));
	let endedReason = "";
	session.on("ended", (r) => endedReason = r);
	await session.end("hung-up");
	assertEquals(states, ["ending", "ended"]);
	assertEquals(endedReason, "hung-up");
	assert(transport.closed);
});

Deno.test("stub transport throws on connect", async () => {
	const { client } = fakeClient();
	const session = new CallSession(client, { to: "u-p" }); // no transport
	const errors: Error[] = [];
	session.on("error", (e) => errors.push(e));
	await assertRejects(() => session.start(), Error, "CallTransport not configured");
	assertEquals(session.state, "failed");
	assertEquals(errors.length, 1);
});

Deno.test("CallSession.sendFile uses caller-supplied decoder", async () => {
	const { client } = fakeClient();
	const transport = recordingTransport();
	const session = new CallSession(client, {
		to: "u-p",
		transport,
		codecs: passthroughCodecs(),
	});
	await session.start();
	// Caller-supplied decoder turns the byte 0xAB into PCM samples
	const decode = (bytes: Uint8Array) => ({
		samples: new Int16Array(800).fill(bytes[0]),
		sampleRate: 16000,
		channels: 1,
	});
	await session.sendFile({ bytes: new Uint8Array([0xAB]), decode });
	// 800 samples / 320-per-frame = 3 frames (2 full + 1 remainder)
	assertEquals(transport.sent.length, 3);
});
