import type { Pb1_C13154r6, SquareEvent } from "../../../types/line_types.ts";
import type { Client } from "../core/mod.ts";
export * from "../events/mod.ts";
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
	async *square(): AsyncGenerator<SquareEvent, void, unknown> {
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
					yield event;
				}
			} catch (_e) {
				this.client.log("squarePollingError", { error: _e });
			}
			await sleep(this.polling_delay);
		}
	}

	async *talk(): AsyncGenerator<Pb1_C13154r6, void, unknown> {
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
					this.sync.talk.revision =
						response.fullSyncResponse.nextRevision;
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
					yield event;
				}
			} catch (_e) {
				this.client.log("talkPollingError", { error: _e });
			}
			await sleep(this.polling_delay);
		}
	}
}
