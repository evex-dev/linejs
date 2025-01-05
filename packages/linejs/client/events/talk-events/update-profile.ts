import type * as line from "@evex/linejs-types";
import type { SourceEvent } from "../mod.ts";
import { LINEEventBase } from "../shared.ts";
import { parseEnum } from "@evex/linejs-types/thrift";

/**
 * An event that indicates a user's profile was updated.
 */
export class UpdateProfileLINEEvent extends LINEEventBase {
	readonly type: "update-profile" = "update-profile";
	userMid: string;
	profileAttributes: (line.Pb1_K6 | null)[] = [];

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "NOTIFIED_UPDATE_PROFILE_CONTENT") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param1;
		const attr = parseEnum("ProfileAttribute", op.param2);
		if (attr !== null) {
			this.profileAttributes[0] = attr as any as line.Pb1_K6;
		} else {
			const arr: line.Pb1_K6[] = [];
			[...(parseInt(op.param2).toString(2))].forEach((e, i) => {
				if (e == "1") {
					arr.push(
						parseEnum(
							"ProfileAttribute",
							2 ** i,
						) as any as line.Pb1_K6,
					);
				}
			});
			this.profileAttributes = arr;
		}
	}
}
