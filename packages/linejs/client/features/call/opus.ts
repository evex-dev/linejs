// Opus codec adapter (wraps npm:opusscript WASM).
// Optional — only imported when client.call.useDefaultOpus() is called.
import type {
	AudioDecoder,
	AudioEncoder,
	CodecFactory,
	PcmFrame,
} from "./audio.ts";
import { Buffer } from "node:buffer";

interface OpusInstance {
	encode(pcm: Buffer, sampleCount: number): Buffer;
	decode(packet: Buffer): Buffer;
	delete(): void;
}
type OpusCtor = new (
	rate: number,
	channels: number,
	app: number,
) => OpusInstance;
const OPUS_VOIP = 2048; // OPUS_APPLICATION_VOIP per opus.h

async function loadOpusScript(): Promise<OpusCtor> {
	const mod = await import("opusscript");
	const ctor = (mod as { default?: OpusCtor }).default ??
		(mod as unknown as OpusCtor);
	return ctor;
}

/** Returns a CodecFactory backed by opusscript (WASM Opus). */
export async function opusCodecFactory(): Promise<CodecFactory> {
	const OpusCtor = await loadOpusScript();
	return {
		newEncoder({ sampleRate, channels, frameDurationMs }): AudioEncoder {
			const enc = new OpusCtor(sampleRate, channels, OPUS_VOIP);
			const samplesPerChannel = Math.floor(
				(sampleRate * (frameDurationMs ?? 20)) / 1000,
			);
			const frameSamples = samplesPerChannel * channels;
			return {
				encode(f: PcmFrame): Uint8Array | null {
					if (f.samples.length < frameSamples) return null;
					const buf = Buffer.from(
						f.samples.buffer,
						f.samples.byteOffset,
						frameSamples * Int16Array.BYTES_PER_ELEMENT,
					);
					return new Uint8Array(enc.encode(buf, samplesPerChannel));
				},
				close() {
					enc.delete();
				},
			};
		},
		newDecoder({ sampleRate, channels }): AudioDecoder {
			const dec = new OpusCtor(sampleRate, channels, OPUS_VOIP);
			return {
				decode(packet: Uint8Array): PcmFrame {
					const buf = dec.decode(Buffer.from(packet));
					const samples = new Int16Array(
						buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
					);
					return { samples, sampleRate, channels };
				},
				close() {
					dec.delete();
				},
			};
		},
	};
}
