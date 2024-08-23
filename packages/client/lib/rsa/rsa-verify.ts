import { Key } from "npm:node-bignumber@1.2.2";
import type { RSAKey } from "../thrift/line__types.ts";

export function getRSACrypto(message: string, json: RSAKey) {
	const rsa = new Key();
	rsa.setPublic(json.nvalue, json.evalue);
	const credentials = rsa.encrypt(message).toString("hex");
	const keyname = json.keynm;
	return { keyname, credentials, message };
}
