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
	sync: SyncData = { talk: { revision: 0, globalRev: 0, individualRev: 0 } };

	client: BaseClient;
	islisten: boolean = false;
	constructor(client: BaseClient) {
		this.client = client;
	}

	/**
	 * Listens to square events and yields them as they are received.
	 *
	 * @param options - Configuration options for listening to square events.
	 * @param options.signal - An AbortSignal to cancel the polling.
	 * @param options.onError - A callback function to handle errors.
	 * @param options.pollingInterval - The interval in milliseconds between polling requests. Defaults to 1000ms.
	 *
	 * @yields {SquareEvent} - The events received from the square.
	 *
	 * @deprecated
	 */
	async *_listenSquareEvents(options: {
		signal?: AbortSignal;
		onError?: (error: unknown) => void;
		pollingInterval?: number;
	} = {}): AsyncGenerator<SquareEvent, void, unknown> {
		const { signal, onError, pollingInterval } = {
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
			if (signal?.aborted) {
				break;
			}
		}
	}

	/**
	 * Listens for talk events by polling the server at a specified interval.
	 *
	 * @param {Object} [options] - Configuration options for the polling.
	 * @param {AbortSignal} [options.signal] - An AbortSignal to cancel the polling.
	 * @param {(error: unknown) => void} [options.onError] - A callback function to handle errors.
	 * @param {number} [options.pollingInterval=1000] - The interval in milliseconds between each poll.
	 *
	 * @yields {Operation} - Yields each operation event received from the server.
	 *
	 * @returns {AsyncGenerator<Operation, void, unknown>} - An async generator that yields operation events.
	 *
	 * @deprecated
	 */
	async *_listenTalkEvents(options: {
		signal?: AbortSignal;
		onError?: (error: unknown) => void;
		pollingInterval?: number;
	} = {}): AsyncGenerator<Operation, void, unknown> {
		const { signal, onError, pollingInterval } = {
			pollingInterval: 100,
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
					response.operationResponse &&
					response.operationResponse.globalEvents &&
					response.operationResponse.globalEvents.lastRevision
				) {
					this.sync.talk.globalRev =
						response.operationResponse.globalEvents.lastRevision;
				}
				if (
					response.operationResponse &&
					response.operationResponse.individualEvents &&
					response.operationResponse.individualEvents.lastRevision
				) {
					this.sync.talk.individualRev =
						response.operationResponse.individualEvents
							.lastRevision;
				}
				if (
					!(response.operationResponse &&
						response.operationResponse.operations)
				) {
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
			if (signal?.aborted) {
				break;
			}
		}
	}

	async initLegyPusher(cb?: () => void) {
		if (this.islisten) {
			cb && cb();
			return;
		}
		while (this.client.authToken) {
			try {
				this.islisten = true;
				try {
					await this.client.push.initializeConn(1, [3, 8]);
				} catch (error) {
					this.client.log("LegyPusherError_cannot_init", { error });
					break;
				}
				cb && cb();
				await this.client.push.InitAndRead([3, 8]);
				await sleep(4);
			} catch (error) {
				this.client.log("LegyPusherError", { error });
				await sleep(4);
			}
		}
		this.islisten = false;
	}

	listenSquareEvents(): ReadableStream<SquareEvent> {
		this.client.push.sqStream.renew();
		this.initLegyPusher();
		return this.client.push.sqStream.stream;
	}

	listenTalkEvents(): ReadableStream<Operation> {
		this.client.push.opStream.renew();
		this.initLegyPusher();
		return this.client.push.opStream.stream;
	}
}
