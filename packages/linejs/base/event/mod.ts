import type { BaseClient } from "../core/mod.ts";

export * from "./message-class.ts";
export * from "./talk-class.ts";
export * from "./square-class.ts";

import { SquareMessage, TalkMessage } from "./message-class.ts";
import { Operation } from "./talk-class.ts";

export class LineEvent {
    client: BaseClient;
    constructor(client: BaseClient) {
        this.client = client;
    }
    async talk() {
        for await (const event of this.client.polling.talk()) {
            if (
                event.type === "SEND_MESSAGE" ||
                event.type === "RECEIVE_MESSAGE"
            ) {
                const message = await this.client.e2ee.decryptE2EEMessage(
                    event.message,
                );
                this.client.emit(
                    "message",
                    new TalkMessage({ message }, this.client),
                );
            }
            this.client.emit("event", new Operation(event, this.client));
        }
    }
    async square() {
        for await (const event of this.client.polling.square()) {
            if (
                event.payload.notificationMessage &&
                event.type === "NOTIFICATION_MESSAGE"
            ) {
                this.client.emit(
                    "square:message",
                    new SquareMessage({
                        squareEventNotificationMessage:
                            event.payload.notificationMessage,
                    }, this.client),
                );
            }
            this.client.emit("square:event", event);
        }
    }
}
