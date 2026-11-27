import { assert, test } from "vite-plus/test";
import { assertRejects } from "../../test/assert.ts";
import { BaseClient } from "../core/mod.ts";
import { type NestedArray, Protocols } from "../thrift/readwrite/declares.ts";
import { writeThrift } from "../thrift/readwrite/write.ts";

const nextAccess = "NEXT-ACCESS-MARKER";
const bodyText = "<html>BODY-MARKER</html>";
const pathToken = "PATH-MARKER";

/** Every place a logger or error serializer reads an error from. */
function errorText(error: Error): string {
	return [
		error.message,
		error.stack ?? "",
		JSON.stringify({ ...error }),
		String(error.cause ?? ""),
	].join("\n");
}

// A gateway error page is not Thrift, so the parse fails. That error used to
// print every response header, x-line-next-access included, and the body as
// hex, and callers copy the message into logs and tool output. A caller's
// path may carry a query string, so the error leaves the path out too.
test("request — an unparsable response names no headers, body or path", async () => {
	const base = new BaseClient({
		device: "DESKTOPWIN",
		fetch: () =>
			Promise.resolve(
				new Response(bodyText, {
					status: 503,
					headers: { "x-line-next-access": nextAccess },
				}),
			),
	});
	const body = new TextEncoder().encode(bodyText);

	const error = await assertRejects(() =>
		base.request.request([], "getProfile", 3, true, `/S3?token=${pathToken}`),
	);

	assert.strictEqual(Object.getPrototypeOf(error), Error.prototype);
	const text = errorText(error);
	assert.notInclude(text, nextAccess);
	assert.notInclude(text, bodyText);
	assert.notInclude(text, pathToken);
	assert.notInclude(text, [...body].map((byte) => byte.toString(16)).join(" "));
	assert.deepEqual(error.cause, undefined);
	assert.deepEqual(
		error.message,
		`Request internal failed: status=503 method=getProfile bodyLength=${body.length}`,
	);
});

function replyWith(fields: NestedArray, methodName: string): BaseClient {
	const body = writeThrift(fields, methodName, Protocols[4]);
	return new BaseClient({
		device: "DESKTOPWIN",
		fetch: () => Promise.resolve(new Response(new Uint8Array(body))),
	});
}

// Field 0 carries the result, and false, 0 and "" are results like any
// other. Only a reply that lacks field 0 but has other fields (an exception)
// is an error.
test("request — a false, 0 or empty result is returned, not thrown", async () => {
	const cases: [string, NestedArray, unknown][] = [
		["isUseridAvailable", [[2, 0, false]], false],
		["getServerTime", [[10, 0, 0]], 0],
		["issueNonce", [[11, 0, ""]], ""],
	];
	for (const [methodName, fields, expected] of cases) {
		const base = replyWith(fields, methodName);
		assert.strictEqual(
			await base.request.request([], methodName, 4, false, "/S4"),
			expected,
			methodName,
		);
	}
});

test("request — an enum result of 0 is renamed and returned", async () => {
	const base = replyWith([[8, 0, 0]], "getPurchaseEnabledStatus");

	assert.strictEqual(
		await base.request.request([], "getPurchaseEnabledStatus", 4, true, "/S4"),
		"OK",
	);
});

test("request — a void reply returns undefined", async () => {
	const base = replyWith([], "noop");

	assert.strictEqual(await base.request.request([], "noop", 4, false, "/S4"), undefined);
});

test("request — an exception reply still throws", async () => {
	const base = replyWith([[12, 1, [[8, 1, 5]]]], "isUseridAvailable");

	const error = await assertRejects(() =>
		base.request.request([], "isUseridAvailable", 4, false, "/S4"),
	);
	assert.match(error.message, /isUseridAvailable\(\/S4\)/);
});
