import {
    loginWithAuthToken,
    loginWithPassword,
    loginWithQR,
} from "@evex/linejs";
import { FileStorage } from "@evex/linejs/storage";
import { Buffer } from "node:buffer";

const client = await loginWithAuthToken(
    "DUMMYTOKEN",
    {
        device: "DESKTOPWIN",
        storage: new FileStorage("./storage.json"),
    },
);

await client.base.talk.acceptChatInvitation({
    request: {
        reqSeq: await client.base.getReqseq(),
        chatMid: "c...",
    },
});

await client.base.talk.acceptChatInvitationByTicket({
    request: {
        reqSeq: await client.base.getReqseq(),
        ticketId: "...",
        chatMid: "c...",
    },
});

await client.base.talk.acquireEncryptedAccessToken({
    featureType: "OBS_GENERAL",
});

await client.base.talk.addToFollowBlacklist({
    addToFollowBlacklistRequest: {
        followMid: {
            mid: "u...",
            eMid: "...",
        },
    },
});

await client.base.talk.blockContact({
    reqSeq: await client.base.getReqseq(),
    id: "u...",
});

await client.base.talk.blockRecommendation({
    reqSeq: await client.base.getReqseq(),
    targetMid: "...",
});

await client.base.talk.bulkFollow({
    bulkFollowRequest: {
        followTargetMids: ["..."],
        unfollowTargetMids: ["..."],
        hasNext: false,
    },
});

await client.base.talk.cancelChatInvitation({
    request: {
        reqSeq: await client.base.getReqseq(),
        chatMid: "c...",
        targetUserMids: ["u..."],
    },
});

await client.base.talk.cancelReaction({
    cancelReactionRequest: {
        reqSeq: await client.base.getReqseq(),
        messageId: 99999999999999,
    },
});

await client.base.talk.changeVerificationMethod({
    sessionId: "...",
    method: "PIN_VIA_SMS",
});

await client.base.talk.clearRingtone({
    oid: "...",
});

await client.base.talk.createChat({
    request: {
        reqSeq: await client.base.getReqseq(),
        targetUserMids: ["u..."],
        type: "GROUP",
        name: "chat name",
        /* picturePath: "/0h...", */
    },
});

await client.base.talk.createChatRoomAnnouncement({
    reqSeq: await client.base.getReqseq(),
    chatRoomMid: "c...",
    type: "MESSAGE",
    contents: {
        text: "text",
        /* thumbnail: "https://img", */
        link: "line://nv/home",
        contentMetadata: {},
    },
});

await client.base.talk.createSession({
    request: {},
});

await client.base.talk.decryptFollowEMid({
    eMid: "",
});

await client.base.talk.deleteOtherFromChat({
    request: {
        chatMid: "c...",
        targetUserMids: ["u..."],
        reqSeq: await client.base.getReqseq(),
    },
});

await client.base.talk.deleteSelfFromChat({
    request: { chatMid: "c...", reqSeq: await client.base.getReqseq() },
});

await client.base.talk.determineMediaMessageFlow({
    request: {
        chatMid: "c...",
    },
});

await client.base.talk.fetchOperations({
    request: {
        offsetFrom: 999999,
        deviceId: "...",
    },
});

await client.base.talk.findChatByTicket({
    request: {
        ticketId: "...",
    },
});

await client.base.talk.findContactByUserTicket({
    ticketIdWithTag: "...",
});

await client.base.talk.findContactByUserid({
    searchId: "...",
});

await client.base.talk.findContactsByPhone({
    phones: ["..."],
});

await client.base.talk.finishUpdateVerification({
    sessionId: "...",
});

await client.base.talk.follow({
    followRequest: {
        followMid: {
            mid: "u...",
            eMid: "...",
        },
    },
});

await client.base.talk.generateUserTicket({
    expirationTime: 999999,
    maxUseCount: 999999,
});

await client.base.talk.getAllChatMids({
    syncReason: "INTERNAL",
    request: {
        withInvitedChats: true,
        withMemberChats: true,
    },
});

await client.base.talk.getAllContactIds({
    syncReason: "INTERNAL",
});

await client.base.talk.getBlockedContactIds({
    syncReason: "INTERNAL",
});

await client.base.talk.getBlockedRecommendationIds({
    syncReason: "INTERNAL",
});

await client.base.talk.getChat({
    chatMid: "c...",
});

await client.base.talk.getChatEffectMetaList({
    categories: ["BACKGROUND", "CONTENT_METADATA_TAG_BASED", "KEYWORD"],
});

await client.base.talk.getChatRoomAnnouncements({
    chatRoomMid: "c...",
});

await client.base.talk.getChatRoomAnnouncementsBulk({
    chatRoomMids: ["c..."],
});

await client.base.talk.getChatRoomBGMs({
    chatRoomMids: ["c..."],
    syncReason: "INTERNAL",
});

await client.base.talk.getChats({
    chatMids: ["c..."],
});

await client.base.talk.getConfigurations({
    syncReason: "INTERNAL",
    revision: 0,
    carrier: "...",
    regionOfLocale: "...",
    regionOfTelephone: "...",
    regionOfUsim: "...",
});

await client.base.talk.getContact({
    mid: "u...",
});

await client.base.talk.getContacts({
    mids: ["u..."],
});

await client.base.talk.getContactsV2({
    mids: ["u..."],
});

await client.base.talk.getCountries({
    countryGroup: "UNKNOWN",
});

await client.base.talk.getE2EEGroupSharedKey({
    chatMid: "c...",
    keyVersion: 0,
    groupKeyId: 9999,
});

await client.base.talk.getE2EEPublicKey({
    keyId: 9999,
    keyVersion: 0,
});

await client.base.talk.getE2EEPublicKeys();

await client.base.talk.getExtendedProfile({
    syncReason: "INTERNAL",
});

await client.base.talk.getFollowBlacklist({
    getFollowBlacklistRequest: { cursor: "..." },
});

await client.base.talk.getFollowers({
    getFollowersRequest: {
        followMid: { mid: "u...", eMid: "..." },
        cursor: "...",
    },
});

await client.base.talk.getFollowings({
    getFollowingsRequest: {
        followMid: { mid: "u...", eMid: "..." },
        cursor: "...",
    },
});

await client.base.talk.getFriendRequests({
    lastSeenSeqId: 0,
    direction: "INCOMING",
});

await client.base.talk.getInstantNews({
    region: "...",
    location: {
        latitude: 0,
        longitude: 0,
    },
});

await client.base.talk.getLastE2EEGroupSharedKey({
    keyVersion: 0,
    chatMid: "c...",
});

await client.base.talk.getLastE2EEPublicKeys({
    chatMid: "c...",
});

await client.base.talk.getMessageBoxes({
    messageBoxListRequest: {
        maxChatId: "c...",
        minChatId: "c...",
        activeOnly: true,
        lastMessagesPerMessageBoxCount: 1,
        messageBoxCountLimit: 100,
        unreadOnly: true,
        withUnreadCount: true,
    },
});

await client.base.talk.getMessageReadRange({
    chatIds: ["u...", "c..."],
    syncReason: "INTERNAL",
});

await client.base.talk.getNotificationSettings({
    request: {
        syncReason: "INTERNAL",
        chatMids: ["u...", "c..."],
    },
});

await client.base.talk.getPreviousMessagesV2WithRequest({
    request: {
        endMessageId: {
            deliveredTime: 9999,
            messageId: 9999,
        },
    },
});

await client.base.talk.getProfile();

await client.base.talk.getRecentFriendRequests();

await client.base.talk.getRecommendationIds();

await client.base.talk.getRepairElements({
    request: {
        profile: true,
        settings: true,
        configurations: {
            carrier: "...",
            regionOfLocale: "...",
            regionOfTelephone: "...",
            regionOfUsim: "...",
        },
        numLocalJoinedGroups: 0,
        numLocalInvitedGroups: 0,
        numLocalFriends: 0,
        numLocalRecommendations: 0,
        numLocalBlockedFriends: 0,
        numLocalBlockedRecommendations: 0,
        localGroupMembers: {
            "str": { invalidGroup: true, numMembers: 0 },
        },
        syncReason: "INTERNAL",
        localProfileMappings: { "str": 0 },
    },
});

await client.base.talk.getServerTime();

await client.base.talk.getSettings();

await client.base.talk.getSettingsAttributes2({
    attributesToRetrieve: [
        "AGREEMENT_MID",
    ],
});

await client.base.talk.inviteIntoChat({
    chatMid: "c...",
    targetUserMids: ["u..."],
});

await client.base.talk.isUseridAvailable({
    searchId: "...",
});

await client.base.talk.negotiateE2EEPublicKey({
    mid: "u...",
});

await client.base.talk.notifyInstalled({
    applicationTypeWithExtensions: "...",
    udidHash: "...",
});

await client.base.talk.notifyRegistrationComplete({
    applicationTypeWithExtensions: "...",
    udidHash: "...",
});

await client.base.talk.notifyUpdated({
    deviceInfo: {
        applicationType: "ANDROID",
        carrierCode: "JP_AU",
        carrierName: "...",
        deviceName: "...",
        model: "...",
        systemName: "...",
        systemVersion: "...",
        webViewVersion: "...",
    },
});

await client.base.talk.react({
    id: BigInt("0"),
    reaction: "NICE",
});

await client.base.talk.registerE2EEGroupKey({
    chatMid: "c...",
    encryptedSharedKeys: [new Buffer([])],
    keyIds: [0],
    keyVersion: 0,
    members: ["..."],
});

await client.base.talk.registerE2EEPublicKey(
    {
        reqSeq: await client.base.getReqseq(),
        publicKey: {
            createdTime: 0,
            keyData: "...",
            keyId: 0,
            version: 0,
        },
    },
);

await client.base.talk.registerUserid({
    reqSeq: await client.base.getReqseq(),
    searchId: "...",
});

await client.base.talk.reissueChatTicket({
    request: {
        groupMid: "c...",
        reqSeq: await client.base.getReqseq(),
    },
});

await client.base.talk.rejectChatInvitation({
    request: {
        chatMid: "c...",
        reqSeq: await client.base.getReqseq(),
    },
});

await client.base.talk.removeChatRoomAnnouncement({
    announcementSeq: 0,
    chatRoomMid: "c...",
    reqSeq: await client.base.getReqseq(),
});

await client.base.talk.removeFollower({
    removeFollowerRequest: {
        followMid: {
            eMid: "...",
            mid: "u...",
        },
    },
});

await client.base.talk.removeFriendRequest({
    direction: "INCOMING",
    midOrEMid: "...",
});

await client.base.talk.removeFromFollowBlacklist({
    removeFromFollowBlacklistRequest: {
        followMid: {
            eMid: "...",
            mid: "u...",
        },
    },
});

await client.base.talk.reportAbuseEx({
    request: {
        abuseReportEntry: {
            lineMeeting: {
                chatMid: "c...",
                evidenceIds: [{
                    objectId: "...",
                    spaceId: "...",
                }],
            },
        },
    },
});

await client.base.talk.reportDeviceState({
    booleanState: { 0: true },
    stringState: { 0: "..." },
});

await client.base.talk.reportPushRecvReports({
    reqSeq: await client.base.getReqseq(),
    pushRecvReports: [
        {
            battery: 0,
            batteryMode: "LOW_BATTERY",
            carrierCode: "...",
            clientNetworkType: "WIFI",
            displayTimestamp: 0,
            pushTrackingId: "...",
            recvTimestamp: 0,
        },
    ],
});

await client.base.talk.reportSettings({
    settings: {},
    syncOpRevision: 0,
});

await client.base.talk.resendPinCode({
    sessionId: "...",
});

await client.base.talk.sendChatChecked({
    chatMid: "c...",
    lastMessageId: "0",
    seq: 0,
    sessionId: 0,
});

await client.base.talk.sendChatRemoved({
    chatMid: "c...",
    lastMessageId: "0",
    seq: 0,
    sessionId: 0,
});

await client.base.talk.sendMessage({
    to: "u...",
    text: "...",
    contentType: "NONE",
    e2ee: true,
});

await client.base.talk.sendPostback({
    request: {
        chatMID: "...",
        messageId: "0",
        originMID: "...",
        url: "...",
    },
});

await client.base.talk.setChatHiddenStatus({
    setChatHiddenStatusRequest: {
        chatMid: "c...",
        hidden: true,
        lastMessageId: 0,
        reqSeq: await client.base.getReqseq(),
    },
});

await client.base.talk.setNotificationsEnabled({
    enablement: true,
    reqSeq: await client.base.getReqseq(),
    target: "c...",
    type: "USER",
});

await client.base.talk.sync({
    limit: 100,
    globalRev: 0,
    individualRev: 0,
    revision: 0,
    timeout: 30_000,
});

await client.base.talk.syncContacts({
    localContacts: [{
        emails: ["..."],
        luid: "...",
        mobileContactName: "...",
        phones: ["..."],
        phoneticName: "...",
        type: "MODIFY",
        userids: ["..."],
    }],
});

await client.base.talk.tryFriendRequest({
    friendRequestParams: "...",
    method: "NEARBY",
    midOrEMid: "...",
});

await client.base.talk.unblockContact({
    id: "...",
    reference: "...",
    reqSeq: await client.base.getReqseq(),
});

await client.base.talk.unblockRecommendation({
    reqSeq: await client.base.getReqseq(),
    targetMid: "...",
});

await client.base.talk.unfollow({
    unfollowRequest: {
        followMid: {
            mid: "u...",
            eMid: "...",
        },
    },
});

await client.base.talk.unsendMessage({
    messageId: "...",
    seq: 0,
});

await client.base.talk.updateChat({
    request: {
        reqSeq: await client.base.getReqseq(),
        chat: {
            /* struct Chat */
            chatMid: "c...",
            chatName: "test",
        },
        updatedAttribute: "NAME",
    },
});

await client.base.talk.updateChatRoomBGM({
    chatRoomBGMInfo: "...",
    chatRoomMid: "c...",
});

await client.base.talk.updateContactSetting({
    flag: "CONTACT_SETTING_DISPLAY_NAME_OVERRIDE",
    mid: "u...",
    reqSeq: await client.base.getReqseq(),
    value: "...",
});

await client.base.talk.updateNotificationToken({
    token: "...",
    type: "LINE_BOT",
});

await client.base.talk.updateProfileAttributes({
    reqSeq: await client.base.getReqseq(),
    request: {
        profileAttributes: {
            0: {
                meta: {
                    "...": "...",
                },
                value: "...",
            },
        },
    },
});

await client.base.talk.updateSettingsAttributes2({
    attributesToUpdate: ["AGREEMENT_SQUARE"],
    reqSeq: await client.base.getReqseq(),
    settings: {
        agreementSquareTime: 1,
    },
});

await client.base.talk.verifyPhoneNumber({
    migrationPincodeSessionId: "...",
    oldUdidHash: "...",
    pinCode: "...",
    sessionId: "...",
    udidHash: "...",
});

await client.base.talk.verifyQrcode({
    pinCode: "...",
    verifier: "...",
});

await client.base.talk.wakeUpLongPolling({
    clientRevision: 0,
});
