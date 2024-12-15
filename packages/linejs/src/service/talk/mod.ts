import type { Client } from "../../core/mod.ts";
import type { ProtocolKey } from "../../thrift/mod.ts";
import type { BaseService } from "../types.ts";
import type * as LINETypes from "@evex/linejs-types";
import { LINEStruct } from "../../thrift/mod.ts";
import type { Buffer } from "node:buffer";
import { mergeObject } from "../../core/mod.ts";

export class TalkService implements BaseService {
    client: Client;
    protocolType: ProtocolKey = 4;
    requestPath = "/S4";
    constructor(client: Client) {
        this.client = client;
    }
    async getProfile(
        ...param: Parameters<typeof LINEStruct.getProfile_args>
    ): Promise<LINETypes.getProfile_result["success"]> {
        return await this.client.request.request(
            LINEStruct.getProfile_args(...param),
            "getProfile",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async sendMessage(options: {
        to: string;
        text?: string;
        contentType?: LINETypes.ContentType;
        contentMetadata?: Record<string, string>;
        relatedMessageId?: string;
        location?: LINETypes.Location;
        chunk?: string[] | Buffer[];
        e2ee?: boolean;
    }): Promise<LINETypes.sendMessage_result["success"]> {
        const message = mergeObject(options, {
            contentMetadata: {},
            contentType: "NONE",
        });
        // TODO: e2ee
        return await this.client.request.request(
            LINEStruct.sendMessage_args({ message }),
            "sendMessage",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
}
