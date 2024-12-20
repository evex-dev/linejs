// For Channel (channel, voom, etc)

import { LINEStruct, type ProtocolKey } from "../../thrift/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import type { ClientInitBase } from "../../core/types.ts";
import type { Client } from "../../core/mod.ts";
import type { BaseService } from "../types.ts";
export class ChannelService implements BaseService {
    client: Client;
    protocolType: ProtocolKey = 4;
    requestPath = "/CH4";
    errorName = "ChannelServiceError";
    constructor(client: Client) {
        this.client = client;
    }
    /**
     * @description Gets the ChannelToken by channelId.\
     * channelIds:
     * - linevoom: 1341209850
     */
    async approveChannelAndIssueChannelToken(
        ...param: Parameters<
            typeof LINEStruct.approveChannelAndIssueChannelToken_args
        >
    ): Promise<LINETypes.approveChannelAndIssueChannelToken_result["success"]> {
        return await this.client.request.request(
            LINEStruct.approveChannelAndIssueChannelToken_args(...param),
            "approveChannelAndIssueChannelToken",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
}
