// For Base (login, request, line, relation, etc)

import { getRSACrypto } from "../libs/rsa/rsa-verify.ts";
import type { BaseStorage } from "../libs/storage/base-storage.ts";
import { MemoryStorage } from "../libs/storage/memory-storage.ts";
import { CacheManager } from "../libs/storage/cache-manager.ts";
import {
	type NestedArray,
	type ParsedThrift,
	type ProtocolKey,
	Protocols,
} from "../libs/thrift/declares.ts";
import * as LINETypes from "@evex/linejs-types";
import ThriftRenameParser from "../libs/thrift/parser.ts";
import { readThrift } from "../libs/thrift/read.ts";
import { Thrift } from "@evex/linejs-types/thrift";
import { writeThrift } from "../libs/thrift/write.ts";
import { TypedEventEmitter } from "../libs/typed-event-emitter/index.ts";
import type { LogType } from "../entities/log.ts";
import type { LoginOptions } from "../entities/login.ts";
import type { LooseType } from "../entities/common.ts";
import { type Device, getDeviceDetails } from "../entities/device.ts";
import { InternalError } from "../entities/errors.ts";
import type { ClientEvents } from "../entities/events.ts";
import type { Metadata } from "../entities/metadata.ts";
import {
	AUTH_TOKEN_REGEX,
	EMAIL_REGEX,
	PASSWORD_REGEX,
	PRIMARY_TOKEN_REGEX,
} from "../entities/regex.ts";
import type { System } from "../entities/system.ts";
import { Buffer } from "node:buffer";
import type {
	MessageReplyOptions,
	SquareMessageReactionOptions,
	SquareMessageSendOptions,
} from "../entities/message.ts";
import { LINE_OBS } from "../../utils/obs/index.ts";
import { RateLimitter } from "../libs/rate-limitter/index.ts";
import type { FetchLike } from "../entities/fetch.ts";
import { MimeType } from "../entities/mime.ts";

interface ClientOptions {
	storage?: BaseStorage;
	squareRateLimitter?: RateLimitter;
	endpoint?: string;
	customFetch?: FetchLike;
	LINE_OBS?: LINE_OBS;
	cacheManager?: CacheManager;
}

export class BaseClient extends TypedEventEmitter<ClientEvents> {
	/**
	 * @description Create a new LINE SelfBot Client instance
	 *
	 * @param {ClientOptions} [options] Options for the client
	 * @param {BaseStorage} [options.storage] Storage for the client
	 * @param {RateLimitter} [options.squareRateLimitter] Square rate limitter for the client
	 * @param {string} [options.endpoint] Endpoint for the client
	 * @param {FetchLike} [options.customFetch] Custom fetch for the client
	 * @param {string} [options.LINE_OBS] Endpoint for the obs
	 * @param {CacheManager} [options.cacheManager] Cache manager for the client
	 */
	constructor(options: ClientOptions = {}) {
		super();
		this.parser.def = Thrift;

		this.storage = options.storage || new MemoryStorage();
		this.squareRateLimitter = options.squareRateLimitter || new RateLimitter();
		this.endpoint = options.endpoint || "gw.line.naver.jp";
		this.customFetch = options.customFetch || fetch;
		this.LINE_OBS = options.LINE_OBS || new LINE_OBS();
		this.cache = options.cacheManager || new CacheManager(this.storage);
		this.squareRateLimitter.callPolling();
		this.reqseqs =
			JSON.parse((this.storage.get("reqseq") as string) || "{}") || {};
	}

	/**
	 * @description the storage of client
	 */
	public storage: BaseStorage;

	/**
	 * @description the square rate limitter of client
	 */
	public squareRateLimitter: RateLimitter;

	/**
	 * @description the endpoint of LINE Gateway of client
	 */
	public endpoint: string;

	/**
	 * @description the custom fetch of client (for CORS, PROXY)
	 */
	public customFetch: FetchLike;

	/**
	 * @description the LINE OBS of client
	 */
	public LINE_OBS: LINE_OBS;

	public cache: CacheManager;

	/**
	 * @description THe information of user
	 */
	public user: LINETypes.Profile | undefined;
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
	 * @param {LogType} type Log type
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
		}
		const device: Device =
			options.device ||
			(options.authToken
				? PRIMARY_TOKEN_REGEX.test(options.authToken)
					? "ANDROID"
					: "IOSIPAD"
				: "IOSIPAD");
		const details = await getDeviceDetails(device, options.deviceMap || {});

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
			if (!options.email || !options.password || options.qr) {
				if (options.v3) {
					authToken = await this.requestSQR2();
				} else {
					authToken = await this.requestSQR();
				}
			} else {
				if (options.v3) {
					authToken = await this.requestEmailLoginV2(
						options.email,
						options.password,
						options.pincode,
					);
				} else {
					authToken = await this.requestEmailLogin(
						options.email,
						options.password,
						options.e2ee || true,
						options.pincode,
					);
				}
			}
		}

		this.metadata = {
			authToken,
		};

		this.emit("update:authtoken", authToken);

		this.emit("ready", await this.refreshProfile(true));

		const polling = options.polling || ["talk", "square"];
		const pollingIn: Promise<void>[] = [];
		if (polling.includes("square")) {
			pollingIn.push(this.pollingSquareEvents());
		}
		if (polling.includes("talk")) {
			pollingIn.push(this.pollingTalkEvents());
		}
		await Promise.all(pollingIn);
	}

	protected IS_POLLING_SQUARE = false;
	protected IS_POLLING_TALK = false;

	public async pollingSquareEvents() {
		if (this.IS_POLLING_SQUARE) {
			return;
		}

		this.IS_POLLING_SQUARE = true;

		let noopMyEvents: LINETypes.FetchMyEventsResponse | undefined;
		try {
			noopMyEvents = await this.fetchMyEvents();
		} catch (_e) {
			this.IS_POLLING_SQUARE = false;
			return;
		}

		let myEventsSyncToken = noopMyEvents.syncToken;
		let previousMessageId: string | undefined = undefined;

		while (true) {
			if (!this.metadata) {
				this.IS_POLLING_SQUARE = false;
				return;
			}

			const myEvents = await this.fetchMyEvents({
				syncToken: myEventsSyncToken,
			});

			if (myEvents.syncToken !== myEventsSyncToken) {
				for (const event of myEvents.events) {
					this.emit("square:event", event);

					if (event.type === LINETypes.SquareEventType._NOTIFICATION_MESSAGE) {
						const payload = event.payload.notificationMessage;

						if (!payload) {
							continue;
						}

						const message = payload.squareMessage.message;

						if (previousMessageId === message.id) {
							continue;
						}

						previousMessageId = message.id;

						const send = async (
							options: SquareMessageSendOptions,
							safe: boolean = true,
						) => {
							if (typeof options === "string") {
								return await this.sendSquareMessage(
									{
										squareChatMid: message.to,
										text: options,
										relatedMessageId: undefined,
									},
									safe,
								);
							} else {
								return await this.sendSquareMessage(
									{
										squareChatMid: message.to,
										relatedMessageId: undefined,
										...options,
									},
									safe,
								);
							}
						};

						const reply = async (
							options: MessageReplyOptions,
							safe: boolean = true,
						) => {
							if (typeof options === "string") {
								return await this.sendSquareMessage(
									{
										squareChatMid: message.to,
										text: options,
										relatedMessageId: message.id,
									},
									safe,
								);
							} else {
								return await this.sendSquareMessage(
									{
										squareChatMid: message.to,
										relatedMessageId: message.id,
										...options,
									},
									safe,
								);
							}
						};

						const react = async (options: SquareMessageReactionOptions) => {
							if (typeof options === "number") {
								return await this.reactToSquareMessage({
									squareChatMid: payload.squareChatMid,
									reactionType: options as LINETypes.MessageReactionType,
									squareMessageId: message.id,
								});
							} else {
								return await this.reactToSquareMessage({
									squareChatMid: payload.squareChatMid,
									reactionType: (
										options as Exclude<
											SquareMessageReactionOptions,
											LINETypes.MessageReactionType
										>
									).reactionType,
									squareMessageId: message.id,
								});
							}
						};

						const getMyProfile = async () =>
							await this.getSquareProfile({
								squareMid: (
									await this.getSquareChat({
										squareChatMid: message.to,
									})
								).squareChat.squareMid,
							});

						this.emit("square:message", {
							...payload,
							type: "square",
							content: typeof message.text === "string" ? message.text : "",
							contentMetadata: message.contentMetadata,
							contentType: message.contentType,
							messageId: message.id,
							replyId: message.relatedMessageId,
							reply,
							send,
							react,
							author: {
								mid: message._from,
								get displayName() {
									return (
										payload.senderDisplayName ||
										getMyProfile().then((myProfile) => myProfile.displayName)
									);
								},
								iconImage: this.LINE_OBS.getSquareMemberImage(message._from),
							},
							isMyMessage: async () =>
								(await getMyProfile()).squareMemberMid === message._from,
							getProfile: async () =>
								(
									await this.getSquareMember({
										squareMemberMid: message._from,
									})
								).squareMember,
							getMyProfile,
							square: async () =>
								await this.getSquareChat({
									squareChatMid: payload.squareChatMid,
								}),
							data:
								this.hasData(message) &&
								(async (preview) =>
									await this.getMessageObsData(message.id, preview)),
							message,
						});
					} else if (
						event.type ===
						LINETypes.SquareEventType._NOTIFIED_UPDATE_SQUARE_CHAT_STATUS
					) {
						const payload = event.payload.notifiedUpdateSquareChatStatus;

						if (!payload) {
							continue;
						}

						this.emit("square:status", {
							...payload,
							...payload["statusWithoutMessage"],
						});
					}
				}
				myEventsSyncToken = myEvents.syncToken;
			}

			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	public revision: number = 0;

	public async pollingTalkEvents() {
		if (this.IS_POLLING_TALK) {
			return;
		}

		this.IS_POLLING_TALK = true;

		const noopEvents = await this.sync();
		let revision = this.revision || noopEvents.fullSyncResponse.nextRevision;
		let globalRev: number | undefined, individualRev: number | undefined;
		while (true) {
			if (!this.metadata) {
				this.IS_POLLING_TALK = false;
				return;
			}
			try {
				const myEvents = await this.sync({
					revision: revision as number,
					globalRev,
					individualRev,
				});

				for (const operation of myEvents.operationResponse?.operations) {
					revision = operation.revision;
					if (
						operation.type === LINETypes.OpType._RECEIVE_MESSAGE ||
						operation.type === LINETypes.OpType._SEND_MESSAGE ||
						operation.type === LINETypes.OpType._SEND_CONTENT
					) {
						const message = await this.decryptE2EEMessage(operation.message);
						if (
							this.hasData(message) &&
							operation.type == LINETypes.OpType._SEND_MESSAGE
						) {
							//continue;
						}
						let sendIn = "";
						if (message.toType === LINETypes.MIDType._USER) {
							if (message._from === this.user?.mid) {
								sendIn = message.to;
							} else {
								sendIn = message._from;
							}
						} else {
							sendIn = message.to;
						}
						const send = async (options: SquareMessageSendOptions) => {
							if (typeof options === "string") {
								return await this.sendMessage({
									to: sendIn,
									text: options,
									relatedMessageId: undefined,
								});
							} else {
								return await this.sendMessage({
									to: sendIn,
									relatedMessageId: undefined,
									...options,
								});
							}
						};

						const reply = async (options: MessageReplyOptions) => {
							if (typeof options === "string") {
								return await this.sendMessage({
									to: sendIn,
									text: options,
									relatedMessageId: message.id,
								});
							} else {
								return await this.sendMessage({
									to: sendIn,
									relatedMessageId: message.id,
									...options,
								});
							}
						};

						const react = async (options: SquareMessageReactionOptions) => {
							if (typeof options === "number") {
								return await this.reactToMessage({
									reactionType: options as LINETypes.MessageReactionType,
									messageId: message.id,
								});
							} else {
								return await this.reactToMessage({
									reactionType: (
										options as Exclude<
											SquareMessageReactionOptions,
											LINETypes.MessageReactionType
										>
									).reactionType,
									messageId: message.id,
								});
							}
						};

						const chat =
							message.toType === LINETypes.MIDType._USER
								? async () => {
										return await this.getContact({ mid: sendIn });
									}
								: undefined;

						const group =
							message.toType !== LINETypes.MIDType._USER
								? async () => {
										return (await this.getChats({ mids: [sendIn] })).chats[0];
									}
								: (undefined as LooseType);

						const getContact = async () => {
							return await this.getContact({ mid: message._from });
						};

						const getMyProfile = async () => {
							return await this.refreshProfile(true);
						};

						this.emit("message", {
							...operation,
							type: (message.toType === LINETypes.MIDType._USER
								? "chat"
								: "group") as LooseType,
							opType: operation.type,
							content: typeof message.text === "string" ? message.text : "",
							contentMetadata: message.contentMetadata,
							contentType: message.contentType,
							messageId: message.id,
							replyId: message.relatedMessageId,
							reply,
							send,
							react,
							author: {
								mid: message._from,
								get displayName() {
									return getContact().then((contact) => contact.displayName);
								},
								iconImage: this.LINE_OBS.getProfileImage(message._from),
							},
							isMyMessage: async () =>
								(await getMyProfile()).mid === message._from,
							getContact,
							getMyProfile,
							chat,
							group,
							data:
								this.hasData(message) &&
								(async (preview) =>
									await this.getMessageObsData(message.id, preview)),
							message,
						});
					}
					this.emit("event", operation);
				}
				globalRev =
					(myEvents.operationResponse?.globalEvents?.lastRevision as number) ||
					globalRev;
				individualRev =
					(myEvents.operationResponse?.individualEvents
						?.lastRevision as number) || individualRev;
				revision = myEvents.fullSyncResponse?.nextRevision || revision;
			} catch {
				/* Do Nothing */
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	/**
	 * @description Check the message have obs data
	 */
	public hasData(message: LINETypes.Message): true | undefined {
		return ["IMAGE", "VIDEO", "AUDIO", "FILE"].find(
			(e) => e === message.contentType,
		)
			? true
			: undefined;
	}

	/**
	 * @description Will override.
	 */
	public async sync(
		_options: {
			limit?: number;
			revision?: number;
			globalRev?: number;
			individualRev?: number;
		} = {},
	): Promise<LINETypes.SyncResponse> {
		return (await Symbol("Unreachable")) as LooseType;
	}

	/**
	 * @description Will override.
	 */
	public async sendMessage(_options: {
		to: string;
		text?: string;
		contentType?: LINETypes.ContentType;
		contentMetadata?: LooseType;
		relatedMessageId?: string;
		location?: LINETypes.Location;
		chunk?: string[] | Buffer[];
		e2ee?: boolean;
	}): Promise<LINETypes.Message> {
		return (await Symbol("Unreachable")) as LooseType;
	}

	/**
	 * @description Will override.
	 */
	public async decryptE2EEMessage(
		_messageObj: LINETypes.Message,
	): Promise<LINETypes.Message> {
		return (await Symbol("Unreachable")) as LooseType;
	}

	/**
	 * @description Will override.
	 */
	public async reactToMessage(_options: {
		messageId: string;
		reactionType: LINETypes.MessageReactionType;
	}): Promise<LINETypes.ReactToMessageResponse> {
		return (await Symbol("Unreachable")) as LooseType;
	}

	/**
	 * @description Will override.
	 */
	public async getContact(_options: LooseType): Promise<LINETypes.Contact> {
		return (await Symbol("Unreachable")) as LooseType;
	}

	/**
	 * @description Will override.
	 */
	public async getChats(
		_options: LooseType,
	): Promise<LINETypes.GetChatsResponse> {
		return (await Symbol("Unreachable")) as LooseType;
	}

	/**
	 * @description Will override.
	 */
	public async fetchMyEvents(
		_options: {
			limit?: number;
			syncToken?: string;
			continuationToken?: string;
			subscriptionId?: number;
		} = {},
	): Promise<LINETypes.FetchMyEventsResponse> {
		return (await Symbol("Unreachable")) as LooseType;
	}

	/**
	 * @description Will override.
	 */
	public async getSquareMember(_options: {
		squareMemberMid: string;
	}): Promise<LINETypes.GetSquareMemberResponse> {
		return (await Symbol("Unreachable")) as LooseType;
	}

	/**
	 * @description Will override.
	 */
	public async getSquareProfile(_options: {
		squareMid: string;
	}): Promise<LINETypes.SquareMember> {
		return (await Symbol("Unreachable")) as LooseType;
	}

	/**
	 * @description Will override.
	 */
	public async getSquareChat(_options: {
		squareChatMid: string;
	}): Promise<LINETypes.GetSquareChatResponse> {
		return (await Symbol("Unreachable")) as LooseType;
	}

	/**
	 * @description Will override.
	 */
	public async sendSquareMessage(
		_options: {
			squareChatMid: string;
			text?: string;
			contentType?: LINETypes.ContentType;
			contentMetadata?: LooseType;
			relatedMessageId?: string;
		},
		_safe = true,
	): Promise<LINETypes.SendMessageResponse> {
		return (await Symbol("Unreachable")) as LooseType;
	}

	public async reactToSquareMessage(_options: {
		squareChatMid: string;
		reactionType?: LINETypes.MessageReactionType;
		squareMessageId: string;
		squareThreadMid?: string;
	}): Promise<LINETypes.ReactToMessageResponse> {
		return (await Symbol("Unreachable")) as LooseType;
	}

	protected parser: ThriftRenameParser = new ThriftRenameParser();
	private cert: string | null = null;
	private qrCert: string | null = null;

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
	 * @description Registers a certificate to be used for login.
	 *
	 * @param {string | null} qrCert - The certificate to register. If null, the certificate will be cleared.
	 */
	public registerQrCert(qrCert: string | null): void {
		this.qrCert = qrCert;
	}

	/**
	 * @description Reads the certificate from the registered path, if it exists.
	 *
	 * @return {Promise<string | null>} The certificate, or null if it does not exist or an error occurred.
	 */
	public getQrCert(): string | null {
		return this.qrCert;
	}

	/**
	 * @description Login to LINE server with email and password.
	 *
	 * @param {string} [email] The email to login with.
	 * @param {string} [password] The password to login with.
	 * @param {boolean} [enableE2EE=false] Enable E2EE or not.
	 * @param {string} [constantPincode="114514"] The constant pincode.
	 * @returns {Promise<string>} The auth token.
	 * @throws {InternalError} If the system is not setup yet.
	 * @throws {InternalError} If the login type is not supported.
	 * @throws {InternalError} If the constant pincode is not valid.
	 * @emits pincall
	 * @emits update:cert
	 */
	public async requestEmailLogin(
		email: string,
		password: string,
		enableE2EE: boolean = false,
		constantPincode: string = "114514",
	): Promise<string> {
		if (constantPincode.length !== 6) {
			throw new InternalError(
				"Invalid constant pincode",
				"The constant pincode should be 6 digits",
			);
		}

		this.log("login", {
			method: "email",
			email,
			password,
			enableE2EE,
			constantPincode,
		});

		if (!this.system) {
			throw new InternalError("Not setup yet", "Please call 'login()' first");
		}

		const rsaKey = await this.getRSAKeyInfo();
		const { keynm, sessionKey } = rsaKey;

		const message =
			String.fromCharCode(sessionKey.length) +
			sessionKey +
			String.fromCharCode(email.length) +
			email +
			String.fromCharCode(password.length) +
			password;

		let e2eeData: Buffer | undefined,
			secret: Uint8Array | undefined,
			secretPK: string | undefined;

		if (enableE2EE) {
			[secret, secretPK] = this.createSqrSecret(true);
			e2eeData = this.encryptAESECB(
				this.getSHA256Sum(constantPincode),
				Buffer.from(secretPK, "base64"),
			);
		}

		const encryptedMessage = getRSACrypto(message, rsaKey).credentials;

		const cert = this.getCert() || undefined;

		let response = await this.loginV2(
			keynm,
			encryptedMessage,
			this.system?.device,
			undefined,
			e2eeData,
			cert,
			"loginZ",
		);

		if (!response.authToken) {
			this.emit("pincall", response.pinCode || constantPincode);
			if (enableE2EE && secret) {
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
				const e2eeInfo = (
					await this.customFetch(`https://${this.endpoint}/LF1`, {
						headers: headers,
					}).then((res) => res.json())
				).result;
				this.log("response", e2eeInfo);
				this.decodeE2EEKeyV1(e2eeInfo.metadata, Buffer.from(secret));
				const deviceSecret = this.encryptDeviceSecret(
					Buffer.from(e2eeInfo.metadata.publicKey, "base64"),
					Buffer.from(secret),
					Buffer.from(e2eeInfo.metadata.encryptedKeyChain, "base64"),
				);
				const e2eeLogin = await this.confirmE2EELogin(
					response.verifier,
					deviceSecret,
				);
				response = await this.loginV2(
					keynm,
					encryptedMessage,
					this.system.device,
					e2eeLogin,
					e2eeData,
					cert,
					"loginZ",
				);
			} else {
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
				const verifier = await this.customFetch(`https://${this.endpoint}/Q`, {
					headers: headers,
				}).then((res) => res.json());
				this.log("response", verifier);
				response = await this.loginV2(
					keynm,
					encryptedMessage,
					this.system.device,
					verifier.result.verifier,
					e2eeData,
					cert,
					"loginZ",
				);
			}
		}
		if (response.certificate) {
			this.emit("update:cert", response.certificate);
		}
		return response.authToken;
	}

	public async requestEmailLoginV2(
		email: string,
		password: string,
		constantPincode: string = "114514",
	): Promise<string> {
		if (constantPincode.length !== 6) {
			throw new InternalError(
				"Invalid constant pincode",
				"The constant pincode should be 6 digits",
			);
		}

		this.log("login", {
			method: "email",
			email,
			password,
			constantPincode,
		});

		if (!this.system) {
			throw new InternalError("Not setup yet", "Please call 'login()' first");
		}

		const rsaKey = await this.getRSAKeyInfo();
		const { keynm, sessionKey } = rsaKey;

		const message =
			String.fromCharCode(sessionKey.length) +
			sessionKey +
			String.fromCharCode(email.length) +
			email +
			String.fromCharCode(password.length) +
			password;

		const [secret, secretPK] = this.createSqrSecret(true);
		const e2eeData = this.encryptAESECB(
			this.getSHA256Sum(constantPincode),
			Buffer.from(secretPK, "base64"),
		);

		const encryptedMessage = getRSACrypto(message, rsaKey).credentials;

		const cert = this.getCert() || undefined;

		let response = (await this.loginV2(
			keynm,
			encryptedMessage,
			this.system?.device,
			undefined,
			e2eeData,
			cert,
			"loginV2",
		)) as LooseType;

		if (!response[9]) {
			this.emit("pincall", constantPincode);
			const headers = {
				Host: this.endpoint,
				accept: "application/x-thrift",
				"user-agent": this.system.userAgent,
				"x-line-application": this.system.type,
				"x-line-access": response[3],
				"x-lal": "ja_JP",
				"x-lpv": "1",
				"x-lhm": "GET",
				"accept-encoding": "gzip",
			};
			const e2eeInfo = (
				await this.customFetch(`https://${this.endpoint}/LF1`, {
					headers: headers,
				}).then((res) => res.json())
			).result;
			this.log("response", e2eeInfo);
			this.decodeE2EEKeyV1(e2eeInfo.metadata, Buffer.from(secret));
			const deviceSecret = this.encryptDeviceSecret(
				Buffer.from(e2eeInfo.metadata.publicKey, "base64"),
				Buffer.from(secret),
				Buffer.from(e2eeInfo.metadata.encryptedKeyChain, "base64"),
			);
			const e2eeLogin = await this.confirmE2EELogin(response[3], deviceSecret);
			response = await this.loginV2(
				keynm,
				encryptedMessage,
				this.system.device,
				e2eeLogin,
				e2eeData,
				cert,
				"loginV2",
			);
		}
		if (response[2]) {
			this.emit("update:cert", response[2]);
		}
		this.storage.set("refreshToken", response[9][2]);
		this.storage.set("expire", response[9][3] + response[9][6]);
		return response[9][1];
	}

	public async requestSQR(): Promise<string> {
		const { 1: sqr } = await this.createSession();
		let { 1: url } = await this.createQrCode(sqr);
		const [secret, secretUrl] = this.createSqrSecret();
		url = url + secretUrl;
		this.emit("qrcall", url);
		if (await this.checkQrCodeVerified(sqr)) {
			try {
				await this.verifyCertificate(sqr, this.getQrCert() as string);
			} catch (_e) {
				const { 1: pincode } = await this.createPinCode(sqr);
				this.emit("pincall", pincode);
				await this.checkPinCodeVerified(sqr);
			}
			const response = await this.qrCodeLogin(sqr);
			const { 1: pem, 2: authToken, 4: e2eeInfo, 5: _mid } = response;
			if (pem) {
				this.emit("update:qrcert", pem);
			}
			if (e2eeInfo) {
				this.decodeE2EEKeyV1(e2eeInfo, Buffer.from(secret));
			}
			return authToken;
		}
		return "";
	}

	public async requestSQR2(): Promise<string> {
		const { 1: sqr } = await this.createSession();
		let { 1: url } = await this.createQrCode(sqr);
		const [secret, secretUrl] = this.createSqrSecret();
		url = url + secretUrl;
		this.emit("qrcall", url);
		if (await this.checkQrCodeVerified(sqr)) {
			try {
				await this.verifyCertificate(sqr, this.getQrCert() as string);
			} catch (_e) {
				const { 1: pincode } = await this.createPinCode(sqr);
				this.emit("pincall", pincode);
				await this.checkPinCodeVerified(sqr);
			}
			const response = await this.qrCodeLogin(sqr);
			const { 1: pem, 3: tokenInfo, 4: _mid, 10: e2eeInfo } = response;
			if (pem) {
				this.emit("update:qrcert", pem);
			}
			if (e2eeInfo) {
				this.decodeE2EEKeyV1(e2eeInfo, Buffer.from(secret));
			}
			this.storage.set("refreshToken", tokenInfo[2]);
			this.storage.set("expire", tokenInfo[3] + tokenInfo[6]);
			return tokenInfo[1];
		}
		return "";
	}

	/**
	 * @description Will override.
	 */
	public createSqrSecret(_base64Only?: boolean): [Uint8Array, string] {
		return [new Uint8Array(), ""];
	}

	/**
	 * @description Will override.
	 */
	public getSHA256Sum(..._args: string[] | Buffer[]): Buffer {
		return Buffer.from([]);
	}

	/**
	 * @description Will override.
	 */
	public encryptAESECB(_aesKey: LooseType, _plainData: LooseType): Buffer {
		return Buffer.from([]);
	}

	/**
	 * @description Will override.
	 */
	public decodeE2EEKeyV1(_data: LooseType, _secret: Buffer): LooseType {}

	/**
	 * @description Will override.
	 */
	public encryptDeviceSecret(
		_publicKey: Buffer,
		_privateKey: Buffer,
		_encryptedKeyChain: Buffer,
	): Buffer {
		return Buffer.from([]);
	}

	public async createSession(): Promise<string> {
		return await this.direct_request(
			[],
			"createSession",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	public async createQrCode(qrcode: string): Promise<LooseType> {
		return await this.request(
			[[11, 1, qrcode]],
			"createQrCode",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	public async checkQrCodeVerified(qrcode: string): Promise<boolean> {
		try {
			await this.request(
				[[11, 1, qrcode]],
				"checkQrCodeVerified",
				4,
				false,
				"/acct/lp/lgn/sq/v1",
				{
					"x-lst": "150000",
					"x-line-access": qrcode,
				},
			);
			return true;
		} catch (error) {
			throw error;
		}
	}

	public async verifyCertificate(
		qrcode: string,
		cert?: string | undefined,
	): Promise<LooseType> {
		return await this.request(
			[
				[11, 1, qrcode],
				[11, 2, cert],
			],
			"verifyCertificate",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	public async createPinCode(qrcode: string): Promise<LooseType> {
		return await this.request(
			[[11, 1, qrcode]],
			"createPinCode",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	public async checkPinCodeVerified(qrcode: string): Promise<boolean> {
		try {
			await this.request(
				[[11, 1, qrcode]],
				"checkPinCodeVerified",
				4,
				false,
				"/acct/lp/lgn/sq/v1",
				{
					"x-lst": "150000",
					"x-line-access": qrcode,
				},
			);
			return true;
		} catch (error) {
			throw error;
		}
	}

	public async qrCodeLogin(
		authSessionId: string,
		autoLoginIsRequired: boolean = true,
	): Promise<LooseType> {
		return await this.request(
			[
				[11, 1, authSessionId],
				[11, 2, this.system?.device],
				[2, 3, autoLoginIsRequired],
			],
			"qrCodeLogin",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	public async qrCodeLoginV2(
		authSessionId: string,
		modelName: string = "evex",
		systemName: string = "linejs",
		autoLoginIsRequired: boolean = true,
	): Promise<LooseType> {
		return await this.request(
			[
				[11, 1, authSessionId],
				[11, 2, systemName],
				[11, 3, modelName],
				[2, 4, autoLoginIsRequired],
			],
			"qrCodeLoginV2",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	public async confirmE2EELogin(
		verifier: string,
		deviceSecret: Buffer,
	): Promise<LooseType> {
		return await this.direct_request(
			[
				[11, 1, verifier],
				[11, 2, deviceSecret],
			],
			"confirmE2EELogin",
			3,
			false,
			"/api/v3p/rs",
		);
	}
	private async loginV2(
		keynm: string,
		encryptedMessage: string,
		deviceName: Device,
		verifier: string | undefined,
		secret: Buffer | undefined,
		cert: string | undefined,
		methodName: string = "loginV2",
	): Promise<LINETypes.LoginResult> {
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
			methodName,
			3,
			methodName === "loginZ" ? "LoginResult" : false,
			"/api/v3p/rs",
		);
	}

	/**
	 * @description Get RSA key info for login.
	 *
	 * @param {number} [provider=0] Provider to get RSA key info from.
	 * @returns {Promise<LINETypes.RSAKey>} RSA key info.
	 * @throws {FetchError} If failed to fetch RSA key info.
	 */
	public async getRSAKeyInfo(provider: number = 0): Promise<LINETypes.RSAKey> {
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
		path: string = "/S3",
		headers: Record<string, string | undefined> = {},
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
		path: string = "/S3",
		headers: Record<string, string | undefined> = {},
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

	public EXCEPTION_TYPES = {
		"/S3": "TalkException",
		"/S4": "TalkException",
		"/SYNC4": "TalkException",
		"/SYNC3": "TalkException",
		"/CH3": "ChannelException",
		"/CH4": "ChannelException",
		"/SQ1": "SquareException",
		"/LIFF1": "LiffException",
		"/api/v3p/rs": "TalkException",
		"/api/v3/TalkService.do": "TalkException",
	} as Record<string, string | undefined>;

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
	 * @param {boolean} [isReRequest=false] - Is Re-Request.
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
		isReRequest: boolean = false,
	): Promise<ParsedThrift> {
		if (!this.system) {
			throw new InternalError("Not setup yet", "Please call 'login()' first");
		}

		const Protocol = Protocols[protocolType];
		let headers = this.getHeader(this.metadata?.authToken, overrideMethod);

		headers = { ...headers, ...appendHeaders };

		this.log("request-write", {
			thriftMethodName: methodName,
			protocolType,
			value,
		});

		const Trequest = writeThrift(value, methodName, Protocol);

		this.log("request-send", {
			method: "thrift",
			thriftMethodName: methodName,
			httpMethod: overrideMethod,
			data: Trequest,
			headers,
		});

		const response = await this.customFetch(`https://${this.endpoint}${path}`, {
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
		this.log("response-recv", {
			method: "thrift",
			response,
			data: parsedBody,
		});
		const res = readThrift(parsedBody, Protocol);
		if (parse === true) {
			this.parser.rename_data(res);
		} else if (typeof parse === "string") {
			res.value = this.parser.rename_thrift(parse, res.value);
		}

		if (res.e) {
			const structName = this.EXCEPTION_TYPES[path] || "TalkException";

			if (structName) {
				res.e = this.parser.rename_thrift(structName, res.e);
			}
		}

		this.log("response-parse", {
			parsedData: res,
		});

		const isRefresh =
			res.e &&
			res.e["code"] === LINETypes.ErrorCode._NOT_AUTHORIZED_DEVICE &&
			nextToken;

		if (res.e && !isRefresh) {
			throw new InternalError(
				"Request internal failed",
				JSON.stringify(res.e),
				res.e,
			);
		}

		if (isRefresh && !isReRequest) {
			this.metadata = {
				authToken: nextToken,
			};
			this.emit("update:authtoken", this.metadata.authToken);

			return await this.rawRequest(
				path,
				value,
				methodName,
				protocolType,
				appendHeaders,
				overrideMethod,
				parse,
				true,
			);
		}
		return res;
	}

	/**
	 * Get HTTP headers for a request.
	 * @param {string | undefined} [lineAccessToken] The auth token to use in the `x-line-access` header.
	 * @param {string} [overrideMethod="POST"] The HTTP method to use in the `x-lhm` header.
	 * @returns {Record<string, string>} An object with the headers as key-value pairs.
	 * @throws {InternalError} If the client has not been setup yet.
	 */
	public getHeader(
		lineAccessToken: string | undefined,
		overrideMethod = "POST",
	): Record<string, string> {
		if (!this.system) {
			throw new InternalError("Not setup yet", "Please call 'login()' first");
		}

		const header = {
			Host: this.endpoint,
			accept: "application/x-thrift",
			"user-agent": this.system.userAgent,
			"x-line-application": this.system.type,
			"content-type": "application/x-thrift",
			"x-lal": "ja_JP",
			"x-lpv": "1",
			"x-lhm": overrideMethod,
			"accept-encoding": "gzip",
		} as Record<string, string>;

		if (lineAccessToken) {
			header["x-line-access"] = lineAccessToken;
		}

		return header;
	}

	/**
	 * @description Gets arugments of thrift
	 * @experimental
	 */
	public getArgumentsHelper(structName: string): LooseType[][] {
		return this.parser.get_cl(structName);
	}

	public LINEService_API_PATH = "/S4";
	public LINEService_PROTOCOL_TYPE: ProtocolKey = 4;

	public AuthService_API_PATH = "/RS4";
	public AuthService_PROTOCOL_TYPE: ProtocolKey = 4;

	/**
	 * @description Logouts from LINE server
	 */
	public async logout(__force: boolean = false): Promise<void> {
		if (!this.metadata || !this.user) {
			throw new InternalError("Not setup yet", "Please call 'login()' first");
		}

		this.emit("end", this.user);
		this.squareRateLimitter.clear();
		this.metadata = undefined;
		this.user = undefined;
		this.system = undefined;

		if (__force) {
			this.storage.clear();

			await this.request(
				[],
				"logoutZ",
				this.AuthService_PROTOCOL_TYPE,
				false,
				this.AuthService_API_PATH,
			);
		}
	}

	/**
	 * @description Gets the server time
	 */
	public async getServerTime(): Promise<number> {
		return await this.request(
			[
				128, 1, 0, 1, 0, 0, 0, 13, 103, 101, 116, 83, 101, 114, 118, 101, 114,
				84, 105, 109, 101, 0, 0, 0, 0, 0,
			],
			"getServerTime",
			this.LINEService_PROTOCOL_TYPE,
			false,
			this.LINEService_API_PATH,
		);
	}

	/**
	 * @description Gets the profile of the current user.
	 */
	public async getProfile(): Promise<LINETypes.Profile> {
		return await this.request(
			[],
			"getProfile",
			this.LINEService_PROTOCOL_TYPE,
			"Profile",
			this.LINEService_API_PATH,
		);
	}

	/**
	 * @description Updates the profile of the current user.
	 */

	public async updateProfile(options: {
		all?: LooseType;
		email?: string;
		displayName?: string;
		phoneticName?: string;
		pictureUrl?: string;
		statusMessage?: string;
		allowSearchByUserid?: string;
		allowSearchByEmail?: string;
		buddyStatus?: LooseType;
		musicProfile?: LooseType;
		avatarProfile?: LooseType;
	}): Promise<LooseType[]> {
		const typeByLabel = {
			all: 0,
			email: 1,
			displayName: 2,
			phoneticName: 4,
			pictureUrl: 8,
			statusMessage: 16,
			allowSearchByUserid: 32,
			allowSearchByEmail: 64,
			buddyStatus: 128,
			musicProfile: 256,
			avatarProfile: 512,
		} satisfies Record<keyof typeof options, number>;

		const updateLabels = Object.keys(options) as (keyof typeof typeByLabel)[];
		const responseList = [];

		for (const label of updateLabels) {
			const attr = typeByLabel[label];
			const value = options[label];

			const params = [
				[8, 1, 0],
				[8, 2, attr],
				[11, 3, value],
			];

			responseList.push(
				await this.direct_request(
					params,
					"updateProfileAttribute",
					this.LINEService_PROTOCOL_TYPE,
					false,
					this.LINEService_API_PATH,
				),
			);
		}

		await this.refreshProfile();

		return responseList;
	}

	/**
	 * @description Updates the display name of the current user.
	 */
	public async updateDisplayName(displayName: string): Promise<LooseType> {
		return (await this.updateProfile({ displayName }))[0];
	}

	/**
	 * @description Updates the picture url of the current user.
	 */
	public async updatePictureUrl(pictureUrl: string): Promise<LooseType> {
		return (await this.updateProfile({ pictureUrl }))[0];
	}

	/**
	 * @description Updates the status message of the current user.
	 */
	public async updateStatusMessage(statusMessage: string): Promise<LooseType> {
		return (await this.updateProfile({ statusMessage }))[0];
	}

	/**
	 * @description Refresh the profile of the current user.
	 */
	public async refreshProfile(
		noEmit: boolean = false,
	): Promise<LINETypes.Profile> {
		const profile = await this.getProfile();

		if (!noEmit) this.emit("update:profile", profile);

		this.user = profile;

		return this.user;
	}

	/**
	 * @description Try to refresh token.
	 */
	public async tryRefreshToken() {
		const refreshToken = this.storage.get("refreshToken");
		if (refreshToken) {
			const RATR = await this.refreshAccessToken(refreshToken as string);
			this.metadata!.authToken = RATR.accessToken;
			this.emit("update:authtoken", RATR.accessToken);
			this.storage.set(
				"expire",
				(
					(RATR.tokenIssueTimeEpochSec as number) +
					(RATR.durationUntilRefreshInSec as number)
				).toString(),
			);
		} else {
			throw new InternalError("refreshError", "refreshToken not found");
		}
	}

	/**
	 * @description Refresh token.
	 */
	public async refreshAccessToken(
		refreshToken: string,
	): Promise<LINETypes.RefreshAccessTokenResponse> {
		return await this.request(
			[[11, 1, refreshToken]],
			"refresh",
			4,
			"RefreshAccessTokenResponse",
			"/EXT/auth/tokenrefresh/v1",
		);
	}

	/**
	 * @description Gets the message's data from LINE Obs.
	 */
	public async getMessageObsData(
		messageId: string,
		isPreview = false,
	): Promise<Blob> {
		if (!this.metadata) {
			throw new InternalError("Not setup yet", "Please call 'login()' first");
		}
		return await this.customFetch(
			this.LINE_OBS.getDataUrl(messageId, isPreview),
			{
				headers: {
					accept: "application/json, text/plain, */*",
					"x-line-application": this.system?.type as string,
					"x-Line-access": this.metadata.authToken,
				},
			},
		).then((r) => {
			return r.blob();
		});
	}

	/**
	 * @description Upload obs message to talk.
	 */
	public async uploadObjTalk(
		to: string,
		type: "image" | "gif" | "video" | "audio" | "file",
		data: Blob,
		filename?: string,
	): Promise<Response> {
		if (!this.metadata) {
			throw new InternalError("Not setup yet", "Please call 'login()' first");
		}

		const ext = MimeType[data.type as keyof typeof MimeType];
		const param: {
			oid: string;
			reqseq: string;
			tomid: string;
			ver: string;
			name: string;
			type: string;
			cat?: string;
			duration?: string;
		} = {
			ver: "2.0",
			name: filename || "linejs." + ext,
			type,
			tomid: to,
			oid: "reqseq",
			reqseq: this.getReqseq("talk").toString(),
		};
		if (type === "image") {
			param.cat = "original";
		} else if (type === "gif") {
			param.cat = "original";
			param.type = "image";
		} else if (type === "audio" || type === "video") {
			param.duration = "1919";
		}
		const toType: "talk" | "g2" =
			to[0] === "m" || to[0] === "t" ? "g2" : "talk";
		return await this.customFetch(
			this.LINE_OBS.prefix + "r/" + toType + "/m/reqseq",
			{
				headers: {
					accept: "application/json, text/plain, */*",
					"x-line-application": this.system?.type as string,
					"x-Line-access": this.metadata.authToken,
					"content-type": "application/x-www-form-urlencoded",
					"x-obs-params": btoa(JSON.stringify(param)),
				},
				body: data,
				method: "POST",
			},
		);
	}

	private reqseqs: Record<string, number> = {};
	public getReqseq(name: string = "talk"): number {
		if (!this.reqseqs[name]) this.reqseqs[name] = 0;
		const seq = this.reqseqs[name];
		this.reqseqs[name]++;
		this.storage.set("reqseq", JSON.stringify(this.reqseqs));
		return seq;
	}
}
