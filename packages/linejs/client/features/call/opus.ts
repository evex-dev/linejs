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
	setBitrate(bitrate: number): void;
	encoderCTL(ctl: number, arg: number): void;
	delete(): void;
}
type OpusCtor = new (
	rate: number,
	channels: number,
	app: number,
) => OpusInstance;
const OPUS_VOIP = 2048; // OPUS_APPLICATION_VOIP per opus.h
const OPUS_AUTO = -1000;
const OPUS_SET_VBR_REQUEST = 4006;
const OPUS_SET_BANDWIDTH_REQUEST = 4008;
const OPUS_SET_SIGNAL_REQUEST = 4024;
const OPUS_BANDWIDTH = {
	narrowband: 1101,
	mediumband: 1102,
	wideband: 1103,
	superwideband: 1104,
	fullband: 1105,
} as const;
const OPUS_SIGNAL = {
	auto: OPUS_AUTO,
	voice: 3001,
	music: 3002,
} as const;

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
		newEncoder({
			sampleRate,
			channels,
			bitrate,
			frameDurationMs,
			bandwidth,
			signal,
			vbr,
		}): AudioEncoder {
			const enc = new OpusCtor(sampleRate, channels, OPUS_VOIP);
			if (bitrate !== undefined) enc.setBitrate(bitrate);
			if (vbr !== undefined) enc.encoderCTL(OPUS_SET_VBR_REQUEST, vbr ? 1 : 0);
			if (bandwidth) {
				enc.encoderCTL(OPUS_SET_BANDWIDTH_REQUEST, OPUS_BANDWIDTH[bandwidth]);
			}
			if (signal) enc.encoderCTL(OPUS_SET_SIGNAL_REQUEST, OPUS_SIGNAL[signal]);
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
