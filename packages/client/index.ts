/**
 * @module
 * LINE SelfBot Client
 */

import * as fs from "node:fs/promises";
import { getRSACrypto } from "./lib/rsa/rsa-verify.ts";
import type { BaseStorage } from "./lib/storage/base-storage.ts";
import { MemoryStorage } from "./lib/storage/memory-storage.ts";
import {
	type NestedArray,
	type ParsedThrift,
	type ProtocolKey,
	Protocols,
} from "./lib/thrift/declares.ts";
import type * as ttype from "./lib/thrift/line_types.ts";
import ThriftRenameParser from "./lib/thrift/parser.js";
import { readThrift } from "./lib/thrift/read.js";
import { Thrift } from "./lib/thrift/thrift.ts";
import { writeThrift } from "./lib/thrift/write.js";
import { TypedEventEmitter } from "./lib/typed-event-emitter/index.ts";
import type { LogType } from "./method/log.ts";
import type { LoginOptions } from "./method/login.ts";
import type { LooseType } from "./utils/common.ts";
import { type Device, getDeviceDetails } from "./utils/device.ts";
import { InternalError } from "./utils/errors.ts";
import type { ClientEvents } from "./utils/events.ts";
import type { Metadata } from "./utils/metadata.ts";
import {
	AUTH_TOKEN_REGEX,
	EMAIL_REGEX,
	PASSWORD_REGEX,
} from "./utils/regex.ts";
import type { System } from "./utils/system.ts";
import type { User } from "./utils/user.ts";
import { defaultSquareCoverImageObsHash } from "./utils/default.ts";

interface ClientOptions {
	storage?: BaseStorage;
	endpoint?: string;
}

/**
 * @classdesc LINE SelfBot Client
 * @constructor
 */
export class Client extends TypedEventEmitter<ClientEvents> {
	/**
	 * @description Create a new LINE SelfBot Client instance
	 *
	 * @param {ClientOptions} [options] Options for the client
	 * @param {BaseStorage} [options.storage] Storage for the client
	 * @param {string} [options.endpoint] Endpoint for the client
	 */
	constructor(options: ClientOptions = {}) {
		super();
		this.parser.def = Thrift;
		const requiredOptions = {
			storage: new MemoryStorage(),
			endpoint: "https://gw.line.naver.jp",
			...options,
		};

		this.storage = requiredOptions.storage;
		this.endpoint = requiredOptions.endpoint;
	}

	public storage: BaseStorage;
	public endpoint: string;

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
	 * @description Emit log event
	 *
	 * @param {LooseType} [data] Log data
	 * @emits log
	 */
	public log(type: LogType, data: LooseType) {
		this.emit("log", {
			type,
			data,
		});
	}

	/**
	 * @description Login to LINE server with auth token or email/password
	 *
	 * @param {LoginOptions} [options] Options for login
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
			type: `${device}\t${details.appVersion}\t${details.systemName}\t${details.systemVersion}`,
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
	 * @param {string} [path]  - The path to the certificate.
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
	 * @param {string} [email] The email to login with.
	 * @param {string} [password] The password to login with.
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
		enableE2EE = false,
	): Promise<string> {
		this.log("login", {
			method: "email",
			email,
			password,
		});
		if (!this.system) {
			throw new InternalError("Not setup yet", "Please call 'login()' first");
		}

		const rsaKey = await this.getRSAKeyInfo();
		const { keynm } = rsaKey;
		const message =
			String.fromCharCode(rsaKey.sessionKey.length) +
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

		const encryptedMessage = getRSACrypto(message, rsaKey).credentials;

		const cert = (await this.getCert()) || undefined;

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
		}
		this.emit("pincall", response.pinCode);
		const headers = {
			Host: this.endpoint,
			accept: "application/x-thrift",
			"user-agent": this.system.userAgent,
			"x-line-application": this.system.type,
			"x-line-access": response.verifier,
			"x-lal": "ja_JP",
			"x-lpv": "1",
			"x-lhm": "GET",
			"accept-encoding": "gzip",
		};
		const verifier = await fetch(`https://${this.endpoint}/Q`, {
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

	private async requestLoginV2(
		keynm: string,
		encryptedMessage: string,
		deviceName: Device,
		verifier: string | undefined,
		secret: string | undefined,
		cert: string | undefined,
		calledName = "loginV2",
	): Promise<ttype.LoginResult> {
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
	 * @returns {Promise<ttype.RSAKey>} RSA key info.
	 * @throws {FetchError} If failed to fetch RSA key info.
	 */
	public async getRSAKeyInfo(provider = 0): Promise<ttype.RSAKey> {
		return await this.request(
			[[8, 2, provider]],
			"getRSAKeyInfo",
			3,
			"RSAKey",
			"/api/v3/TalkService.do",
		);
	}

	/**
	 * @description Request to LINE API.
	 *
	 * @param {NestedArray} [value] - The value to request.
	 * @param {string} [methodName] - The method name of the request.
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
		return (
			await this.rawRequest(
				path,
				[[12, 1, value]],
				methodName,
				protocolType,
				headers,
				undefined,
				parse,
			)
		).value;
	}

	/**
	 * @description Request to LINE API directly.
	 *
	 * @param {NestedArray} [value] - The value to request.
	 * @param {string} [methodName] - The method name of the request.
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
		return (
			await this.rawRequest(
				path,
				value,
				methodName,
				protocolType,
				headers,
				undefined,
				parse,
			)
		).value;
	}

	/**
	 * @description Request to LINE API by raw.
	 *
	 * @param {string} [path] - The path of the request.
	 * @param {NestedArray} [value] - The value to request.
	 * @param {string} [methodName] - The method name of the request.
	 * @param {ProtocolKey} [protocolType] - The protocol type of the request.
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
			throw new InternalError("Not setup yet", "Please call 'login()' first");
		}

		const Protocol = Protocols[protocolType];
		let headers = {
			Host: this.endpoint,
			accept: "application/x-thrift",
			"user-agent": this.system.userAgent,
			"x-line-application": this.system.type,
			"content-type": "application/x-thrift",
			"x-lal": "ja_JP",
			"x-lpv": "1",
			"x-lhm": "POST",
			"accept-encoding": "gzip",
		} as Record<string, string>;

		headers = { ...headers, ...appendHeaders };

		if (this.metadata?.authToken) {
			headers["x-line-access"] = this.metadata.authToken;
		}

		let res;
		try {
			const Trequest = writeThrift(value, methodName, Protocol);

			this.log("request", {
				method: "thrift",
				thriftMethodName: methodName,
				httpMethod: overrideMethod,
				protocolType,
				value,
				requestPath: path,
				data: Trequest,
				headers,
			});

			const response = await fetch(this.endpoint + path, {
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

			this.log("response", {
				method: "thrift",
				response,
				data: parsedBody,
				parsedData: res,
			});
		} catch (error) {
			throw new InternalError("Request external failed", error.stack);
		}
		if (res?.e) {
			throw new InternalError("Request internal failed", JSON.stringify(res.e));
		}
		return res;
	}

	private LINEService_API_PATH = "/S4";
	private LINEService_PROTOCOL_TYPE: ProtocolKey = 4;
	private SquareService_API_PATH = "/SQ1";
	private SquareService_PROTOCOL_TYPE: ProtocolKey = 4;

	/**
	 * @description Get the profile of the current user.
	 *
	 * @returns {Promise<ttype.Profile>} The profile of the user.
	 */
	public async getProfile(): Promise<ttype.Profile> {
		return await this.request(
			[],
			"getProfile",
			this.LINEService_PROTOCOL_TYPE,
			"Profile",
			this.LINEService_API_PATH,
		);
	}

	public async getJoinedSquares(
		limit = 100,
		continuationToken: string,
	): Promise<ttype.GetJoinedSquaresResponse> {
		return await this.request(
			[
				[11, 2, continuationToken],
				[8, 3, limit],
			],
			"getJoinedSquares",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async inviteIntoSquareChat(
		inviteeMids: string[],
		squareChatMid: string,
	): Promise<ttype.InviteIntoSquareChatResponse> {
		return await this.request(
			[
				[15, 1, [11, inviteeMids]],
				[11, 2, squareChatMid],
			],
			"inviteIntoSquareChat",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async inviteToSquare(
		squareMid: string,
		invitees: string[],
		squareChatMid: string,
	): Promise<ttype.InviteToSquareResponse> {
		return await this.request(
			[
				[11, 2, squareMid],
				[15, 3, [11, invitees]],
				[11, 4, squareChatMid],
			],
			"inviteToSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async markAsRead(
		squareChatMid: string,
		messageId: string,
	): Promise<ttype.MarkAsReadResponse> {
		return await this.request(
			[
				[11, 2, squareChatMid],
				[11, 4, messageId],
			],
			"markAsRead",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async reactToMessage(
		squareChatMid: string,
		messageId: string,
		reactionType: ttype.MessageReactionType = 2,
	): Promise<ttype.ReactToMessageResponse> {
		return await this.request(
			[
				[8, 1, 0],
				[11, 2, squareChatMid],
				[11, 3, messageId],
				[8, 4, reactionType],
			],
			"reactToMessage",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async findSquareByInvitationTicket(
		invitationTicket: string,
	): Promise<ttype.FindSquareByInvitationTicketResponse> {
		return await this.request(
			[[11, 2, invitationTicket]],
			"findSquareByInvitationTicket",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async fetchMyEvents(
		syncToken: string | undefined = undefined,
		limit = 100,
		continuationToken: string | undefined = undefined,
		subscriptionId = 0,
	): Promise<ttype.FetchMyEventsResponse> {
		return await this.request(
			[
				[10, 1, subscriptionId],
				[11, 2, syncToken],
				[8, 3, limit],
				[11, 4, continuationToken],
			],
			"fetchMyEvents",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async fetchSquareChatEvents(
		squareChatMid: string,
		syncToken: string | undefined = undefined,
		continuationToken: string | undefined = undefined,
		subscriptionId = 0,
		limit = 100,
	): Promise<ttype.FetchSquareChatEventsResponse> {
		return await this.request(
			[
				[10, 1, subscriptionId],
				[11, 2, squareChatMid],
				[11, 3, syncToken],
				[8, 4, limit],
				[8, 5, 1],
				[8, 6, 1],
				[11, 7, continuationToken],
				[8, 8, 1],
			],
			"fetchSquareChatEvents",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async sendSquareMessage(
		squareChatMid: string,
		text: string | undefined,
		contentType: ttype.ContentType = 0,
		contentMetadata: LooseType = {},
		relatedMessageId: string | undefined = undefined,
	): Promise<ttype.SendMessageResponse> {
		const msg = [
			[11, 2, squareChatMid],
			[11, 10, text],
			[8, 15, contentType],
			[13, 18, [11, 11, contentMetadata]],
		];
		if (relatedMessageId) {
			msg.push([11, 21, relatedMessageId], [8, 22, 3], [8, 24, 2]);
		}
		return await this.request(
			[
				[8, 1, 0],
				[11, 2, squareChatMid],
				[
					12,
					3,
					[
						[12, 1, msg],
						[8, 3, 4],
					],
				],
			],
			"sendMessage",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getSquare(squareMid: string): Promise<ttype.GetSquareResponse> {
		return await this.request(
			[[11, 2, squareMid]],
			"getSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getSquareChat(
		squareChatMid: string,
	): Promise<ttype.GetSquareChatResponse> {
		return await this.request(
			[[11, 1, squareChatMid]],
			"getSquareChat",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getJoinableSquareChats(
		squareMid: string,
		continuationToken: string | undefined = undefined,
		limit = 100,
	): Promise<ttype.GetJoinableSquareChatsResponse> {
		return await this.request(
			[
				[11, 1, squareMid],
				[11, 10, continuationToken],
				[8, 11, limit],
			],
			"getJoinableSquareChats",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async createSquare(
		name: string,
		displayName: string,
		profileImageObsHash = defaultSquareCoverImageObsHash,
		description = "",
		searchable = true,
		SquareJoinMethodType: ttype.SquareJoinMethodType = 0,
	): Promise<ttype.CreateSquareResponse> {
		return await this.request(
			[
				[8, 2, 0],
				[
					12,
					2,
					[
						[11, 2, name],
						[11, 4, profileImageObsHash],
						[11, 5, description],
						[2, 6, searchable],
						[8, 7, 1], // type
						[8, 8, 1], // categoryId
						[10, 10, 0], // revision
						[2, 11, true], // ableToUseInvitationTicket
						[12, 14, [[8, 1, SquareJoinMethodType]]],
						[2, 15, false], // adultOnly
						[15, 16, [11, []]], // svcTags
					],
				],
				[
					12,
					3,
					[
						[11, 3, displayName],
						// [11, 4, profileImageObsHash],
						[2, 5, true], // ableToReceiveMessage
						[10, 9, 0], // revision
					],
				],
			],
			"createSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getSquareChatAnnouncements(
		squareChatMid: string,
	): Promise<ttype.GetSquareChatAnnouncementsResponse> {
		return await this.request(
			[[11, 2, squareChatMid]],
			"getSquareChatAnnouncements",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async updateSquareFeatureSet(
		updateAttributes: ttype.SquareFeatureSetAttribute[],
		squareMid: string,
		revision: number,
		creatingSecretSquareChat = 0,
	): Promise<ttype.UpdateSquareFeatureSetResponse> {
		const SquareFeatureSet: NestedArray = [
			[11, 1, squareMid],
			[10, 2, revision],
		];
		if (creatingSecretSquareChat) {
			SquareFeatureSet.push([
				12,
				11,
				[
					[8, 1, 1],
					[8, 2, creatingSecretSquareChat],
				],
			]);
		}
		return await this.request(
			[
				[14, 2, [8, updateAttributes]],
				[12, 3, SquareFeatureSet],
			],
			"updateSquareFeatureSet",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async joinSquare(
		squareMid: string,
		displayName: string,
		ableToReceiveMessage = false,
		passCode: string | undefined = undefined,
	): Promise<ttype.JoinSquareResponse> {
		return await this.request(
			[
				[11, 2, squareMid],
				[
					12,
					3,
					[
						[11, 2, squareMid],
						[11, 3, displayName],
						[2, 5, ableToReceiveMessage],
						[10, 9, 0],
					],
				],
				[12, 5, [[12, 2, [[11, 1, passCode]]]]],
			],
			"joinSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async removeSubscriptions(
		subscriptionIds: number[] = [],
	): Promise<ttype.RemoveSubscriptionsResponse> {
		return await this.request(
			[[15, 2, [10, subscriptionIds]]],
			"removeSubscriptions",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async unsendSquareMessage(
		squareChatMid: string,
		messageId: string,
	): Promise<ttype.UnsendMessageResponse> {
		return await this.request(
			[
				[11, 2, squareChatMid],
				[11, 3, messageId],
			],
			"unsendMessage",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async createSquareChat(
		squareChatMid: string,
		name: string,
		chatImageObsHash = defaultSquareCoverImageObsHash,
		squareChatType: ttype.SquareChatType = 1,
		maxMemberCount = 5000,
		ableToSearchMessage: ttype.BooleanState = 1,
		squareMemberMids = [],
	): Promise<ttype.CreateSquareChatResponse> {
		return await this.request(
			[
				[8, 1, 0],
				[
					12,
					2,
					[
						[11, 1, squareChatMid],
						[8, 3, squareChatType],
						[11, 4, name],
						[11, 5, chatImageObsHash],
						[8, 7, maxMemberCount],
						[8, 11, ableToSearchMessage],
					],
				],
				[15, 3, [11, squareMemberMids]],
			],
			"createSquareChat",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getSquareChatMembers(
		squareChatMid: string,
		continuationToken: string | undefined = undefined,
		limit = 200,
	): Promise<ttype.GetSquareChatMembersResponse> {
		const req = [
			[11, 1, squareChatMid],
			[8, 3, limit],
		];
		if (continuationToken) {
			req.push([11, 2, continuationToken]);
		}
		return await this.request(
			req,
			"getSquareChatMembers",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getSquareFeatureSet(
		squareMid: string,
	): Promise<ttype.GetSquareFeatureSetResponse> {
		return await this.request(
			[[11, 2, squareMid]],
			"getSquareFeatureSet",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getSquareInvitationTicketUrl(
		mid: string,
	): Promise<ttype.GetInvitationTicketUrlResponse> {
		return await this.request(
			[[11, 2, mid]],
			"getInvitationTicketUrl",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async updateSquareChatMember(
		squareMemberMid: string,
		squareChatMid: string,
		notificationForMessage = true,
		notificationForNewMember = true,
		updatedAttrs: ttype.SquareChatMemberAttribute[] = [6],
	): Promise<ttype.UpdateSquareChatMemberResponse> {
		return await this.request(
			[
				[14, 2, [8, updatedAttrs]],
				[
					12,
					3,
					[
						[11, 1, squareMemberMid],
						[11, 2, squareChatMid],
						[2, 5, notificationForMessage],
						[2, 6, notificationForNewMember],
					],
				],
			],
			"updateSquareChatMember",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async updateSquareMember(
		squareMemberMid: string,
		squareMid: string,
		revision: number,
		displayName: string | undefined,
		membershipState: ttype.SquareMembershipState | undefined,
		role: ttype.SquareMemberRole | undefined,
		updatedAttrs: ttype.SquareMemberAttribute[] = [],
		updatedPreferenceAttrs: number[] = [],
	): Promise<ttype.UpdateSquareMemberResponse> {
		const squareMember: NestedArray = [
			[11, 1, squareMemberMid],
			[11, 2, squareMid],
		];
		if (updatedAttrs.includes(1)) {
			squareMember.push([11, 3, displayName]);
		}
		if (updatedAttrs.includes(5)) {
			squareMember.push([8, 7, membershipState]);
		}
		if (updatedAttrs.includes(6)) {
			squareMember.push([8, 8, role]);
		}
		squareMember.push([10, 9, revision]);
		return await this.request(
			[
				[14, 2, [8, updatedAttrs]],
				[14, 3, [8, updatedPreferenceAttrs]],
				[12, 4, squareMember],
			],
			"updateSquareMember",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async kickOutSquareMember(
		squareMid: string,
		squareMemberMid: string,
		allowRejoin = true,
	): Promise<ttype.UpdateSquareMemberResponse> {
		const UPDATE_PREF_ATTRS: number[] = [];
		const UPDATE_ATTRS = [5];
		const MEMBERSHIP_STATE = allowRejoin ? 5 : 6;
		const getSquareMemberResp = await this.getSquareMember(squareMemberMid);
		const squareMember = getSquareMemberResp.squareMember;
		const squareMemberRevision = squareMember.revision;
		return await this.updateSquareMember(
			squareMemberMid,
			squareMid,
			squareMemberRevision,
			undefined,
			MEMBERSHIP_STATE,
			undefined,
			UPDATE_ATTRS,
			UPDATE_PREF_ATTRS,
		);
	}

	public async checkSquareJoinCode(
		squareMid: string,
		code: string,
	): Promise<LooseType> {
		return await this.request(
			[
				[11, 2, squareMid],
				[11, 3, code],
			],
			"checkJoinCode",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async createSquareChatAnnouncement(
		squareChatMid: string,
		messageId: string,
		text: string,
		senderSquareMemberMid: string,
		createdAt: number,
		announcementType = 0,
	): Promise<ttype.CreateSquareChatAnnouncementResponse> {
		return await this.request(
			[
				[8, 1, 0],
				[11, 2, squareChatMid],
				[
					12,
					3,
					[
						[8, 2, announcementType],
						[
							12,
							3,
							[
								[
									12,
									1,
									[
										[11, 1, messageId],
										[11, 2, text],
										[11, 3, senderSquareMemberMid],
										[10, 4, createdAt],
									],
								],
							],
						],
					],
				],
			],
			"createSquareChatAnnouncement",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getSquareMember(
		squareMemberMid: string,
	): Promise<ttype.GetSquareMemberResponse> {
		return await this.request(
			[[11, 2, squareMemberMid]],
			"getSquareMember",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async searchSquareChatMembers(
		squareChatMid: string,
		displayName = "",
		continuationToken: string | undefined = undefined,
		limit = 20,
	): Promise<LooseType> {
		const req = [
			[11, 1, squareChatMid],
			[12, 2, [[11, 1, displayName]]],
			[8, 4, limit],
			[11, 3, continuationToken],
		];
		return await this.request(
			[[12, 1, req]],
			"searchSquareChatMembers",
			this.SquareService_PROTOCOL_TYPE,
			false,
			this.SquareService_API_PATH,
		);
	}

	public async getSquareEmid(
		squareMid: string,
	): Promise<ttype.GetSquareEmidResponse> {
		return await this.request(
			[[11, 1, squareMid]],
			"getSquareEmid",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getSquareMembersBySquare(
		squareMid: string,
		squareMemberMids: Array<string> = [],
	): Promise<ttype.GetSquareMembersBySquareResponse> {
		return await this.request(
			[
				[11, 2, squareMid],
				[14, 3, [11, squareMemberMids]],
			],
			"getSquareMembersBySquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async manualRepair(
		syncToken: string | undefined = undefined,
		limit = 100,
		continuationToken: string | undefined = undefined,
	): Promise<ttype.ManualRepairResponse> {
		return await this.request(
			[
				[11, 1, syncToken],
				[8, 2, limit],
				[11, 3, continuationToken],
			],
			"manualRepair",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async leaveSquare(
		squareMid: string,
	): Promise<ttype.LeaveSquareResponse> {
		return await this.request(
			[[11, 2, squareMid]],
			"leaveSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async reportSquare(
		squareMid: string,
		reportType: ttype.ReportType,
		otherReason: string | undefined = undefined,
	): Promise<ttype.ReportSquareResponse> {
		return await this.request(
			[
				[11, 2, squareMid],
				[10, 3, reportType],
				[11, 4, otherReason],
			],
			"reportSquare",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}
	public async sendSquareRequestByName(
		METHOD_NAME: string,
		params: NestedArray,
	): Promise<Map<string, LooseType>> {
		return await this.request(
			params,
			METHOD_NAME,
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async getFetchMyEventsNowSyncToken(): Promise<string> {
		return (await this.manualRepair(undefined, 1)).continuationToken;
	}

	public async fetchSquareThreadEvents(
		squareChatMid: string,
		squareThreadMid: string,
		syncToken: string | undefined = undefined,
		continuationToken: string | undefined = undefined,
		subscriptionId = 0,
		limit = 100,
	): Promise<ttype.FetchSquareChatEventsResponse> {
		return await this.request(
			[
				[10, 1, subscriptionId],
				[11, 2, squareChatMid],
				[11, 3, syncToken],
				[8, 4, limit],
				[8, 5, 1],
				[8, 6, 1],
				[11, 7, continuationToken],
				[11, 9, squareThreadMid],
			],
			"fetchSquareChatEvents",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}

	public async sendSquareThreadMessage(
		from: string,
		squareThreadMid: string,
		text: string | undefined,
		contentType: ttype.ContentType = 0,
		contentMetadata: LooseType = {},
		relatedMessageId: string | undefined = undefined,
	): Promise<ttype.SendMessageResponse> {
		const msg = [
			[11, 1, from],
			[11, 2, squareThreadMid],
			[8, 3, 7],
			[11, 10, text],
			[2, 14, false],
			[8, 15, contentType],
			[3, 19, null],
			[15, 27, [12, []]],
		];
		if (relatedMessageId) {
			msg.push([11, 21, relatedMessageId], [8, 22, 3], [8, 24, 2]);
		}
		return await this.request(
			[
				[12, 1, msg],
				[8, 3, 5],
				[10, 4, 1],
				[8, 5, 1],
				[
					12,
					6,
					[
						[11, 1, squareThreadMid],
						[2, 2, false],
					],
				],
			],
			"sendMessage",
			this.SquareService_PROTOCOL_TYPE,
			true,
			this.SquareService_API_PATH,
		);
	}
}
