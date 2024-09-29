//import CryptoJS from "npm:crypto-js@4.2.0";
import * as curve25519 from "curve25519-js";
import * as crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { TalkClient } from "../internal/talk-client.ts";
import type { LooseType } from "../../entities/common.ts";
import { rawReadStruct as readStruct } from "../../libs/thrift/read.ts";
import {
	ContentType,
	type Location,
	type Message,
	MIDType,
} from "@evex/linejs-types";
import nacl from "tweetnacl";
import { InternalError } from "../../entities/errors.ts";

class E2EE extends TalkClient {
	public async getE2EESelfKeyData(mid: string): Promise<LooseType> {
		try {
			return JSON.parse(this.storage.get("e2eeKeys:" + mid) as string);
		} catch (_e) {
			/* Do Nothing */
		}
		const keys = await this.getE2EEPublicKeys();
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const { keyId } = key;
			const _keyData = this.getE2EESelfKeyDataByKeyId(keyId);
			if (_keyData) return _keyData;
		}
		throw new InternalError("No E2EEKey",
			"E2EE Key has not been saved, try register `saveE2EESelfKeyDataByKeyId` or use E2EE Login",
		);
	}
	public getE2EESelfKeyDataByKeyId(keyId: string | number): LooseType {
		try {
			return JSON.parse(this.storage.get("e2eeKeys:" + keyId) as string);
		} catch (_e) {
			/* Do Nothing */
		}
	}
	public saveE2EESelfKeyDataByKeyId(keyId: string | number, value: LooseType) {
		this.storage.set("e2eeKeys:" + keyId, JSON.stringify(value));
	}
	public getToType(mid: string): number | null {
		/**
		 * USER(0),
		 * ROOM(1),
		 * GROUP(2),
		 * SQUARE(3),
		 * SQUARE_CHAT(4),
		 * SQUARE_MEMBER(5),
		 * BOT(6);
		 */
		const _u = mid.charAt(0);
		switch (_u) {
			case "u":
				return 0;
			case "r":
				return 1;
			case "c":
				return 2;
			case "s":
				return 3;
			case "m":
				return 4;
			case "p":
				return 5;
			case "v":
				return 6;
			default:
				return null;
		}
	}
	public async getE2EELocalPublicKey(
		mid: string,
		keyId?: string | number | undefined,
	): Promise<LooseType> {
		const toType = this.getToType(mid);
		let key: LooseType = undefined;
		let fd: LooseType, fn: LooseType;

		if (toType === 0) {
			fd = "e2eePublicKeys";
			fn = `:${keyId}`;
			if (keyId !== undefined) {
				key = this.storage.get(fd + fn);
			}
			let receiverKeyData;
			if (!key) {
				receiverKeyData = await this.negotiateE2EEPublicKey({ mid });
				const specVersion = receiverKeyData.specVersion;
				if (specVersion === -1) {
					throw new InternalError("Not support E2EE",`${mid}`);
				}
				const publicKey = receiverKeyData.publicKey;
				const receiverKeyId = publicKey.keyId;
				receiverKeyData = publicKey.keyData;
				if (receiverKeyId === keyId) {
					key = Buffer.from(receiverKeyData).toString("base64");
					this.storage.set(fd + fn, key);
				} else {
					throw new InternalError("No E2EEKey",
						`E2EE key id-${keyId} not found on ${mid}, key id should be ${receiverKeyId}`,
					);
				}
			}
		} else {
			fd = "e2eeGroupKeys";
			fn = `:${mid}`;
			key = this.storage.get(fd + fn);
			if (keyId !== undefined && key !== undefined) {
				const keyData = JSON.parse(key);
				if (keyId !== keyData["keyId"]) {
					this.e2eeLog("getE2EELocalPublicKeykeyIdMismatch", mid);
					key = undefined;
				}
			} else {
				key = undefined;
			}
			if (!key) {
				const E2EEGroupSharedKey = await this.getLastE2EEGroupSharedKey({
					keyVersion: 2,
					chatMid: mid,
				});
				const groupKeyId = E2EEGroupSharedKey.groupKeyId;
				const creator = E2EEGroupSharedKey.creator;
				const creatorKeyId = E2EEGroupSharedKey.creatorKeyId;
				const _receiver = E2EEGroupSharedKey.receiver;
				const receiverKeyId = E2EEGroupSharedKey.receiverKeyId;
				const encryptedSharedKey =
					E2EEGroupSharedKey.encryptedSharedKey as Buffer;
				const selfKey = Buffer.from(
					this.getE2EESelfKeyDataByKeyId(receiverKeyId)["privKey"],
					"base64",
				);
				const creatorKey = await this.getE2EELocalPublicKey(
					creator,
					creatorKeyId,
				);

				const aesKey = this.generateSharedSecret(selfKey, creatorKey);
				const aes_key = this.getSHA256Sum(Buffer.from(aesKey), "Key");
				const aes_iv = this.xor(this.getSHA256Sum(Buffer.from(aesKey), "IV"));

				this.e2eeLog("getE2EELocalPublicKeyAESInfo", {
					aes_key,
					aes_iv,
					encryptedSharedKey,
				});
				const decipher = crypto.createDecipheriv(
					"aes-256-cbc",
					aes_key,
					aes_iv,
				);
				decipher.setAutoPadding(false);
				const plainText = Buffer.concat([
					decipher.update(encryptedSharedKey),
					decipher.final(),
				]);
				/*
				const cipherParams = CryptoJS.lib.CipherParams.create({
					ciphertext: encryptedSharedKey.toString(),
					iv: aes_iv.toString(),
					mode: CryptoJS.mode.CBC,
					padding: CryptoJS.pad.Pkcs7,
				});

				const plainText = CryptoJS.AES.decrypt(
					cipherParams,
					aes_key.toString(),
					{ mode: CryptoJS.mode.CBC },
				);
				*/
				this.e2eeLog("getE2EELocalPublicKeyDecryptedLength", plainText.length);
				const decrypted = plainText.toString("base64"); //.toString(CryptoJS.enc.Base64);
				this.e2eeLog("getE2EELocalPublicKeyDecrypted", decrypted);
				const data = {
					privKey: decrypted,
					keyId: groupKeyId,
				};
				key = JSON.stringify(data);
				this.storage.set(fd + fn, key);
				return data;
			}
			return JSON.parse(key);
		}
		return Buffer.from(key, "base64");
	}

	public generateSharedSecret(
		privateKey: Buffer,
		publicKey: Buffer,
	): Uint8Array {
		this.e2eeLog("generateSharedSecretKeyInfo", {
			privateKey: privateKey.length,
			publicKey: publicKey.length,
		});
		return curve25519.sharedKey(
			Uint8Array.from(privateKey),
			Uint8Array.from(publicKey),
		);
	}

	public xor(buf: Buffer): Buffer {
		const bufLength = Math.floor(buf.length / 2);
		const buf2 = Buffer.alloc(bufLength);
		for (let i = 0; i < bufLength; i++) {
			buf2[i] = buf[i] ^ buf[bufLength + i];
		}
		return buf2;
	}

	public getSHA256Sum(...args: (string | Buffer)[]): Buffer {
		const hash = crypto.createHash("sha256");
		for (let arg of args) {
			if (typeof arg === "string") {
				arg = Buffer.from(arg);
			}
			hash.update(arg);
		}
		return hash.digest();
	}

	public encryptAESECB(aesKey: Buffer, plainData: Buffer): Buffer {
		const cipher = crypto.createCipheriv(
			"aes-256-ecb",
			aesKey,
			new Uint8Array(0),
		);
		cipher.setAutoPadding(false);
		return Buffer.concat([cipher.update(plainData), cipher.final()]);
	}

	public decodeE2EEKeyV1(
		data: LooseType,
		secret: Buffer,
	):
		| {
				keyId: LooseType;
				privKey: Buffer;
				pubKey: Buffer;
				e2eeVersion: LooseType;
		  }
		| undefined {
		if (data.encryptedKeyChain) {
			const encryptedKeyChain = Buffer.from(data.encryptedKeyChain, "base64");
			const keyId = data.keyId;
			const publicKey = Buffer.from(data.publicKey, "base64");
			const e2eeVersion = data.e2eeVersion;
			const [privKey, pubKey] = this.decryptKeyChain(
				publicKey,
				secret,
				encryptedKeyChain,
			);
			this.e2eeLog("decodeE2EEKeyV1E2EEKeyInfo", {
				e2eeKey: {
					keyId,
					privKey,
					pubKey,
					e2eeVersion,
				},
			});
			this.storage.set(
				"e2eeKeys:" + keyId,
				JSON.stringify({
					keyId,
					privKey: privKey.toString("base64"),
					pubKey: pubKey.toString("base64"),
					e2eeVersion,
				}),
			);
			return {
				keyId,
				privKey,
				pubKey,
				e2eeVersion,
			};
		}
	}
	public decryptKeyChain(
		publicKey: Buffer,
		privateKey: Buffer,
		encryptedKeyChain: Buffer,
	): Buffer[] {
		this.e2eeLog("decryptKeyChainKeyInfo", {
			decryptKeyChain: {
				publicKey: publicKey.toString("base64"),
				privateKey: privateKey.toString("base64"),
				encryptedKeyChain: encryptedKeyChain.toString("base64"),
			},
		});
		const sharedSecret = this.generateSharedSecret(privateKey, publicKey);
		const aesKey = this.getSHA256Sum(Buffer.from(sharedSecret), "Key");
		const aesIv = this.xor(this.getSHA256Sum(Buffer.from(sharedSecret), "IV"));
		const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, aesIv);
		decipher.setAutoPadding(false);
		const keychainData = Buffer.concat([
			decipher.update(encryptedKeyChain),
			decipher.final(),
		]);
		this.e2eeLog("decryptKeyChainBinKeyInfo", {
			binkey: keychainData.toString("hex"),
		});
		const key = readStruct(keychainData)[1];
		const publicKeyBytes = Buffer.from(key[0][4]);
		const privateKeyBytes = Buffer.from(key[0][5]);
		return [privateKeyBytes, publicKeyBytes];
	}

	public encryptDeviceSecret(
		publicKey: Buffer,
		privateKey: Buffer,
		encryptedKeyChain: Buffer,
	): Buffer {
		const sharedSecret = this.generateSharedSecret(privateKey, publicKey);
		const aesKey = this.getSHA256Sum(Buffer.from(sharedSecret), "Key");
		encryptedKeyChain = this.xor(this.getSHA256Sum(encryptedKeyChain));
		const cipher = crypto.createCipheriv(
			"aes-256-ecb",
			aesKey,
			new Uint8Array(0),
		);
		cipher.setAutoPadding(false);
		const keychainData = Buffer.concat([
			cipher.update(encryptedKeyChain),
			cipher.final(),
		]);
		return keychainData;
	}

	public generateAAD(
		a: string,
		b: string,
		c: number,
		d: number,
		e = 2,
		f = 0,
	): Buffer {
		let aad = Buffer.alloc(0);
		aad = Buffer.concat([aad, Buffer.from(a)]);
		aad = Buffer.concat([aad, Buffer.from(b)]);
		aad = Buffer.concat([aad, this.getIntBytes(c)]);
		aad = Buffer.concat([aad, this.getIntBytes(d)]);
		aad = Buffer.concat([aad, this.getIntBytes(e)]);
		aad = Buffer.concat([aad, this.getIntBytes(f)]);
		return aad;
	}
	public getIntBytes(i: number): Uint8Array {
		const j = 4;
		let res: Uint8Array;

		if (j ** 2 === 16) {
			const buffer = new ArrayBuffer(4);
			const view = new DataView(buffer);
			view.setInt32(0, i);
			res = new Uint8Array(buffer);
		} else {
			const buffer = new ArrayBuffer(8);
			const view = new DataView(buffer);
			view.setBigInt64(0, BigInt(i));
			res = new Uint8Array(buffer);
		}
		return res;
	}

	public async encryptE2EEMessage(
		to: string,
		text: string | Location,
		contentType = 0,
		specVersion = 2,
	): Promise<Buffer[]> {
		const _from = this.user?.mid as string;
		const selfKeyData = await this.getE2EESelfKeyData(_from);

		if (to.length === 0 || ![0, 1, 2].includes(this.getToType(to) as number)) {
			throw new InternalError("Invalid mid",to);
		}

		const senderKeyId = selfKeyData.keyId;
		let receiverKeyId, keyData;

		if (this.getToType(to) === 0) {
			const privateKey = Buffer.from(selfKeyData.privKey, "base64");
			const receiverKeyData = await this.negotiateE2EEPublicKey({ mid: to });
			specVersion = receiverKeyData.specVersion;

			if (specVersion === -1) {
				throw new InternalError("Not support E2EE",`${to}`);
			}

			const publicKey = receiverKeyData.publicKey;
			receiverKeyId = publicKey.keyId;
			const receiverKeyDataBuffer = Buffer.from(publicKey.keyData);
			keyData = this.generateSharedSecret(privateKey, receiverKeyDataBuffer);
		} else {
			const groupK = await this.getE2EELocalPublicKey(to, undefined);
			const privK = Buffer.from(groupK.privKey, "base64");
			const pubK = Buffer.from(selfKeyData.pubKey, "base64");
			receiverKeyId = groupK.keyId;
			keyData = this.generateSharedSecret(privK, pubK);
		}

		let chunks;
		if (contentType === 15) {
			chunks = this.encryptE2EELocationMessage(
				senderKeyId,
				receiverKeyId,
				Buffer.from(keyData),
				specVersion,
				text as Location,
				to,
				_from,
			);
		} else {
			chunks = this.encryptE2EETextMessage(
				senderKeyId,
				receiverKeyId,
				Buffer.from(keyData),
				specVersion,
				text as string,
				to,
				_from,
			);
		}

		return chunks;
	}

	public encryptE2EETextMessage(
		senderKeyId: number,
		receiverKeyId: number,
		keyData: Buffer,
		specVersion: number,
		text: string,
		to: string,
		_from: string,
	): Buffer[] {
		const salt = crypto.randomBytes(16);
		const gcmKey = this.getSHA256Sum(keyData, salt, Buffer.from("Key"));
		const aad = this.generateAAD(
			to,
			_from,
			senderKeyId,
			receiverKeyId,
			specVersion,
			0,
		);
		const sign = crypto.randomBytes(12);
		const data = Buffer.from(JSON.stringify({ text: text }));
		const encData = this.encryptE2EEMessageV2(data, gcmKey, sign, aad);

		const bSenderKeyId = Buffer.from(this.getIntBytes(senderKeyId));
		const bReceiverKeyId = Buffer.from(this.getIntBytes(receiverKeyId));

		this.e2eeLog(
			"encryptE2EETextMessageSenderKeyId",
			`${senderKeyId} (${bSenderKeyId.toString("hex")})`,
		);
		this.e2eeLog(
			"encryptE2EETextMessageReceiverKeyId",
			`${receiverKeyId} (${bReceiverKeyId.toString("hex")})`,
		);

		return [salt, encData, sign, bSenderKeyId, bReceiverKeyId];
	}

	public encryptE2EELocationMessage(
		senderKeyId: number,
		receiverKeyId: number,
		keyData: Buffer,
		specVersion: number,
		location: Location,
		to: string,
		_from: string,
	): Buffer[] {
		const salt = crypto.randomBytes(16);
		const gcmKey = this.getSHA256Sum(keyData, salt, Buffer.from("Key"));
		const aad = this.generateAAD(
			to,
			_from,
			senderKeyId,
			receiverKeyId,
			specVersion,
			15,
		);
		const sign = crypto.randomBytes(12);
		const data = Buffer.from(JSON.stringify({ location: location }));
		const encData = this.encryptE2EEMessageV2(data, gcmKey, sign, aad);

		const bSenderKeyId = Buffer.from(this.getIntBytes(senderKeyId));
		const bReceiverKeyId = Buffer.from(this.getIntBytes(receiverKeyId));

		this.e2eeLog(
			"encryptE2EELocationMessageSenderKeyId",
			`${senderKeyId} (${bSenderKeyId.toString("hex")})`,
		);
		this.e2eeLog(
			"encryptE2EELocationMessageReceiverKeyId",
			`${receiverKeyId} (${bReceiverKeyId.toString("hex")})`,
		);

		return [salt, encData, sign, bSenderKeyId, bReceiverKeyId];
	}

	public encryptE2EEMessageV2(
		data: Buffer,
		gcmKey: Buffer,
		nonce: Buffer,
		aad: Buffer,
	): Buffer {
		this.e2eeLog("createCipheriv", { data, gcmKey, nonce, aad });
		const cipher = crypto.createCipheriv("aes-256-gcm", gcmKey, nonce);
		cipher.setAAD(aad);
		const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
		const tag = cipher.getAuthTag();
		return Buffer.concat([encrypted, tag]);
	}

	public async decryptE2EEMessage(messageObj: Message): Promise<Message> {
		if (
			(messageObj.contentType === "NONE" ||
				messageObj.contentType === ContentType.NONE) &&
			messageObj.chunks
		) {
			messageObj.text = await this.decryptE2EETextMessage(messageObj);
		} else if (
			(messageObj.contentType === "LOCATION" ||
				messageObj.contentType === ContentType.LOCATION) &&
			messageObj.chunks
		) {
			messageObj.location = await this.decryptE2EELocationMessage(messageObj);
		}
		if (messageObj.chunks) messageObj.chunks = undefined as LooseType;

		return messageObj;
	}

	public async decryptE2EETextMessage(
		messageObj: Message,
		isSelf = false,
	): Promise<string> {
		const _from = messageObj._from;
		const to = messageObj.to;
		if (_from === this.user?.mid) {
			isSelf = true;
		}
		const toType = messageObj.toType;
		const metadata = messageObj.contentMetadata;
		const specVersion = metadata.e2eeVersion || "2";
		const contentType = messageObj.contentType;
		const chunks = messageObj.chunks.map((chunk) =>
			typeof chunk === "string" ? Buffer.from(chunk, "utf-8") : chunk,
		);
		const senderKeyId = byte2int(chunks[3]);
		const receiverKeyId = byte2int(chunks[4]);
		this.e2eeLog("decryptE2EETextMessageSenderKeyId", senderKeyId);
		this.e2eeLog("decryptE2EETextMessageReceiverKeyId", receiverKeyId);

		const selfKey = await this.getE2EESelfKeyData(this.user?.mid as string);
		let privK = Buffer.from(selfKey.privKey, "base64");
		let pubK;

		if (toType === MIDType.USER || toType === MIDType._USER) {
			pubK = await this.getE2EELocalPublicKey(
				isSelf ? to : _from,
				isSelf ? receiverKeyId : senderKeyId,
			);
		} else {
			const groupK = await this.getE2EELocalPublicKey(to, receiverKeyId);
			privK = Buffer.from(groupK.privKey, "base64");
			pubK = Buffer.from(selfKey.pubKey, "base64");
			if (_from !== this.user?.mid) {
				pubK = await this.getE2EELocalPublicKey(_from, senderKeyId);
			}
		}

		let decrypted;
		if (specVersion === "2") {
			decrypted = this.decryptE2EEMessageV2(
				to,
				_from,
				chunks,
				privK,
				pubK,
				parseInt(specVersion),
				contentType as number,
			);
		} else {
			decrypted = this.decryptE2EEMessageV1(chunks, privK, pubK);
		}

		return decrypted.text || "";
	}

	public async decryptE2EELocationMessage(
		messageObj: Message,
		isSelf = true,
	): Promise<Location> {
		const _from = messageObj._from;
		const to = messageObj.to;
		const toType = messageObj.toType;
		const metadata = messageObj.contentMetadata;
		const specVersion = metadata.e2eeVersion || "2";
		const contentType = messageObj.contentType;
		const chunks = messageObj.chunks.map((chunk) =>
			typeof chunk === "string" ? Buffer.from(chunk, "utf-8") : chunk,
		);

		const senderKeyId = byte2int(chunks[3]);
		const receiverKeyId = byte2int(chunks[4]);
		this.e2eeLog("decryptE2EELocationMessageSenderKeyId", senderKeyId);
		this.e2eeLog("decryptE2EELocationMessageReceiverKeyId", receiverKeyId);

		const selfKey = await this.getE2EESelfKeyData(this.user?.mid as string);
		let privK = Buffer.from(selfKey.privKey, "base64");
		let pubK;

		if (toType === MIDType.USER || toType === MIDType._USER) {
			pubK = await this.getE2EELocalPublicKey(
				to,
				isSelf ? receiverKeyId : senderKeyId,
			);
		} else {
			const groupK = await this.getE2EELocalPublicKey(to, receiverKeyId);
			privK = Buffer.from(groupK.privKey, "base64");
			pubK = Buffer.from(selfKey.pubKey, "base64");
			if (_from !== this.user?.mid) {
				pubK = await this.getE2EELocalPublicKey(_from, senderKeyId);
			}
		}

		let decrypted;
		if (specVersion === "2") {
			decrypted = this.decryptE2EEMessageV2(
				to,
				_from,
				chunks,
				privK,
				pubK,
				parseInt(specVersion),
				contentType as number,
			);
		} else {
			decrypted = this.decryptE2EEMessageV1(chunks, privK, pubK);
		}

		return decrypted.location || undefined;
	}

	public decryptE2EEMessageV1(
		chunks: Buffer[],
		privK: Buffer,
		pubK: Buffer,
	): LooseType {
		this.e2eeLog("decryptE2EEMessageV1_arg", {
			chunks,
			privK,
			pubK,
		});
		const salt = chunks[0];
		const message = chunks[1];
		const _sign = chunks[2];
		const aesKey = this.generateSharedSecret(privK, pubK);
		const aes_key = this.getSHA256Sum(Buffer.from(aesKey), salt, "Key");
		const aes_iv = this.xor(this.getSHA256Sum(Buffer.from(aesKey), salt, "IV"));
		this.e2eeLog("decryptE2EEMessageV1", {
			aes_key,
			aes_iv,
			message,
		});
		const decipher = crypto.createDecipheriv("aes-256-cbc", aes_key, aes_iv);
		decipher.setAutoPadding(false);
		const decrypted = Buffer.concat([
			decipher.update(message),
			decipher.final(),
		]);
		this.e2eeLog(
			"decryptE2EEMessageV1DecryptedMessage",
			decrypted.toString("utf-8"),
		);
		return JSON.parse(decrypted.toString("utf-8"));
	}

	public decryptE2EEMessageV2(
		to: string,
		_from: string,
		chunks: Buffer[],
		privK: Buffer,
		pubK: Buffer,
		specVersion = 2,
		contentType = 0,
	): LooseType {
		const salt = chunks[0];
		const message = chunks[1];
		const ciphertext = message.subarray(0, -16);
		const tag = message.subarray(-16);
		const sign = chunks[2];
		const senderKeyId = byte2int(chunks[3]);
		const receiverKeyId = byte2int(chunks[4]);
		const aesKey = this.generateSharedSecret(privK, pubK);
		const gcmKey = this.getSHA256Sum(Buffer.from(aesKey), salt, "Key");
		const aad = this.generateAAD(
			to,
			_from,
			senderKeyId,
			receiverKeyId,
			specVersion,
			contentType,
		);

		const decipher = crypto.createDecipheriv("aes-256-gcm", gcmKey, sign);
		decipher.setAuthTag(tag);
		decipher.setAAD(aad);
		let decrypted;
		try {
			decrypted = decipher.update(ciphertext);
			decrypted = Buffer.concat([decrypted, decipher.final()]);
		} catch (error) {
			this.e2eeLog("decryptE2EEMessageV2DecryptionFailed", error.message);
			throw error;
		}

		this.e2eeLog("decryptE2EEMessageV2DecryptedMessage", decrypted);
		return JSON.parse(decrypted.toString());
	}

	private e2eeLog(type: string, message: LooseType) {
		this.log("e2ee", { type, message });
	}

	public createSqrSecret(base64Only: boolean = false): [Uint8Array, string] {
		const { secretKey, publicKey } = nacl.box.keyPair();
		const secret = encodeURIComponent(
			Buffer.from(publicKey).toString("base64"),
		);
		const version = 1;

		if (base64Only) {
			return [
				Buffer.from(secretKey),
				Buffer.from(publicKey).toString("base64"),
			];
		}
		return [Buffer.from(secretKey), `?secret=${secret}&e2eeVersion=${version}`];
	}
}

function byte2int(t: Buffer) {
	let e = 0;
	const s = t.length;
	for (let i = 0; i < s; i++) {
		e = 256 * e + t[i];
	}
	return e;
}

function _bin2bytes(k: string) {
	const e: number[] = [];
	for (let i = 0; i < k.length / 2; i++) {
		const _i = parseInt(k.substring(i * 2, i * 2 + 2), 16);
		e.push(_i);
	}
	return new Uint8Array(e);
}

export { E2EE };
