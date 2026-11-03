import type { Client } from "../../packages/linejs/client/mod.ts";
import type { PlanetTransport } from "../../packages/linejs/client/features/call/mod.ts";

/** Install on an already logged-in client before calling client.listen(). */
export function installIncomingAudio(
	client: Client,
	options: {
		deviceId: string;
		signal: AbortSignal;
		/** Ask the user or apply your own admission policy. No default auto-answer. */
		admit: (callerMid: string) => Promise<boolean>;
		/** Send/receive encoded Opus packets; close when finished. */
		media: (transport: PlanetTransport) => Promise<void>;
		onError: (error: unknown) => void;
	},
): void {
	let busy = false;
	client.on("call:incoming", (event) => {
		if (!event.audio || busy || options.signal.aborted) return;
		busy = true;
		void (async () => {
			let transport: PlanetTransport | undefined;
			try {
				if (!(await options.admit(event.audio!.callerMid))) return;
				transport = await client.call.answerIncoming(event, {
					deviceId: options.deviceId,
					signal: options.signal,
				});
				await options.media(transport);
			} finally {
				try {
					await transport?.close();
				} finally {
					busy = false;
				}
			}
		})().catch(options.onError);
	});
}
