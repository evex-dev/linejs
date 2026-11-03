import { expect } from "vite-plus/test";

/**
 * Vitest's `expect(...).rejects` does not return the rejected error, while the
 * tests assert on it (and on both its class and message). This helper keeps
 * those assertions on top of Vitest's `expect` and returns the error.
 */
export async function assertRejects<E extends Error = Error>(
	fn: () => Promise<unknown> | unknown,
	errorClass?: (abstract new (...args: never[]) => E) | string | RegExp,
	messageIncludes?: string,
): Promise<E> {
	let error: unknown;
	let rejected = false;
	try {
		await fn();
	} catch (caught) {
		rejected = true;
		error = caught;
	}

	expect(rejected, "expected the function to reject").toBe(true);

	const matcher = typeof errorClass === "function" ? undefined : errorClass;
	if (typeof errorClass === "function") {
		expect(error).toBeInstanceOf(errorClass);
	}
	if (matcher !== undefined) {
		const message = String((error as Error | undefined)?.message ?? error);
		if (typeof matcher === "string") {
			expect(message).toContain(matcher);
		} else {
			expect(message).toMatch(matcher);
		}
	}
	if (messageIncludes !== undefined) {
		expect(String((error as Error | undefined)?.message ?? error)).toContain(messageIncludes);
	}

	return error as E;
}
