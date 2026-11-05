import { assert, test } from "vite-plus/test";
import { assertRejects } from "../../test/assert.ts";
import { BaseClient } from "../core/mod.ts";

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
