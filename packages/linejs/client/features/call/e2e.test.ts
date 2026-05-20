// End-to-end: PCM → codec → SRTP wire → SRTP receive → codec → PCM,
// using a loopback transport. Proves the audio plumbing carries
// samples bit-identical without needing a real Opus impl.
import { assertEquals } from "@std/assert";
import { CallSession, type CallTransport } from "./session.ts";
import {
	type AudioDecoder,
	type AudioEncoder,
	bufferSink,
	bufferSource,
	type CodecFactory,
	type PcmFrame,
} from "./audio.ts";
import { deriveSrtpContext, SRTP_KEYING_LEN, srtpDecrypt, srtpEncrypt, buildRtp, parseRtp } from "./srtp.ts";

/** Identity codec — encodes a PCM frame to a binary packet that
 *  encloses the raw samples. */
function identityCodec(): CodecFactory {
	return {
		newEncoder(): AudioEncoder {
			return {
				encode(f: PcmFrame): Uint8Array {
					const buf = new Uint8Array(4 + f.samples.byteLength);
					new DataView(buf.buffer).setUint32(0, f.samples.length, false);
					buf.set(new Uint8Array(f.samples.buffer, f.samples.byteOffset, f.samples.byteLength), 4);
					return buf;
				},
			};
		},
		newDecoder(): AudioDecoder {
			return {
				decode(p: Uint8Array): PcmFrame {
					const n = new DataView(p.buffer, p.byteOffset, p.byteLength).getUint32(0, false);
					const samples = new Int16Array(n);
					new Uint8Array(samples.buffer).set(p.subarray(4, 4 + n * 2));
					return { samples, sampleRate: 16000, channels: 1 };
				},
			};
		},
	};
}

/** A loopback transport that runs sent packets through SRTP encrypt
 *  then back through SRTP decrypt to itself — exercises the full
 *  send and receive path. */
function loopbackTransport(): CallTransport {
	const keying = new Uint8Array(SRTP_KEYING_LEN);
	for (let i = 0; i < keying.length; i++) keying[i] = (i + 5) & 0xff;
	let sendCtx: Awaited<ReturnType<typeof deriveSrtpContext>>;
	let recvCtx: Awaited<ReturnType<typeof deriveSrtpContext>>;
	const incoming: Uint8Array[] = [];
	const waiters: ((b: Uint8Array | null) => void)[] = [];
	let ssrc = 0xabcdef01;
	let seq = 0;
	let timestamp = 0;
	return {
		async connect() {
			sendCtx = await deriveSrtpContext(keying);
			recvCtx = await deriveSrtpContext(keying);
		},
		close() { return Promise.resolve(); },
		async send(opusPacket: Uint8Array) {
			const rtp = buildRtp({
				payloadType: 96,
				seq: seq++,
				timestamp: (timestamp += 320),
				ssrc,
				payload: opusPacket,
			});
			const srtp = await srtpEncrypt(sendCtx, rtp);
			const rtpDec = await srtpDecrypt(recvCtx, srtp);
			const payload = parseRtp(rtpDec).payload;
			const w = waiters.shift();
			if (w) w(payload);
			else incoming.push(payload);
		},
		async *receive() {
			while (true) {
				const p = incoming.length
					? incoming.shift()!
					: await new Promise<Uint8Array | null>((r) => waiters.push(r));
				if (!p) return;
				yield p;
			}
		},
	};
}

Deno.test("e2e: PCM → codec → SRTP → loopback → SRTP → codec → PCM (byte-identical)", async () => {
	const session = new CallSession(
		{
			call: {
				acquireRoute() {
					return Promise.resolve({
						voipAddress: "127.0.0.1",
						voipUdpPort: 9999,
						fromToken: "x",
					});
				},
			},
		} as never,
		{
			to: "u-peer",
			transport: loopbackTransport(),
			codecs: identityCodec(),
		},
	);
	await session.start();

	const samples = new Int16Array(1600);
	for (let i = 0; i < samples.length; i++) {
		samples[i] = Math.floor(Math.sin((2 * Math.PI * 440 * i) / 16000) * 10000);
	}

	const sink = bufferSink();
	const recvPromise = (async () => {
		let got = 0;
		const it = session.received();
		while (got < samples.length) {
			let timeoutId: number | undefined;
			const next = await Promise.race([
				it.next(),
				new Promise<{ done: true; value: undefined }>((r) => {
					timeoutId = setTimeout(
						() => r({ done: true, value: undefined }),
						1000,
					) as unknown as number;
				}),
			]);
			if (timeoutId !== undefined) clearTimeout(timeoutId);
			if (next.done || !next.value) break;
			sink.write(next.value);
			got += next.value.samples.length;
		}
	})();

	await session.sendStream(bufferSource({
		samples,
		sampleRate: 16000,
		frameDurationMs: 20,
	}));
	await recvPromise;
	await session.end();

	let total = 0;
	for (const f of sink.frames) total += f.samples.length;
	const recovered = new Int16Array(total);
	let o = 0;
	for (const f of sink.frames) {
		recovered.set(f.samples, o);
		o += f.samples.length;
	}
	assertEquals(recovered.length, samples.length);
	assertEquals(recovered, samples);
});
