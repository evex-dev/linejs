import type * as LINETypes from "../lib/thrift/line_types.ts";

type UserType = "friend" | "other" | "me";

export type User<T extends UserType = UserType> = LINETypes.Profile & {
	type: T;
};
