import type { ClientInitBase } from "../core/types.ts";
import { getRSACrypto } from "./rsa-verify.ts";
import { EMAIL_REGEX, PASSWORD_REGEX } from "./regex.ts";
import { isV3Support } from "../core/utils/devices.ts";
import { InternalError } from "../core/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import type { Buffer } from "node:buffer";
import { LINEStruct } from "../thrift/mod.ts";

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
    constructor(init: ClientInitBase) {
        this.client = init.client;
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
                const verifier = await this.customFetch(
                    `https://${this.endpoint}/Q`,
                    {
                        headers: headers,
                    },
                ).then((res) => res.json());
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
    public getRSAKeyInfo(
        provider: LINETypes.IdentityProvider = 0,
    ): Promise<LINETypes.RSAKey> {
        return this.client.request.request(
            [[8, 2, LINEStruct.IdentityProvider(provider)]],
            "getRSAKeyInfo",
            3,
            "RSAKey",
            "/api/v3/TalkService.do",
        );
    }
}
