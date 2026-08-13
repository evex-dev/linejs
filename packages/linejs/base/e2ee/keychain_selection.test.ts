import { assertEquals } from "@std/assert";
import { selectKeyChainEntry } from "./mod.ts";

/**
 * Chains observed on a real account are ordered oldest-first and hold every
 * key ever registered, while `keyId` names the one currently in use.
 */
const chain = [
	{ 2: 5894267, 4: "pub-old", 5: "priv-old" },
	{ 2: 5952097, 4: "pub-mid", 5: "priv-mid" },
	{ 2: 5979343, 4: "pub-current", 5: "priv-current" },
];

Deno.test("selectKeyChainEntry picks the entry naming the requested key", () => {
	assertEquals(selectKeyChainEntry(chain, 5979343)[4], "pub-current");
	assertEquals(selectKeyChainEntry(chain, 5952097)[4], "pub-mid");
});

Deno.test("selectKeyChainEntry compares ids as strings", () => {
	// `keyId` arrives as a string from the login payload and as a number from
	// the thrift struct, so both have to resolve to the same entry.
	assertEquals(selectKeyChainEntry(chain, "5979343")[4], "pub-current");
});

Deno.test("selectKeyChainEntry falls back to the first entry", () => {
	// Unknown id, or no id at all: keep the pre-existing behaviour, which is
	// also correct for a chain that only ever holds one key.
	assertEquals(selectKeyChainEntry(chain, 111)[4], "pub-old");
	assertEquals(selectKeyChainEntry(chain)[4], "pub-old");
	assertEquals(selectKeyChainEntry([chain[0]], 5979343)[4], "pub-old");
});
