// CallSession — control plane is real, transport is pluggable.
import type { Client } from "../../mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import type {
	AudioDecoder,
	AudioEncoder,
	AudioSink,
	AudioSource,
	CodecFactory,
	PcmFrame,
} from "./audio.ts";
import { defaultCodecFactory } from "./audio.ts";
import { TypedEventEmitter } from "../../../base/core/typed-event-emitter/index.ts";

export type CallSessionState =
	| "idle"
	| "acquiring"
	| "connecting"
	| "ringing"
	| "in-call"
	| "ending"
	| "ended"
	| "failed";

export type CallKind = "AUDIO" | "VIDEO" | "FACEPLAY";

export interface CallSessionOpts {
	to: string;
	kind?: CallKind;
	fromEnvInfo?: Record<string, string>;
	codecs?: CodecFactory;
	transport?: CallTransport;
}

export interface CallTransport {
	connect(opts: { route: LINETypes.CallRoute }): Promise<void>;
	close(): Promise<void>;
	send(packet: Uint8Array): void | Promise<void>;
	receive(): AsyncIterable<Uint8Array>;
	/** Optional. When present, CallSession.start() drives the full
	 *  signaling dialog after connect() (SIP INVITE → 200 → ACK). */
	invite?(opts: { to: string }): Promise<unknown>;
}

export const stubTransport: CallTransport = {
	connect() {
		throw new Error("CallTransport not configured");
	},
	close() { return Promise.resolve(); },
	send() { throw new Error("stubTransport.send"); },
	async *receive() { /* */ },
};

export type CallSessionEvents = {
	state: (newState: CallSessionState, prev: CallSessionState) => void;
	connected: (route: LINETypes.CallRoute) => void;
	ended: (reason: string) => void;
	error: (err: Error) => void;
};

export class CallSession extends TypedEventEmitter<CallSessionEvents> {
	#client: Client;
	#opts: CallSessionOpts;
	#state: CallSessionState = "idle";
	#route?: LINETypes.CallRoute;
	#transport: CallTransport;
	#codecs: CodecFactory;
	#encoder?: AudioEncoder;
	#decoder?: AudioDecoder;
	#sendAbort?: AbortController;
	#receiveSink?: AudioSink;

	constructor(client: Client, opts: CallSessionOpts) {
		super();
		this.#client = client;
		this.#opts = opts;
		this.#transport = opts.transport ?? stubTransport;
		this.#codecs = opts.codecs ?? defaultCodecFactory;
	}

	get state(): CallSessionState {
		return this.#state;
	}
	get route(): LINETypes.CallRoute | undefined {
		return this.#route;
	}
	get peer(): string {
		return this.#opts.to;
	}
	get kind(): CallKind {
		return this.#opts.kind ?? "AUDIO";
	}

	#setState(s: CallSessionState) {
		if (s === this.#state) return;
		const prev = this.#state;
		this.#state = s;
		this.emit("state", s, prev);
	}

	async start(): Promise<LINETypes.CallRoute> {
		if (this.#route) return this.#route;
		this.#setState("acquiring");
		try {
			this.#route = await this.#client.call.acquireRoute({
				to: this.#opts.to,
				callType: this.#opts.kind ?? "AUDIO",
				fromEnvInfo: this.#opts.fromEnvInfo,
			});
			this.#setState("connecting");
			await this.#transport.connect({ route: this.#route });
			if (this.#transport.invite) {
				await this.#transport.invite({ to: this.#opts.to });
			}
			this.#setState("in-call");
			this.emit("connected", this.#route);
			return this.#route;
		} catch (e) {
			this.#setState("failed");
			const err = e instanceof Error ? e : new Error(String(e));
			this.emit("error", err);
			throw err;
		}
	}

	async sendStream(source: AudioSource, opts: { signal?: AbortSignal } = {}): Promise<void> {
		if (this.#state !== "in-call") {
			throw new Error(`sendStream: session not in-call (state=${this.#state})`);
		}
		this.#sendAbort = new AbortController();
		const signal = opts.signal
			? mergeSignals(opts.signal, this.#sendAbort.signal)
			: this.#sendAbort.signal;
		const enc = this.#encoder ??= this.#codecs.newEncoder({
			sampleRate: 48000,
			channels: 1,
		});
		for await (const frame of source.frames({ signal })) {
			if (signal.aborted) break;
			const packet = enc.encode(frame);
			if (packet) await this.#transport.send(packet);
		}
	}

	async sendBuffer(opts: {
		samples: Int16Array;
		sampleRate: number;
		channels?: number;
	}): Promise<void> {
		const { bufferSource } = await import("./audio.ts");
		await this.sendStream(bufferSource(opts));
	}

	async sendFile(opts: {
		bytes: Uint8Array;
		decode: (b: Uint8Array) => Promise<{
			samples: Int16Array;
			sampleRate: number;
			channels: number;
		}> | { samples: Int16Array; sampleRate: number; channels: number };
	}): Promise<void> {
		const decoded = await opts.decode(opts.bytes);
		await this.sendBuffer(decoded);
	}

	async receiveInto(sink: AudioSink): Promise<void> {
		if (this.#state !== "in-call") {
			throw new Error(`receiveInto: session not in-call (state=${this.#state})`);
		}
		this.#receiveSink = sink;
		const dec = this.#decoder ??= this.#codecs.newDecoder({
			sampleRate: 48000,
			channels: 1,
		});
		for await (const packet of this.#transport.receive()) {
			const frame = dec.decode(packet);
			if (frame) await sink.write(frame);
		}
		await sink.end?.();
	}

	async *received(): AsyncGenerator<PcmFrame> {
		if (this.#state !== "in-call") {
			throw new Error(`received: session not in-call (state=${this.#state})`);
		}
		const dec = this.#decoder ??= this.#codecs.newDecoder({
			sampleRate: 48000,
			channels: 1,
		});
		for await (const packet of this.#transport.receive()) {
			const frame = dec.decode(packet);
			if (frame) yield frame;
		}
	}

	async end(reason = "user-ended"): Promise<void> {
		if (this.#state === "ended" || this.#state === "idle") return;
		this.#setState("ending");
		this.#sendAbort?.abort();
		try {
			await this.#transport.close();
		} catch { /* */ }
		this.#encoder?.close?.();
		this.#decoder?.close?.();
		await this.#receiveSink?.end?.();
		this.#setState("ended");
		this.emit("ended", reason);
	}
}

function mergeSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
	if (a.aborted) return a;
	if (b.aborted) return b;
	const c = new AbortController();
	const onA = () => c.abort(a.reason);
	const onB = () => c.abort(b.reason);
	a.addEventListener("abort", onA, { once: true });
	b.addEventListener("abort", onB, { once: true });
	return c.signal;
}
