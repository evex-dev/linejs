// Audio pipeline — PCM in/out, Opus codec hook.

export interface PcmFrame {
	samples: Int16Array;
	sampleRate: number;
	channels: number;
	timestamp?: number;
}

export interface AudioSource {
	frames(opts?: { signal?: AbortSignal }): AsyncIterable<PcmFrame>;
	close?(): Promise<void> | void;
}

export interface AudioSink {
	write(frame: PcmFrame): Promise<void> | void;
	end?(): Promise<void> | void;
}

export function streamSource(
	stream: ReadableStream<PcmFrame>,
): AudioSource {
	return {
		async *frames(opts) {
			const reader = stream.getReader();
			const onAbort = () => reader.cancel().catch(() => {});
			opts?.signal?.addEventListener("abort", onAbort);
			try {
				while (true) {
					const { value, done } = await reader.read();
					if (done) return;
					yield value;
				}
			} finally {
				opts?.signal?.removeEventListener("abort", onAbort);
				reader.releaseLock();
			}
		},
		async close() {
			await stream.cancel().catch(() => {});
		},
	};
}

export function bufferSource(opts: {
	samples: Int16Array;
	sampleRate: number;
	channels?: number;
	frameDurationMs?: number;
}): AudioSource {
	const channels = opts.channels ?? 1;
	const frameMs = opts.frameDurationMs ?? 20;
	const frameSamples = Math.floor((opts.sampleRate * frameMs) / 1000) *
		channels;
	return {
		async *frames(o) {
			for (let i = 0; i < opts.samples.length; i += frameSamples) {
				if (o?.signal?.aborted) return;
				yield {
					samples: opts.samples.subarray(i, i + frameSamples),
					sampleRate: opts.sampleRate,
					channels,
				};
			}
		},
	};
}

export interface FileDecoder {
	(bytes: Uint8Array): Promise<{
		samples: Int16Array;
		sampleRate: number;
		channels: number;
	}>;
}

export async function fileSource(opts: {
	bytes: Uint8Array;
	decode: FileDecoder;
	frameDurationMs?: number;
}): Promise<AudioSource> {
	const { samples, sampleRate, channels } = await opts.decode(opts.bytes);
	return bufferSource({
		samples,
		sampleRate,
		channels,
		frameDurationMs: opts.frameDurationMs,
	});
}

export function bufferSink(): AudioSink & { frames: PcmFrame[] } {
	const frames: PcmFrame[] = [];
	return {
		frames,
		write(f) {
			frames.push(f);
		},
	};
}

export function streamSink(
	stream: WritableStream<PcmFrame>,
): AudioSink {
	const writer = stream.getWriter();
	return {
		write(f) {
			return writer.write(f);
		},
		async end() {
			await writer.close().catch(() => {});
			writer.releaseLock();
		},
	};
}

export interface AudioEncoder {
	encode(frame: PcmFrame): Uint8Array | null;
	close?(): void;
}

export interface AudioDecoder {
	decode(packet: Uint8Array): PcmFrame | null;
	close?(): void;
}

export interface CodecFactory {
	newEncoder(opts: {
		sampleRate: number;
		channels: number;
		bitrate?: number;
	}): AudioEncoder;
	newDecoder(opts: {
		sampleRate: number;
		channels: number;
	}): AudioDecoder;
}

export const defaultCodecFactory: CodecFactory = {
	newEncoder() {
		throw new Error("no audio encoder configured");
	},
	newDecoder() {
		throw new Error("no audio decoder configured");
	},
};

/** Minimal 16-bit PCM WAV decoder. Throws on compressed formats. */
export function decodeWavSync(bytes: Uint8Array): {
	samples: Int16Array;
	sampleRate: number;
	channels: number;
} {
	const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	if (
		bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 ||
		bytes[3] !== 0x46
	) throw new Error("decodeWavSync: not a RIFF file");
	if (
		bytes[8] !== 0x57 || bytes[9] !== 0x41 || bytes[10] !== 0x56 ||
		bytes[11] !== 0x45
	) throw new Error("decodeWavSync: not a WAVE file");
	let off = 12;
	let fmt: {
		channels: number;
		sampleRate: number;
		bitsPerSample: number;
		audioFormat: number;
	} | null = null;
	let dataOff = -1;
	let dataLen = 0;
	while (off + 8 <= bytes.length) {
		const id = String.fromCharCode(
			bytes[off],
			bytes[off + 1],
			bytes[off + 2],
			bytes[off + 3],
		);
		const size = dv.getUint32(off + 4, true);
		const start = off + 8;
		if (id === "fmt ") {
			if (size < 16 || start + 16 > bytes.length) {
				throw new Error("decodeWavSync: invalid fmt chunk");
			}
			fmt = {
				audioFormat: dv.getUint16(start, true),
				channels: dv.getUint16(start + 2, true),
				sampleRate: dv.getUint32(start + 4, true),
				bitsPerSample: dv.getUint16(start + 14, true),
			};
		} else if (id === "data") {
			dataOff = start;
			// ffmpeg writes a placeholder 0xffffffff data size when emitting WAV
			// to a non-seekable stream. In that case the real data is the
			// remaining bytes in the buffer.
			dataLen = Math.min(size, Math.max(0, bytes.length - start));
			break;
		}
		off = start + size + (size % 2); // chunks are 2-aligned
	}
	if (!fmt) throw new Error("decodeWavSync: no fmt chunk");
	if (dataOff < 0) throw new Error("decodeWavSync: no data chunk");
	if (fmt.audioFormat !== 1) {
		throw new Error(
			`decodeWavSync: audioFormat=${fmt.audioFormat} not PCM; use a real decoder`,
		);
	}
	if (fmt.bitsPerSample !== 16) {
		throw new Error(
			`decodeWavSync: ${fmt.bitsPerSample}-bit samples not supported (need 16)`,
		);
	}
	const sampleCount = Math.floor(dataLen / 2);
	const samples = new Int16Array(sampleCount);
	for (let i = 0; i < sampleCount; i++) {
		samples[i] = dv.getInt16(dataOff + i * 2, true);
	}
	return {
		samples,
		sampleRate: fmt.sampleRate,
		channels: fmt.channels,
	};
}

/** Linear-interpolated resample of interleaved 16-bit PCM. */
export function resampleLinear(
	samples: Int16Array,
	fromRate: number,
	toRate: number,
	channels: number,
): Int16Array {
	if (fromRate === toRate) return samples;
	const ratio = toRate / fromRate;
	const framesIn = Math.floor(samples.length / channels);
	const framesOut = Math.floor(framesIn * ratio);
	const out = new Int16Array(framesOut * channels);
	for (let f = 0; f < framesOut; f++) {
		const srcF = f / ratio;
		const i = Math.floor(srcF);
		const t = srcF - i;
		for (let c = 0; c < channels; c++) {
			const a = samples[i * channels + c] ?? 0;
			const b = samples[(i + 1) * channels + c] ?? a;
			out[f * channels + c] = (a + (b - a) * t) | 0;
		}
	}
	return out;
}
