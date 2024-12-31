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
	#sync: SyncData = { talk: {} };

	client: Client;
	constructor(client: Client) {
		this.client = client;
	}

	/**
	 * Listen OpenChat events as a async generator.
	 */
	async *listenSquareEvents(
		abortController?: AbortController,
		onError?: (error: unknown) => void,
		pollingInterval: number = 1000,
	): AsyncGenerator<SquareEvent, void, unknown> {
		let continuationToken: string | undefined;
		while (true) {
			try {
				const response = await this.client.square.fetchMyEvents({
					syncToken: this.#sync.square,
					continuationToken,
					limit: 100,
				});
				this.#sync.square = response.syncToken;
				continuationToken = response.continuationToken;
				for (const event of response.events) {
					yield event;
				}
			} catch (error) {
				onError?.(error);
			}
			await sleep(pollingInterval);
			if (abortController?.signal.aborted) {
				break;
			}
		}
	}

	async *listenTalkEvents(
		abortController?: AbortController,
		onError?: (error: unknown) => void,
		pollingInterval: number = 1000,
	): AsyncGenerator<Pb1_C13154r6, void, unknown> {
		while (true) {
			try {
				const response = await this.client.talk.sync({
					...this.#sync.talk,
					limit: 100,
				});
				if (
					response.fullSyncResponse &&
					response.fullSyncResponse.nextRevision
				) {
					this.#sync.talk.revision = response.fullSyncResponse.nextRevision;
					continue;
				}
				if (
					response.operationResponse.globalEvents &&
					response.operationResponse.globalEvents.lastRevision
				) {
					this.#sync.talk.globalRev =
						response.operationResponse.globalEvents.lastRevision;
				}
				if (
					response.operationResponse.individualEvents &&
					response.operationResponse.individualEvents.lastRevision
				) {
					this.#sync.talk.individualRev =
						response.operationResponse.individualEvents
							.lastRevision;
				}
				if (!response.operationResponse.operations) {
					continue;
				}
				for (const event of response.operationResponse.operations) {
					yield event;
				}
			} catch (error) {
				onError?.(error);
			}
			await sleep(pollingInterval);
			if (abortController?.signal.aborted) {
				break;
			}
		}
	}
}
