import type { ClientInitBase } from "../core/types.ts";
import { getRSACrypto } from "./rsa-verify.ts";
import { EMAIL_REGEX, PASSWORD_REGEX } from "./regex.ts";
import { type Device, isV3Support } from "../core/utils/devices.ts";
import { InternalError } from "../core/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import { Buffer } from "node:buffer";
import { LINEStruct } from "../thrift/mod.ts";
import type { Client } from "../core/mod.ts";

interface LoginVer {
    loginV2: any;
    loginZ: LINETypes.LoginResult;
}

interface PasswordLoginOption {
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
}

interface QrCodeLoginOption {
    email?: undefined;
    /**
     * use v3 login or not.
     */
    v3?: boolean;
}

export class Login {
    readonly client: Client;
    cert: string | null;
    qrCert: string | null;
    constructor(init: ClientInitBase) {
        this.client = init.client;
        this.qrCert = null;
        this.cert = null;
    }

    /**
     * @description Registers a certificate to be used for login.
     *
     * @param {string | null} cert - The certificate to register. If null, the certificate will be cleared.
     */
    public async registerCert(cert: string): Promise<void> {
        await this.client.storage.set("cert", cert);
    }

    /**
     * @description Reads the certificate from the registered path, if it exists.
     *
     * @return {Promise<string | undefined>} The certificate, or undefined if it does not exist or an error occurred.
     */
    public async getCert(): Promise<string | undefined> {
        return await this.client.storage.get("cert") as string;
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

    async login(options?: PasswordLoginOption | QrCodeLoginOption) {
        if (!options) {
            await this.withQrCode();
        } else if (options.email) {
            await this.withPassword(options);
        } else if (options.v3) {
            await this.withQrCode({ v3: options.v3 });
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
        const _tmp = await this.createSession();
        console.log(_tmp);

        const { 1: sqr } = _tmp;
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
                this.client.e2ee.decodeE2EEKeyV1(e2eeInfo, Buffer.from(secret));
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
            const { 1: pem, 3: tokenInfo, 4: _mid, 10: e2eeInfo } = response;
            if (pem) {
                this.client.emit("update:qrcert", pem);
                await this.registerQrCert(pem);
            }
            if (e2eeInfo) {
                this.client.e2ee.decodeE2EEKeyV1(e2eeInfo, Buffer.from(secret));
            }
            this.client.storage.set("refreshToken", tokenInfo[2]);
            this.client.storage.set("expire", tokenInfo[3] + tokenInfo[6]);
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
        if (PASSWORD_REGEX.test(options.password)) {
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
        enableE2EE: boolean = false,
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

        const cert = await this.getCert() || undefined;

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
                    accept: "application/x-thrift",
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
                this.client.e2ee.decodeE2EEKeyV1(
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
            this.registerCert(response.certificate);
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
        console.log(rsaKey);
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

        const cert = await this.getCert() || undefined;

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
            this.client.e2ee.decodeE2EEKeyV1(
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
            this.registerCert(response[2]);
        }
        this.client.storage.set("refreshToken", response[9][2]);
        this.client.storage.set("expire", response[9][3] + response[9][6]);
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

    public async createSession(): Promise<any> {
        return await this.client.request.request(
            [],
            "createSession",
            4,
            false,
            "/acct/lgn/sq/v1",
        );
    }

    public async createQrCode(qrcode: string): Promise<any> {
        return await this.client.request.request(
            [[12, 1, [[11, 1, qrcode]]]],
            "createQrCode",
            4,
            false,
            "/acct/lgn/sq/v1",
        );
    }

    public async checkQrCodeVerified(qrcode: string): Promise<boolean> {
        try {
            await this.client.request.request(
                [[12, 1, [[11, 1, qrcode]]]],
                "checkQrCodeVerified",
                4,
                false,
                "/acct/lp/lgn/sq/v1",
                {
                    "x-lst": "180000",
                    "x-line-access": qrcode,
                },
                this.client.config.longTimeout,
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    public async verifyCertificate(
        qrcode: string,
        cert?: string | undefined,
    ): Promise<any> {
        return await this.client.request.request(
            [[12, 1, [[11, 1, qrcode], [11, 2, cert]]]],
            "verifyCertificate",
            4,
            false,
            "/acct/lgn/sq/v1",
        );
    }

    public async createPinCode(qrcode: string): Promise<any> {
        return await this.client.request.request(
            [[12, 1, [[11, 1, qrcode]]]],
            "createPinCode",
            4,
            false,
            "/acct/lgn/sq/v1",
        );
    }

    public async checkPinCodeVerified(qrcode: string): Promise<boolean> {
        try {
            await this.client.request.request(
                [[12, 1, [[11, 1, qrcode]]]],
                "checkPinCodeVerified",
                4,
                false,
                "/acct/lp/lgn/sq/v1",
                {
                    "x-lst": "180000",
                    "x-line-access": qrcode,
                },
                this.client.config.longTimeout,
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    public async qrCodeLogin(
        authSessionId: string,
        autoLoginIsRequired: boolean = true,
    ): Promise<any> {
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
        modelName: string = "evex",
        systemName: string = "linejs",
        autoLoginIsRequired: boolean = true,
    ): Promise<any> {
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

    public async confirmE2EELogin(
        verifier: string,
        deviceSecret: Buffer,
    ): Promise<any> {
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
}
