import type { LooseType } from "../../utils/common.ts";

export interface RSAKeyInfo {
	keynm: LooseType;
	nvalue: LooseType;
	evalue: LooseType;
	sessionKey: LooseType;
}
