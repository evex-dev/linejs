import { BaseClient } from "../core/mod.ts";
import {
	LegyH2PingFrame,
	LegyH2PingFrameType,
	LegyH2PushFrame,
	LegyH2PushFrameType,
	LegyH2SignOnResponseFrame,
} from "./connData.ts";
import type { ConnManager, ReadableStreamWriter } from "./connManager.ts";

export class Conn {
	manager: ConnManager;

	h2Headers: Array<[string, string]> = [];
	isNotFinished = false;
	cacheData: Uint8Array = new Uint8Array(0);
	notFinPayloads: Record<number, Uint8Array> = {};
	reqStream?: ReadableStreamWriter<Uint8Array> & { abort: AbortController };
	resStream?: ReadableStream<Uint8Array>;
	private _lastSendTime = 0;
	private _closed = false;

	constructor(manager: ConnManager) {
		this.manager = manager;
	}

	get client(): BaseClient {
		return this.manager.client;
	}

	createAsyncReadableStream(): {
		stream: ReadableStream<Uint8Array<ArrayBufferLike>>;
		enqueue(chunk: string | Uint8Array): void;
		close(): void;
		error(err: any): void;
		renew(): void;
	} {
		let controller: ReadableStreamDefaultController<Uint8Array> | null = null;

		const chunks: Uint8Array[] = [];
		const encoder = new TextEncoder();
		const stream = new ReadableStream<Uint8Array>({
			start(c) {
				controller = c;
			},
			pull(c) {
				if (chunks.length) {
					c.enqueue(chunks.shift()!);
				}
			},
			cancel() {
				controller = null;
			},
		}, {
			highWaterMark: 200,
			size() {
				return 1;
			},
		});

		return {
			stream,
			enqueue(chunk: string | Uint8Array) {
				const data = typeof chunk === "string" ? encoder.encode(chunk) : chunk;
				if (controller && (controller.desiredSize ?? 0) > 0) {
					controller.enqueue(data);
				} else {
					chunks.push(data);
				}
			},
			close() {
				controller?.close();
				controller = null;
			},
			error(err: any) {
				controller?.error(err);
				controller = null;
			},
			renew() {
				new ReadableStream<Uint8Array>({
					start(c) {
						controller = c;
					},
					pull(c) {
						if (chunks.length) {
							c.enqueue(chunks.shift()!);
						}
					},
					cancel() {
						controller = null;
					},
				}, {
					highWaterMark: 200,
					size() {
						return 1;
					},
				});
			},
		};
	}

	async new(
		host: string,
		port: number,
		path: string,
		headers: Record<string, string> = {},
	) {
		const bodystream = this.createAsyncReadableStream();
		const abort = new AbortController();
		const socket = await this.client.fetch(`https://${host}${path}`, {
			method: "POST",
			headers,
			body: bodystream.stream,
			signal: abort.signal,
		});
		if (!socket.body) {
			throw new Error("no body");
		}
		this.resStream = socket.body;
		this.reqStream = { ...bodystream, abort };
	}

	writeByte(data: Uint8Array) {
		if (!this.reqStream) {
			throw new Error("no reqStream");
		}
		this.manager.log("writeByte", data);
		this.reqStream.enqueue(data);
	}

	async writeRequest(requestType: number, data: Uint8Array) {
		const d = this.manager.buildRequest(requestType, data);
		await this.writeByte(d);
	}

	async read() {
		if (!this.resStream) {
			throw new Error("no resStream");
		}
		for await (const chunk of this.resStream) {
			this.manager.log("readByte", chunk);
			this.onDataReceived(chunk);
		}
	}

	isAble2Request(): boolean {
		if (this.client.authToken && !this._closed) {
			if (Date.now() / 1000 - this._lastSendTime > 0.5) return true;
		}
		return false;
	}

	readPacketHeader(
		data: Uint8Array,
	): { dt: number; dd: Uint8Array; dl: number } {
		const dl = (data[0] << 8) | data[1];
		const dt = data[2];
		const dd = data.subarray(3); // WHAT:
		return { dt, dd, dl };
	}

	onDataReceived(data: Uint8Array): void {
		if (this.isNotFinished) {
			const concat = new Uint8Array(this.cacheData.length + data.length);
			concat.set(this.cacheData);
			concat.set(data, this.cacheData.length);
			data = concat;
		}
		this.manager.log(
			`[H2][PUSH] receives packet. raw:${bytesToHex(data)}`,
			true,
		);
		const { dt, dd, dl } = this.readPacketHeader(data);
		if (dl > dd.length) {
			this.isNotFinished = true;
			this.cacheData = data;
			return;
		} else {
			this.isNotFinished = false;
			if (dd.length > dl) {
				this.onPacketReceived(dt, dd.subarray(0, dl));
				const rest = dd.subarray(dl);
				this.manager.log(
					`[PUSH] extra data ${bytesToHex(rest).slice(0, 50)}...`,
					true,
				);
				return this.onDataReceived(rest);
			}
		}
		this.onPacketReceived(dt, dd);
	}

	onPacketReceived(dt: number, dd: Uint8Array) {
		const debugOnly = true;
		if (dt === 1) {
			const pingType = dd[0];
			const pingId = (dd[1] << 8) | dd[2];
			const packet = new LegyH2PingFrame(pingType, pingId);
			this.manager.log(
				`[PUSH] receives ping frame. pingId:${packet.pingId}`,
				debugOnly,
			);
			if (packet.pingType === LegyH2PingFrameType.ACK_REQUIRED) {
				this.writeByte(packet.ackPacket());
				this.manager.log(`[PUSH] send ping ack. pingId:${pingId}`, debugOnly);
				this.manager.OnPingCallback(pingId);
			} else {
				throw new Error(`ping type not Implemented: ${pingType}`);
			}
		} else if (dt === 3) {
			const req = (dd[0] << 8) | dd[1];
			const requestId = req & 0x7fff;
			const isFin = (req & 0x8000) !== 0;
			let responsePayload = dd.subarray(2);
			const packet = new LegyH2SignOnResponseFrame(
				requestId,
				isFin,
				responsePayload,
			);
			if (packet.isFin) {
				if (this.notFinPayloads[requestId]) {
					const a = this.notFinPayloads[requestId];
					const newPayload = new Uint8Array(a.length + responsePayload.length);
					newPayload.set(a);
					newPayload.set(responsePayload, a.length);
					responsePayload = newPayload;
					delete this.notFinPayloads[requestId];
				}
				this.manager.OnSignOnResponse(requestId, isFin, responsePayload);
			} else {
				this.manager.log(
					`[PUSH] receives long data. requestId: ${requestId}, req=${req}`,
					debugOnly,
				);
				if (!this.notFinPayloads[requestId]) {
					this.notFinPayloads[requestId] = new Uint8Array(0);
				}
				const prev = this.notFinPayloads[requestId];
				const combined = new Uint8Array(prev.length + responsePayload.length);
				combined.set(prev);
				combined.set(responsePayload, prev.length);
				this.notFinPayloads[requestId] = combined;
			}
		} else if (dt === 4) {
			const pushType = dd[0];
			const serviceType = dd[1];
			const pushId = (dd[2] << 24) | (dd[3] << 16) | (dd[4] << 8) | dd[5];
			const pushPayload = dd.subarray(6);
			const packet = new LegyH2PushFrame(
				pushType,
				serviceType,
				pushId,
				pushPayload,
			);
			this.manager.log(
				`[PUSH] receives push frame. service:${packet.serviceType}`,
				debugOnly,
			);
			if (
				[LegyH2PushFrameType.NONE, LegyH2PushFrameType.ACK_REQUIRED].includes(
					packet.pushType!,
				)
			) {
				if (packet.pushType === LegyH2PushFrameType.ACK_REQUIRED) {
					this.writeByte(packet.ackPacket());
					this.manager.log(
						`[PUSH] send push ack. service:${serviceType}`,
						debugOnly,
					);
				}
				this.manager.OnPushResponse(packet);
			} else {
				throw new Error(`push type not Implemented: ${pushType}`);
			}
		} else {
			throw new Error(
				`PUSH not Implemented: type:${dt}, payloads:${
					bytesToHex(dd).slice(0, 30)
				}, len:${dd.length}`,
			);
		}
	}

	async close() {
		this._closed = true;
		try {
			this.reqStream?.close();
			this.reqStream?.abort.abort();
		} catch (e) {
			// ignore
		}
	}
}

/* helpers */
function bytesToHex(b: Uint8Array) {
	return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}
