import { assertEquals } from "@std/assert";
import { Buffer } from "node:buffer";
import type { PurchaseOrder as PurchaseOrderType } from "@evex/linejs-types";
import { PurchaseOrder } from "./struct.ts";
import { Protocols } from "./declares.ts";
import { writeStruct } from "./write.ts";
import { readThriftStruct } from "./read.ts";

for (const value of [true, false]) {
	Deno.test(`PurchaseOrder preserves legacy auto-exchange input (${value}) at fid 12`, () => {
		// Also checks that the previously published property remains in the type.
		const input: Pick<PurchaseOrderType, "enableLinePointAutoExchange"> = {
			enableLinePointAutoExchange: value,
		};
		const fields = PurchaseOrder(input);
		assertEquals(fields.find((field) => field?.[1] === 12), [2, 12, value]);
		const wire = Buffer.from(writeStruct(fields, Protocols[4]));
		assertEquals(Boolean(readThriftStruct(wire)[12]), value);
	});
}
