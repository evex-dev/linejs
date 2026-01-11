import { BaseClient } from "@evex/linejs/base";

const client = new BaseClient({
    device: "ANDROIDSECONDARY"
});

// by group+groupmid
await client.relation.addFriendByMid({
    mid: "uhex",
    reference: '{"screen":"groupMemberList","spec":"native"}',
    trackingMetaHint: "chex",
    trackingMetaType: 4,
})


// by talk+chatmid
await client.relation.addFriendByMid({
    mid: "uhex",
    reference: '{"screen":"talkroom:message","spec":"native"}',
    trackingMetaHint: "uhex",
    trackingMetaType: 4,
})
