import { Buffer } from "node:buffer";

export const COMPACT_PLAIN_MESSAGE_ENDPOINT = "/CA5";
export const COMPACT_E2EE_MESSAGE_ENDPOINT = "/ECA5";

export type CompactMessageType = 2 | 5 | 6;

export interface CompactMessageResponse {
	sequenceId: number;
	messageId: bigint;
	createdTime: number;
}

export interface CompactMessageProtocolOptions {
	msgType: CompactMessageType;
	seqId: number;
	to: string;
	args: string | readonly Uint8Array[];
	plainSuffix?: number;
}

export interface SendCompactMessageOptions {
	to: string;
	text?: string;
	chunks?: readonly Uint8Array[];
	e2ee?: boolean;
}

export class CompactMessageProtocolError extends Error {
	readonly code?: number;

	constructor(message: string, code?: number) {
		super(message);
		this.name = "CompactMessageProtocolError";
		this.code = code;
	}
}

export function packCompactMessage(
	options: CompactMessageProtocolOptions,
): Uint8Array {
	const out: number[] = [];
	out.push(assertByte(options.msgType, "msgType"));
	out.push(getMidTypeByMid(options.to));
	writeCompactI32(out, options.seqId);
	out.push(...midToBytes(options.to));

	if (typeof options.args === "string") {
		const text = encodeCompactText(options.args);
		writeCompactBinary(out, text);
		out.push(assertByte(options.plainSuffix ?? 0, "plainSuffix"));
		return Uint8Array.from(out);
	}

	const chunks = normalizeE2EEChunks(options.args);
	out.push(2);
	for (const chunk of chunks.slice(0, 3)) {
		writeCompactBinary(out, chunk);
	}
	writeCompactI32(out, readSignedI32(chunks[3]));
	writeCompactI32(out, readSignedI32(chunks[4]));
	return Uint8Array.from(out);
}

export function packCompactPlainMessage(
	seqId: number,
	to: string,
	text: string,
): Uint8Array {
	return packCompactMessage({
		msgType: 2,
		seqId,
		to,
		args: text,
	});
}

export function packCompactE2EEMessage(
	seqId: number,
	to: string,
	chunks: readonly Uint8Array[],
	msgType: 5 | 6 = 5,
): Uint8Array {
	return packCompactMessage({
		msgType,
		seqId,
		to,
		args: chunks,
	});
}

export function decodeCompactMessageResponse(
	data: Uint8Array,
): CompactMessageResponse {
	const reader = new CompactReader(data);
	const success = reader.readBool();
	if (!success) {
		const code = reader.readI32();
		throw new CompactMessageProtocolError(
			`compact message failed: error code ${code}`,
			code,
		);
	}
	const sequenceId = reader.readI32();
	const messageId = reader.readI64();
	const createdTimeMs = reader.readI64();
	reader.assertDone();
	return {
		sequenceId,
		messageId,
		createdTime: Number(createdTimeMs / 1000n),
	};
}

export function encodeCompactText(text: string): Uint8Array {
	const utf8 = Buffer.concat([
		Buffer.from([0xef, 0xbb, 0xbf]),
		Buffer.from(text, "utf8"),
	]);
	const utf16 = Buffer.allocUnsafe(2 + text.length * 2);
	utf16[0] = 0xff;
	utf16[1] = 0xfe;
	for (let i = 0; i < text.length; i++) {
		utf16.writeUInt16LE(text.charCodeAt(i), 2 + i * 2);
	}
	return utf8.length > utf16.length ? utf16 : utf8;
}

export function writeCompactI32(out: number[], value: number): void {
	if (!Number.isInteger(value)) {
		throw new TypeError("compact i32 value must be an integer");
	}
	if (value < -0x80000000 || value > 0x7fffffff) {
		throw new RangeError("compact i32 value out of range");
	}
	const n = BigInt(value);
	writeVarint(out, (n << 1n) ^ (n >> 31n));
}

export function writeCompactI64(out: number[], value: bigint): void {
	writeVarint(out, (value << 1n) ^ (value >> 63n));
}

function writeCompactBinary(out: number[], data: Uint8Array): void {
	writeVarint(out, BigInt(data.length));
	out.push(...data);
}

function writeVarint(out: number[], value: bigint): void {
	if (value < 0n) {
		throw new RangeError("compact varint value must be unsigned");
	}
	while (true) {
		if ((value & ~0x7fn) === 0n) {
			out.push(Number(value));
			return;
		}
		out.push(Number((value & 0x7fn) | 0x80n));
		value >>= 7n;
	}
}

function getMidTypeByMid(mid: string): number {
	switch (mid[0]) {
		case "u":
			return 0;
		case "r":
			return 1;
		case "c":
			return 2;
		default:
			throw new CompactMessageProtocolError(
				"unsupported compact message MID type",
			);
	}
}

function midToBytes(mid: string): number[] {
	const hex = mid.slice(1);
	if (!/^[0-9a-f]{32}$/i.test(hex)) {
		throw new CompactMessageProtocolError("invalid compact message MID format");
	}
	const out = new Array<number>(16);
	for (let i = 0; i < 16; i++) {
		out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	}
	return out;
}

function normalizeE2EEChunks(chunks: readonly Uint8Array[]): Uint8Array[] {
	if (chunks.length < 5) {
		throw new CompactMessageProtocolError(
			"compact E2EE message requires 5 chunks",
		);
	}
	return chunks.slice(0, 5).map((chunk) =>
		chunk instanceof Uint8Array ? chunk : Uint8Array.from(chunk)
	);
}

function readSignedI32(bytes: Uint8Array): number {
	if (bytes.length !== 4) {
		throw new CompactMessageProtocolError(
			"compact E2EE key id chunk must be 4 bytes",
		);
	}
	const value = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
		.getUint32(0, false);
	return value > 0x7fffffff ? value - 0x100000000 : value;
}

function assertByte(value: number, name: string): number {
	if (!Number.isInteger(value) || value < 0 || value > 0xff) {
		throw new RangeError(`${name} must be a byte`);
	}
	return value;
}

class CompactReader {
	#offset = 0;
	readonly #data: Uint8Array;

	constructor(data: Uint8Array) {
		this.#data = data;
	}

	readBool(): boolean {
		const value = this.#readByte();
		if (value === 1) return true;
		if (value === 2) return false;
		throw new CompactMessageProtocolError(
			`invalid compact bool value ${value}`,
		);
	}

	readI32(): number {
		const n = this.#readVarint();
		const decoded = (n >> 1n) ^ -(n & 1n);
		if (decoded < -0x80000000n || decoded > 0x7fffffffn) {
			throw new CompactMessageProtocolError("compact i32 out of range");
		}
		return Number(decoded);
	}

	readI64(): bigint {
		const n = this.#readVarint();
		return (n >> 1n) ^ -(n & 1n);
	}

	assertDone(): void {
		if (this.#offset !== this.#data.length) {
			throw new CompactMessageProtocolError(
				"unexpected trailing compact message response bytes",
			);
		}
	}

	#readByte(): number {
		if (this.#offset >= this.#data.length) {
			throw new CompactMessageProtocolError("unexpected end of compact data");
		}
		return this.#data[this.#offset++];
	}

	#readVarint(): bigint {
		let shift = 0n;
		let result = 0n;
		while (true) {
			const byte = this.#readByte();
			result |= BigInt(byte & 0x7f) << shift;
			if ((byte & 0x80) === 0) return result;
			shift += 7n;
			if (shift > 70n) {
				throw new CompactMessageProtocolError("compact varint is too long");
			}
		}
	}
}
