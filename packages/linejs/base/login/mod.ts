import { getRSACrypto } from "./rsa-verify.ts";
import { EMAIL_REGEX, PASSWORD_REGEX } from "./regex.ts";
import { type Device, isV3Support } from "../core/utils/devices.ts";
import { InternalError } from "../core/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import { Buffer } from "node:buffer";
import { LINEStruct } from "../thrift/mod.ts";
import type { BaseClient } from "../core/mod.ts";
import type { LooseType } from "@evex/loose-types";
import {
	type AuthTokenInput,
	parseAuthTokenInput,
} from "../request/auth_token.ts";

export type LoginOption = PasswordLoginOption | QrCodeLoginOption | {
	authToken: AuthTokenInput;
	email?: undefined;
	qr?: undefined;
};

interface LoginVer {
	loginV2: LooseType;
	loginZ: LINETypes.LoginResult;
}

export interface PasswordLoginOption {
	/**
	 * account e-mail address
	 */
	email: string;
	/**
	 * account password
	 */
	password: string;
	/**
	 * Custom pin-code. It have to be 6-digit.
	 */
	pincode?: string;
	/**
	 * use v3 login or not.
	 */
	v3?: boolean;
	/**
	 * use e2ee login or not.
	 * @default true
	 */
	e2ee?: boolean;
	qr?: undefined;

	authToken?: undefined;
}

export interface QrCodeLoginOption {
	email?: undefined;
	authToken?: undefined;
	qr?: true;
	/**
	 * use v3 login or not.
	 */
	v3?: boolean;
}

export class Login {
	readonly client: BaseClient;
	cert: string | null;
	qrCert: string | null;
	constructor(client: BaseClient) {
		this.client = client;
		this.qrCert = null;
		this.cert = null;
	}

	/**
	 * @description Registers a certificate to be used for login.
	 *
	 * @param {string | null} cert - The certificate to register. If null, the certificate will be cleared.
	 */
	public async registerCert(cert: string, email: string): Promise<void> {
		await this.client.storage.set("cert:" + email, cert);
	}

	/**
	 * @description Reads the certificate from the registered path, if it exists.
	 *
	 * @return {Promise<string | undefined>} The certificate, or undefined if it does not exist or an error occurred.
	 */
	public async getCert(email: string): Promise<string | undefined> {
		return await this.client.storage.get("cert:" + email) as string;
	}

	/**
	 * @description Registers a certificate to be used for login.
	 *
	 * @param {string | null} qrCert - The certificate to register. If null, the certificate will be cleared.
	 */
	public async registerQrCert(qrCert: string): Promise<void> {
		await this.client.storage.set("qrCert", qrCert);
	}

	/**
	 * @description Reads the certificate from the registered path, if it exists.
	 *
	 * @return {Promise<string | undefined>} The certificate, or undefined if it does not exist or an error occurred.
	 */
	public async getQrCert(): Promise<string | undefined> {
		return await this.client.storage.get("qrCert") as string;
	}

	async ready(): Promise<void> {
		if (!this.client.authToken) {
			throw new InternalError("NotAuthorized", "try login first");
		}
		this.client.profile = await this.client.talk.getProfile();
		this.client.emit("ready", this.client.profile);
	}

	/**
	 * Logs in the user using the provided options.
	 *
	 * Depending on the options provided, this method will:
	 * - Use QR code authentication if no options are provided or if `options.qr` is true.
	 * - Use an authentication token if `options.authToken` is provided.
	 * - Use email and password authentication if `options.email` is provided.
	 *
	 * @param {LoginOption} [options] - The login options.
	 * @param {boolean} [options.qr] - Whether to use QR code authentication.
	 * @param {boolean} [options.v3] - Whether to use version 3 of QR code authentication.
	 * @param {string} [options.authToken] - The authentication token.
	 * @param {string} [options.email] - The user's email.
	 * @param {string} [options.password] - The user's password.
	 *
	 * @example
	 * // Login with QR code
	 * await login();
	 *
	 * @example
	 * // Login with authentication token
	 * await login({ authToken: 'your-auth-token' });
	 *
	 * @example
	 * // Login with email and password
	 * await login({ email: 'user@example.com', password: 'your-password' });
	 */
	async login(
		options?: LoginOption,
	) {
		if (!options) {
			await this.withQrCode();
		} else if (options.qr) {
			await this.withQrCode({ v3: options.v3 });
		} else if (options.authToken) {
			const credential = parseAuthTokenInput(options.authToken);
			this.client.emit("update:authtoken", credential.accessToken);
			this.client.authToken = credential.accessToken;
			if (credential.refreshToken) {
				await this.client.storage.set("refreshToken", credential.refreshToken);
			}
			if (credential.expire !== undefined) {
				await this.client.storage.set("expire", credential.expire);
			}
		} else if (options.email) {
			await this.withPassword(options);
		} else {
			await this.withQrCode();
		}
		await this.ready();
	}
	/**
	 * Login with qrcode.
	 * @param options.v3 use v3 login or not.
	 */
	async withQrCode(options?: QrCodeLoginOption): Promise<void> {
		let authToken: string;
		if (
			typeof options === "undefined" || typeof options.v3 === "undefined"
		) {
			if (isV3Support(this.client.device)) {
				authToken = await this.requestSQR2();
			} else {
				authToken = await this.requestSQR();
			}
		} else {
			if (options.v3) {
				authToken = await this.requestSQR2();
			} else {
				authToken = await this.requestSQR();
			}
		}
		this.client.emit("update:authtoken", authToken);
		this.client.authToken = authToken;
	}

	public async requestSQR(): Promise<string> {
		const { 1: sqr } = await this.createSession();
		let { 1: url } = await this.createQrCode(sqr);
		const [secret, secretUrl] = this.client.e2ee.createSqrSecret();
		url = url + secretUrl;
		this.client.emit("qrcall", url);
		if (await this.checkQrCodeVerified(sqr)) {
			try {
				await this.verifyCertificate(sqr, await this.getQrCert());
			} catch (_e) {
				const { 1: pincode } = await this.createPinCode(sqr);
				this.client.emit("pincall", pincode);
				await this.checkPinCodeVerified(sqr);
			}
			const response = await this.qrCodeLogin(sqr);
			const { 1: pem, 2: authToken, 4: e2eeInfo, 5: _mid } = response;
			if (pem) {
				this.client.emit("update:qrcert", pem);
				await this.registerQrCert(pem);
			}
			if (e2eeInfo) {
				await this.client.e2ee.decodeE2EEKeyV1(
					e2eeInfo,
					Buffer.from(secret),
				);
			}
			return authToken;
		}
		throw new InternalError(
			"TimeoutError",
			"checkQrCodeVerified timed out",
		);
	}

	public async requestSQR2(): Promise<string> {
		const { 1: sqr } = await this.createSession();
		const forSecure = await this.createQrCodeForSecure(sqr);
		// Response shape per `oc4.i` (CreateQrCodeForSecureResponse):
		//   1: callbackUrl, 2: longPollingMaxCount,
		//   3: longPollingIntervalSec, 4: nonce
		let url: string = forSecure[1];
		// Generous fallbacks: if the server omits these (older builds, or
		// future protocol drift), we still get up to 6 minutes of total
		// poll budget instead of immediately giving up.
		const longPollingMaxCount: number = forSecure[2] ?? 12;
		const longPollingIntervalSec: number = forSecure[3] ?? 30;
		const nonce: string = forSecure[4] ?? "";
		console.log(
			`[login] ForSecure: maxCount=${longPollingMaxCount} intervalSec=${longPollingIntervalSec} nonce=${nonce.length}chars`,
		);
		const [secret, secretUrl] = this.client.e2ee.createSqrSecret();
		url = url + secretUrl;
		this.client.emit("qrcall", url);
		// The ForSecure flow expects us to long-poll: the server holds
		// each `checkQrCodeVerified` request open for `longPollingIntervalSec`
		// and retries up to `longPollingMaxCount` times.  A single
		// non-long-polling call (the legacy behaviour) makes the server
		// expire the session almost immediately.
		if (
			await this.checkQrCodeVerified(
				sqr,
				longPollingMaxCount,
				longPollingIntervalSec,
			)
		) {
			try {
				await this.verifyCertificate(sqr, await this.getQrCert());
			} catch (_e) {
				const { 1: pincode } = await this.createPinCode(sqr);
				this.client.emit("pincall", pincode);
				await this.checkPinCodeVerified(
					sqr,
					longPollingMaxCount,
					longPollingIntervalSec,
				);
			}
			const response = await this.qrCodeLoginV2ForSecure(sqr, nonce);
			// Response shape per `oc4.q` (QrCodeLoginV2Response — reused
			// by both V2 and V2ForSecure):
			//   1: certificate, 2: accessTokenV2 (legacy str),
			//   3: tokenV3IssueResult, 4: mid, 5: lastBindTimestamp,
			//   6: metaData (map<string,string>)
			const { 1: pem, 3: tokenInfo, 4: _mid, 6: metaData } = response;
			if (pem) {
				this.client.emit("update:qrcert", pem);
				await this.registerQrCert(pem);
			}
			// E2EE info historically arrived in field 10 on the non-
			// ForSecure response, and in metaData["e2eeInfo"] on
			// ForSecure.  Try both.
			const e2eeInfo = response[10] ?? metaData?.["e2eeInfo"];
			if (e2eeInfo) {
				await this.client.e2ee.decodeE2EEKeyV1(
					e2eeInfo,
					Buffer.from(secret),
				);
			}
			await this.client.storage.set("refreshToken", tokenInfo[2]);
			await this.client.storage.set(
				"expire",
				tokenInfo[3] + tokenInfo[6],
			);
			return tokenInfo[1];
		}
		throw new InternalError(
			"TimeoutError",
			"checkQrCodeVerified timed out",
		);
	}

	/**
	 * Login with email and password.
	 * @param options.email account e-mail address
	 * @param options.password account password
	 * @param options.pincode Custom pin-code. It have to be 6-digit.
	 * @param options.v3 use v3 login or not.
	 * @param options.e2ee use e2ee login or not.
	 */
	async withPassword(options: PasswordLoginOption): Promise<void> {
		let authToken: string;
		if (!EMAIL_REGEX.test(options.email)) {
			throw new InternalError("RegExpUnmatch", "invalid email");
		}
		if (!PASSWORD_REGEX.test(options.password)) {
			throw new InternalError("RegExpUnmatch", "invalid password");
		}

		if (typeof options.v3 === "undefined") {
			if (isV3Support(this.client.device)) {
				authToken = await this.requestEmailLoginV2(
					options.email,
					options.password,
					options.pincode,
				);
			} else {
				authToken = await this.requestEmailLogin(
					options.email,
					options.password,
					options.pincode,
					options.e2ee,
				);
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
					options.pincode,
					options.e2ee,
				);
			}
		}
		this.client.emit("update:authtoken", authToken);
		this.client.authToken = authToken;
	}

	/**
	 * @description Login to LINE server with email and password.
	 *
	 * @param {string} [email] The email to login with.
	 * @param {string} [password] The password to login with.
	 * @param {boolean} [enableE2EE=false] Enable E2EE Login or not.
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
		constantPincode: string = "114514",
		enableE2EE: boolean = true,
	): Promise<string> {
		if (constantPincode.length !== 6) {
			throw new InternalError(
				"Invalid constant pincode",
				"The constant pincode should be 6 digits",
			);
		}

		this.client.log("login", {
			method: "email_v1",
			email,
			password: password.length,
			enableE2EE,
			constantPincode,
		});

		const rsaKey = await this.getRSAKeyInfo();
		const { keynm, sessionKey } = rsaKey;

		const message = String.fromCharCode(sessionKey.length) +
			sessionKey +
			String.fromCharCode(email.length) +
			email +
			String.fromCharCode(password.length) +
			password;

		let e2eeData: Buffer | undefined,
			secret: Uint8Array | undefined,
			secretPK: string | undefined;

		if (enableE2EE) {
			[secret, secretPK] = this.client.e2ee.createSqrSecret(true);
			e2eeData = this.client.e2ee.encryptAESECB(
				this.client.e2ee.getSHA256Sum(constantPincode),
				Buffer.from(secretPK, "base64"),
			);
		}

		const encryptedMessage = getRSACrypto(message, rsaKey).credentials;

		const cert = await this.getCert(email) || undefined;

		let response = await this.loginV2(
			keynm,
			encryptedMessage,
			this.client.device,
			undefined,
			e2eeData,
			cert,
			"loginZ",
		);

		if (!response.authToken) {
			this.client.emit("pincall", response.pinCode || constantPincode);
			if (enableE2EE && secret) {
				const headers = {
					"user-agent": this.client.request.userAgent,
					"x-line-application": this.client.request.systemType,
					"x-line-access": response.verifier,
					"x-lal": "ja_JP",
					"x-lpv": "1",
					"x-lhm": "GET",
					"accept-encoding": "gzip",
				};
				const e2eeInfo = (
					await this.client.fetch(
						`https://${this.client.request.endpoint}/LF1`,
						{
							headers: headers,
						},
					).then((res) => res.json())
				).result;
				this.client.log("response", e2eeInfo);
				await this.client.e2ee.decodeE2EEKeyV1(
					e2eeInfo.metadata,
					Buffer.from(secret),
				);
				const deviceSecret = this.client.e2ee.encryptDeviceSecret(
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
					this.client.device,
					e2eeLogin,
					e2eeData,
					cert,
					"loginZ",
				);
			} else {
				const headers = {
					accept: "application/x-thrift",
					"user-agent": this.client.request.userAgent,
					"x-line-application": this.client.request.systemType,
					"x-line-access": response.verifier,
					"x-lal": "ja_JP",
					"x-lpv": "1",
					"x-lhm": "GET",
					"accept-encoding": "gzip",
				};
				const verifier = await this.client.fetch(
					`https://${this.client.request.endpoint}/Q`,
					{
						headers: headers,
					},
				).then((res) => res.json());
				this.client.log("response", verifier);
				response = await this.loginV2(
					keynm,
					encryptedMessage,
					this.client.device,
					verifier.result.verifier,
					e2eeData,
					cert,
					"loginZ",
				);
			}
		}
		if (response.certificate) {
			this.client.emit("update:cert", response.certificate);
			await this.registerCert(response.certificate, email);
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

		this.client.log("login", {
			method: "email",
			email,
			password: password.length,
			constantPincode,
		});

		const rsaKey = await this.getRSAKeyInfo();
		const { keynm, sessionKey } = rsaKey;

		const message = String.fromCharCode(sessionKey.length) +
			sessionKey +
			String.fromCharCode(email.length) +
			email +
			String.fromCharCode(password.length) +
			password;

		const [secret, secretPK] = this.client.e2ee.createSqrSecret(true);
		const e2eeData = this.client.e2ee.encryptAESECB(
			this.client.e2ee.getSHA256Sum(constantPincode),
			Buffer.from(secretPK, "base64"),
		);

		const encryptedMessage = getRSACrypto(message, rsaKey).credentials;

		const cert = await this.getCert(email) || undefined;

		let response = await this.loginV2(
			keynm,
			encryptedMessage,
			this.client.device,
			undefined,
			e2eeData,
			cert,
			"loginV2",
		);

		if (!response[9]) {
			this.client.emit("pincall", constantPincode);
			const headers = {
				accept: "application/x-thrift",
				"user-agent": this.client.request.userAgent,
				"x-line-application": this.client.request.systemType,
				"x-line-access": response[3],
				"x-lal": "ja_JP",
				"x-lpv": "1",
				"x-lhm": "GET",
				"accept-encoding": "gzip",
			};
			const e2eeInfo = (
				await this.client.fetch(
					`https://${this.client.request.endpoint}/LF1`,
					{
						headers: headers,
					},
				).then((res) => res.json())
			).result;
			this.client.log("response", e2eeInfo);
			await this.client.e2ee.decodeE2EEKeyV1(
				e2eeInfo.metadata,
				Buffer.from(secret),
			);
			const deviceSecret = this.client.e2ee.encryptDeviceSecret(
				Buffer.from(e2eeInfo.metadata.publicKey, "base64"),
				Buffer.from(secret),
				Buffer.from(e2eeInfo.metadata.encryptedKeyChain, "base64"),
			);
			const e2eeLogin = await this.confirmE2EELogin(
				response[3],
				deviceSecret,
			);
			response = await this.loginV2(
				keynm,
				encryptedMessage,
				this.client.device,
				e2eeLogin,
				e2eeData,
				cert,
				"loginV2",
			);
		}
		if (response[2]) {
			this.client.emit("update:cert", response[2]);
			await this.registerCert(response[2], email);
		}
		await this.client.storage.set("refreshToken", response[9][2]);
		await this.client.storage.set(
			"expire",
			response[9][3] + response[9][6],
		);
		return response[9][1];
	}

	/**
	 * @description Get RSA key info for login.
	 *
	 * @param {number} [provider=0] Provider to get RSA key info from.
	 * @returns {Promise<LINETypes.RSAKey>} RSA key info.
	 * @throws {FetchError} If failed to fetch RSA key info.
	 */
	public async getRSAKeyInfo(
		provider: LINETypes.IdentityProvider = 0,
	): Promise<LINETypes.RSAKey> {
		return await this.client.request.request(
			[[12, 1, [[8, 2, LINEStruct.IdentityProvider(provider)]]]],
			"getRSAKeyInfo",
			3,
			"RSAKey",
			"/api/v3/TalkService.do",
		);
	}

	private async loginV2<K extends keyof LoginVer>(
		keynm: string,
		encryptedMessage: string,
		deviceName: Device,
		verifier: string | undefined,
		secret: Buffer | undefined,
		cert: string | undefined,
		methodName: K,
	): Promise<LoginVer[K]> {
		let loginType = 2;
		if (!secret) loginType = 0;
		if (verifier) {
			loginType = 1;
		}
		return await this.client.request.request(
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

	public async createSession(): Promise<LooseType> {
		return await this.client.request.request(
			[],
			"createSession",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	public async createQrCode(qrcode: string): Promise<LooseType> {
		return await this.client.request.request(
			[[12, 1, [[11, 1, qrcode]]]],
			"createQrCode",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	public async checkQrCodeVerified(
		qrcode: string,
		maxCount: number = 1,
		intervalSec: number = 30,
	): Promise<boolean> {
		const intervalMs = intervalSec * 1000;
		for (let i = 0; i < maxCount; i++) {
			try {
				await this.client.request.request(
					[[12, 1, [[11, 1, qrcode]]]],
					"checkQrCodeVerified",
					4,
					false,
					"/acct/lp/lgn/sq/v1",
					{
						"x-lst": intervalMs.toString(),
						"x-line-access": qrcode,
					},
					intervalMs + 5000,
				);
				return true;
			} catch (error) {
				const msg = error instanceof Error ? error.message : String(error);
				// Long-polling: a timed-out poll just means "no user
				// action yet", keep looping.  Anything else is fatal.
				if (
					/Timeout|timed out|status=408|status=410/i.test(msg) &&
					i < maxCount - 1
				) {
					continue;
				}
				throw error;
			}
		}
		return false;
	}

	public async verifyCertificate(
		qrcode: string,
		cert?: string | undefined,
	): Promise<LooseType> {
		return await this.client.request.request(
			[[12, 1, [[11, 1, qrcode], [11, 2, cert]]]],
			"verifyCertificate",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	public async createPinCode(qrcode: string): Promise<LooseType> {
		return await this.client.request.request(
			[[12, 1, [[11, 1, qrcode]]]],
			"createPinCode",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	public async checkPinCodeVerified(
		qrcode: string,
		maxCount: number = 1,
		intervalSec: number = 30,
	): Promise<boolean> {
		const intervalMs = intervalSec * 1000;
		for (let i = 0; i < maxCount; i++) {
			try {
				await this.client.request.request(
					[[12, 1, [[11, 1, qrcode]]]],
					"checkPinCodeVerified",
					4,
					false,
					"/acct/lp/lgn/sq/v1",
					{
						"x-lst": intervalMs.toString(),
						"x-line-access": qrcode,
					},
					intervalMs + 5000,
				);
				return true;
			} catch (error) {
				const msg = error instanceof Error ? error.message : String(error);
				if (
					/Timeout|timed out|status=408|status=410/i.test(msg) &&
					i < maxCount - 1
				) {
					continue;
				}
				throw error;
			}
		}
		return false;
	}

	public async qrCodeLogin(
		authSessionId: string,
		autoLoginIsRequired: boolean = true,
	): Promise<LooseType> {
		return await this.client.request.request(
			[[12, 1, [
				[11, 1, authSessionId],
				[11, 2, this.client.device],
				[2, 3, autoLoginIsRequired],
			]]],
			"qrCodeLogin",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	public async qrCodeLoginV2(
		authSessionId: string,
		modelName: string = "evex-device",
		systemName: string = "linejs-v2",
		autoLoginIsRequired: boolean = true,
	): Promise<LooseType> {
		return await this.client.request.request(
			[[12, 1, [
				[11, 1, authSessionId],
				[11, 2, systemName],
				[11, 3, modelName],
				[2, 4, autoLoginIsRequired],
			]]],
			"qrCodeLoginV2",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	/**
	 * ForSecure variant of {@link createQrCode}.  The newer LINE-Android
	 * login flow (LINE 26+) requires this — the legacy `createQrCode`
	 * RPC still exists but the server marks issued QR sessions
	 * immediately expired, so logins through it fail with `Expired` on
	 * the device side.
	 *
	 * Returns the callback URL, the long-polling parameters
	 * (`longPollingMaxCount`, `longPollingIntervalSec`), and a `nonce`
	 * that {@link qrCodeLoginV2ForSecure} must echo back to complete
	 * the login.
	 *
	 * Schema source: smali `oc4.i.smali` in LINE Android 26.6.2.
	 */
	public async createQrCodeForSecure(
		authSessionId: string,
	): Promise<LooseType> {
		return await this.client.request.request(
			[[12, 1, [[11, 1, authSessionId]]]],
			"createQrCodeForSecure",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	/**
	 * ForSecure variant of {@link qrCodeLoginV2}.  Echoes the `nonce`
	 * received from {@link createQrCodeForSecure}.
	 *
	 * Schema source: smali `oc4.p.smali` (QrCodeLoginV2ForSecureRequest)
	 * in LINE Android 26.6.2.  Field map:
	 *   1: authSessionId       (string)
	 *   2: systemName          (string)
	 *   3: modelName           (string)
	 *   4: autoLoginIsRequired (bool)
	 *   5: nonce               (string)
	 */
	public async qrCodeLoginV2ForSecure(
		authSessionId: string,
		nonce: string,
		modelName: string = "evex-device",
		systemName: string = "linejs-v2",
		autoLoginIsRequired: boolean = true,
	): Promise<LooseType> {
		return await this.client.request.request(
			[[12, 1, [
				[11, 1, authSessionId],
				[11, 2, systemName],
				[11, 3, modelName],
				[2, 4, autoLoginIsRequired],
				[11, 5, nonce],
			]]],
			"qrCodeLoginV2ForSecure",
			4,
			false,
			"/acct/lgn/sq/v1",
		);
	}

	public async confirmE2EELogin(
		verifier: string,
		deviceSecret: Buffer,
	): Promise<LooseType> {
		return await this.client.request.request(
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

	/**
	 * Primary (already-logged-in) device's response to a pending PIN-
	 * authorized login on another device.  The new device sees the PIN,
	 * the user types it here, and this call ships:
	 *   - `verifier`         — the secondary device's auth session id
	 *   - `publicKey`        — secondary device's E2EE public key
	 *   - `encryptedKeyChain`— this device's E2EE keychain, encrypted
	 *                         with the shared secret derived from
	 *                         `publicKey`
	 *   - `hashKeyChain`     — integrity hash over the plaintext chain
	 *   - `errorCode`        — `0` for accept, non-zero rejects
	 *
	 * Schema recovered from LINE Android 26.6.2 smali at
	 * `decompiled/base/smali/smali_classes4/fh8/c1.smali` (the args
	 * struct), filed as evex-dev/linejs#155.
	 *
	 * Companion to {@link confirmE2EELogin}, which the new device
	 * calls after this one approves.
	 */
	public async respondE2EELoginRequest(opts: {
		verifier: string;
		publicKey: LINETypes.Pb1_C13097n4;
		encryptedKeyChain: Buffer;
		hashKeyChain: Buffer;
		errorCode?: number;
	}): Promise<LooseType> {
		const { verifier, publicKey, encryptedKeyChain, hashKeyChain } = opts;
		const errorCode = opts.errorCode ?? 0;
		const pk = publicKey as unknown as {
			version?: number;
			keyId?: number;
			keyData?: Buffer;
		};
		const pkTuple: import("../thrift/mod.ts").NestedArray = [];
		if (pk.version !== undefined) pkTuple.push([8, 1, pk.version]);
		if (pk.keyId !== undefined) pkTuple.push([8, 2, pk.keyId]);
		if (pk.keyData !== undefined) pkTuple.push([11, 4, pk.keyData]);
		return await this.client.request.request(
			[
				[11, 1, verifier],
				[12, 2, pkTuple],
				[11, 3, encryptedKeyChain],
				[11, 4, hashKeyChain],
				[8, 5, errorCode],
			],
			"respondE2EELoginRequest",
			4,
			false,
			"/S4",
		);
	}
}
