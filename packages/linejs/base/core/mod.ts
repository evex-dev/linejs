import {
	type Device,
	type DeviceDetails,
	getDeviceDetails,
} from "./utils/devices.ts";

import { type BaseStorage, MemoryStorage } from "../storage/mod.ts";

import { TypedEventEmitter } from "./typed-event-emitter/index.ts";

import type { ClientEvents, Log } from "./utils/events.ts";
import { InternalError } from "./utils/error.ts";
import { type Continuable, continueRequest } from "./utils/continue.ts";

export type { Continuable, Device, DeviceDetails, Log };
export { continueRequest, InternalError };

import {
	AuthService,
	CallService,
	ChannelService,
	LiffService,
	RelationService,
	SquareLiveTalkService,
	SquareService,
	TalkService,
} from "../service/mod.ts";

import { Login } from "../login/mod.ts";
import { Thrift } from "../thrift/mod.ts";
import { RequestClient } from "../request/mod.ts";
import { E2EE } from "../e2ee/mod.ts";
import { LineObs } from "../obs/mod.ts";
import { Timeline } from "../timeline/mod.ts";
import { Polling } from "../polling/mod.ts";
import { ConnManager } from "../push/mod.ts";

import { Thrift as def } from "@evex/linejs-types/thrift";

import type * as LINETypes from "@evex/linejs-types";
import type { Fetch, FetchLike } from "../types.ts";

import { Buffer } from "node:buffer";

export interface LoginOption {
	email?: string;
	password?: string;
	pincode?: string;
	authToken?: string;
	qr?: boolean;
	e2ee?: boolean;
	v3?: boolean;
}

export interface ClientInit {
	/**
	 * version which LINE App to emulating
	 */
	version?: string;

	/**
	 * API Endpoint
	 * @default "legy.line-apps.com"
	 */
	endpoint?: string;

	/**
	 * Device
	 */
	device: Device;

	/**
	 * Storage
	 * @default MemoryStorage
	 */
	storage?: BaseStorage;

	/**
	 * Custom function to connect network.
	 * @default `globalThis.fetch`
	 */
	fetch?: FetchLike;
}

export interface Config {
	/**
	 * Timeout
	 * @default 30_000
	 */
	timeout: number;

	/**
	 * Long timeout
	 * @default 180_000
	 */
	longTimeout: number;
}

/**
 * LINE.js client, which is entry point.
 */
export class BaseClient extends TypedEventEmitter<ClientEvents> {
	authToken?: string;
	readonly device: Device;
	readonly loginProcess: Login;
	readonly thrift: Thrift;
	readonly request: RequestClient;
	readonly storage: BaseStorage;
	readonly e2ee: E2EE;
	readonly obs: LineObs;
	readonly timeline: Timeline;
	readonly poll: Polling;
	readonly push: ConnManager;

	readonly auth: AuthService;
	readonly call: CallService;
	readonly channel: ChannelService;
	readonly liff: LiffService;
	readonly relation: RelationService;
	readonly livetalk: SquareLiveTalkService;
	readonly square: SquareService;
	readonly talk: TalkService;
	#customFetch?: FetchLike;
	profile?: LINETypes.Profile;
	config: Config;
	readonly deviceDetails: DeviceDetails;
	readonly endpoint: string;
	/**
	 * Initializes a new instance of the class.
	 *
	 * @param init - The initialization parameters.
	 * @param init.device - The device type.
	 * @param init.version - The version of the device.
	 * @param init.fetch - Optional custom fetch function.
	 * @param init.endpoint - Optional endpoint URL.
	 * @param init.storage - Optional storage mechanism.
	 *
	 * @throws {Error} If the device is unsupported.
	 *
	 * @example
	 * ```typescript
	 * const client = new Client({
	 *   device: 'iOS',
	 *   version: '10.0',
	 *   fetch: customFetchFunction,
	 *   endpoint: 'custom-endpoint.com',
	 *   storage: new FileStorage("./storage.json"),
	 * });
	 * ```
	 */
	constructor(init: ClientInit) {
		super();
		const deviceDetails = getDeviceDetails(init.device, init.version);
		if (!deviceDetails) {
			throw new Error(`Unsupported device: ${init.device}.`);
		}
		if (init.fetch) {
			this.#customFetch = init.fetch;
		}
		this.deviceDetails = deviceDetails;
		this.endpoint = init.endpoint ?? "legy.line-apps.com";
		this.config = {
			timeout: 30_000,
			longTimeout: 180_000,
		};
		this.device = init.device;

		this.storage = init.storage ?? new MemoryStorage();
		this.request = new RequestClient(this);
		this.loginProcess = new Login(this);
		this.thrift = new Thrift();
		this.thrift.def = def;
		this.e2ee = new E2EE(this);
		this.obs = new LineObs(this);
		this.timeline = new Timeline(this);
		this.poll = new Polling(this);
		this.push = new ConnManager(this);

		this.auth = new AuthService(this);
		this.call = new CallService(this);
		this.channel = new ChannelService(this);
		this.liff = new LiffService(this);
		this.livetalk = new SquareLiveTalkService(this);
		this.relation = new RelationService(this);
		this.square = new SquareService(this);
		this.talk = new TalkService(this);
	}

	log(type: string, data: Record<string, any>) {
		this.emit("log", { type, data });
	}
	getToType(mid: string): number | null {
		const typeMapping: { [key: string]: number } = {
			u: 0,
			r: 1,
			c: 2,
			s: 3,
			m: 4,
			p: 5,
			v: 6,
			t: 7,
		};
		return typeMapping[mid[0]] ?? null;
	}
	reqseqs?: Record<string, number>;
	async getReqseq(name: string = "talk"): Promise<number> {
		if (!this.reqseqs) {
			this.reqseqs = JSON.parse(
				((await this.storage.get("reqseq")) ?? "{}").toString(),
			) as Record<string, number>;
		}
		if (!this.reqseqs[name]) {
			this.reqseqs[name] = 0;
		}
		const seq = this.reqseqs[name];
		this.reqseqs[name]++;
		await this.storage.set("reqseq", JSON.stringify(this.reqseqs));
		return seq;
	}

	// NOTE: use allow function.
	// `const { fetch } = base` is not working if you change to function decorations.
	readonly fetch: Fetch = async (
		info: RequestInfo | URL,
		init?: RequestInit,
	): Promise<Response> => {
		const req = new Request(info, init);
		const res =
			await (this.#customFetch
				? this.#customFetch(req)
				: globalThis.fetch(req));
		return res;
	};

	/**
	 * returns polling client.
	 */
	createPolling(): Polling {
		return this.poll;
	}

	/**
	 * JSON replacer to remove mid and authToken, parse bigint to number
	 *
	 * ```
	 * JSON.stringify(data, BaseClient.jsonReplacer);
	 * ```
	 */
	static jsonReplacer(k: any, v: any): any {
		if (typeof v === "bigint") {
			return Number(v);
		}
		if (typeof v === "string") {
			const midType = v.match(/([ucrpmst])[0123456789abcdef]{32}/);
			if (midType && midType[1]) {
				return `[${midType[1].toUpperCase()} mid]`;
			}
			if (k === "x-line-access") {
				return `[AuthToken]`;
			}
		}
		if (typeof v === "object") {
			if (Array.isArray(v)) {
				return v.map((item) => BaseClient.jsonReplacer("", item));
			}
			if (v instanceof Uint8Array) {
				return `Uint8Array[${v.length}]<${
					Array.from(v).map((e) => e.toString(16).padStart(2, "0")).join(" ")
				}>`;
			}
			if (v.type === "Buffer" && Array.isArray(v.data)) {
				return `Buffer[${v.data.length}]<${
					Array.from(v.data).map((e) => Number(e).toString(16).padStart(2, "0"))
						.join(
							" ",
						)
				}>`;
			}
			if (v instanceof Blob) {
				return `Blob[${v.size}]@${v.type}`;
			}

			const newObj: any = {};
			let midCount = 0;
			for (const key in v) {
				if (Object.prototype.hasOwnProperty.call(v, key)) {
					const value = v[key];
					const midType = key.match(/(.)[0123456789abcdef]{32}/);
					if (midType && midType[1]) {
						midCount++;
						newObj[
							`[${midType[1].toUpperCase()} mid ${midCount}]`
						] = value;
					} else {
						newObj[key] = value;
					}
				}
			}
			return newObj;
		}
		return v;
	}
}
