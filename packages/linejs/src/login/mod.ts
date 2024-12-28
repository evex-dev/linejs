import type { ClientInitBase } from "../core/types.ts";
import { getRSACrypto } from "./rsa-verify.ts";
import { EMAIL_REGEX, PASSWORD_REGEX } from "./regex.ts";
import { type Device, isV3Support } from "../core/utils/devices.ts";
import { InternalError } from "../core/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import { Buffer } from "node:buffer";
import { LINEStruct } from "../thrift/mod.ts";

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
export class Login {
    readonly client;
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
     * Login with email and password.
     * @param options.email account e-mail address
     * @param options.password account password
     * @param options.pincode Custom pin-code. It have to be 6-digit.
     * @param options.v3 use v3 login or not.
     * @param options.e2ee use e2ee login or not.
     */
    async withPassword(options: PasswordLoginOption): Promise<void> {
        let authToken: string;
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
        this.client.emit("update:authToken", authToken);
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

        const cert = this.getCert() || undefined;

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
        }
        return response.authToken;
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
            [[8, 2, LINEStruct.IdentityProvider(provider)]],
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

    public createSession(): Promise<string> {
        return this.client.request.request(
            [],
            "createSession",
            4,
            false,
            "/acct/lgn/sq/v1",
        );
    }

    public async createQrCode(qrcode: string): Promise<any> {
        return await this.client.request.request(
            [[11, 1, qrcode]],
            "createQrCode",
            4,
            false,
            "/acct/lgn/sq/v1",
        );
    }

    public async checkQrCodeVerified(qrcode: string): Promise<boolean> {
        try {
            await this.client.request.request(
                [[11, 1, qrcode]],
                "checkQrCodeVerified",
                4,
                false,
                "/acct/lp/lgn/sq/v1",
                {
                    "x-lst": "150000",
                    "x-line-access": qrcode,
                },
                this.client.config.timeout,
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

    public async createPinCode(qrcode: string): Promise<any> {
        return await this.client.request.request(
            [[11, 1, qrcode]],
            "createPinCode",
            4,
            false,
            "/acct/lgn/sq/v1",
        );
    }

    public async checkPinCodeVerified(qrcode: string): Promise<boolean> {
        try {
            await this.client.request.request(
                [[11, 1, qrcode]],
                "checkPinCodeVerified",
                4,
                false,
                "/acct/lp/lgn/sq/v1",
                {
                    "x-lst": "150000",
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
            [
                [11, 1, authSessionId],
                [11, 2, this.client.device],
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
    ): Promise<any> {
        return await this.client.request.request(
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
