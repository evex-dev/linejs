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

import {
	Group,
	LineEvent,
	Square,
	SquareChat,
	SquareMember,
	User,
} from "../event/mod.ts";
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

import { Thrift as def } from "@evex/linejs-types/thrift";
import type * as LINETypes from "@evex/linejs-types";
import type { Fetch, FetchLike } from "../types.ts";

export interface LoginOption {
	email?: string;
	password?: string;
	pincode?: string;
	authToken?: string;
	qr?: boolean;
	e2ee?: boolean;
	v3?: boolean;
}

type ListenOption = "talk" | "square";

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
	readonly polling: Polling;
	readonly event: LineEvent;

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
		this.polling = new Polling(this);
		this.event = new LineEvent(this);

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

	listen(options: ListenOption[]): Promise<void[]> {
		const promises: Promise<void>[] = [];
		if (options.includes("talk")) {
			promises.push(this.event.talk());
		}
		if (options.includes("square")) {
			promises.push(this.event.square());
		}
		return Promise.all(promises);
	}

	getUser(userMid: string): Promise<User> {
		return User.from(userMid, this);
	}
	getGroup(chatMid: string): Promise<Group> {
		return Group.from(chatMid, this);
	}
	getSquare(squareMid: string): Promise<Square> {
		return Square.from(squareMid, this);
	}
	getSquareChat(squareChatMid: string): Promise<SquareChat> {
		return SquareChat.from(squareChatMid, this);
	}
	getSquareMember(squareMemberMid: string): Promise<SquareMember> {
		return SquareMember.from(squareMemberMid, this);
	}

	async fetch(
		info: RequestInfo | URL,
		init?: RequestInit,
	): Promise<Response> {
		const req = new Request(info, init);
		const res =
			await (this.#customFetch
				? this.#customFetch(req)
				: globalThis.fetch(req));
		return res;
	}
}
