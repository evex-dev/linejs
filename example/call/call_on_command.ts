import {
	loginWithAuthToken,
	loginWithQR,
	type TalkMessage,
} from "@evex/linejs";
import type { Device } from "@evex/linejs/base";
import { FileStorage } from "@evex/linejs/storage";
import {
	decodeWavSync,
	opusCodecFactory,
	PlanetTransport,
	type PlanetTransportOpts,
	resampleLinear,
} from "@evex/linejs/call";

type PlanetMediaKeyMode = NonNullable<PlanetTransportOpts["mediaKeyMode"]>;

const COMMAND = Deno.env.get("LINE_CALL_COMMAND") ?? "!call";
const SAMPLE_RATE = 48_000;
const wavPath = Deno.args[0] ?? Deno.env.get("LINE_CALL_WAV") ??
	new URL("./unity.wav", import.meta.url);
const configuredDevice = Deno.env.get("LINE_DEVICE")?.trim() as
	| Device
	| undefined;
const version = Deno.env.get("LINE_VERSION") ?? undefined;
const fromEnvInfo = readFromEnvInfo();
const storagePath = Deno.env.get("LINE_STORAGE_FILE");
const mediaKeyMode = (Deno.env.get("LINE_CALL_MEDIA_KEY_MODE") ??
	"audio-reverse-stage") as PlanetMediaKeyMode;
const frameMs = readNumberEnv("LINE_CALL_FRAME_MS", 20);
const gain = readNumberEnv("LINE_CALL_GAIN", 1);
const holdMs = readNumberEnv("LINE_CALL_HOLD_MS", 1_000);
const timeoutMs = readNumberEnv("LINE_CALL_TIMEOUT_MS", 10_000);
const answerTimeoutMs = readNumberEnv("LINE_CALL_ANSWER_TIMEOUT_MS", 60_000);
const bitrate = readOptionalNumberEnv("LINE_CALL_OPUS_BITRATE");
const bandwidth = Deno.env.get("LINE_CALL_OPUS_BANDWIDTH") as
	| "narrowband"
	| "mediumband"
	| "wideband"
	| "superwideband"
	| "fullband"
	| undefined;
const payloadPrefix = hexToBytes(
	Deno.env.get("LINE_CALL_PAYLOAD_PREFIX_HEX") ?? "00",
);

const authToken = await readAuthToken();
const device = configuredDevice || (authToken ? "ANDROID" : "ANDROIDSECONDARY");
const storage = storagePath ? new FileStorage(storagePath) : undefined;
const client = authToken
	? await loginWithAuthToken(authToken, { device, version, storage })
	: await loginWithQR({
		onReceiveQRUrl(url) {
			console.log(`QR: ${url}`);
		},
		onPincodeRequest(pin) {
			console.log(`PIN: ${pin}`);
		},
	}, { device, version, storage });

const audio = await loadWavForCall(wavPath, gain);
let activeCall: Promise<void> | undefined;

console.log(`Listening for ${COMMAND}`);
client.on("message", (message) => {
	void handleMessage(message).catch((error) => {
		console.error(
			"[call] failed:",
			error instanceof Error ? error.message : error,
		);
	});
});
client.listen({ talk: true, square: false });

async function handleMessage(message: TalkMessage): Promise<void> {
	if (message.text?.trim() !== COMMAND) return;
	const myMid = client.base.profile?.mid;
	if (!myMid) throw new Error("profile is not ready");
	const to = oneToOnePeer(message, myMid);
	if (!to) {
		await message.reply("1:1 chat only");
		return;
	}
	if (activeCall) {
		await message.reply("call already running");
		return;
	}
	await message.reply("calling");
	activeCall = callAndPlay(to)
		.finally(() => {
			activeCall = undefined;
		});
	await activeCall;
}

async function callAndPlay(to: string): Promise<void> {
	const localMid = client.base.profile?.mid;
	if (!localMid) throw new Error("profile is not ready");

	const route = await acquireAudioRoute(to);
	const transport = new PlanetTransport({
		localMid,
		timeoutMs,
		mediaKeyMode,
	});

	try {
		await transport.connect({ route });
		await transport.inviteDetailed({ to });
		const answer = await transport.waitForAnswerDetailed({
			timeoutMs: answerTimeoutMs,
			autoConnRsp: true,
		});
		if (!answer.mediaReady) {
			throw new Error("call answered, but media was not established");
		}
		await streamOpus(transport, audio);
		if (holdMs > 0) await sleep(holdMs);
	} finally {
		await transport.close();
	}
}

async function acquireAudioRoute(to: string) {
	try {
		return await client.call.acquireRoute({
			to,
			callType: "AUDIO",
			fromEnvInfo,
		});
	} catch (error) {
		throw addAcquireRouteHint(error);
	}
}

async function streamOpus(
	transport: PlanetTransport,
	samples: Int16Array,
): Promise<void> {
	const codec = await opusCodecFactory();
	const encoder = codec.newEncoder({
		sampleRate: SAMPLE_RATE,
		channels: 1,
		frameDurationMs: frameMs,
		bitrate,
		bandwidth,
		signal: "music",
	});
	const frameSamples = Math.floor((SAMPLE_RATE * frameMs) / 1000);
	try {
		for (let offset = 0; offset < samples.length; offset += frameSamples) {
			const frame = new Int16Array(frameSamples);
			frame.set(samples.subarray(offset, offset + frameSamples));
			const packet = encoder.encode({
				samples: frame,
				sampleRate: SAMPLE_RATE,
				channels: 1,
			});
			if (packet) {
				await transport.send(prepend(packet, payloadPrefix), {
					timestampStep: frameSamples,
				});
			}
			await sleep(frameMs);
		}
	} finally {
		encoder.close?.();
	}
}

async function loadWavForCall(
	path: string | URL,
	audioGain: number,
): Promise<Int16Array> {
	const wav = decodeWavSync(await Deno.readFile(path));
	let samples = wav.samples;
	if (wav.sampleRate !== SAMPLE_RATE) {
		samples = resampleLinear(
			samples,
			wav.sampleRate,
			SAMPLE_RATE,
			wav.channels,
		);
	}
	if (wav.channels !== 1) samples = downmixToMono(samples, wav.channels);
	if (audioGain !== 1) samples = applyGain(samples, audioGain);
	return samples;
}

function oneToOnePeer(message: TalkMessage, myMid: string): string | null {
	if (message.to.type !== "USER" && message.to.type !== 0) return null;
	return message.from.id === myMid ? message.to.id : message.from.id;
}

function downmixToMono(samples: Int16Array, channels: number): Int16Array {
	if (channels <= 1) return samples;
	const frames = Math.floor(samples.length / channels);
	const out = new Int16Array(frames);
	for (let frame = 0; frame < frames; frame++) {
		let sum = 0;
		for (let channel = 0; channel < channels; channel++) {
			sum += samples[frame * channels + channel] ?? 0;
		}
		out[frame] = clamp16(Math.round(sum / channels));
	}
	return out;
}

function readFromEnvInfo(): Record<string, string> | undefined {
	const json = Deno.env.get("LINE_CALL_FROM_ENV_INFO")?.trim();
	if (json) {
		const parsed = JSON.parse(json) as unknown;
		if (!isStringRecord(parsed)) {
			throw new Error("LINE_CALL_FROM_ENV_INFO must be a JSON string map");
		}
		return parsed;
	}
	const devname = Deno.env.get("LINE_CALL_DEVNAME")?.trim();
	return devname ? { devname } : undefined;
}

function isStringRecord(value: unknown): value is Record<string, string> {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		Object.values(value).every((item) => typeof item === "string")
	);
}

function addAcquireRouteHint(error: unknown): Error {
	const message = error instanceof Error ? error.message : String(error);
	if (
		!message.includes("acquireCallRoute") || !message.includes("INVALID_STATE")
	) {
		return error instanceof Error ? error : new Error(message);
	}
	return new Error(
		message +
			"\nacquireCallRoute INVALID_STATE: LINE rejected this account/peer state. " +
			"Check that the token device matches LINE_DEVICE, the peer is a callable 1:1 friend, " +
			"and set LINE_CALL_DEVNAME to the primary device model if you are using a primary token.",
		{ cause: error },
	);
}

function applyGain(samples: Int16Array, audioGain: number): Int16Array {
	const out = new Int16Array(samples.length);
	for (let i = 0; i < samples.length; i++) {
		out[i] = clamp16(Math.round(samples[i] * audioGain));
	}
	return out;
}

function prepend(packet: Uint8Array, prefix: Uint8Array): Uint8Array {
	if (!prefix.length) return packet;
	const out = new Uint8Array(prefix.length + packet.length);
	out.set(prefix, 0);
	out.set(packet, prefix.length);
	return out;
}

function hexToBytes(hex: string): Uint8Array {
	const compact = hex.replaceAll(/[\s:_-]/g, "");
	if (!compact) return new Uint8Array();
	if (compact.length % 2 !== 0) {
		throw new Error("LINE_CALL_PAYLOAD_PREFIX_HEX must contain full bytes");
	}
	const out = new Uint8Array(compact.length / 2);
	for (let i = 0; i < out.length; i++) {
		const byte = Number.parseInt(compact.slice(i * 2, i * 2 + 2), 16);
		if (!Number.isFinite(byte)) {
			throw new Error("LINE_CALL_PAYLOAD_PREFIX_HEX contains non-hex data");
		}
		out[i] = byte;
	}
	return out;
}

async function readAuthToken(): Promise<string | undefined> {
	const direct = Deno.env.get("LINE_AUTH_TOKEN");
	if (direct) return direct.trim();
	const file = Deno.env.get("LINE_AUTH_TOKEN_FILE");
	if (!file) return undefined;
	return (await Deno.readTextFile(file)).trim();
}

function readNumberEnv(name: string, fallback: number): number {
	return readOptionalNumberEnv(name) ?? fallback;
}

function readOptionalNumberEnv(name: string): number | undefined {
	const value = Deno.env.get(name);
	if (value === undefined || value === "") return undefined;
	const number = Number(value);
	if (!Number.isFinite(number)) throw new Error(`${name} must be a number`);
	return number;
}

function clamp16(n: number): number {
	return Math.max(-32768, Math.min(32767, n));
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
