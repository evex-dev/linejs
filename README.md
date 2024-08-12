# Line-Deno-Client

Line-Deno-ClientはDenoで書かれたLINEの非公式APIです

## コード例

### インスタンス生成

メールとパスワードでログイン:

```js
const LINE = new LineClient({
    device: "device",
    email: "email",
    pw: "pass_word",
    pincall: (pincode) => {
        // pincode callback
    },
}, () => {
    // oninit
});
```

Tokenから生成:

```js
const LINE = new LineClient({
    authToken: "authToken",
    device: "device",
}, () => {
    // oninit
});
```

### LINEリクエストを送信

`LineClient.request`を使用してthriftデータを送信、受信できます:

```js
await LINE.request(
    CHRdata = [], // CHRLINE Thrift [[ftype,fid,value],...]
    methodName, // Method Name
    protocol_type = 3, // 3:TBINARY 4:TCOMPACT
    parse = true, // true:auto-parse false:no-parse "name":name-parse
    path = "/S3", // gw.line.naver.jp{path}
    headers = {}, // HTTP headers
);
// return Promise<Object(thriftData)>
// throw error.cause = thriftExceptionData
```

実装されているメソッドを利用することもできます:

```js
// SquareServise
await LINE.getJoinedSquares(limit = 50, continuationToken);
await LINE.inviteIntoSquareChat(inviteeMids, squareChatMid);
await LINE.inviteToSquare(squareMid, invitees, squareChatMid);
await LINE.markAsRead(squareChatMid, messageId);
await LINE.reactToMessage(squareChatMid, messageId, reactionType = 2);
/*
    reactionType
        ALL     = 0,
        UNDO    = 1,
        NICE    = 2,
        LOVE    = 3,
        FUN     = 4,
        AMAZING = 5,
        SAD     = 6,
        OMG     = 7,
*/
await LINE.findSquareByInvitationTicket(invitationTicket);
await LINE.fetchMyEvents(
    syncToken = undefined,
    limit = 100,
    continuationToken = undefined,
    subscriptionId,
);
await LINE.fetchSquareChatEvents(
    squareChatMid,
    syncToken = undefined,
    continuationToken = undefined,
    subscriptionId = 0,
    limit = 100,
);
await LINE.sendSquareMessage(
    squareChatMid,
    text = "test Message",
    contentType = 0,
    contentMetadata = {},
    relatedMessageId = undefined,
);
await LINE.getSquare(squareMid);
await LINE.getSquareChat(squareChatMid);
await LINE.getJoinableSquareChats(
    squareMid,
    continuationToken = undefined,
    limit = 100,
);
await LINE.createSquare(
    name = "TEST Square",
    displayName = "Tester",
    profileImageObsHash =
        "0h6tJf0hQsaVt3H0eLAsAWDFheczgHd3wTCTx2eApNKSoefHNVGRdwfgxbdgUMLi8MSngnPFMeNmpbLi8MSngnPFMeNmpbLi8MSngnOA",
    desc = "test with LINE-Deno-Client",
    searchable = true,
    SquareJoinMethodType = 0,
);
/*
    SquareJoinMethodType
        NONE(0),
        APPROVAL(1),
        CODE(2);
*/
await LINE.getSquareChatAnnouncements(squareChatMid);
await LINE.updateSquareFeatureSet(
    updateAttributes = [],
    squareMid,
    revision,
    creatingSecretSquareChat = 0,
);
/*
    updateAttributes:
        CREATING_SECRET_SQUARE_CHAT(1),
        INVITING_INTO_OPEN_SQUARE_CHAT(2),
        CREATING_SQUARE_CHAT(3),
        READONLY_DEFAULT_CHAT(4),
        SHOWING_ADVERTISEMENT(5),
        DELEGATE_JOIN_TO_PLUG(6),
        DELEGATE_KICK_OUT_TO_PLUG(7),
        DISABLE_UPDATE_JOIN_METHOD(8),
        DISABLE_TRANSFER_ADMIN(9),
        CREATING_LIVE_TALK(10);
*/
await LINE.joinSquare(
    squareMid,
    displayName,
    ableToReceiveMessage = false,
    passCode = undefined,
);
await LINE.removeSubscriptions(subscriptionIds = []);
await LINE.unsendSquareMessage(squareChatMid, messageId);
await LINE.createSquareChat(
    squareChatMid,
    name,
    chatImageObsHash,
    squareChatType = 1,
    maxMemberCount = 5000,
    ableToSearchMessage = 1,
    squareMemberMids = [],
);
/*
    - SquareChatType:
        OPEN(1),
        SECRET(2),
        ONE_ON_ONE(3),
        SQUARE_DEFAULT(4);
    - ableToSearchMessage:
        NONE(0),
        OFF(1),
        ON(2);
*/
await LINE.getSquareChatMembers(
    squareChatMid,
    continuationToken = undefined,
    limit = 200,
);
await LINE.getSquareFeatureSet(squareMid);
await LINE.getSquareInvitationTicketUrl(mid);
await LINE.updateSquareChatMember(
    squareMemberMid,
    squareChatMid,
    notificationForMessage = true,
    notificationForNewMember = true,
    updatedAttrs = [6],
);
/*
    - SquareChatMemberAttribute:
        MEMBERSHIP_STATE(4),
        NOTIFICATION_MESSAGE(6),
        NOTIFICATION_NEW_MEMBER(7);
*/
await LINE.updateSquareMember(
    updatedAttrs = [],
    updatedPreferenceAttrs = [],
    squareMemberMid,
    squareMid,
    revision,
    displayName,
    membershipState,
    role,
);
/*
    SquareMemberAttribute:
        DISPLAY_NAME(1),
        PROFILE_IMAGE(2),
        ABLE_TO_RECEIVE_MESSAGE(3),
        MEMBERSHIP_STATE(5),
        ROLE(6),
        PREFERENCE(7);
    SquareMembershipState:
        JOIN_REQUESTED(1),
        JOINED(2),
        REJECTED(3),
        LEFT(4),
        KICK_OUT(5),
        BANNED(6),
        DELETED(7);
*/
await LINE.kickOutSquareMember(sid, pid);
await LINE.checkSquareJoinCode(squareMid, code);
await LINE.createSquareChatAnnouncement(
    squareChatMid,
    messageId,
    text,
    senderSquareMemberMid,
    createdAt,
    announcementType = 0,
);
await LINE.getSquareMember(squareMemberMid);
await LINE.searchSquareChatMembers(
    squareChatMid,
    displayName = "",
    continuationToken,
    limit = 20,
);
await LINE.getSquareEmid(squareMid);
await LINE.getSquareMembersBySquare(squareMid, squareMemberMids = []);
await LINE.manualRepair(syncToken, limit = 100, continuationToken);
await LINE.sendSquareRequestByName(METHOD_NAME, params); // send SquareRequest
// LINEServise
await LINE.getProfile();
// LiffServise
await LINE.issueLiffView(
    chatMid,
    liffId = "1562242036-RW04okm",
    lang = "ja_JP",
);
// ChannelService
await LINE.approveChannelAndIssueChannelToken(channelId = "1341209850");
```

### イベントハンドラー

Squareでイベントハンドラーを利用できます。

fetchMyEventsのハンドラー:

```js
const handler = (event, line) => {
    console.log(event);
};
const remove = await LINE.squareEvent(handler, syncToken, interval, remove);
function stopRoop() {
    remove.remove = true;
}
```

fetchSquareChatEventsのハンドラー:

```js
const handler = (event, line, mid) => {
    console.log(event);
};
const remove = await LINE.squareChatEvent(
    handler,
    mid,
    syncToken,
    interval,
    remove,
);
function stopRoop() {
    remove.remove = true;
}
```

addEventListenerを利用して処理することもできます。

fetchMyEventsのハンドラー:

```js
const eventTarget = LINE.getSquareEventTarget();
eventTarget.addEventListener(
    "message",
    (e) => console.log(e.squareMessage.message.text),
);
eventTarget.onmessage = (e) => console.log(e.squareMessage.message.text);

function stopRoop() {
    eventTarget.remove.remove = true;
}
```

fetchMyEventsのハンドラー:

```js
const eventTarget = LINE.getSquareChatEventTarget(mid);
eventTarget.addEventListener(
    "message",
    (e) => {
        console.log(e.squareMessage.message.text);
        LINE.sendSquareMessage(
            mid,
            e.squareMessage.message.text,
        );
        // echo BOT
    },
);
eventTarget.onmessage = (e) => console.log(e.squareMessage.message.text);
// message は receiveMessage,sendMessage の受信時にも発火します
eventTarget.addEventListener(
    "markAsRead",
    (e) => console.log("既読:", e),
);

function stopRoop() {
    eventTarget.remove.remove = true;
}
```

## Thanks

`This project got their help directly/indirectly, thank them deeply`

- [EdamAmex](https://github.com/EdamAme-x)
- [羽風](https://github.com/hafusun)
- [jkFujiyama](https://github.com/jkFujiyama)
- [CHRLINE](https://github.com/DeachSword/CHRLINE)
- [thriftrw-node](https://github.com/thriftrw/thriftrw-node/)
- LINE open-chat 拓也集落's group members
