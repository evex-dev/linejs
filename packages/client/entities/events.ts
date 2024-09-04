import type { Log } from "./log.ts";
import type { User } from "./user.ts";

export type ClientEvents = {
	pincall: (pincode: string) => void;
	qrcall: (pincode: string) => void;
	ready: (user: User<"me">) => void;
	"update:authtoken": (authtoken: string) => void;
	"update:cert": (cert: string) => void;
	"update:qrcert": (cert: string) => void;
	log: (data: Log) => void;
};
