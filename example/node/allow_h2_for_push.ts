import undici from "npm:undici";
import { BaseClient } from "@evex/linejs/base";

undici.setGlobalDispatcher(new undici.Agent({
  allowH2: true
}));

//@ts-expect-error
globalThis.Request = undici.Request;

const client = new BaseClient({
//@ts-expect-error
    fetch: undici.fetch,
});
