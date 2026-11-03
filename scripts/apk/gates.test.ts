/**
 * @description Cover the rules that decide what an APK extraction may write
 *              into thrift.ts without review.
 *
 * Two layers. The synthetic cases pin each rule in isolation. The fixture cases
 * replay real pairings from the LINE 26.14.0 extraction — including the ones
 * that made the ungated pipeline rewrite 64 field definitions and break the
 * type check — so a future loosening of the gates fails here first.
 */
import { readFile } from "node:fs/promises";
import { assert, test } from "vite-plus/test";
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

test("jaccard: disjoint sets score 0, identical sets score 1", () => {
	assert.deepEqual(jaccard(["a", "b"], ["c", "d"]), 0);
	assert.deepEqual(jaccard(["a", "b"], ["b", "a"]), 1);
	assert.deepEqual(jaccard(["a", "b", "c"], ["a", "b"]), 2 / 3);
	// Two empty structs are the same shape, not an undefined ratio.
	assert.deepEqual(jaccard([], []), 1);
});

test("classifyPair: name identity beats an override, which beats content", () => {
	const overrides = { h: "getChatapp_result" };
	assert.deepEqual(classifyPair("Locale", "Locale", ["a"], ["a"], overrides).via, "canonical");
	assert.deepEqual(classifyPair("h", "getChatapp_result", ["a"], ["b"], overrides).via, "rpc");
	assert.deepEqual(classifyPair("h", "Other", ["a"], ["a"], overrides).via, "jaccard");
});

// --------------------------------------------------------------------------
// rewrites
// --------------------------------------------------------------------------

test("rewrite: disjoint field names are refused at every tier", () => {
	for (const via of ["canonical", "rpc", "jaccard"] as const) {
		const v = acceptRewrite(pair({ via, score: 0 }), true);
		assert.deepEqual(v.ok, false, `via=${via} must not rewrite across disjoint sets`);
		assert.isOk(v.reason.includes("disjoint"));
	}
});

test("rewrite: a canonical name is trusted even when fields moved a lot", () => {
	// LINE renaming several fields of a struct it did not obfuscate is exactly
	// the drift the tool exists to track; the name is still an identity.
	assert.deepEqual(acceptRewrite(pair({ via: "canonical", score: 0.25 }), false).ok, true);
});

test("rewrite: tiers B and C must clear the content floor", () => {
	const { minOverlap } = DEFAULT_GATE_OPTIONS;
	const under = minOverlap - 0.01;
	assert.deepEqual(acceptRewrite(pair({ via: "rpc", score: under }), true).ok, false);
	assert.deepEqual(acceptRewrite(pair({ via: "jaccard", score: under }), true).ok, false);
	assert.deepEqual(acceptRewrite(pair({ via: "rpc", score: minOverlap }), false).ok, true);
	assert.deepEqual(acceptRewrite(pair({ via: "jaccard", score: minOverlap }), true).ok, true);
});

test("rewrite: tier C additionally needs a shape unique on both sides", () => {
	assert.deepEqual(acceptRewrite(pair({ via: "jaccard", score: 0.9 }), false).ok, false);
	assert.deepEqual(acceptRewrite(pair({ via: "jaccard", score: 0.9 }), true).ok, true);
});

test("rewrite: a perfect ratio on a tiny struct is not evidence", () => {
	// `{request}` overlaps `{request}` at 1.0 and means nothing. This is what
	// moved `Locale`'s field ids and repointed `getProductV2_args.request`.
	const { minSharedFields } = DEFAULT_GATE_OPTIONS;
	for (const via of ["rpc", "jaccard"] as const) {
		const v = acceptRewrite(pair({ via, score: 1, shared: minSharedFields - 1 }), true);
		assert.deepEqual(v.ok, false, `via=${via} at ${minSharedFields - 1} shared`);
		assert.isOk(v.reason.includes("shared field name"));
	}
	assert.deepEqual(
		acceptRewrite(pair({ via: "jaccard", score: 0.75, shared: minSharedFields }), true).ok,
		true,
	);
	// A canonical name is an identity and does not need corroboration.
	assert.deepEqual(acceptRewrite(pair({ via: "canonical", score: 1, shared: 1 }), true).ok, true);
});

test("struct field add: tier B also needs enough shared names", () => {
	const { minSharedFields } = DEFAULT_GATE_OPTIONS;
	assert.deepEqual(
		acceptStructFieldAdd(pair({ via: "rpc", score: 1, shared: minSharedFields - 1 })).ok,
		false,
	);
	assert.deepEqual(
		acceptStructFieldAdd(pair({ via: "rpc", score: 1, shared: minSharedFields })).ok,
		true,
	);
});

test("rewrite: the floor is a flag, not a constant", () => {
	const loose = { ...DEFAULT_GATE_OPTIONS, minOverlap: 0.2 };
	assert.deepEqual(acceptRewrite(pair({ via: "rpc", score: 0.3 }), true).ok, false);
	assert.deepEqual(acceptRewrite(pair({ via: "rpc", score: 0.3 }), true, loose).ok, true);
});

// --------------------------------------------------------------------------
// additive struct fields
// --------------------------------------------------------------------------

test("struct field add: content-only pairings are reported, never applied", () => {
	// An add invents a slot on the pairing alone — nothing corroborates it.
	const v = acceptStructFieldAdd(pair({ via: "jaccard", score: 0.95 }));
	assert.deepEqual(v.ok, false);
	assert.isOk(v.reason.includes("tier C"));
});

test("struct field add: canonical always, RPC only above the floor", () => {
	assert.deepEqual(acceptStructFieldAdd(pair({ via: "canonical", score: 0.1 })).ok, true);
	assert.deepEqual(acceptStructFieldAdd(pair({ via: "rpc", score: 0.9 })).ok, true);
	assert.deepEqual(acceptStructFieldAdd(pair({ via: "rpc", score: 0.2 })).ok, false);
});

// --------------------------------------------------------------------------
// additive enum values
// --------------------------------------------------------------------------

test("enum value add: large enums may take content-matched adds", () => {
	assert.deepEqual(acceptEnumValueAdd(pair({ via: "jaccard", score: 0.8 }), 123).ok, true);
});

test("enum value add: small enums may not", () => {
	const { enumAddMinMembers } = DEFAULT_GATE_OPTIONS;
	assert.deepEqual(
		acceptEnumValueAdd(pair({ via: "jaccard", score: 1 }), enumAddMinMembers - 1).ok,
		false,
	);
	assert.deepEqual(
		acceptEnumValueAdd(pair({ via: "jaccard", score: 1 }), enumAddMinMembers).ok,
		true,
	);
	// …unless the APK kept the name, which does not depend on size at all.
	assert.deepEqual(acceptEnumValueAdd(pair({ via: "canonical", score: 1 }), 2).ok, true);
});

test("enum value add: the size floor does not rescue a weak overlap", () => {
	assert.deepEqual(acceptEnumValueAdd(pair({ via: "jaccard", score: 0.1 }), 200).ok, false);
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

const fixture: { structPairings: StructCase[]; enumPairings: EnumCase[] } = JSON.parse(
	await readFile(new URL("./testdata/pairings_26.14.0.json", import.meta.url), "utf8"),
);

test("26.14.0 pairings: rewrite verdicts", () => {
	for (const c of fixture.structPairings) {
		const overrides = c.via === "rpc" ? { [c.apk]: c.linejs } : {};
		const p = classifyPair(c.apk, c.linejs, c.apkNames, c.linejsNames, overrides);
		assert.deepEqual(p.via, c.via, `${c.linejs}: unexpected tier`);
		assert.deepEqual(
			acceptRewrite(p, c.uniqueShape).ok,
			c.expectRewrite,
			`${c.linejs} <- ${c.apk}: ${c.why}`,
		);
	}
});

test("26.14.0 pairings: struct field add verdicts", () => {
	for (const c of fixture.structPairings) {
		const overrides = c.via === "rpc" ? { [c.apk]: c.linejs } : {};
		const p = classifyPair(c.apk, c.linejs, c.apkNames, c.linejsNames, overrides);
		assert.deepEqual(
			acceptStructFieldAdd(p).ok,
			c.expectFieldAdd,
			`${c.linejs} <- ${c.apk}: ${c.why}`,
		);
	}
});

test("26.14.0 pairings: enum value add verdicts", () => {
	for (const c of fixture.enumPairings) {
		const p = classifyPair(c.apk, c.linejs, c.apkNames, c.linejsNames, {});
		assert.deepEqual(
			acceptEnumValueAdd(p, c.linejsMemberCount).ok,
			c.expectValueAdd,
			`${c.linejs} <- ${c.apk}: ${c.why}`,
		);
	}
});

test("26.14.0 pairings: every refusal is structural, not incidental", () => {
	// Each pairing we refuse to rewrite is refused for a reason visible in the
	// two name sets alone: they share nothing, or they share too little for the
	// overlap to mean anything. If a future change refuses one for some other
	// reason, that is a gate doing something we did not intend.
	const { minSharedFields } = DEFAULT_GATE_OPTIONS;
	for (const c of fixture.structPairings.filter((x) => !x.expectRewrite)) {
		const p = classifyPair(c.apk, c.linejs, c.apkNames, c.linejsNames, {});
		assert.isOk(
			p.shared === 0 || p.shared < minSharedFields,
			`${c.linejs} <- ${c.apk}: refused with ${p.shared} shared name(s) at ` +
				`overlap ${p.score.toFixed(2)} — neither disjoint nor too narrow`,
		);
	}
});
