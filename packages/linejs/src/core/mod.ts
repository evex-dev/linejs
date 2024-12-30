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

import type { ClientInitBase, fetchLike } from "./types.ts";

export type {
	ClientInitBase,
	Continuable,
	Device,
	DeviceDetails,
	fetchLike,
	Log,
};
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

import { Thrift as def } from "@evex/linejs-types/thrift";
import type * as LINETypes from "@evex/linejs-types";

export interface LoginOption {
	email?: string;
	password?: string;
	pincode?: string;
	authToken?: string;
	qr?: boolean;
	e2ee?: boolean;
	v3?: boolean;
}

type PollingOption = "talk" | "square";

export interface ClientInit {
	/**
	 * version which LINE App to emurating
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
	 * Proxy
	 * @default fetch
	 */
	fetch?: fetchLike;
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

export class Client extends TypedEventEmitter<ClientEvents> {
	authToken?: string;
	readonly device: Device;
	readonly loginProcess: Login;
	readonly thrift: Thrift;
	readonly request: RequestClient;
	readonly storage: BaseStorage;
	readonly e2ee: E2EE;
	readonly obs: LineObs;
	readonly timeline: Timeline;
	readonly pollingProcess: Polling;

	readonly auth: AuthService;
	readonly call: CallService;
	readonly channel: ChannelService;
	readonly liff: LiffService;
	readonly relation: RelationService;
	readonly livetalk: SquareLiveTalkService;
	readonly square: SquareService;
	readonly talk: TalkService;
	fetch: fetchLike;
	profile?: LINETypes.Profile;
	config: Config;
	constructor(init: ClientInit) {
		super();
		const deviceDetails = getDeviceDetails(init.device, init.version);
		if (!deviceDetails) {
			throw new Error(`Unsupported device: ${init.device}.`);
		}

		this.storage = init.storage ?? new MemoryStorage();
		this.request = new RequestClient({
			endpoint: init.endpoint ?? "legy.line-apps.com",
			client: this,
			deviceDetails,
		});
		this.loginProcess = new Login({ client: this });
		this.thrift = new Thrift();
		this.e2ee = new E2EE({ client: this });
		this.obs = new LineObs({ client: this });
		this.timeline = new Timeline({ client: this });
		this.pollingProcess = new Polling({ client: this });

		this.thrift.def = def;
		this.device = init.device;
		this.fetch = init.fetch ?? fetch;
		this.config = {
			timeout: 30_000,
			longTimeout: 180_000,
		};
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
	async login(
		options?: LoginOption,
	): Promise<void> {
		return await this.loginProcess.login(options as any);
	}
	polling(options: PollingOption[]): Promise<void[]> {
		const promise: Promise<void>[] = [];
		if (options.includes("talk")) {
			promise.push(this.pollingProcess.talk());
		}
		if (options.includes("square")) {
			promise.push(this.pollingProcess.square());
		}
		return Promise.all(promise);
	}
}
