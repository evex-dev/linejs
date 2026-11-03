import { assert, test } from "vite-plus/test";
import { TypedEventEmitter } from "./index.ts";

test("promise() should be vaild", async () => {
	type Events = {
		example: (v: number) => void;
	};
	class Client extends TypedEventEmitter<Events, "example"> {}
	const client = new Client();

	const promise = client.waitFor("example");

	client.emit("example", 123456);

	const [v] = await promise;

	assert.deepEqual(v, 123456);
});
