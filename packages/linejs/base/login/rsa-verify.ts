import { Key } from "node-bignumber";
import type { RSAKey } from "@evex/linejs-types";

export function getRSACrypto(message: string, json: RSAKey) {
	const rsa = new Key();
	rsa.setPublic(json.nvalue, json.evalue);
	const credentials = rsa.encrypt(message).toString("hex");
	const keyname = json.keynm;
	return { keyname, credentials, message };
}

/*
import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import type { RSAKey } from "@evex/linejs-types";

function encodeLength(len: number) {
	// short form
	if (len < 0x80) return Buffer.from([len]);
	// long form
	const octets = [];
	while (len > 0) {
		octets.unshift(len & 0xff);
		len >>= 8;
	}
	return Buffer.from([0x80 | octets.length, ...octets]);
}

function encodeInteger(buf: Buffer) {
	// ensure positive integer (add 0x00 if high bit set)
	if (buf[0] & 0x80) buf = Buffer.concat([Buffer.from([0x00]), buf]);
	return Buffer.concat([Buffer.from([0x02]), encodeLength(buf.length), buf]);
}

function toBufferFromHexOrDec(input: string) {
		// if odd length, pad with leading zero
		const hex = input.length % 2 ? "0" + input : input;
		return Buffer.from(hex, "hex");
}

function rsaPublicKeyPem(modulusHexOrDec: string, exponentHexOrDec: string) {
	const nBuf = toBufferFromHexOrDec(modulusHexOrDec);
	const eBuf = toBufferFromHexOrDec(exponentHexOrDec);
	const seq = Buffer.concat([encodeInteger(nBuf), encodeInteger(eBuf)]);
	const der = Buffer.concat([
		Buffer.from([0x30]),
		encodeLength(seq.length),
		seq,
	]);
	const b64 = der.toString("base64");
	const pem = ["-----BEGIN RSA PUBLIC KEY-----"];
	for (let i = 0; i < b64.length; i += 64) pem.push(b64.slice(i, i + 64));
	pem.push("-----END RSA PUBLIC KEY-----", "");
	return pem.join("\n");
}

export function getRSACrypto(message: string, json: RSAKey) {
	// json.nvalue and json.evalue are expected to be hex or decimal strings
	const pem = rsaPublicKeyPem(json.nvalue, json.evalue);
	const encrypted = crypto.publicEncrypt(
		{
			key: pem,
			padding: crypto.constants.RSA_PKCS1_PADDING,
		},
		Buffer.from(message, "utf8"),
	);
	const credentials = encrypted.toString("hex");
	const keyname = json.keynm;
	return { keyname, credentials, message };
}

 */