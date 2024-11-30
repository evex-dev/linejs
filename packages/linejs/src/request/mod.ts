import { NestedArray, ProtocolKey } from "./thrift/declares.ts";

/**
 * Request to LINE API.
 *
 * @param {NestedArray} [value] - The thrift value(argument) to request.
 * @param {string} [methodName] - The method name of the request.
 * @param {ProtocolKey} [protocolType=3] - The protocol type of the request.
 * @param {boolean | string} [parse=true] - Whether to parse the response.
 * @param {string} [path="/S3"] - The path of the request.
 * @param {object} [headers={}] - The headers of the request.
 * @param {number} [timeOutMs=this.timeOutMs] - The timeout milliseconds of the request.
 * @returns {Promise<LooseType>} The response.
 *
 * ---
 * Use for functions that take one thrift struct argument
 * ```
 * SendMessageResponse sendMessage(1: SendMessageRequest request) throws(1: SquareException e);
 * ```
 */
export const request = async (
    value: NestedArray,
    methodName: string,
    protocolType: ProtocolKey = 3,
    parse: boolean | string = true,
    path: string = "/S3",
    headers: Record<string, string | undefined> = {},
    timeOutMs: number = 100,
): unknown => {
    return (
        await rawRequest(
            path,
            [[12, 1, value]],
            methodName,
            protocolType,
            headers,
            undefined,
            parse,
            undefined,
            timeOutMs,
        )
    ).value
}