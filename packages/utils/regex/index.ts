/**
 * @module
 * Utility for LINE REGEX
 */

/**
 * @description LINE Regex Utility
 */
class LINE_REGEX_BASE {
	constructor() {}

	/**
	 * Extracts a ticket from a given link using a regular expression.
	 *
	 * @param {string} link - The link to extract the ticket from.
	 * @return {string|null} The extracted ticket, or null if no match is found.
	 */
	public getTicket(link: string): string | null {
		const regex = /([a-zA-Z0-9-_]{10,38})[\?.+]?/;

		const matchResult = link.match(regex);
		if (!matchResult) {
			return null;
		}

		const ticket = matchResult.pop();

		if (!ticket) {
			return null;
		}

		return ticket;
	}

	/**
	 * Extracts a emid from a given link using a regular expression.
	 *
	 * @param {string} link - The link to extract the ticket from.
	 * @return {string|null} The extracted ticket, or null if no match is found.
	 */
	public getEmid(link: string): string | null {
		const regex = /([a-zA-Z0-9-_]{59})[\?.+]?/;

		const matchResult = link.match(regex);
		if (!matchResult) {
			return null;
		}

		const ticket = matchResult.pop();

		if (!ticket) {
			return null;
		}

		return ticket;
	}
}

export { LINE_REGEX_BASE as LINE_REGEX };
