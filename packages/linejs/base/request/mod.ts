import {
	type NestedArray,
	type ParsedThrift,
	type ProtocolKey,
	Protocols,
} from "../thrift/mod.ts";
import { type BaseClient, InternalError } from "../core/mod.ts";

const square = ["/SQ1", "/SQLV1"];

/**
 * Request Client
 */
/**
 * @class RequestClient
 * @description A client for making requests to the LINE API.
 *
 * @property {BaseClient} client - The base client instance.
 * @property {string} endpoint - The endpoint for the API requests.
 * @property {string} userAgent - The user agent string for the requests.
 * @property {string} systemType - The system type string for the requests.
 * @property {Record<string, string | undefined>} EXCEPTION_TYPES - A static record of exception types based on request paths.
 *
 * @constructor
 * @param {BaseClient} client - The base client instance.
 */
export class RequestClient {
	readonly client: BaseClient;
	endpoint: string;
	userAgent: string;
	/**
	 * x-line-application
	 */
	systemType: string;
	static readonly EXCEPTION_TYPES: Record<string, string | undefined> = {
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

	constructor(client: BaseClient) {
		const deviceDetails = client.deviceDetails;
		this.endpoint = client.endpoint ?? "legy.line-apps.com";
		this.systemType =
			`${deviceDetails.device}\t${deviceDetails.appVersion}\t${deviceDetails.systemName}\t${deviceDetails.systemVersion}`;
		this.userAgent = `Line/${deviceDetails.appVersion}`;
		this.client = client;
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
	 */
	public async request<T = unknown>(
		value: NestedArray,
		methodName: string,
		protocolType: ProtocolKey = 3,
		parse: boolean | string = true,
		path: string = "/S3",
		headers: Record<string, string | undefined> = {},
		timeout = this.client.config.timeout,
	): Promise<T> {
		const res = await this.requestCore(
			path,
			value,
			methodName,
			protocolType,
			headers,
			undefined,
			parse,
			undefined,
			timeout,
		);
		return res.data.success;
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
	 * @param {number} [timeout=this.timeOutMs] - The timeout milliseconds of the request.
	 * @returns {Promise<ParsedThrift>} The response.
	 * @throws {InternalError} If the request fails or timeout.
	 */
	private async requestCore(
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
		const protocol = Protocols[protocolType];

		const headers = {
			...this.getHeader(overrideMethod),
			...appendHeaders,
		};

		this.client.log("writeThrift", {
			value,
			methodName,
			protocolType,
		});

		const Trequest = this.client.thrift.writeThrift(
			value,
			methodName,
			protocol,
		);

		this.client.log("request", {
			methodName,
			path: `https://${this.endpoint}${path}`,
			method: overrideMethod,
			headers,
			timeout,
			body: Trequest,
		});

		const response = await this.client.fetch(
			`https://${this.endpoint}${path}`,
			{
				method: overrideMethod,
				headers,
				signal: AbortSignal.timeout(timeout),
				// @ts-expect-error: will fix cuz typescript version change
				body: Trequest,
			},
		);
		const nextToken = response.headers.get("x-line-next-access");
		if (nextToken) {
			this.client.emit("update:authtoken", nextToken);
		}
		const body = await response.arrayBuffer();
		const parsedBody = new Uint8Array(body);
		this.client.log("response", {
			...response,
			parsedBody,
			methodName,
		});
		let res: ParsedThrift;
		let hasError = false;
		try {
			res = this.client.thrift.readThrift(parsedBody, protocol);
		} catch {
			throw new Error(
				`Request internal failed: Invalid response buffer <${
					[...parsedBody].map((e) => e.toString(16)).join(" ")
				}>`,
			);
		}
		if (!res.data[0] && Object.keys(res.data).length) {
			hasError = true;
		}
		if (parse === true) {
			this.client.thrift.rename_data(res, square.includes(path));
		} else if (typeof parse === "string") {
			res.data.success = this.client.thrift.rename_thrift(
				parse,
				res.data[0],
			);
			delete res.data[0];
			if (res.data[1]) {
				const structName = RequestClient.EXCEPTION_TYPES[path] ||
					"TalkException";
				if (structName) {
					res.data.e = this.client.thrift.rename_thrift(
						structName,
						res.data[1],
					);
				} else {
					res.data.e = res.data[1];
				}
				delete res.data[1];
			}
		} else {
			res.data.success = res.data[0];
			delete res.data[0];
			if (res.data[1]) {
				const structName = RequestClient.EXCEPTION_TYPES[path] ||
					"TalkException";
				if (structName) {
					res.data.e = this.client.thrift.rename_thrift(
						structName,
						res.data[1],
					);
				} else {
					res.data.e = res.data[1];
				}
				delete res.data[1];
			}
		}

		this.client.log("readThrift", {
			res,
		});

		const isRefresh = Boolean(
			res.data.e &&
				res.data.e.code === "MUST_REFRESH_V3_TOKEN" &&
				await this.client.storage.get("refreshToken"),
		);

		if (res.data.e && !isRefresh) {
			throw new InternalError(
				"RequestError",
				`Request internal failed, ${methodName}(${path}) -> ` +
					JSON.stringify(res.data.e),
				res.data.e,
			);
		}
		if (hasError && !isRefresh) {
			if (res.data.e.code === "NOT_AUTHORIZED_DEVICE") {
				delete this.client.authToken;
				this.client.emit("end", this.client.profile!);
			}
			throw new InternalError(
				"RequestError",
				`Request internal failed, ${methodName}(${path}) -> ` +
					JSON.stringify(res.data),
				res.data,
			);
		}

		if (isRefresh && !isReRequest) {
			await this.client.auth.tryRefreshToken();
			return this.requestCore(
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
	 * @param {string} [overrideMethod="POST"] The HTTP method to use in the `x-lhm` header.
	 * @returns {Record<string, string>} An object with the headers as key-value pairs.
	 */
	public getHeader(
		overrideMethod: string = "POST",
	): Record<string, string> {
		const header = {
			Host: this.endpoint,
			accept: "application/x-thrift",
			"user-agent": this.userAgent,
			"x-line-application": this.systemType,
			"content-type": "application/x-thrift",
			"x-lal": "ja_JP",
			"x-lpv": "1",
			"x-lhm": overrideMethod,
			"accept-encoding": "gzip",
		} as Record<string, string>;

		if (this.client.authToken) {
			header["x-line-access"] = this.client.authToken;
		}

		return header;
	}
}
