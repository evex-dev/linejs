import { Buffer } from "node:buffer";
import {
	constants,
	createCipheriv,
	createDecipheriv,
	publicEncrypt,
	randomBytes,
} from "node:crypto";
import { resolveLineAccessToken } from "./auth_token.ts";

export interface LegyEncryptedFetchOptions {
	endpoint?: string;
	application: string;
	userAgent: string;
}

const LEGY_ENDPOINT = "https://gf.line.naver.jp/enc";
const LEGY_LE = "7";
const LEGY_LAP = "5";
const LEGY_LCS_PREFIX = "0008";
const LEGY_IV = Buffer.from([
	78,
	9,
	72,
	62,
	56,
	245,
	255,
	114,
	128,
	18,
	123,
	158,
	251,
	92,
	45,
	51,
]);
const LINE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsMC6HAYeMq4R59e2yRw6
W1OWT2t9aepiAp4fbSCXzRj7A29BOAFAvKlzAub4oxN13Nt8dbcB+ICAufyDnN5N
d3+vXgDxEXZ/sx2/wuFbC3B3evSNKR4hKcs80suRs8aL6EeWi+bAU2oYIc78Bbqh
Nzx0WCzZSJbMBFw1VlsU/HQ/XdiUufopl5QSa0S246XXmwJmmXRO0v7bNvrxaNV0
cbviGkOvTlBt1+RerIFHMTw3SwLDnCOolTz3CuE5V2OrPZCmC0nlmPRzwUfxoxxs
/6qFdpZNoORH/s5mQenSyqPkmH8TBOlHJWPH3eN1k6aZIlK5S54mcUb/oNRRq9wD
1wIDAQAB
-----END PUBLIC KEY-----`;

export class LegyEncryptedTransport {
	readonly endpoint: string;
	#aesKey = randomBytes(16);
	#xLcs?: string;

	constructor(endpoint = LEGY_ENDPOINT) {
		this.endpoint = endpoint;
	}

	async fetch(
		request: Request,
		fetcher: (request: Request) => Promise<Response>,
		options: LegyEncryptedFetchOptions,
	): Promise<Response> {
		const url = new URL(request.url);
		const body = Buffer.from(await request.arrayBuffer());
		const path = `${url.pathname}${url.search}`;
		const access = request.headers.get("x-line-access");
		const innerHeaders: Record<string, string> = { "x-lpqs": path };
		if (access) {
			innerHeaders["x-lt"] = resolveLineAccessToken(access);
		}
		const plaintext = Buffer.concat([
			encodeLegyHeaders(innerHeaders),
			body,
		]);
		const leInt = Number.parseInt(LEGY_LE, 10);
		const payload = (leInt & 4) === 4
			? Buffer.concat([Buffer.from([leInt]), plaintext])
			: plaintext;
		let encrypted = this.#encrypt(payload);
		if ((leInt & 2) === 2) {
			encrypted = Buffer.concat([
				encrypted,
				legyHmac(this.#aesKey, encrypted),
			]);
		}

		const response = await fetcher(
			new Request(options.endpoint ?? this.endpoint, {
				method: "POST",
				headers: this.#outerHeaders(request, options),
				body: new Uint8Array(encrypted),
			}),
		);
		const responseBody = Buffer.from(await response.arrayBuffer());
		if (!responseBody.length) {
			return new Response(new Uint8Array(responseBody), {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			});
		}

		let decrypted = this.#decrypt(responseBody);
		if ((leInt & 4) === 4) decrypted = decrypted.subarray(1);
		const decoded = decodeLegyHeaders(decrypted);
		const status = decoded.headers["x-lc"] &&
				decoded.headers["x-lc"] !== "200"
			? Number.parseInt(decoded.headers["x-lc"], 10)
			: response.status;
		const headers = new Headers(response.headers);
		for (const [key, value] of Object.entries(decoded.headers)) {
			headers.set(key, value);
		}
		headers.set("content-type", "application/x-thrift");
		return new Response(new Uint8Array(decoded.data), {
			status: Number.isFinite(status) ? status : response.status,
			headers,
		});
	}

	#outerHeaders(
		request: Request,
		options: LegyEncryptedFetchOptions,
	): Headers {
		const headers = new Headers();
		headers.set("x-line-application", options.application);
		headers.set("x-le", LEGY_LE);
		headers.set("x-lap", LEGY_LAP);
		headers.set("x-lpv", request.headers.get("x-lpv") ?? "1");
		headers.set("x-lcs", this.#getXLcs());
		headers.set("user-agent", options.userAgent);
		headers.set(
			"content-type",
			request.headers.get("content-type") ?? "application/x-thrift",
		);
		headers.set("x-lal", request.headers.get("x-lal") ?? "ja_JP");
		headers.set("x-lhm", request.headers.get("x-lhm") ?? request.method);
		headers.set("accept", request.headers.get("accept") ?? "*/*");
		headers.set("accept-encoding", "gzip, deflate");
		headers.set("connection", "keep-alive");
		return headers;
	}

	#getXLcs(): string {
		if (!this.#xLcs) {
			this.#xLcs = LEGY_LCS_PREFIX + publicEncrypt(
				{
					key: LINE_PUBLIC_KEY,
					padding: constants.RSA_PKCS1_OAEP_PADDING,
					oaepHash: "sha1",
				},
				this.#aesKey,
			).toString("base64");
		}
		return this.#xLcs;
	}

	#encrypt(plaintext: Buffer): Buffer {
		const cipher = createCipheriv("aes-128-cbc", this.#aesKey, LEGY_IV);
		cipher.setAutoPadding(true);
		return Buffer.concat([cipher.update(plaintext), cipher.final()]);
	}

	#decrypt(ciphertext: Buffer): Buffer {
		const padded = pkcs7Pad(ciphertext, 16);
		const decipher = createDecipheriv("aes-128-cbc", this.#aesKey, LEGY_IV);
		decipher.setAutoPadding(false);
		const decrypted = Buffer.concat([
			decipher.update(padded),
			decipher.final(),
		]);
		return pkcs7Unpad(decrypted.subarray(0, decrypted.length - 16));
	}
}

export function encodeLegyHeaders(headers: Record<string, string>): Buffer {
	const parts: Buffer[] = [];
	const entries = Object.entries(headers);
	parts.push(u16be(entries.length));
	for (const [key, value] of entries) {
		const keyBuf = Buffer.from(key, "ascii");
		const valueBuf = Buffer.from(value, "utf-8");
		parts.push(u16be(keyBuf.length), keyBuf, u16be(valueBuf.length), valueBuf);
	}
	const body = Buffer.concat(parts);
	return Buffer.concat([u16be(body.length), body]);
}

export function decodeLegyHeaders(data: Buffer): {
	headers: Record<string, string>;
	data: Buffer;
} {
	let offset = 0;
	const readU16 = () => {
		const value = data.readUInt16BE(offset);
		offset += 2;
		return value;
	};
	const dataLength = readU16() + 2;
	const count = readU16();
	const headers: Record<string, string> = {};
	for (let i = 0; i < count; i++) {
		const keyLength = readU16();
		const key = data.subarray(offset, offset + keyLength).toString("ascii");
		offset += keyLength;
		const valueLength = readU16();
		const value = data.subarray(offset, offset + valueLength).toString("utf-8");
		offset += valueLength;
		headers[key] = value;
	}
	return { headers, data: data.subarray(dataLength) };
}

export function xxhash32(data: Uint8Array, seed = 0): number {
	const PRIME1 = 0x9e3779b1;
	const PRIME2 = 0x85ebca77;
	const PRIME3 = 0xc2b2ae3d;
	const PRIME4 = 0x27d4eb2f;
	const PRIME5 = 0x165667b1;
	const len = data.length;
	let offset = 0;
	let h32: number;
	if (len >= 16) {
		let v1 = (seed + PRIME1 + PRIME2) >>> 0;
		let v2 = (seed + PRIME2) >>> 0;
		let v3 = seed >>> 0;
		let v4 = (seed - PRIME1) >>> 0;
		const limit = len - 16;
		while (offset <= limit) {
			v1 = xxhRound(v1, readU32LE(data, offset));
			offset += 4;
			v2 = xxhRound(v2, readU32LE(data, offset));
			offset += 4;
			v3 = xxhRound(v3, readU32LE(data, offset));
			offset += 4;
			v4 = xxhRound(v4, readU32LE(data, offset));
			offset += 4;
		}
		h32 = (
			rotl(v1, 1) + rotl(v2, 7) + rotl(v3, 12) + rotl(v4, 18)
		) >>> 0;
	} else {
		h32 = (seed + PRIME5) >>> 0;
	}
	h32 = (h32 + len) >>> 0;
	while (offset <= len - 4) {
		h32 = Math.imul(
			rotl((h32 + Math.imul(readU32LE(data, offset), PRIME3)) >>> 0, 17),
			PRIME4,
		) >>> 0;
		offset += 4;
	}
	while (offset < len) {
		h32 = Math.imul(
			rotl((h32 + Math.imul(data[offset], PRIME5)) >>> 0, 11),
			PRIME1,
		) >>> 0;
		offset++;
	}
	h32 ^= h32 >>> 15;
	h32 = Math.imul(h32, PRIME2) >>> 0;
	h32 ^= h32 >>> 13;
	h32 = Math.imul(h32, PRIME3) >>> 0;
	h32 ^= h32 >>> 16;
	return h32 >>> 0;
}

function legyHmac(key: Buffer, data: Buffer): Buffer {
	const opad = Buffer.alloc(16);
	const ipad = Buffer.alloc(16);
	for (let i = 0; i < 16; i++) {
		opad[i] = 0x5c ^ key[i];
		ipad[i] = 0x36 ^ key[i];
	}
	const innerHex = xxhash32(Buffer.concat([ipad, data]))
		.toString(16)
		.padStart(8, "0");
	const outerHex = xxhash32(Buffer.concat([opad, Buffer.from(innerHex, "hex")]))
		.toString(16)
		.padStart(8, "0");
	return Buffer.from(outerHex, "hex");
}

function xxhRound(acc: number, input: number): number {
	return Math.imul(
		rotl((acc + Math.imul(input, 0x85ebca77)) >>> 0, 13),
		0x9e3779b1,
	) >>> 0;
}

function readU32LE(data: Uint8Array, offset: number): number {
	return (
		data[offset] |
		(data[offset + 1] << 8) |
		(data[offset + 2] << 16) |
		(data[offset + 3] << 24)
	) >>> 0;
}

function rotl(value: number, bits: number): number {
	return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}

function pkcs7Pad(buf: Buffer, blockSize: number): Buffer {
	const size = blockSize - (buf.length % blockSize);
	return Buffer.concat([buf, Buffer.alloc(size, size)]);
}

function pkcs7Unpad(buf: Buffer): Buffer {
	const size = buf[buf.length - 1];
	return size > 0 && size <= 16 ? buf.subarray(0, buf.length - size) : buf;
}

function u16be(value: number): Buffer {
	const out = Buffer.alloc(2);
	out.writeUInt16BE(value);
	return out;
}
