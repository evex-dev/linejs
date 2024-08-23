import type { User } from "./user.ts";

export type ClientEvents = {
	"pincall": (pincode: string) => void;
	"ready": (user: User<"me">) => void;
	"update:authtoken": (authtoken: string) => void;
	"update:cert": (cert: string) => void;
	"log": (data: string, date: Date) => void;
};
