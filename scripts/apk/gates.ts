/**
 * @description Decide which extracted-from-APK changes are safe to write into
 *              `packages/types/thrift.ts` without a human looking at them.
 *
 * Everything the extractor proposes is a statement about one *pairing*: "this
 * APK class is that linejs entry". After R8 the APK class is usually named `h`
 * or `e0`, so the pairing is evidence of varying strength, and the strength is
 * what decides whether a change may be applied:
 *
 *   tier A `canonical` — the APK kept the linejs entry's own name. LINE does
 *                        not obfuscate `com.linecorp.square.protocol.thrift.*`,
 *                        so this is an identity, not a guess.
 *   tier B `rpc`       — the class was reached through a wire RPC string in a
 *                        service client. RPC names are wire-format invariants,
 *                        so the binding survives any shading — *provided* the
 *                        class it lands on is really the one the RPC uses. It
 *                        is keyed by the R8 short name, and short names collide
 *                        across the whole app, so this tier is only as good as
 *                        its content check.
 *   tier C `jaccard`   — the field-name sets overlap. Fine for a 100-member
 *                        enum, worthless for `{request}`-shaped `_args`.
 *
 * The floors below are not taste. Against LINE 26.14.0 the ungated pipeline
 * rewrote 64 field definitions, of which pairings like `getChatapp_result` ↔ a
 * shop-product class had **zero** overlapping field names — the classic
 * short-name collision — and it appended a `success` field at fid 0 to two
 * `_args` structs. Every mismatch it reported in both 26.6.2 and 26.14.0 came
 * from a non-canonical APK class; not one came from a direct-name match.
 */

/** How an (APK class, linejs entry) pairing was established. */
export type PairVia = "canonical" | "rpc" | "jaccard";

export interface Pairing {
	/** APK-side class short name, usually R8-obfuscated. */
	apk: string;
	/** linejs `thrift.ts` entry name. */
	linejs: string;
	via: PairVia;
	/** Jaccard overlap of the two sides' field (or enum member) name sets. */
	score: number;
	/** How many names the two sides actually have in common. A ratio hides the
	 *  difference between two wide structs agreeing and two narrow ones both
	 *  being called `{request}`. */
	shared: number;
}

export interface GateOptions {
	/**
	 * Minimum content overlap for a non-canonical pairing to be trusted.
	 *
	 * The matcher's own discovery threshold is 0.7, so any tier-C pairing
	 * already clears this by construction; the floor exists to catch tier-B
	 * pairings, which are asserted by name and never content-checked. Sitting
	 * just below the discovery threshold means the gate can never contradict
	 * the matcher — it only rejects pairings the matcher was never asked about.
	 */
	minOverlap: number;
	/**
	 * Minimum member count for an enum to accept value adds from a
	 * content-matched (non-canonical) pairing.
	 *
	 * Every enum mis-pairing observed across the 26.6.2 and 26.14.0 extractions
	 * involved a linejs enum of 13 members or fewer (`CarrierCode` 13,
	 * `wm_EnumC38497a` 9, a two-member `{ANDROID, IOS}` enum that matches any
	 * other two-member `{ANDROID, IOS}` enum at Jaccard 1.0). Every enum whose
	 * adds survived review has 112 or more. 16 sits in that gap.
	 */
	enumAddMinMembers: number;
	/**
	 * Minimum number of field names a non-canonical struct pairing must have in
	 * common before it may drive a write.
	 *
	 * A ratio alone cannot carry this. `{request}` overlaps `{request}` at 1.0,
	 * and so does `{language, country}` — LINE ships many one- and two-field
	 * structs with exactly those generic names, so a perfect score on them says
	 * only "both are small", not "both are the same type". Every rewrite the
	 * 26.14.0 run proposed that we would not sign off on sat at score 1.00 on a
	 * struct of three fields or fewer: `getProductV2_args` {request},
	 * `getModulesV4WithStatus_result` {success, e}, `Locale` {language,
	 * country}. The rewrites worth having were on wide structs — `PurchaseOrder`
	 * at 0.75 across a dozen shared names.
	 *
	 * This is the same argument as `enumAddMinMembers`, in field space.
	 */
	minSharedFields: number;
}

export const DEFAULT_GATE_OPTIONS: GateOptions = {
	minOverlap: 0.6,
	enumAddMinMembers: 16,
	minSharedFields: 3,
};

/** Overlap of two name sets, 0..1. Two empty sets count as identical. */
export function jaccard(a: Iterable<string>, b: Iterable<string>): number {
	const A = new Set(a);
	const B = new Set(b);
	if (A.size === 0 && B.size === 0) return 1;
	let inter = 0;
	for (const x of A) if (B.has(x)) inter++;
	const union = A.size + B.size - inter;
	return union === 0 ? 1 : inter / union;
}

/** Classify a pairing that is already on the table (it came out of the matcher
 *  or out of a diff entry) by re-deriving its evidence from the two sides. We
 *  do not care how the matcher found it — only what supports it now. */
export function classifyPair(
	apk: string,
	linejs: string,
	apkNames: Iterable<string>,
	linejsNames: Iterable<string>,
	overrides: Record<string, string>,
): Pairing {
	const A = new Set(apkNames);
	const B = new Set(linejsNames);
	let shared = 0;
	for (const x of A) if (B.has(x)) shared++;
	const score = jaccard(A, B);
	const via: PairVia = apk === linejs
		? "canonical"
		: overrides[apk] === linejs
		? "rpc"
		: "jaccard";
	return { apk, linejs, via, score, shared };
}

export interface Verdict {
	ok: boolean;
	/** Why, for the report. Present whether or not `ok`. */
	reason: string;
}

/** May we rewrite an existing field definition on the strength of `p`?
 *
 *  `uniqueShape` is the caller's tier-C evidence: the linejs entry's field-name
 *  set occurs exactly once in linejs AND the APK struct's occurs exactly once
 *  in the APK, so the pairing is a bijection rather than one of a crowd. */
export function acceptRewrite(
	p: Pairing,
	uniqueShape: boolean,
	opts: GateOptions = DEFAULT_GATE_OPTIONS,
): Verdict {
	// A rewrite claims "these are the same struct, and LINE changed this slot".
	// Disjoint field names refute the premise, whatever tier asserted it.
	if (p.score === 0) {
		return { ok: false, reason: "field-name sets are disjoint" };
	}
	if (p.via === "canonical") {
		return { ok: true, reason: "tier A: APK kept the canonical name" };
	}
	if (p.score < opts.minOverlap) {
		return {
			ok: false,
			reason: `overlap ${
				p.score.toFixed(2)
			} below ${opts.minOverlap} (via ${p.via})`,
		};
	}
	if (p.shared < opts.minSharedFields) {
		return {
			ok: false,
			reason:
				`only ${p.shared} shared field name(s), below ${opts.minSharedFields} (via ${p.via})`,
		};
	}
	if (p.via === "rpc") {
		return {
			ok: true,
			reason: "tier B: bound by wire RPC name, content agrees",
		};
	}
	if (uniqueShape) {
		return { ok: true, reason: "tier C: field-name set unique on both sides" };
	}
	return { ok: false, reason: "tier C: shape is not unique on both sides" };
}

/** May we add a field the APK has and linejs does not?
 *
 *  Stricter than a rewrite, which sounds backwards until you look at what each
 *  one rests on. A rewrite lands on a slot both sides already agree exists, so
 *  the rest of the struct corroborates the pairing. An add invents a slot on
 *  the pairing alone — and when the pairing is wrong the result is a field that
 *  no version of LINE ever sent, sitting in the schema looking authoritative.
 *  That is how `establishE2EESession_args` acquired three coin-balance fields. */
export function acceptStructFieldAdd(
	p: Pairing,
	opts: GateOptions = DEFAULT_GATE_OPTIONS,
): Verdict {
	if (p.via === "canonical") {
		return { ok: true, reason: "tier A: APK kept the canonical name" };
	}
	if (p.via === "rpc") {
		if (p.score < opts.minOverlap) {
			return {
				ok: false,
				reason: `tier B: overlap ${
					p.score.toFixed(2)
				} below ${opts.minOverlap}`,
			};
		}
		if (p.shared < opts.minSharedFields) {
			return {
				ok: false,
				reason:
					`tier B: only ${p.shared} shared field name(s), below ${opts.minSharedFields}`,
			};
		}
		return {
			ok: true,
			reason: "tier B: bound by wire RPC name, content agrees",
		};
	}
	return {
		ok: false,
		reason: `tier C: content-only pairing (overlap ${p.score.toFixed(2)})`,
	};
}

/** May we add an enum value the APK has and linejs does not?
 *
 *  The one place a tier-C pairing is admitted. Enum matching compares member
 *  *names*, and on a large enum an overlap above the threshold cannot happen by
 *  accident: there is no second 112-member enum in LINE that shares 70% of
 *  `SettingsAttributeEx`'s member names. Small enums are the opposite — that is
 *  what `enumAddMinMembers` draws the line at. */
export function acceptEnumValueAdd(
	p: Pairing,
	linejsMemberCount: number,
	opts: GateOptions = DEFAULT_GATE_OPTIONS,
): Verdict {
	if (p.via === "canonical") {
		return { ok: true, reason: "tier A: APK kept the canonical name" };
	}
	if (p.score < opts.minOverlap) {
		return {
			ok: false,
			reason: `overlap ${
				p.score.toFixed(2)
			} below ${opts.minOverlap} (via ${p.via})`,
		};
	}
	if (linejsMemberCount < opts.enumAddMinMembers) {
		return {
			ok: false,
			reason:
				`enum has ${linejsMemberCount} members, below ${opts.enumAddMinMembers}`,
		};
	}
	return {
		ok: true,
		reason: `${linejsMemberCount}-member enum, overlap ${p.score.toFixed(2)}`,
	};
}
