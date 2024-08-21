/**
 * @module
 * LINE SelfBot Client
 */

import ThriftRenameParser from "./lib/thrift/parser.js";
import { Thrift } from "./lib/thrift/thrift.ts";
import { TypedEventEmitter } from "./lib/typed-event-emitter/index.ts";
import type { LoginOptions } from "./method/login.ts";
import { getDeviceDetails } from "./utils/device.ts";
import { InternalError } from "./utils/errors.ts";
import type { ClientEvents } from "./utils/events.ts";
import {
	AUTH_TOKEN_REGEX,
	EMAIL_REGEX,
	PASSWORD_REGEX,
} from "./utils/regex.ts";
import type { System } from "./utils/system.ts";
import type { User } from "./utils/user.ts";
import type { Metadata } from "./utils/metadata.ts";
import {
	type LooseType,
	type NestedArray,
	Protocols,
} from "./lib/thrift/declares.ts";
import { Buffer } from "node:buffer";
import { writeThrift } from "./lib/thrift/write.js";
import { readThrift } from "./lib/thrift/read.js";

/**
 * @description LINE SelfBot Client
 */
export class Client extends TypedEventEmitter<ClientEvents> {
	constructor() {
		super();
		this.parser.def = Thrift;
	}

	public user: User<"me"> | undefined;
	public system: System | undefined;
	public metadata: Metadata | undefined;

	public login(options: LoginOptions) {
		if (options.authToken) {
			if (!AUTH_TOKEN_REGEX.test(options.authToken)) {
				throw new InternalError("Invalid auth token", `'${options.authToken}'`);
			}
		} else if (options.email && options.password) {
			if (!EMAIL_REGEX.test(options.email)) {
				throw new InternalError("Invalid email", `'${options.email}'`);
			}

			if (!PASSWORD_REGEX.test(options.password)) {
				throw new InternalError("Invalid password", `'${options.password}'`);
			}
		} else {
			throw new InternalError(
				"Invalid login options",
				`Login options need 'authToken' or 'email' and 'password'`,
			);
		}

		const device = options.device || "IOSIPAD";
		const details = getDeviceDetails(device);

		if (!details) {
			throw new InternalError("Unsupported device", `'${device}'`);
		}

		this.system = {
			appVersion: details.appVersion,
			systemName: details.systemName,
			systemVersion: details.systemVersion,
			type:
				`${device}\t${details.appVersion}\t${details.systemName}\t${details.systemVersion}`,
			userAgent: `Line/${details.appVersion}`,
			device,
		};

		let authToken = options.authToken;

		if (!authToken) {
			authToken = "";
		}

		this.metadata = {
			authToken,
		};
	}

	private parser: ThriftRenameParser = new ThriftRenameParser();

	async _request(
		path: string,
		value: NestedArray,
		name: string,
		ptype: keyof typeof Protocols,
		add_headers = {},
		parse = true,
	) {
		if (!this.system || !this.metadata) {
			throw new InternalError(
				"Not logged in",
				"Please call 'login()' first",
			);
		}

		const Protocol = Protocols[ptype];
		let headers = {
			"Host": "gw.line.naver.jp",
			"accept": "application/x-thrift",
			"user-agent": this.system.userAgent,
			"x-line-application": this.system.type,
			"x-line-access": this.metadata.authToken,
			"content-type": "application/x-thrift",
			"x-lal": "ja_JP",
			"x-lpv": "1",
			"x-lhm": "POST",
			"accept-encoding": "gzip",
		};

		headers = { ...headers, ...add_headers };
		let res;
		if (Protocol !== Buffer) {
			try {
				const Trequest = writeThrift(value, name, Protocol);
				const response = await fetch("https://gw.line.naver.jp" + path, {
					method: "POST",
					headers: headers,
					body: Trequest,
				});
				if (response.headers.get("x-line-next-access")) {
					this.metadata.authToken =
						response.headers.get("x-line-next-access") ||
						this.metadata.authToken;
					this.emit("update:authtoken", this.metadata.authToken);
				}

				const body = await response.arrayBuffer();
				const parsedBody = new Uint8Array(body);
				res = readThrift(parsedBody, Protocol);
				if (parse === true) {
					this.parser.rename_data(res);
				} else if (typeof parse === "string") {
					res.value = this.parser.rename_thrift(parse, res.value);
				}
			} catch (error) {
				throw new InternalError("Request external failed ", "(" + String(error.stack) + ")");
			}
			if (res && res.e) {
				throw new InternalError("Request internal failed", JSON.stringify(res.e));
			}
			return res;
		} else {
			try {
				const Trequest = value;
				const response = await fetch("https://gw.line.naver.jp" + path, {
					method: "POST",
					headers: headers,
					body: Trequest as LooseType,
				});
				const body = await response.arrayBuffer();
				const parsedBody = new Uint8Array(body);
				res = parsedBody;
			} catch (error) {
				throw new InternalError("Request external failed", String(error));
			}
			return res;
		}
	}
}
