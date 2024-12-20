import { Thrift } from "../../packages/types/thrift.ts";
console.log(
    Object.keys(Thrift).map((k) =>
        k.endsWith("_args")
            ? k.startsWith("SquareService_")
                ? `
    // SquareService
    async ${k.replace("_args", "").replace("SquareService_", "")}(
        ...param: Parameters<typeof LINEStruct.${k}>
    ): Promise<${
                    Thrift[k.replace("_args", "_result")] &&
                        (Thrift[k.replace("_args", "_result")] as any[]).find(
                            (e) => e.name === "success",
                        )
                        ? `LINETypes.${
                            k.replace("_args", "")
                        }_result["success"]`
                        : "void"
                }> {
        return await this.client.request.request(
            LINEStruct.${k}(...param),
            "${k.replace("_args", "").replace("SquareService_", "")}",
            this.protocolType,
            true,
            this.requestPath,
        );
    }`
                : `
    async ${k.replace("_args", "")}(
        ...param: Parameters<typeof LINEStruct.${k}>
    ): Promise<${
                    Thrift[k.replace("_args", "_result")] &&
                        (Thrift[k.replace("_args", "_result")] as any[]).find(
                            (e) => e.name === "success",
                        )
                        ? `LINETypes.${
                            k.replace("_args", "")
                        }_result["success"]`
                        : "void"
                }> {
        return await this.client.request.request(
            LINEStruct.${k}(...param),
            "${k.replace("_args", "")}",
            this.protocolType,
            true,
            this.requestPath,
        );
    }`
            : ""
    ).join(""),
);
