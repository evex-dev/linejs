// deno-lint-ignore no-explicit-any
export type TimelineResponse<T = any> = {
	code: number;
	message: string;
	result: T;
};
