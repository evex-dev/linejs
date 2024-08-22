/**
 * @module
 * Utility for LINE FUNCTIONS
 */

import type { ALL_STRING } from "../common/types.ts";

interface Square {
	emid: string;
	name: string;
	desc: string;
	profileImageObsHash: string;
	emblems: number[];
	joinMethodType: number;
	badges: number[];
}

type SearchSquareResult = {
	error: string;
	data: null;
} | {
	error: null;
	data: {
		squares: {
			square: Square;
			memberCount: number;
			chatCount: number;
			postCount: number;
			latestMessageCreatedAt: number;
			lastestMessageCreatedAt: number;
		}[];
		continuationToken: `${number}`;
		totalCount: number;
		showNewForOneMember: boolean;
	};
};

/**
 * Search square by query.
 *
 * @param query {string} The query of search square.
 * @param limit {number} The limit of the result. (0-200)
 * @returns The result of the search.
 */
export async function searchSquare(
	query: string,
	limit: number,
): Promise<SearchSquareResult> {
	if (limit < 0 || limit > 200) {
		return {
			error: "limit must be between 0 and 200",
			data: null,
		};
	}

	const result = await fetch(
		`https://openchat.line.me/api/square/search?query=${
			encodeURIComponent(
				query,
			)
		}&limit=${limit}`,
		{
			headers: {
				accept: "application/json, text/plain, */*",
				"accept-language": "ja,en-US;q=0.9,en;q=0.8",
				"sec-ch-ua":
					'"Chromium";v="100", "Google Chrome";v="100", "Not=A?Brand";v="100"',
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": '"Windows"',
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-lal": "jp",
			},
			referrerPolicy: "strict-origin-when-cross-origin",
			body: null,
			method: "GET",
			mode: "cors",
			credentials: "include",
		},
	);

	if (!result.ok) {
		return {
			error: result.statusText,
			data: null,
		};
	}

	return {
		error: null,
		data: await result.json(),
	};
}

type getSquareResult = {
	error: string;
	data: null;
} | {
	error: null;
	data: {
		square: Square;
		noteCount: number;
		isFull: boolean;
		isReadOnly: boolean;
		isYoutubeSquare: boolean;
		country: string;
		isOASquare: boolean;
	};
};

/**
 * Gets a Square by its ticket or emid.
 *
 * @param ticketOrEmid {string} The ticket or emid of the Square.
 * @param isTicket {string} Whether the given parameter is a ticket or emid.
 * @param append_headers {object} The headers to append. (Please includes 'x-line-channeltoken')
 * @returns The result of the get.
 */
export async function getSquare(
	ticketOrEmid: string,
	isTicket: boolean,
	append_headers: Record<"x-line-channeltoken" | ALL_STRING, string>,
): Promise<getSquareResult> {
	const url = isTicket
		? `https://square-api.line.me/smw/api/v2p/sm/square?ticket=${ticketOrEmid}`
		: `https://square-api.line.me/smw/api/v2p/sm/square?emid=${ticketOrEmid}`;

	const result = await fetch(
		url,
		{
			"headers": {
				"accept": "application/json, text/plain, */*",
				"accept-language":
					"ja-JP,ja;q=0.9,ar-SS;q=0.8,ar;q=0.7,en-US;q=0.6,en;q=0.5,ko-KR;q=0.4,ko;q=0.3",
				"cache-control": "no-cache",
				"pragma": "no-cache",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-lal": "ja-JP_JP",
				"x-web-client-version": "4.3.3",
				...append_headers,
			},
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": null,
			"method": "GET",
			"mode": "cors",
			"credentials": "include",
		},
	);

	if (!result.ok) {
		return {
			error: result.statusText,
			data: null,
		};
	}

	return {
		error: null,
		data: await result.json(),
	};
}
