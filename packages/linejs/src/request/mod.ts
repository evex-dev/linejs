import { Protocols, type ParsedThrift, type ProtocolKey, type NestedArray } from "./thrift/declares.ts";
import ThriftRenameParser from "./thrift/parser.ts";
import { readThrift } from "./thrift/read.ts";
import { writeThrift } from "./thrift/write.ts";
import { getDeviceDetails, type Device } from './utils/devices.ts'

interface RequestClientInit {
    /**
     * API Endpoint
     * @default gw.line.naver.jp
     */
    endpoint?: string

    /**
     * Device
     * @defaults `'ANDROID'`
     */
    device: Device

    /**
     * Access Token
     */
    lineAccessToken?: string
}
/**
 * Request Client
 */
export class RequestClient {
    #endpoint: string
    #userAgent: string
    #systemType: string
    #lineAccessToken?: string
    #parser = new ThriftRenameParser()
    readonly #EXCEPTION_TYPES: Record<string, string | undefined> = {
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
	};

    constructor(init: RequestClientInit) {
        this.#endpoint = init.endpoint ?? 'gw.line.naver.jp'
        this.#lineAccessToken = init.lineAccessToken

        const deviceDetails = getDeviceDetails(init.device, {})
        if (!deviceDetails) {
            throw new Error(`Unsupported device: ${init.device}.`)
        }
        this.#systemType = `${init.device}\t${deviceDetails.appVersion}\t${deviceDetails.systemName}\t${deviceDetails.systemVersion}`
        this.#userAgent = `Line/${deviceDetails.appVersion}`
    }

    /**
     * @description Request to LINE API.
     *
     * @param value - The thrift value(argument) to request.
     * @param methodName - The method name of the request.
     * @param protocolType - The protocol type of the request.
     * @param parse - Whether to parse the response.
     * @param path - The path of the request.
     * @param headers - The headers of the request.
     * @param timeout - The timeout milliseconds of the request.
     * @returns The response.
     * ---
     * Use for functions that take one thrift struct argument
     * ```
     * SendMessageResponse sendMessage(1: SendMessageRequest request) throws(1: SquareException e);
     * ```
     */
    public async request(
        value: NestedArray,
        methodName: string,
        protocolType: ProtocolKey = 3,
        parse: boolean | string = true,
        path: string = "/S3",
        headers: Record<string, string | undefined> = {},
        timeout = 1000,
    ): Promise<unknown> {
        return (
            await this.rawRequest(
                path,
                [[12, 1, value]],
                methodName,
                protocolType,
                headers,
                undefined,
                parse,
                undefined,
                timeout,
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
     * @param {boolean} [isReRequest=false] - Is Re-Request.
     * @param {number} [timeOutMs=this.timeOutMs] - The timeout milliseconds of the request.
     * @returns {Promise<ParsedThrift>} The response.
     * @throws {InternalError} If the request fails or timeout.
     */
    public async rawRequest(
        path: string,
        value: NestedArray,
        methodName: string,
        protocolType: ProtocolKey,
        appendHeaders: object = {},
        overrideMethod: string = "POST",
        parse: boolean | string = true,
        isReRequest: boolean = false,
        timeout: number = 1000,
    ): Promise<ParsedThrift> {
        const Protocol = Protocols[protocolType];

        const headers = {
            ...this.getHeader(overrideMethod),
            ...appendHeaders
        }

        const Trequest = writeThrift(value, methodName, Protocol);
        const req = new Request(
            `https://${this.#endpoint}${path}`,
            {
                method: overrideMethod,
                headers,
                signal: AbortSignal.timeout(timeout),
                body: Trequest,
            })

        const response = await fetch(req);
        const nextToken = response.headers.get("x-line-next-access");
        if (nextToken) {
            console.warn('Next token')
        }
        const body = await response.arrayBuffer();
        const parsedBody = new Uint8Array(body);
        let res: {
            value: any;
            e: any;
            _info: any;
        };
        try {
            res = readThrift(parsedBody, Protocol);
        } catch {
            throw new Error(
                `Request internal failed, ${methodName}(${path}) -> Invalid response buffer: <${[...parsedBody].map((e) => e.toString(16)).join(" ")}>`,
            );
        }
        if (parse === true) {
            this.#parser.rename_data(res);
        } else if (typeof parse === "string") {
            res.value = this.#parser.rename_thrift(parse, res.value);
        }

        if (res.e) {
            const structName = this.#EXCEPTION_TYPES[path] || "TalkException";

            if (structName) {
                res.e = this.#parser.rename_thrift(structName, res.e);
            }
        }

        const isRefresh =
            res.e &&
            res.e["code"] === "MUST_REFRESH_V3_TOKEN"/*&&
            this.storage.get("refreshToken");*/

        if (res.e && !isRefresh) {
            throw new Error(
                `Request internal failed, ${methodName}(${path}) -> ` + JSON.stringify(res.e),
            );
        }

        if (isRefresh && !isReRequest) {
            throw new Error('Refresh token is not supported.')
            /*
            await this.tryRefreshToken();
            return this.rawRequest(
                path,
                value,
                methodName,
                protocolType,
                appendHeaders,
                overrideMethod,
                parse,
                true,
            );*/
        }
        return res;
    }

    /**
     * Get HTTP headers for a request.
     * @param {string} [overrideMethod="POST"] The HTTP method to use in the `x-lhm` header.
     * @returns {Record<string, string>} An object with the headers as key-value pairs.
     * @throws {InternalError} If the client has not been setup yet.
     */
    public getHeader(
        overrideMethod: string = "POST",
    ): Record<string, string> {
        const header = {
            Host: this.#endpoint,
            accept: "application/x-thrift",
            "user-agent": this.#userAgent,
            "x-line-application": this.#systemType,
            "content-type": "application/x-thrift",
            "x-lal": "ja_JP",
            "x-lpv": "1",
            "x-lhm": overrideMethod,
            "accept-encoding": "gzip",
        } as Record<string, string>;

        if (this.#lineAccessToken) {
            header["x-line-access"] = this.#lineAccessToken
        }

        return header;
    }
}