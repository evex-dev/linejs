import { BaseClient } from "@evex/linejs/base";

const client = new BaseClient({
	device: "ANDROIDSECONDARY",
});

// by group+groupmid
await client.relation.addFriendByMid({
	mid: "uhex",
	reference: '{"screen":"groupMemberList","spec":"native"}',
	trackingMetaHint: "chex",
	trackingMetaType: 5,
});

// by LINE ID — searches then adds. Official Accounts include the leading "@"
await client.relation.addFriendByUserId({
	userId: "@livecast",
});

// or resolve the mid yourself
const contact = await client.relation.findContactBySearchIdOrTicketV3({
	searchId: "@livecast",
});
console.log(contact.mid, contact.displayName);

// by phone number (E.164, e.g. +<country><number> without a leading 0)
await client.relation.addFriendByPhone({
	phone: "+66814298575",
});

const byPhone = await client.relation.findContactByPhoneV3({
	phone: "+66814298575",
});
console.log(byPhone.mid, byPhone.displayName);
