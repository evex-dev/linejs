import undici from "undici";
import { BaseClient } from "@evex-dev/linejs/base";

undici.setGlobalDispatcher(
	new undici.Agent({
		allowH2: true,
	}),
);

//@ts-expect-error
globalThis.Request = undici.Request;

const client = new BaseClient({
	//@ts-expect-error
	fetch: undici.fetch,
});
