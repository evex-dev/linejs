import { LegyH2PushFrame } from "./connData.ts";
import { Conn } from "./conn.ts";
import { BaseClient } from "../mod.ts";
import { TCompactProtocol } from "npm:thrift@^0.20.0";

import { TMoreCompactProtocol } from "../thrift/readwrite/tmc.ts";

// GOMI:
import {
	PartialDeep,
	SquareService_fetchMyEvents_args as gen_SquareService_fetchMyEvents_args,
	sync_args as gen_sync_args,
} from "../thrift/readwrite/struct.ts";

import {
	Operation,
	SquareEvent,
	SquareService_fetchMyEvents_args,
	SquareService_fetchMyEvents_result,
	sync_args,
	sync_result,
} from "@evex/linejs-types";

import { ParsedThrift } from "../thrift/mod.ts";
import { Buffer } from "node:buffer";

function gen_m(ss = [1, 3, 5, 6, 8, 9, 10]) {
	let i = 0;
	for (const s of ss) i |= 1 << (s - 1);
	return i;
}

export interface ReadableStreamWriter<T> {
	stream: ReadableStream<T>;
	enqueue(chunk: T): void;
	close(): void;
	error(err: any): void;
	renew(): void;
}
export class ConnManager {
	client: BaseClient;
	conns: Conn[] = [];
	currPingId = 0;
	subscriptionIds: Record<number, number> = {};
	SignOnRequests: Record<number, any[]> = {};
	OnPingCallback: (id: number) => void;
	OnSignReqResp: Record<number, any> = {};
	OnSignOnResponse: (reqId: number, isFin: boolean, data: Uint8Array) => void;
	OnPushResponse: (frame: LegyH2PushFrame) => void;
	_eventSynced = false;
	_pingInterval = 30;
	authToken: string | null = null;
	subscriptionId: number = 0;

	opStream: ReadableStreamWriter<Operation>;
	sqStream: ReadableStreamWriter<SquareEvent>;

	constructor(base: BaseClient) {
		this.client = base;
		this.OnPingCallback = this._OnPingCallback.bind(this);
		this.OnSignOnResponse = this._OnSignOnResponse.bind(this);
		this.OnPushResponse = this._OnPushResponse.bind(this);
		this.opStream = this.createAsyncReadableStream<Operation>();
		this.sqStream = this.createAsyncReadableStream<SquareEvent>();
	}

	log(text: string, data?: any) {
		this.client.log("[LEGY/PUSH] " + text, data ?? "");
	}

	createAsyncReadableStream<T>(): ReadableStreamWriter<T> {
		let controller: ReadableStreamDefaultController<T> | null = null;

		const chunks: T[] = [];
		const stream = new ReadableStream<T>({
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
				writer.renew();
			},
		}, {
			highWaterMark: 200,
			size() {
				return 1;
			},
		});

		const writer = {
			stream,
			enqueue(chunk: T) {
				const data = chunk;
				if (controller && (controller.desiredSize ?? 0) > 0) {
					controller.enqueue(data);
				} else {
					chunks.push(data);
				}
			},
			close() {
				controller?.close();
				controller = null;
				this.renew();
			},
			error(err: any) {
				controller?.error(err);
				controller = null;
				this.renew();
			},
			renew() {
				new ReadableStream<T>({
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
		return writer;
	}

	async initializeConn(
		state = 1,
		initServices = [3, 6, 8, 9, 10],
	): Promise<Conn> {
		const _conn = new Conn(this);
		if (state === 1) {
			this.conns[0] = _conn;
			this.authToken = this.client.authToken!;
		}
		const tosendHeaders: Record<string, string> = this.client.request
			.getHeader();
		tosendHeaders["content-type"] = "application/octet-stream";
		tosendHeaders["accept"] = "application/octet-stream";
		const m = gen_m(initServices);
		this.log(`Using \`m=${m}\` on \`/PUSH\``);
		const host = this.client.request.endpoint;
		const port = 443;
		await (_conn.new(host, port, `/PUSH/1/subs?m=${m}`, tosendHeaders));
		return _conn;
	}

	buildRequest(service: number, data: Uint8Array): Uint8Array {
		const len = data.length;
		const out = new Uint8Array(2 + 1 + len);
		out[0] = (len >> 8) & 0xff;
		out[1] = len & 0xff;
		out[2] = service & 0xff;
		out.set(data, 3);
		return out;
	}

	async buildAndSendSignOnRequest(
		conn: Conn,
		serviceType: number,
		kwargs: Record<string, any> = {},
	): Promise<{
		payload: Uint8Array<ArrayBuffer>;
		id: number;
	}> {
		this.log("buildAndSendSignOnRequest", { serviceType, kwargs });
		const cl = this.client;
		const id = Object.keys(this.SignOnRequests).length + 1;
		const idBuf = new Uint8Array(2);
		idBuf[0] = (id >> 8) & 0xff;
		idBuf[1] = id & 0xff;
		let methodName: string | undefined;
		// build payload body depending on serviceType
		let req = new Uint8Array(0);
		if (serviceType === 3) {
			// fetchMyEvents - delegate to client generator
			// @ts-ignore: will fix
			req = cl.thrift.writeThrift(
				gen_SquareService_fetchMyEvents_args(kwargs),
				"fetchMyEvents",
				TCompactProtocol,
			);
			methodName = "fetchMyEvents";
		} else if ([5, 8].includes(serviceType)) {
			// @ts-ignore: will fix
			req = cl.thrift.writeThrift(
				gen_sync_args(kwargs),
				"sync",
				TCompactProtocol,
			);
			methodName = "sync";
		}
		const header = new Uint8Array(2 + 1 + 1 + 2 + req.length);
		header.set(idBuf, 0);
		header[2] = serviceType & 0xff;
		header[3] = 0;
		header[4] = (req.length >> 8) & 0xff;
		header[5] = req.length & 0xff;
		header.set(req, 6);
		this.SignOnRequests[id] = [serviceType, methodName, null];
		this.log(
			`[H2][PUSH] send sign-on-request. requestId:${id}, service:${serviceType}`,
		);
		await conn.writeRequest(2, header);
		return { payload: header, id };
	}

	async _OnSignOnResponse(
		reqId: number,
		isFin: boolean,
		data: Uint8Array,
	): Promise<false | undefined> {
		// data = data.slice(5);
		const cl = this.client;
		if (!(reqId in this.SignOnRequests)) {
			this.log(`[PUSH] unknown sign-on-response requestId:${reqId}`);
			return;
		}
		const entry = this.SignOnRequests[reqId];
		const serviceType: number = entry[0];
		const methodName: string | undefined = entry[1];
		const callback = entry[2];

		this.log(
			`receives sign-on-response frame. requestId:${reqId}, service:${serviceType}, isFin:${isFin}, payload:${data.length}`,
		);

		try {
			// service 3: Square.fetchMyEvents
			if (serviceType === 3) {
				const resp: SquareService_fetchMyEvents_result = cl.thrift.rename_data(
					cl.thrift.readThrift(data, TCompactProtocol),
					true,
				).data;
				// validate resp similarly to Python

				if (resp.e) {
					this.log(`can't use PUSH for OpenChat:${resp.e.errorCode}`, resp.e);
					return false;
				}
				// use client's helpers to pick values (mirror Python checkAndGetValue)

				const { subscription: { subscriptionId }, events, syncToken } =
					resp.success;

				this.client.log("SquareService_fetchMyEvents_result", {
					res: resp.success,
				});

				if (!Array.isArray(events)) {
					throw new Error(`events should be list: ${events}`);
				}
				if (typeof syncToken !== "string") {
					throw new Error(`syncToken should be str: ${syncToken}`);
				}
				this.log(
					`response fetchMyEvent(${subscriptionId}) events:${events.length}, syncToken:${syncToken}`,
				);
				if (typeof subscriptionId !== "number") {
					throw new Error(`subscriptionId should be int: ${subscriptionId}`);
				}

				if (subscriptionId != null) {
					this.subscriptionIds[subscriptionId] = Date.now() / 1000;
				}

				for (const ev of events) {
					this.sqStream.enqueue(ev);
				}

				this.client.poll.sync.square = syncToken;
				this.client.emit("update:syncdata", this.client.poll.sync);
				this.subscriptionId = subscriptionId;

				if (!this._eventSynced) {
					this.log(
						`myEvents start(${subscriptionId}) : syncToken:${syncToken}`,
					);
					this._eventSynced = true;
				}
				return;
			} else if ([5, 8].includes(serviceType)) {
				// Talk: may be sync or fetchOps
				const _conn = this.conns[0];
				// try to parse TMoreCompact-like response first if available
				let parsed: ParsedThrift | null = null;
				let detectedMethod = methodName;
				try {
					const proto = new TMoreCompactProtocol(Buffer.from(data));
					parsed = <any> {
						data: proto.res,
						_info: {
							fname: detectedMethod,
						},
					};
					cl.thrift.rename_data(parsed!);

					if (parsed!.data.e) {
						this.log("sync error:", parsed!.data.e);
					}
				} catch (e) {
					// ignore and let outer handler manage
					this.log(`[PUSH] parse error: ${e}`);
					try {
						parsed = cl.thrift.readThrift(data, TCompactProtocol);
					} catch (_) {
						return false;
					}
				}

				if (!detectedMethod && parsed) {
					detectedMethod = parsed._info.fname;
				}

				if (detectedMethod === "sync" && parsed) {
					// handle sync response flow

					const res: sync_result = parsed.data;
					const response = res.success;

					this.client.log("sync_result", { res });

					if (
						response.fullSyncResponse &&
						response.fullSyncResponse.nextRevision
					) {
						this.client.poll.sync.talk.revision =
							response.fullSyncResponse.nextRevision;
					}
					if (
						response.operationResponse &&
						response.operationResponse.globalEvents &&
						response.operationResponse.globalEvents.lastRevision
					) {
						this.client.poll.sync.talk.globalRev =
							response.operationResponse.globalEvents.lastRevision;
					}
					if (
						response.operationResponse &&
						response.operationResponse.individualEvents &&
						response.operationResponse.individualEvents.lastRevision
					) {
						this.client.poll.sync.talk.individualRev =
							response.operationResponse.individualEvents
								.lastRevision;
					}
					if (
						(response.operationResponse &&
							response.operationResponse.operations)
					) {
						for (const event of response.operationResponse.operations) {
							this.client.poll.sync.talk.revision = event.revision;
							this.opStream.enqueue(event);
						}
					}

					this.client.emit("update:syncdata", this.client.poll.sync);

					const ex_val: PartialDeep<sync_args> = {
						request: {
							lastRevision: this.client.poll.sync.talk.revision,
							count: 100,
							lastGlobalRevision: this.client.poll.sync.talk.globalRev,
							lastIndividualRevision: this.client.poll.sync.talk.individualRev,
						},
					};

					this.log(`request talk fetcher:`, ex_val);
					await this.buildAndSendSignOnRequest(_conn, serviceType, ex_val);
					return;
				} /*else if (detectedMethod === "fetchOps") {
					// handle fetchOps response
					const ops = resp;
					if (!Array.isArray(ops)) {
						throw new Error(`ops should be list: ${ops}`);
					}
					this.log(`response fetchOps. operations:${ops.length}`);
					for (const op of ops) {
						const opType = cl.checkAndGetValue
							? cl.checkAndGetValue(op, "type", 3)
							: op.type;

						const param1 = cl.checkAndGetValue
							? cl.checkAndGetValue(op, "param1", 10)
							: op.param1;

						const param2 = cl.checkAndGetValue
							? cl.checkAndGetValue(op, "param2", 11)
							: op.param2;
						if (opType === 0) {
							if (param1 != null) {
								// split behavior as Python

								cl.individualRev = String(param1).split("\x1e")[0];
								this.log(`individualRev: ${cl.individualRev}`);
							}
							if (param2 != null) {
								cl.globalRev = String(param2).split("\x1e")[0];
								this.log(`globalRev: ${cl.globalRev}`);
							}
						}

						const rev = cl.checkAndGetValue
							? cl.checkAndGetValue(op, "revision", 1)
							: op.revision;

						cl.setRevision && cl.setRevision(rev);
						if (typeof this.hookCallback === "function") {
							this.hookCallback(cl, serviceType, op);
						}
					}
					// LOOP: request next fetch
					const fetch_req_data = { revision: cl.revision };
					this.buildAndSendSignOnRequest(_conn, serviceType, fetch_req_data);
					return;
				} */ else {
					this.log("unknown:", parsed);
					return;
				}
			} else {
				throw new Error(
					`[PUSH] receives invalid sign-on-response frame. requestId:${reqId}, service:${serviceType}`,
				);
			}
		} catch (e) {
			return;

		}
	}

	async _OnPushResponse(pushFrame: LegyH2PushFrame) {
		this.log("_OnPushResponse", pushFrame);
		if (pushFrame.serviceType === 3 && pushFrame.pushPayload) {
			this.subscriptionId = this.client.thrift.readThriftStruct(
				pushFrame.pushPayload,
				TCompactProtocol,
			)[1];
			const res = await this.client.square.fetchMyEvents({
				subscriptionId: this.subscriptionId,
				syncToken: this.client.poll.sync.square,
				limit: 100,
			});
			const { events, syncToken, subscription } = res;

			for (const ev of events) {
				this.sqStream.enqueue(ev);
			}
			this.client.poll.sync.square = syncToken;
			this.client.emit("update:syncdata", this.client.poll.sync);

			this.subscriptionId = Number(subscription.subscriptionId);

			this.log("SQ_fetchMyEvents", {
				syncToken,
				subscriptionId: this.subscriptionId,
			});
		}
	}

	_OnPingCallback(pingId: number) {
		this.currPingId = pingId;
		const t1 = Date.now() / 1000;
		const refreshIds: number[] = [];
		for (const k of Object.keys(this.subscriptionIds)) {
			const id = Number(k);
			const t2 = this.subscriptionIds[id];
			if ((t1 - t2) >= 3000) {
				this.subscriptionIds[id] = Date.now() / 1000;
				refreshIds.push(id);
			}
		}
		if (refreshIds.length) {
			this.log(`?refresh square subscriptionId: ${refreshIds}`);
		}
		if (pingId % 3 === 0) {
			this.client.talk.noop().then(() => {
				const oldToken = this.authToken;
				const newToken = this.client.authToken;
				if (oldToken !== newToken && newToken) {
					this.log("renew push conn for new authToken...");
					this.authToken = newToken;
					this.conns[0].close();
				}
			});
		}
	}

	async InitAndRead(initServices: number[] = [3, 5]) {
		if (!this.conns || this.conns.length === 0) {
			throw new Error("No valid connections found.");
		}
		const cl = this.client;
		const _conn = this.conns[0];

		const FLAG = 0;
		const statusPayload = new Uint8Array([0, FLAG, this._pingInterval]);
		_conn.writeRequest(0, statusPayload);
		this.log(`send status frame. flag:${FLAG}, pi:${this._pingInterval}`);

		for (const service of initServices) {
			this.log(`Init service: ${service}`);
			if (service === 3) {
				const subscriptionId = Math.floor(Date.now());
				const syncToken = this.client.poll.sync.square;
				const ex_val: PartialDeep<SquareService_fetchMyEvents_args> = {
					request: {
						subscriptionId,
						syncToken,
						limit: 100,
					},
				};
				this.log(
					`request fetchMyEvent(${subscriptionId}), syncToken:${syncToken}`,
				);
				// clear tracked subscriptions
				this.subscriptionIds = {};
				await this.buildAndSendSignOnRequest(_conn, service, ex_val);
			} else if ([5, 8].includes(service)) {
				const ex_val: PartialDeep<sync_args> = {
					request: {
						lastRevision: this.client.poll.sync.talk.revision,
						count: 100,
						lastGlobalRevision: this.client.poll.sync.talk.globalRev,
						lastIndividualRevision: this.client.poll.sync.talk.individualRev,
					},
				};
				this.log(`request talk fetcher: ${JSON.stringify(ex_val)}`);
				await this.buildAndSendSignOnRequest(_conn, service, ex_val);
			} else {
				await this.buildAndSendSignOnRequest(_conn, service, {});
			}
		}

		this.log("CONN start read push.");
		const readResult = await _conn.read();
		this.log(`CONN died on PingId=${this.currPingId}`, readResult);
		const idx = this.conns.indexOf(_conn);
		if (idx >= 0) this.conns.splice(idx, 1);
	}
}
