export type WEB_SCHEME_PREFIX<T extends string> =
	| `http://${T}`
	| `https://${T}`;
// deno-lint-ignore ban-types
export type ALL_STRING = string & {};
