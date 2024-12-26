import {
    type Device,
    type DeviceDetails,
    getDeviceDetails,
} from "./utils/devices.ts";

import { type BaseStorage, MemoryStorage } from "../storage/mod.ts";

import { TypedEventEmitter } from "./typed-event-emitter/index.ts";

import type { ClientEvents, Log } from "./utils/events.ts";
import { InternalError } from "./utils/error.ts";

import type { ClientInitBase, fetchLike } from "./types.ts";

export type { ClientInitBase, Device, DeviceDetails, fetchLike, Log };
export { InternalError };

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

import { Thrift as def } from "@evex/linejs-types/thrift";
import type * as LINETypes from "@evex/linejs-types";

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
}

export class Client extends TypedEventEmitter<ClientEvents> {
    endpoint: string;
    authToken?: string;
    readonly device: Device;
    readonly login: Login;
    readonly thrift: Thrift;
    readonly request: RequestClient;
    readonly storage: BaseStorage;
    readonly e2ee: E2EE;
    readonly auth: AuthService;
    readonly call: CallService;
    readonly channel: ChannelService;
    readonly liff: LiffService;
    readonly relation: RelationService;
    readonly livetalk: SquareLiveTalkService;
    readonly square: SquareService;
    readonly talk: TalkService;
    fetch: fetchLike;
    user?: LINETypes.Profile;
    config: Config;
    constructor(init: ClientInit) {
        super();
        this.endpoint = init.endpoint ?? "legy.line-apps.com";
        const deviceDetails = getDeviceDetails(init.device, init.version);
        if (!deviceDetails) {
            throw new Error(`Unsupported device: ${init.device}.`);
        }
        this.storage = init.storage ?? new MemoryStorage();
        this.request = new RequestClient({
            endpoint: this.endpoint,
            client: this,
            deviceDetails,
        });
        this.login = new Login({ client: this });
        this.thrift = new Thrift();
        this.e2ee = new E2EE({ client: this });
        this.thrift.def = def;
        this.device = init.device;
        this.fetch = init.fetch ?? fetch;
        this.config = {
            timeout: 30000,
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
        console.log(type, data);
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
}
