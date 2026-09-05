/**
 * @description Cover the rules that decide what an APK extraction may write
 *              into thrift.ts without review.
 *
 * Two layers. The synthetic cases pin each rule in isolation. The fixture cases
 * replay real pairings from the LINE 26.14.0 extraction — including the ones
 * that made the ungated pipeline rewrite 64 field definitions and break
 * `deno check` — so a future loosening of the gates fails here first.
 */
import { assert, assertEquals } from "@std/assert";
import {
	acceptEnumValueAdd,
	acceptRewrite,
	acceptStructFieldAdd,
	classifyPair,
	DEFAULT_GATE_OPTIONS,
	jaccard,
	type Pairing,
} from "./gates.ts";

const pair = (p: Partial<Pairing>): Pairing => ({
	apk: "x",
	linejs: "Y",
	via: "jaccard",
	score: 1,
	// Wide enough that the absolute floor is not what a case is testing unless
	// it says so.
	shared: 8,
	...p,
});

// --------------------------------------------------------------------------
// jaccard / classifyPair
// --------------------------------------------------------------------------

Deno.test("jaccard: disjoint sets score 0, identical sets score 1", () => {
	assertEquals(jaccard(["a", "b"], ["c", "d"]), 0);
	assertEquals(jaccard(["a", "b"], ["b", "a"]), 1);
	assertEquals(jaccard(["a", "b", "c"], ["a", "b"]), 2 / 3);
	// Two empty structs are the same shape, not an undefined ratio.
	assertEquals(jaccard([], []), 1);
});

Deno.test("classifyPair: name identity beats an override, which beats content", () => {
	const overrides = { h: "getChatapp_result" };
	assertEquals(
		classifyPair("Locale", "Locale", ["a"], ["a"], overrides).via,
		"canonical",
	);
	assertEquals(
		classifyPair("h", "getChatapp_result", ["a"], ["b"], overrides).via,
		"rpc",
	);
	assertEquals(
		classifyPair("h", "Other", ["a"], ["a"], overrides).via,
		"jaccard",
	);
});

// --------------------------------------------------------------------------
// rewrites
// --------------------------------------------------------------------------

Deno.test("rewrite: disjoint field names are refused at every tier", () => {
	for (const via of ["canonical", "rpc", "jaccard"] as const) {
		const v = acceptRewrite(pair({ via, score: 0 }), true);
		assertEquals(
			v.ok,
			false,
			`via=${via} must not rewrite across disjoint sets`,
		);
		assert(v.reason.includes("disjoint"));
	}
});

Deno.test("rewrite: a canonical name is trusted even when fields moved a lot", () => {
	// LINE renaming several fields of a struct it did not obfuscate is exactly
	// the drift the tool exists to track; the name is still an identity.
	assertEquals(
		acceptRewrite(pair({ via: "canonical", score: 0.25 }), false).ok,
		true,
	);
});

Deno.test("rewrite: tiers B and C must clear the content floor", () => {
	const { minOverlap } = DEFAULT_GATE_OPTIONS;
	const under = minOverlap - 0.01;
	assertEquals(
		acceptRewrite(pair({ via: "rpc", score: under }), true).ok,
		false,
	);
	assertEquals(
		acceptRewrite(pair({ via: "jaccard", score: under }), true).ok,
		false,
	);
	assertEquals(
		acceptRewrite(pair({ via: "rpc", score: minOverlap }), false).ok,
		true,
	);
	assertEquals(
		acceptRewrite(pair({ via: "jaccard", score: minOverlap }), true).ok,
		true,
	);
});

Deno.test("rewrite: tier C additionally needs a shape unique on both sides", () => {
	assertEquals(
		acceptRewrite(pair({ via: "jaccard", score: 0.9 }), false).ok,
		false,
	);
	assertEquals(
		acceptRewrite(pair({ via: "jaccard", score: 0.9 }), true).ok,
		true,
	);
});

Deno.test("rewrite: a perfect ratio on a tiny struct is not evidence", () => {
	// `{request}` overlaps `{request}` at 1.0 and means nothing. This is what
	// moved `Locale`'s field ids and repointed `getProductV2_args.request`.
	const { minSharedFields } = DEFAULT_GATE_OPTIONS;
	for (const via of ["rpc", "jaccard"] as const) {
		const v = acceptRewrite(
			pair({ via, score: 1, shared: minSharedFields - 1 }),
			true,
		);
		assertEquals(v.ok, false, `via=${via} at ${minSharedFields - 1} shared`);
		assert(v.reason.includes("shared field name"));
	}
	assertEquals(
		acceptRewrite(
			pair({ via: "jaccard", score: 0.75, shared: minSharedFields }),
			true,
		)
			.ok,
		true,
	);
	// A canonical name is an identity and does not need corroboration.
	assertEquals(
		acceptRewrite(pair({ via: "canonical", score: 1, shared: 1 }), true).ok,
		true,
	);
});

Deno.test("struct field add: tier B also needs enough shared names", () => {
	const { minSharedFields } = DEFAULT_GATE_OPTIONS;
	assertEquals(
		acceptStructFieldAdd(
			pair({ via: "rpc", score: 1, shared: minSharedFields - 1 }),
		)
			.ok,
		false,
	);
	assertEquals(
		acceptStructFieldAdd(
			pair({ via: "rpc", score: 1, shared: minSharedFields }),
		).ok,
		true,
	);
});

Deno.test("rewrite: the floor is a flag, not a constant", () => {
	const loose = { ...DEFAULT_GATE_OPTIONS, minOverlap: 0.2 };
	assertEquals(acceptRewrite(pair({ via: "rpc", score: 0.3 }), true).ok, false);
	assertEquals(
		acceptRewrite(pair({ via: "rpc", score: 0.3 }), true, loose).ok,
		true,
	);
});

// --------------------------------------------------------------------------
// additive struct fields
// --------------------------------------------------------------------------

Deno.test("struct field add: content-only pairings are reported, never applied", () => {
	// An add invents a slot on the pairing alone — nothing corroborates it.
	const v = acceptStructFieldAdd(pair({ via: "jaccard", score: 0.95 }));
	assertEquals(v.ok, false);
	assert(v.reason.includes("tier C"));
});

Deno.test("struct field add: canonical always, RPC only above the floor", () => {
	assertEquals(
		acceptStructFieldAdd(pair({ via: "canonical", score: 0.1 })).ok,
		true,
	);
	assertEquals(acceptStructFieldAdd(pair({ via: "rpc", score: 0.9 })).ok, true);
	assertEquals(
		acceptStructFieldAdd(pair({ via: "rpc", score: 0.2 })).ok,
		false,
	);
});

// --------------------------------------------------------------------------
// additive enum values
// --------------------------------------------------------------------------

Deno.test("enum value add: large enums may take content-matched adds", () => {
	assertEquals(
		acceptEnumValueAdd(pair({ via: "jaccard", score: 0.8 }), 123).ok,
		true,
	);
});

Deno.test("enum value add: small enums may not", () => {
	const { enumAddMinMembers } = DEFAULT_GATE_OPTIONS;
	assertEquals(
		acceptEnumValueAdd(
			pair({ via: "jaccard", score: 1 }),
			enumAddMinMembers - 1,
		).ok,
		false,
	);
	assertEquals(
		acceptEnumValueAdd(pair({ via: "jaccard", score: 1 }), enumAddMinMembers)
			.ok,
		true,
	);
	// …unless the APK kept the name, which does not depend on size at all.
	assertEquals(
		acceptEnumValueAdd(pair({ via: "canonical", score: 1 }), 2).ok,
		true,
	);
});

Deno.test("enum value add: the size floor does not rescue a weak overlap", () => {
	assertEquals(
		acceptEnumValueAdd(pair({ via: "jaccard", score: 0.1 }), 200).ok,
		false,
	);
});

// --------------------------------------------------------------------------
// real pairings from the LINE 26.14.0 extraction
// --------------------------------------------------------------------------

interface StructCase {
	apk: string;
	linejs: string;
	via: Pairing["via"];
	apkNames: string[];
	linejsNames: string[];
	uniqueShape: boolean;
	expectRewrite: boolean;
	expectFieldAdd: boolean;
	why: string;
}
interface EnumCase {
	apk: string;
	linejs: string;
	via: Pairing["via"];
	linejsMemberCount: number;
	apkNames: string[];
	linejsNames: string[];
	expectValueAdd: boolean;
	why: string;
}

const fixture: { structPairings: StructCase[]; enumPairings: EnumCase[] } = JSON
	.parse(
		await Deno.readTextFile(
			new URL("./testdata/pairings_26.14.0.json", import.meta.url),
		),
	);

Deno.test("26.14.0 pairings: rewrite verdicts", () => {
	for (const c of fixture.structPairings) {
		const overrides = c.via === "rpc" ? { [c.apk]: c.linejs } : {};
		const p = classifyPair(
			c.apk,
			c.linejs,
			c.apkNames,
			c.linejsNames,
			overrides,
		);
		assertEquals(p.via, c.via, `${c.linejs}: unexpected tier`);
		assertEquals(
			acceptRewrite(p, c.uniqueShape).ok,
			c.expectRewrite,
			`${c.linejs} <- ${c.apk}: ${c.why}`,
		);
	}
});

Deno.test("26.14.0 pairings: struct field add verdicts", () => {
	for (const c of fixture.structPairings) {
		const overrides = c.via === "rpc" ? { [c.apk]: c.linejs } : {};
		const p = classifyPair(
			c.apk,
			c.linejs,
			c.apkNames,
			c.linejsNames,
			overrides,
		);
		assertEquals(
			acceptStructFieldAdd(p).ok,
			c.expectFieldAdd,
			`${c.linejs} <- ${c.apk}: ${c.why}`,
		);
	}
});

Deno.test("26.14.0 pairings: enum value add verdicts", () => {
	for (const c of fixture.enumPairings) {
		const p = classifyPair(c.apk, c.linejs, c.apkNames, c.linejsNames, {});
		assertEquals(
			acceptEnumValueAdd(p, c.linejsMemberCount).ok,
			c.expectValueAdd,
			`${c.linejs} <- ${c.apk}: ${c.why}`,
		);
	}
});

Deno.test("26.14.0 pairings: every refusal is structural, not incidental", () => {
	// Each pairing we refuse to rewrite is refused for a reason visible in the
	// two name sets alone: they share nothing, or they share too little for the
	// overlap to mean anything. If a future change refuses one for some other
	// reason, that is a gate doing something we did not intend.
	const { minSharedFields } = DEFAULT_GATE_OPTIONS;
	for (const c of fixture.structPairings.filter((x) => !x.expectRewrite)) {
		const p = classifyPair(c.apk, c.linejs, c.apkNames, c.linejsNames, {});
		assert(
			p.shared === 0 || p.shared < minSharedFields,
			`${c.linejs} <- ${c.apk}: refused with ${p.shared} shared name(s) at ` +
				`overlap ${p.score.toFixed(2)} — neither disjoint nor too narrow`,
		);
	}
});
