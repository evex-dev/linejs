type UserType = "friend" | "other" | "me";

export type User<T extends UserType = UserType> = Partial<{
	type: T;
	displayName: string;
	displayNameOverridden: string;
	memberId: string;
	iconObsHash: string;
	thumbnailObsHash: string;
	statusMessage: string;
}>;
