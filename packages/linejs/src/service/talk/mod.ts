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
    errorName = "TalkServiceError";
    constructor(client: Client) {
        this.client = client;
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
    async getProfile(): Promise<LINETypes.getProfile_result["success"]> {
        return await this.client.request.request(
            [],
            "getProfile",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async getSettings(
        ...param: Parameters<typeof LINEStruct.getSettings_args>
    ): Promise<LINETypes.getSettings_result["success"]> {
        return await this.client.request.request(
            LINEStruct.getSettings_args(...param),
            "getSettings",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async sendChatChecked(
        ...param: Parameters<typeof LINEStruct.sendChatChecked_args>
    ): Promise<void> {
        return await this.client.request.request(
            LINEStruct.sendChatChecked_args(...param),
            "sendChatChecked",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async sendChatRemoved(
        ...param: Parameters<typeof LINEStruct.sendChatRemoved_args>
    ): Promise<void> {
        return await this.client.request.request(
            LINEStruct.sendChatRemoved_args(...param),
            "sendChatRemoved",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async unsendMessage(
        ...param: Parameters<typeof LINEStruct.unsendMessage_args>
    ): Promise<void> {
        return await this.client.request.request(
            LINEStruct.unsendMessage_args(...param),
            "unsendMessage",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async getContactsV3(
        ...param: Parameters<typeof LINEStruct.getContactsV3_args>
    ): Promise<LINETypes.getContactsV3_result["success"]> {
        return await this.client.request.request(
            LINEStruct.getContactsV3_args(...param),
            "getContactsV3",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async getChats(
        ...param: Parameters<typeof LINEStruct.getChats_args>
    ): Promise<LINETypes.getChats_result["success"]> {
        return await this.client.request.request(
            LINEStruct.getChats_args(...param),
            "getChats",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async getAllChatMids(
        ...param: Parameters<typeof LINEStruct.getAllChatMids_args>
    ): Promise<LINETypes.getAllChatMids_result["success"]> {
        return await this.client.request.request(
            LINEStruct.getAllChatMids_args(...param),
            "getAllChatMids",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async deleteOtherFromChat(
        ...param: Parameters<typeof LINEStruct.deleteOtherFromChat_args>
    ): Promise<LINETypes.deleteOtherFromChat_result["success"]> {
        return await this.client.request.request(
            LINEStruct.deleteOtherFromChat_args(...param),
            "deleteOtherFromChat",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async inviteIntoChat(
        ...param: Parameters<typeof LINEStruct.inviteIntoChat_args>
    ): Promise<LINETypes.inviteIntoChat_result["success"]> {
        return await this.client.request.request(
            LINEStruct.inviteIntoChat_args(...param),
            "inviteIntoChat",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async cancelChatInvitation(
        ...param: Parameters<typeof LINEStruct.cancelChatInvitation_args>
    ): Promise<LINETypes.cancelChatInvitation_result["success"]> {
        return await this.client.request.request(
            LINEStruct.cancelChatInvitation_args(...param),
            "cancelChatInvitation",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async deleteSelfFromChat(
        ...param: Parameters<typeof LINEStruct.deleteSelfFromChat_args>
    ): Promise<LINETypes.deleteSelfFromChat_result["success"]> {
        return await this.client.request.request(
            LINEStruct.deleteSelfFromChat_args(...param),
            "deleteSelfFromChat",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async acceptChatInvitationByTicket(
        ...param: Parameters<
            typeof LINEStruct.acceptChatInvitationByTicket_args
        >
    ): Promise<LINETypes.acceptChatInvitationByTicket_result["success"]> {
        return await this.client.request.request(
            LINEStruct.acceptChatInvitationByTicket_args(...param),
            "acceptChatInvitationByTicket",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async acceptChatInvitation(
        ...param: Parameters<typeof LINEStruct.acceptChatInvitation_args>
    ): Promise<LINETypes.acceptChatInvitation_result["success"]> {
        return await this.client.request.request(
            LINEStruct.acceptChatInvitation_args(...param),
            "acceptChatInvitation",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async reissueChatTicket(
        ...param: Parameters<typeof LINEStruct.reissueChatTicket_args>
    ): Promise<LINETypes.reissueChatTicket_result["success"]> {
        return await this.client.request.request(
            LINEStruct.reissueChatTicket_args(...param),
            "reissueChatTicket",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async findChatByTicket(
        ...param: Parameters<typeof LINEStruct.findChatByTicket_args>
    ): Promise<LINETypes.findChatByTicket_result["success"]> {
        return await this.client.request.request(
            LINEStruct.findChatByTicket_args(...param),
            "findChatByTicket",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async updateChat(
        ...param: Parameters<typeof LINEStruct.updateChat_args>
    ): Promise<LINETypes.updateChat_result["success"]> {
        // TODO
        return await this.client.request.request(
            LINEStruct.updateChat_args(...param),
            "updateChat",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async getAllContactIds(
        ...param: Parameters<typeof LINEStruct.getAllContactIds_args>
    ): Promise<LINETypes.getAllContactIds_result["success"]> {
        return await this.client.request.request(
            LINEStruct.getAllContactIds_args(...param),
            "getAllContactIds",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
    async getBlockedContactIds(
        ...param: Parameters<typeof LINEStruct.getBlockedContactIds_args>
    ): Promise<LINETypes.getBlockedContactIds_result["success"]> {
        return await this.client.request.request(
            LINEStruct.getBlockedContactIds_args(...param),
            "getBlockedContactIds",
            this.protocolType,
            true,
            this.requestPath,
        );
    }
}
