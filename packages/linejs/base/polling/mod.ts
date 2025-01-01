import type { BaseClient } from "../core/mod.ts";
import type { Operation, SquareEvent } from "@evex/linejs-types";

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

	client: BaseClient;
	constructor(client: BaseClient) {
		this.client = client;
	}

	/**
	 * Listen OpenChat events as a async generator.
	 */
	async *listenSquareEvents(options: {
		abortController?: AbortController;
		onError?: (error: unknown) => void;
		pollingInterval?: number;
	} = {}): AsyncGenerator<SquareEvent, void, unknown> {
		const { abortController, onError, pollingInterval } = {
			pollingInterval: 1000,
			...options,
		};
		let continuationToken: string | undefined;
		while (true) {
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
			} catch (error) {
				if (onError) {
					onError(error);
				}
			}
			await sleep(pollingInterval);
			if (abortController?.signal.aborted) {
				break;
			}
		}
	}

	async *listenTalkEvents(options: {
		abortController?: AbortController;
		onError?: (error: unknown) => void;
		pollingInterval?: number;
	} = {}): AsyncGenerator<Operation, void, unknown> {
		const { abortController, onError, pollingInterval } = {
			pollingInterval: 1000,
			...options,
		};
		while (true) {
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
					yield event;
				}
			} catch (error) {
				if (onError) {
					onError(error);
				}
			}
			await sleep(pollingInterval);
			if (abortController?.signal.aborted) {
				break;
			}
		}
	}
}
