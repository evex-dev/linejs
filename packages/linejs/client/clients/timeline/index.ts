import { InviteIntoChatRequest } from "../../../../types/line_types.ts";
import { ClientEvents } from "../../entities/events.ts";
import { Client } from "../../index.ts";

class Timeline extends Client {
    protected timeLineToken: stringing | undefined;

    protected async initTimeline() {
        if (this.timeLineToken) {
            return
        }
        this.timeLineToken = (await this.approveChannelAndIssueChannelToken({ channelId: "1341209850" })).channelAccessToken
    }

    public async createPost(options: {
        homeId: string,
        text?: string,
        sharedPostId?: string,
        textSizeMode?: string,
        backgroundColor?: string,
        textAnimation?: string,
        readPermissionType?: string,
        readPermissionGids?: any[],
        holdingTime?: number,
        stickerIds?: any[],
        stickerPackageIds?: any[],
        locationLatitudes?: any[],
        locationLongitudes?: any[],
        locationNames?: any[],
        mediaObjectIds?: any[],
        mediaObjectTypes?: any[],
        sourceType?: string,
    }) {
        const {homeId,textAnimation,} = {
            textSizeMode: "NORMAL",
            backgroundColor: "#FFFFFF",
            textAnimation: "NONE",
            readPermissionType: "ALL",
            sourceType: "TIMELINE",
            ,...options
    }
}
}