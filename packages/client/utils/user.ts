import type { Profile } from "./profile.ts";

type UserType = "friend" | "other" | "me";

export type User<T extends UserType = UserType> = {
	type: T;
	displayName: string;
	displayNameOverridden: string;
	mid: string;
	iconObsHash: string;
	statusMessage: string;
	statusMessageContentMetadata: Profile["statusMessageContentMetadata"];
} & (T extends "me"
	? {
			profile: Profile;
		}
	: {
			profile: undefined;
		});
