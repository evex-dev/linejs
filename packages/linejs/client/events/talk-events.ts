import type { SourceEvent } from "./mod.ts";
import { LINEEventBase } from "./shared.ts";
import type * as line from "@evex/linejs-types";
import { parseEnum } from "@evex/linejs-types/thrift";

/**
 * An event that indicates a message has been read.
 */
export class NotifiedReadMessage extends LINEEventBase {
  readonly type: "NOTIFIED_READ_MESSAGE" = "NOTIFIED_READ_MESSAGE";
  readonly chatMid: string;
  readonly messageId: string;

  /**
   * The mid of the user who read the message.
   * This is a placeholder property and will be replaced in the future.
   */
  readonly readUserMid: string;

  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "NOTIFIED_READ_MESSAGE") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param2 === "undefined" ||
      typeof op.param3 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.chatMid = op.param1;
    this.readUserMid = op.param2;
    this.messageId = op.param3;
  }
}

/**
 * @description you unsend the message
 */
export class DestroyMessage extends LINEEventBase {
  readonly type: "DESTROY_MESSAGE" = "DESTROY_MESSAGE";
  readonly messageId: string;
  readonly chatMid: string;

  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "DESTROY_MESSAGE") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param1 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.messageId = op.param2;
    this.chatMid = op.param1;
  }
}
/**
 * @description the user unsend the message
 */
export class NotifiedDestroyMessage extends LINEEventBase {
  readonly type: "NOTIFIED_DESTROY_MESSAGE" = "NOTIFIED_DESTROY_MESSAGE";
  messageId: string;
  chatMid: string;

  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "NOTIFIED_DESTROY_MESSAGE") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param2 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.messageId = op.param2;
    this.chatMid = op.param1;
  }
}
/**
 * @description the user joined the chat
 */
export class NotifiedJoinChat extends LINEEventBase {
  readonly type: "NOTIFIED_JOIN_CHAT" = "NOTIFIED_JOIN_CHAT";
  readonly userMid: string;
  readonly chatMid: string;

  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "NOTIFIED_JOIN_CHAT") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param2 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.userMid = op.param2;
    this.chatMid = op.param1;
  }
}

/**
 * @description the user accepted the chat invitation
 */
export class NotifiedAcceptChatInvitation extends LINEEventBase {
  readonly type: "NOTIFIED_ACCEPT_CHAT_INVITATION" =
    "NOTIFIED_ACCEPT_CHAT_INVITATION";
  userMid: string;
  chatMid: string;

  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "NOTIFIED_ACCEPT_CHAT_INVITATION") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param2 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.userMid = op.param2;
    this.chatMid = op.param1;
  }
}

/**
 * @description the user was invited into chat by you
 */
export class InviteIntoChat extends LINEEventBase {
  readonly type: "INVITE_INTO_CHAT" = "INVITE_INTO_CHAT";
  userMid: string;
  chatMid: string;

  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "INVITE_INTO_CHAT") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param2 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.userMid = op.param2;
    this.chatMid = op.param1;
  }
}

/**
 * @description you left the chat
 */
export class DeleteSelfFromChat extends LINEEventBase {
  readonly type: "DELETE_SELF_FROM_CHAT" = "DELETE_SELF_FROM_CHAT";
  chatMid: string;

  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "DELETE_SELF_FROM_CHAT") {
      throw new TypeError("Wrong operation type");
    }
    if (typeof op.param1 === "undefined") {
      throw new TypeError("Wrong param");
    }
    this.chatMid = op.param1;
  }
}

/**
 * @description the user left (kicked) the chat
 */
export class NotifiedLeaveChat extends LINEEventBase {
  readonly type: "NOTIFIED_LEAVE_CHAT" = "NOTIFIED_LEAVE_CHAT";
  userMid: string;
  chatMid: string;

  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "NOTIFIED_LEAVE_CHAT") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param2 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.userMid = op.param2;
    this.chatMid = op.param1;
  }
}

/**
 * @description the other user was kicked from chat by you
 */
export class DeleteOtherFromChat extends LINEEventBase {
  readonly type: "DELETE_OTHER_FROM_CHAT" = "DELETE_OTHER_FROM_CHAT";
  userMid: string;
  chatMid: string;

  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "DELETE_OTHER_FROM_CHAT") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param2 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.userMid = op.param2;
    this.chatMid = op.param1;
  }
}

/**
 * @description the profile content was updated by user
 */
export class NotifiedUpdateProfileContent extends LINEEventBase {
  readonly type: "NOTIFIED_UPDATE_PROFILE_CONTENT" =
    "NOTIFIED_UPDATE_PROFILE_CONTENT";
  userMid: string;
  profileAttributes: (line.Pb1_K6 | null)[] = [];

  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "NOTIFIED_UPDATE_PROFILE_CONTENT") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param2 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.userMid = op.param1;
    const attr = parseEnum("ProfileAttribute", op.param2);
    if (attr !== null) {
      this.profileAttributes[0] = attr as any as line.Pb1_K6;
    } else {
      const arr: line.Pb1_K6[] = [];
      [...(parseInt(op.param2).toString(2))].forEach((e, i) => {
        if (e == "1") {
          arr.push(
            parseEnum(
              "ProfileAttribute",
              2 ** i,
            ) as any as line.Pb1_K6,
          );
        }
      });
      this.profileAttributes = arr;
    }
  }
}

/**
 * @description the profile was updated by user
 */
export class NotifiedUpdateProfile extends LINEEventBase {
  readonly type: "NOTIFIED_UPDATE_PROFILE" = "NOTIFIED_UPDATE_PROFILE";
  userMid: string;
  profileAttributes: (line.Pb1_K6 | null)[] = [];
  info: Record<string, any> = {};

  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "NOTIFIED_UPDATE_PROFILE") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param2 === "undefined" ||
      typeof op.param3 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.userMid = op.param1;
    const attr = parseEnum("ProfileAttribute", op.param2);
    if (attr !== null) {
      this.profileAttributes[0] = attr as any as line.Pb1_K6;
    } else {
      const arr: line.Pb1_K6[] = [];
      [...(parseInt(op.param2).toString(2))].forEach((e, i) => {
        if (e == "1") {
          arr.push(
            parseEnum(
              "ProfileAttribute",
              2 ** i,
            ) as any as line.Pb1_K6,
          );
        }
      });
      this.profileAttributes = arr;
    }
    this.info = JSON.parse(op.param3);
  }
}

/**
 * @description the message was reacted by ypu
 */
export class SendReaction extends LINEEventBase {
  readonly type: "SEND_REACTION" = "SEND_REACTION";
  chatMid: string;
  messageId: string;
  reactionType: line.MessageReactionType;
  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "SEND_REACTION") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param2 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.messageId = op.param1;
    const data = JSON.parse(op.param2);
    this.chatMid = data.chatMid;
    this.reactionType = parseEnum(
      "MessageReactionType",
      data.curr.predefinedReactionType,
    ) as line.MessageReactionType;
  }
}

/**
 * @description the message was reacted by user
 */
export class NotifiedSendReaction extends LINEEventBase {
  readonly type: "NOTIFIED_SEND_REACTION" = "NOTIFIED_SEND_REACTION";
  chatMid: string;
  messageId: string;
  userMid: string;
  reactionType: line.MessageReactionType;
  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "NOTIFIED_SEND_REACTION") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param2 === "undefined" ||
      typeof op.param3 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.messageId = op.param1;
    this.userMid = op.param3;
    const data = JSON.parse(op.param2);
    this.chatMid = data.chatMid;
    this.reactionType = parseEnum(
      "MessageReactionType",
      data.curr.predefinedReactionType,
    ) as line.MessageReactionType;
  }
}

/**
 * @description the message was read by you
 */
export class SendChatChecked extends LINEEventBase {
  readonly type: "SEND_CHAT_CHECKED" = "SEND_CHAT_CHECKED";
  chatMid: string;
  messageId: string;

  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "SEND_CHAT_CHECKED") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param2 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.chatMid = op.param1;
    this.messageId = op.param2;
  }
}

/**
 * @description the chatroom history was removed by you
 */
export class SendChatRemoved extends LINEEventBase {
  readonly type: "SEND_CHAT_REMOVED" = "SEND_CHAT_REMOVED";
  chatMid: string;
  messageId: string;

  constructor(source: SourceEvent & { type: "talk" }) {
    super(source);
    const op = source.event;
    if (op.type !== "SEND_CHAT_REMOVED") {
      throw new TypeError("Wrong operation type");
    }
    if (
      typeof op.param1 === "undefined" ||
      typeof op.param2 === "undefined"
    ) {
      throw new TypeError("Wrong param");
    }
    this.chatMid = op.param1;
    this.messageId = op.param2;
  }
}
