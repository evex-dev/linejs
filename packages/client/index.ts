/**
 * @module
 * LINE SelfBot Client
 */

import ThriftRenameParser from "./lib/thrift/parser.js";
import { Thrift } from "./lib/thrift/thrift.ts";
import { TypedEventEmitter } from "./lib/typed-event-emitter/index.ts";
import type { LoginOptions } from "./method/login.ts";
import { type Device, getDeviceDetails } from "./utils/device.ts";
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
	type NestedArray,
	type ParsedThrift,
	type ProtocolKey,
	Protocols,
} from "./lib/thrift/declares.ts";
import { writeThrift } from "./lib/thrift/write.js";
import { readThrift } from "./lib/thrift/read.js";
import type { RSAKeyInfo } from "./lib/rsa/rsa-key.ts";
import type { LooseType } from "./utils/common.ts";
import { RSAPincodeVerifier } from "./lib/rsa/rsa-verify.ts";
import type { Profile } from "./utils/profile.ts";
import * as fs from "node:fs/promises";
import { MemoryStorage } from "./lib/storage/memory-storage.ts";
import type { BaseStorage } from "./lib/storage/base-storage.ts";

/**
 * @description LINE SelfBot Client
 *
 * @param {BaseStorage} storge Storage
 */
export class Client extends TypedEventEmitter<ClientEvents> {
	constructor(
		public storge: BaseStorage = new MemoryStorage(),
	) {
		super();
		this.parser.def = Thrift;
	}

	/**
	 * @description THe information of user
	 */
	public user: User<"me"> | undefined;
	/**
	 * @description The information of system
	 */
	public system: System | undefined;
	/**
	 * @description The information of metadata
	 */
	public metadata: Metadata | undefined;

	/**
	 * @description Login to LINE server with auth token or email/password
	 *
	 * @param {LoginOptions} options Options for login
	 * @throws {InternalError} If login options are invalid
	 * @throws {InternalError} If email is invalid
	 * @throws {InternalError} If password is invalid
	 * @throws {InternalError} If device is unsupported
	 * @throws {InternalError} If auth token is invalid
	 * @emits ready
	 * @emits update:authtoken
	 */
	public async login(options: LoginOptions): Promise<void> {
		if (options.authToken) {
			if (!AUTH_TOKEN_REGEX.test(options.authToken)) {
				throw new InternalError(
					"Invalid auth token",
					`'${options.authToken}'`,
				);
			}
		} else if (options.email && options.password) {
			if (!EMAIL_REGEX.test(options.email)) {
				throw new InternalError("Invalid email", `'${options.email}'`);
			}

			if (!PASSWORD_REGEX.test(options.password)) {
				throw new InternalError(
					"Invalid password",
					`'${options.password}'`,
				);
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
			if (!options.email || !options.password) {
				throw new InternalError(
					"Invalid login options",
					`Login options need 'authToken' or 'email' and 'password'`,
				);
			}

			authToken = await this.requestEmailLogin(
				options.email,
				options.password,
				false,
			);
		}

		this.metadata = {
			authToken,
		};

		this.emit("update:authtoken", authToken);

		const profile = await this.getProfile();

		this.user = {
			type: "me",
			displayName: profile.displayName,
			displayNameOverridden: profile.displayName,
			mid: profile.mid,
			iconObsHash: profile.pictureStatus,
			statusMessage: profile.statusMessage,
			statusMessageContentMetadata: profile.statusMessageContentMetadata,
			profile,
		};

		this.emit("ready", this.user);
	}

	private parser: ThriftRenameParser = new ThriftRenameParser();
	private cert: string | null = null;

	/**
	 * @description Registers a certificate path to be used for login.
	 *
	 * @param {string} path  - The path to the certificate.
	 */
	public async registerCertPath(path: string): Promise<void> {
		let cert;

		try {
			cert = await fs.readFile(path, "utf8");
		} catch (_) {
			cert = null;
		}

		this.registerCert(cert);
	}

	/**
	 * @description Registers a certificate to be used for login.
	 *
	 * @param {string | null} cert - The certificate to register. If null, the certificate will be cleared.
	 */
	public registerCert(cert: string | null): void {
		this.cert = cert;
	}

	/**
	 * @description Reads the certificate from the registered path, if it exists.
	 *
	 * @return {Promise<string | null>} The certificate, or null if it does not exist or an error occurred.
	 */
	public getCert(): string | null {
		return this.cert;
	}

	/**
	 * @description Login to LINE server with email and password.
	 *
	 * @param {string} email The email to login with.
	 * @param {string} password The password to login with.
	 * @param {boolean} [enableE2EE=false] Enable E2EE or not.
	 * @returns {Promise<string>} The auth token.
	 * @throws {InternalError} If the system is not setup yet.
	 * @throws {InternalError} If the login type is not supported.
	 * @emits pincall
	 * @emits update:cert
	 */
	public async requestEmailLogin(
		email: string,
		password: string,
		enableE2EE: boolean = false,
	): Promise<string> {
		if (!this.system) {
			throw new InternalError(
				"Not setup yet",
				"Please call 'login()' first",
			);
		}

		const rsaKey = await this.getRSAKeyInfo();
		const { keynm } = rsaKey;
		const message = String.fromCharCode(rsaKey.sessionKey.length) +
			rsaKey.sessionKey +
			String.fromCharCode(email.length) +
			email +
			String.fromCharCode(password.length) +
			password;

		let e2eeData;
		if (enableE2EE) {
			e2eeData =
				"0\x8aEH\x96\xa7\x8d#5<\xfb\x91c\x12\x15\xbd\x13H\xfa\x04d\xcf\x96\xee1e\xa0]v,\x9f\xf2";
			throw new InternalError("Not supported login type", "'e2ee'");
		}

		const encryptedMessage =
			new RSAPincodeVerifier(message).getRSACrypto(rsaKey).credentials;

		const cert = await this.getCert() || undefined;

		const response = await this.requestLoginV2(
			keynm,
			encryptedMessage,
			this.system?.device,
			undefined,
			e2eeData,
			cert || undefined,
			"loginZ",
		);

		if (response.authToken) {
			if (response.certificate) {
				this.emit("update:cert", response.certificate);
			}
			return response.authToken;
		} else {
			this.emit("pincall", response.pinCode);
			const headers = {
				"Host": "gw.line.naver.jp",
				"accept": "application/x-thrift",
				"user-agent": this.system.userAgent,
				"x-line-application": this.system.type,
				"x-line-access": response.verifier,
				"x-lal": "ja_JP",
				"x-lpv": "1",
				"x-lhm": "GET",
				"accept-encoding": "gzip",
			};
			const verifier = await fetch("https://gw.line.naver.jp/Q", {
				headers: headers,
			}).then((res) => res.json());
			const loginReponse = await this.requestLoginV2(
				keynm,
				encryptedMessage,
				this.system.device,
				verifier.result.verifier,
				e2eeData,
				undefined,
				"loginZ",
			);
			if (loginReponse.certificate) {
				this.emit("update:cert", loginReponse.certificate);
			}
			return loginReponse.authToken;
		}
	}

	private async requestLoginV2(
		keynm: string,
		encryptedMessage: string,
		deviceName: Device,
		verifier: string | undefined,
		secret: string | undefined,
		cert: string | undefined,
		calledName = "loginV2",
	) {
		let loginType = 2;
		if (!secret) loginType = 0;
		if (verifier) {
			loginType = 1;
		}
		return await this.direct_request(
			[
				[
					12,
					2,
					[
						[8, 1, loginType],
						[8, 2, 1],
						[11, 3, keynm],
						[11, 4, encryptedMessage],
						[2, 5, 0],
						[11, 6, ""],
						[11, 7, deviceName],
						[11, 8, cert],
						[11, 9, verifier],
						[11, 10, secret],
						[8, 11, 1],
						[11, 12, "System Product Name"],
					],
				],
			],
			calledName,
			3,
			"LoginResult",
			"/api/v3p/rs",
		);
	}

	/**
	 * @description Get RSA key info for login.
	 *
	 * @param {number} [provider=0] Provider to get RSA key info from.
	 * @returns {Promise<RSAKeyInfo>} RSA key info.
	 * @throws {FetchError} If failed to fetch RSA key info.
	 */
	public async getRSAKeyInfo(provider = 0): Promise<RSAKeyInfo> {
		return await this.request(
			[
				[8, 2, provider],
			],
			"getRSAKeyInfo",
			3,
			"RSAKey",
			"/api/v3/TalkService.do",
		);
	}

	/**
	 * @description Request to LINE API.
	 *
	 * @param {NestedArray} value - The value to request.
	 * @param {string} methodName - The method name of the request.
	 * @param {ProtocolKey} [protocolType=3] - The protocol type of the request.
	 * @param {boolean | string} [parse=true] - Whether to parse the response.
	 * @param {string} [path="/S3"] - The path of the request.
	 * @param {object} [headers={}] - The headers of the request.
	 * @returns {Promise<LooseType>} The response.
	 */
	public async request(
		value: NestedArray,
		methodName: string,
		protocolType: ProtocolKey = 3,
		parse: boolean | string = true,
		path = "/S3",
		headers = {},
	): Promise<LooseType> {
		return (await this.rawRequest(
			path,
			[
				[
					12,
					1,
					value,
				],
			],
			methodName,
			protocolType,
			headers,
			undefined,
			parse,
		)).value;
	}

	/**
	 * @description Request to LINE API directly.
	 *
	 * @param {NestedArray} value - The value to request.
	 * @param {string} methodName - The method name of the request.
	 * @param {ProtocolKey} [protocolType=3] - The protocol type of the request.
	 * @param {boolean | string} [parse=true] - Whether to parse the response.
	 * @param {string} [path="/S3"] - The path of the request.
	 * @param {object} [headers={}] - The headers of the request.
	 * @returns {Promise<LooseType>} The response.
	 */
	public async direct_request(
		value: NestedArray,
		methodName: string,
		protocolType: ProtocolKey = 3,
		parse: boolean | string = true,
		path = "/S3",
		headers = {},
	): Promise<LooseType> {
		return (await this.rawRequest(
			path,
			value,
			methodName,
			protocolType,
			headers,
			undefined,
			parse,
		)).value;
	}

	/**
	 * @description Request to LINE API by raw.
	 *
	 * @param {string} path - The path of the request.
	 * @param {NestedArray} value - The value to request.
	 * @param {string} methodName - The method name of the request.
	 * @param {ProtocolKey} protocolType - The protocol type of the request.
	 * @param {object} [appendHeaders={}] - The headers to append to the request.
	 * @param {string} [overrideMethod="POST"] - The method of the request.
	 * @param {boolean | string} [parse=true] - Whether to parse the response.
	 * @returns {Promise<ParsedThrift>} The response.
	 *
	 * @throws {InternalError} If the request fails.
	 */
	public async rawRequest(
		path: string,
		value: NestedArray,
		methodName: string,
		protocolType: ProtocolKey,
		appendHeaders = {},
		overrideMethod = "POST",
		parse: boolean | string = true,
	): Promise<ParsedThrift> {
		if (!this.system) {
			throw new InternalError(
				"Not setup yet",
				"Please call 'login()' first",
			);
		}

		const Protocol = Protocols[protocolType];
		let headers = {
			"Host": "gw.line.naver.jp",
			"accept": "application/x-thrift",
			"user-agent": this.system.userAgent,
			"x-line-application": this.system.type,
			"content-type": "application/x-thrift",
			"x-lal": "ja_JP",
			"x-lpv": "1",
			"x-lhm": "POST",
			"accept-encoding": "gzip",
		} as Record<string, string>;

		headers = { ...headers, ...appendHeaders };

		if (this.metadata && this.metadata.authToken) {
			headers["x-line-access"] = this.metadata.authToken;
		}

		let res;
		try {
			const Trequest = writeThrift(value, methodName, Protocol);
			const response = await fetch("https://gw.line.naver.jp" + path, {
				method: overrideMethod,
				headers,
				body: Trequest,
			});
			const nextToken = response.headers.get("x-line-next-access");

			if (nextToken) {
				this.metadata = {
					authToken: nextToken,
				};

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
			throw new InternalError(
				"Request external failed",
				JSON.stringify(error),
			);
		}
		if (res && res.e) {
			throw new InternalError(
				"Request internal failed",
				JSON.stringify(res.e),
			);
		}
		return res;
	}

	private LINEService_API_PATH = "/S4";
	private LINEService_REQ_TYPE: ProtocolKey = 4;

	/**
	 * @description Get the profile of the current user.
	 *
	 * @returns {Promise<Profile>} The profile of the user.
	 */
	public async getProfile(): Promise<Profile> {
		return await this.request(
			[],
			"getProfile",
			this.LINEService_REQ_TYPE,
			"Profile",
			this.LINEService_API_PATH,
		);
	}
}
