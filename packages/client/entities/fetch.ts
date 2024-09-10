export type FetchLike = (
	url: string,
	options?: RequestInit,
) => Promise<Response>;
