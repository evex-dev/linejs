import type { LooseType } from "./common.ts";

export interface Profile {
	mid: string;
	phone: string;
	regionCode: string;
	displayName: string;
	pictureStatus: string;
	statusMessage: string;
	allowSearchByUserid: boolean;
	allowSearchByEmail: boolean;
	picturePath: string;
	statusMessageContentMetadata: LooseType;
	nftProfile: boolean;
}
