/**
 * Some types for linejs.
 * @module
 */

/**
 * Fetch function used by linejs.
 * You can set custom network connection if you create an API which follows FetchLike.
 */
export interface FetchLike {
	(req: Request): Response | Promise<Response>;
}
export type Fetch = (info: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

/**
 * Any value. Inlined from the retired `@evex/loose-types` package.
 */
// oxlint-disable-next-line no-explicit-any
export type LooseType = any;
