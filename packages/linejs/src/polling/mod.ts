import type { Client } from "../core/mod.ts";
import { Operation, SquareMessage } from "./events/mod.ts";
export * from "./events/mod.ts";
export interface SyncData {
	square?: string;
	talk: {
		revision?: number | bigint;
		globalRev?: number | bigint;
		individualRev?: number | bigint;
	};
}

function sleep(time: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, time);
	});
}

export class Polling {
	sync: SyncData = { talk: {} };
	polling_talk = false;
	polling_square = false;
	polling_delay = 1000;

	client: Client;
	constructor(client: Client) {
		this.client = client;
	}
	async square(): Promise<void> {
		if (this.polling_square) {
			return;
		}
		this.polling_square = true;
		let continuationToken: string | undefined;
		while (this.polling_square) {
			try {
				const response = await this.client.square.fetchMyEvents({
					syncToken: this.sync.square,
					continuationToken,
					limit: 100,
				});
				this.sync.square = response.syncToken;
				continuationToken = response.continuationToken;
				for (const event of response.events) {
					this.client.emit("square:event", event);
					if (
						event.type === "NOTIFICATION_MESSAGE" &&
						event.payload.notificationMessage
					) {
						this.client.emit(
							"square:message",
							new SquareMessage(
								{
									squareEventNotificationMessage:
										event.payload.notificationMessage,
								},
								this.client,
							),
						);
					}
				}
			} catch (_e) {
				this.client.log("squarePollingError", { error: _e });
			}
			await sleep(this.polling_delay);
		}
	}

	async talk(): Promise<void> {
		if (this.polling_talk) {
			return;
		}
		this.polling_talk = true;
		while (this.polling_talk) {
			try {
				const response = await this.client.talk.sync({
					...this.sync.talk,
					limit: 100,
				});
				if (
					response.fullSyncResponse &&
					response.fullSyncResponse.nextRevision
				) {
					this.sync.talk.revision = response.fullSyncResponse.nextRevision;
					continue;
				}
				if (
					response.operationResponse.globalEvents &&
					response.operationResponse.globalEvents.lastRevision
				) {
					this.sync.talk.globalRev =
						response.operationResponse.globalEvents.lastRevision;
				}
				if (
					response.operationResponse.individualEvents &&
					response.operationResponse.individualEvents.lastRevision
				) {
					this.sync.talk.individualRev =
						response.operationResponse.individualEvents
							.lastRevision;
				}
				if (!response.operationResponse.operations) {
					continue;
				}
				for (const event of response.operationResponse.operations) {
					this.sync.talk.revision = event.revision;
					if (event.message) {
						event.message = await this.client.e2ee
							.decryptE2EEMessage(event.message);
					}
					const operation = new Operation(event, this.client);
					this.client.emit("event", operation);
					if (
						(operation.type === "SEND_MESSAGE" ||
							operation.type === "RECEIVE_MESSAGE") &&
						operation.message
					) {
						this.client.emit(
							"message",
							operation.message,
						);
					}
				}
			} catch (_e) {
				this.client.log("talkPollingError", { error: _e });
			}
			await sleep(this.polling_delay);
		}
	}
}
