import type { LooseType } from "./common.ts";

export function mergeObjectArguments<T extends Record<string, LooseType>>(
	extend: T,
	base: T,
): T {
	return {
		...extend,
		...base,
	};
}
