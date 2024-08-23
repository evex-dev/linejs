import type * as LINETypes from "../lib/thrift/line_types.ts";

type UserType = "friend" | "other" | "me";

export type User<T extends UserType = UserType> = {
	type: T;
	displayName: string;
	displayNameOverridden: string;
	mid: string;
	iconObsHash: string;
	statusMessage: string;
	statusMessageContentMetadata: LINETypes.Profile["statusMessageContentMetadata"];
} & (T extends "me"
	? {
			profile: LINETypes.Profile;
		}
	: {
			profile: undefined;
		});
