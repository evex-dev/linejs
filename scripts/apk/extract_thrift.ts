/**
 * @description Extract Thrift type definitions from a decompiled (apktool) smali
 *              tree of a LINE Android APK, and diff/apply them against linejs's
 *              packages/types/thrift.ts.
 *
 * Source of truth: the live LINE APK. CHRLINE-Thrift IDL (used by sync_thrift.ts)
 * lags behind the app since it's community-derived; this tool extracts directly
 * from the shipped bytecode.
 *
 * Recognition strategy (resilient to Thrift-library shading and class-name R8):
 *
 *   1. Scan every .smali file for `<init>(Ljava/lang/String;BS)V` invocations.
 *      The Thrift TField constructor signature is unique enough that the most
 *      frequently invoked class with that signature *is* TField. We also detect
 *      the TEnum interface by frequency of `.implements` plus `<init>(Ljava/lang/String;II)V`
 *      invocations (the Java-emitted Thrift enum constant constructor pattern).
 *
 *   2. For each class implementing TBase / TFieldIdEnum / TEnum, parse the
 *      `<clinit>()V` method with a minimal register-state interpreter:
 *        - track `const-string`, `const/4`, `const/16`, `const`, `const/high16`
 *        - on `invoke-direct {..., TField}, ...<init>(String,B,S)V`,
 *          read the three argument registers and emit a (name, ttype, fid) field
 *        - on `invoke-direct {..., enum-class}, ...<init>(String,I,I)V` inside
 *          a class whose .class header has the `enum` modifier, emit an
 *          (enum-member-name, ordinal, value) tuple
 *
 *   3. For struct fields with ttype STRUCT (12), recover the target type by
 *      looking at instance-field declarations. The Thrift Java generator pairs
 *      each TField with one instance field declared in the same `.field` order;
 *      after R8 the instance field becomes one-letter (`a`, `b`, ...) but its
 *      declared Java type (`Lpkg/SomeClass;` etc.) is preserved.
 *
 *   4. The extracted set is shaped into the same IDL AST used by sync_thrift.ts
 *      (enums, structs, services, typedefs, consts), and fed through
 *      sync_thrift.ts's content-based matcher + additive patcher. That reuses
 *      Jaccard matching to bridge linejs's older obfuscated names to the new
 *      APK's (different) obfuscated names.
 *
 * Usage:
 *   deno run -A scripts/apk/extract_thrift.ts --smali <dir> [--apply]
 *                                              [--report <out>]
 *                                              [--match-threshold <0..1>]
 *                                              [--include-pkg <regex>]
 *                                              [--limit <N>]    # cap files for debugging
 */
import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";
import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts";

import {
	applyDiff,
	computeDiff,
	type EnumDef,
	type EnumMember,
	type FieldDef,
	type IDL,
	indexLineThrift,
	type LineEnum,
	type LineField,
	type LineStruct,
	type LineThrift,
	type StructDef,
	TType,
	type TypeExpr,
} from "../thrift/sync_thrift.ts";

// =========================================================================
// CLI
// =========================================================================

interface Args {
	smaliDir: string;
	apply: boolean;
	report: string;
	matchThreshold: number;
	includePkg: RegExp | null;
	limit: number;
	strict: boolean;
	rewriteMismatches: boolean;
	rewriteEnums: boolean;
	servicesReport: string;
}

function parseArgs(argv: string[]): Args {
	const out: Args = {
		smaliDir: "",
		apply: false,
		report: "",
		matchThreshold: 0.7,
		includePkg: null,
		limit: 0,
		strict: false,
		rewriteMismatches: false,
		rewriteEnums: false,
		servicesReport: "",
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		switch (a) {
			case "--smali":
				out.smaliDir = argv[++i];
				break;
			case "--apply":
				out.apply = true;
				break;
			case "--report":
				out.report = argv[++i];
				break;
			case "--match-threshold":
				out.matchThreshold = Number(argv[++i]);
				break;
			case "--include-pkg":
				out.includePkg = new RegExp(argv[++i]);
				break;
			case "--limit":
				out.limit = Number(argv[++i]);
				break;
			case "--strict":
				out.strict = true;
				break;
			case "--rewrite-mismatches":
				out.rewriteMismatches = true;
				break;
			case "--rewrite-enums":
				out.rewriteEnums = true;
				break;
			case "--services-report":
				out.servicesReport = argv[++i];
				break;
			default:
				throw new Error(`unknown arg: ${a}`);
		}
	}
	if (!out.smaliDir) throw new Error("--smali <dir> is required");
	return out;
}

// =========================================================================
// Smali parser (line-oriented, register-state aware)
// =========================================================================

/** A subset of smali register values we track during <clinit> interpretation. */
type RegVal =
	| { kind: "string"; value: string }
	| { kind: "int"; value: number }
	| { kind: "new"; klass: string } // pre-construction object placeholder
	| { kind: "constructed"; klass: string }; // post-<init> object

interface SmaliClass {
	name: string; // FQCN with `L...;` stripped, slashes preserved: e.g. `fh8/u6`
	rawName: string; // `Lfh8/u6;`
	modifiers: Set<string>; // `public`, `final`, `enum`, etc.
	interfaces: string[];
	instanceFields: Array<{ name: string; type: string }>;
	staticFields: Array<{ name: string; type: string }>;
	enclosingClinit: ClinitData;
	filePath: string; // path to the .smali file (used for $StandardScheme lookup)
}

interface ClinitData {
	tfieldCalls: Array<{ name: string; ttype: number; fid: number }>;
	enumConstantCalls: Array<{ name: string; ordinal: number; value: number }>;
	/** Map from a static field name → (TField argument values bound to it),
	 * because TField objects are usually stored to a class static and later
	 * referenced from read/write loops. */
	tfieldByStaticField: Map<
		string,
		{ name: string; ttype: number; fid: number }
	>;
}

const FIELD_DECL_RE = /^\.field\s+([\w\s]+?)\s+(\w+):(L[^;]+;|\[[^;]+;|\w)/;
const FQCN_RE = /^L([\w./$]+);$/;

function parseSmaliFile(src: string, filePath: string): SmaliClass | null {
	const lines = src.split("\n");

	let name = "";
	let rawName = "";
	const modifiers = new Set<string>();
	const interfaces: string[] = [];
	const instanceFields: Array<{ name: string; type: string }> = [];
	const staticFields: Array<{ name: string; type: string }> = [];

	let inClinit = false;
	let clinitLines: string[] = [];

	for (const raw of lines) {
		const line = raw.trim();
		if (line.startsWith(".class")) {
			// .class public final enum LFoo/Bar;
			const tokens = line.split(/\s+/);
			rawName = tokens[tokens.length - 1];
			const m = FQCN_RE.exec(rawName);
			if (m) name = m[1];
			for (const t of tokens.slice(1, -1)) modifiers.add(t);
		} else if (line.startsWith(".implements")) {
			const m = /^\.implements\s+(L[^;]+;)/.exec(line);
			if (m) interfaces.push(m[1]);
		} else if (line.startsWith(".field")) {
			const m = FIELD_DECL_RE.exec(line);
			if (m) {
				const mods = m[1];
				const fname = m[2];
				const ftype = m[3];
				const list = mods.includes("static") ? staticFields : instanceFields;
				list.push({ name: fname, type: ftype });
			}
		} else if (line.startsWith(".method")) {
			if (line.includes("<clinit>()V")) {
				inClinit = true;
				clinitLines = [];
			}
		} else if (line.startsWith(".end method")) {
			if (inClinit) inClinit = false;
		} else if (inClinit) {
			clinitLines.push(line);
		}
	}

	if (!name) return null;
	const enclosingClinit = interpretClinit(
		clinitLines,
		rawName,
		modifiers.has("enum"),
	);
	return {
		name,
		rawName,
		modifiers,
		interfaces,
		instanceFields,
		staticFields,
		enclosingClinit,
		filePath,
	};
}

/** Linear interpretation of <clinit> just enough to capture TField inits and
 *  enum constant inits. We DO NOT model branches or exception edges: Thrift
 *  generators emit straight-line code in <clinit>, so this is sufficient. */
function interpretClinit(
	clinitLines: string[],
	ownerClass: string, // `Lfh8/u6;`
	isEnum: boolean,
): ClinitData {
	const regs = new Map<string, RegVal>();
	const data: ClinitData = {
		tfieldCalls: [],
		enumConstantCalls: [],
		tfieldByStaticField: new Map(),
	};
	// Most recently constructed TField (if any), keyed by destination register.
	// Used to bind a TField to the static field it gets sput-object'd into.
	type LastTField = {
		reg: string;
		name: string;
		ttype: number;
		fid: number;
	};
	let lastTField: LastTField | null = null;

	for (const line of clinitLines) {
		// const-string vN, "value"
		// (also const-string/jumbo)
		{
			const m = /^const-string(?:\/jumbo)?\s+(\w+),\s+"((?:\\.|[^"\\])*)"$/
				.exec(line);
			if (m) {
				regs.set(m[1], { kind: "string", value: unescapeSmaliString(m[2]) });
				continue;
			}
		}
		// const/4, const/16, const, const/high16, const-wide/* (we treat as int — large
		// ttype values don't appear in Thrift signatures).
		{
			const m =
				/^const(?:\/4|\/16|\/high16|-wide(?:\/16|\/32|\/high16)?|)?\s+(\w+),\s+(-?\w+)$/
					.exec(line);
			if (m) {
				const reg = m[1];
				const raw = m[2];
				let value: number;
				if (raw.startsWith("0x") || raw.startsWith("-0x")) {
					value = parseInt(raw, 16);
				} else {
					value = parseInt(raw, 10);
				}
				if (!Number.isNaN(value)) {
					regs.set(reg, { kind: "int", value });
				}
				continue;
			}
		}
		// new-instance vN, Lcls;
		{
			const m = /^new-instance\s+(\w+),\s+(L[^;]+;)/.exec(line);
			if (m) {
				regs.set(m[1], { kind: "new", klass: m[2] });
				continue;
			}
		}
		// invoke-direct {regs}, Lcls;-><init>(sig)V
		{
			const m =
				/^invoke-direct\s+\{([^}]*)\},\s+(L[^;]+;)->\<init\>\(([^)]*)\)V$/.exec(
					line,
				);
			if (m) {
				const callRegs = m[1].split(",").map((s) => s.trim()).filter(Boolean);
				const klass = m[2];
				const sig = m[3];
				const result = handleInvokeDirect(
					regs,
					callRegs,
					klass,
					sig,
					ownerClass,
					isEnum,
					data,
				);
				if (result) lastTField = result;
				continue;
			}
		}
		// sput-object vN, Lcls;->fieldName:Ltype;
		{
			const m = /^sput-object\s+(\w+),\s+L[^;]+;->(\w+):(L[^;]+;)/.exec(line);
			if (m && lastTField !== null && lastTField.reg === m[1]) {
				const fieldName = m[2];
				data.tfieldByStaticField.set(fieldName, {
					name: lastTField.name,
					ttype: lastTField.ttype,
					fid: lastTField.fid,
				});
				lastTField = null;
				continue;
			}
		}
		// move-result-object vN — invalidates the register
		{
			const m = /^move-result(?:-object|-wide)?\s+(\w+)$/.exec(line);
			if (m) {
				regs.delete(m[1]);
				continue;
			}
		}
		// Any other instruction touching a register conservatively invalidates it.
		// We keep this minimal: handle goto/throw/return as terminators.
		if (/^(return|throw|goto)/.test(line)) {
			// no-op
		}
	}

	return data;
}

/** Process one `invoke-direct ... <init>(sig)V` call. Returns the newly
 *  constructed TField (bound to the receiver register) if applicable, else null. */
function handleInvokeDirect(
	regs: Map<string, RegVal>,
	callRegs: string[],
	klass: string,
	sig: string,
	ownerClass: string,
	isEnum: boolean,
	data: ClinitData,
): { reg: string; name: string; ttype: number; fid: number } | null {
	if (callRegs.length === 0) return null;
	const receiverReg = callRegs[0];
	const args = callRegs.slice(1);

	// TField: <init>(Ljava/lang/String;BS)V  →  args = [name, ttype, fid]
	if (sig === "Ljava/lang/String;BS") {
		if (args.length !== 3) return null;
		const name = regs.get(args[0]);
		const ttype = regs.get(args[1]);
		const fid = regs.get(args[2]);
		if (
			name?.kind === "string" && ttype?.kind === "int" && fid?.kind === "int"
		) {
			data.tfieldCalls.push({
				name: name.value,
				ttype: ttype.value,
				fid: fid.value,
			});
			regs.set(receiverReg, { kind: "constructed", klass });
			return {
				reg: receiverReg,
				name: name.value,
				ttype: ttype.value,
				fid: fid.value,
			};
		}
		return null;
	}

	// Java-emitted Thrift enum constant ctor: <init>(Ljava/lang/String;II)V
	//   args = [name, ordinal, value]. Only meaningful when the class being
	//   constructed is the enclosing enum itself.
	if (sig === "Ljava/lang/String;II" && isEnum && klass === ownerClass) {
		if (args.length !== 3) return null;
		const name = regs.get(args[0]);
		const ord = regs.get(args[1]);
		const value = regs.get(args[2]);
		if (
			name?.kind === "string" && ord?.kind === "int" && value?.kind === "int"
		) {
			data.enumConstantCalls.push({
				name: name.value,
				ordinal: ord.value,
				value: value.value,
			});
		}
		return null;
	}

	return null;
}

function unescapeSmaliString(s: string): string {
	return s.replace(/\\([\\"nrt])|\\u([0-9a-fA-F]{4})/g, (_m, esc, uni) => {
		if (uni) return String.fromCharCode(parseInt(uni, 16));
		switch (esc) {
			case "n":
				return "\n";
			case "r":
				return "\r";
			case "t":
				return "\t";
			case "\\":
				return "\\";
			case '"':
				return '"';
		}
		return _m;
	});
}

// =========================================================================
// IDL synthesis from extracted smali classes
// =========================================================================

/** Diagnostics: count interface frequencies among classes that contain TField
 *  initializers. The dominant non-stdlib interface is the shaded TBase
 *  (`Lorg/apache/thrift/e;` in LINE 26.6.2, `Lorg/apache/thrift/TBase;` in
 *  unshaded builds, possibly a different short letter in other builds).
 *  We log the top hits so the operator can sanity-check that detection is
 *  finding real Thrift bytecode in the APK, but we do NOT gate struct
 *  detection on a specific interface name — the presence of a TField
 *  constructor invocation in <clinit> is the load-bearing signal. */
function reportShadedInterfaces(classes: SmaliClass[]) {
	const tbaseCandidates = new Map<string, number>();
	const tenumCandidates = new Map<string, number>();
	for (const c of classes) {
		if (c.enclosingClinit.tfieldCalls.length > 0) {
			for (const iface of c.interfaces) {
				if (iface.startsWith("Ljava/")) continue;
				tbaseCandidates.set(iface, (tbaseCandidates.get(iface) ?? 0) + 1);
			}
		}
		if (
			c.modifiers.has("enum") &&
			c.enclosingClinit.enumConstantCalls.length > 0
		) {
			for (const iface of c.interfaces) {
				if (iface.startsWith("Ljava/")) continue;
				tenumCandidates.set(iface, (tenumCandidates.get(iface) ?? 0) + 1);
			}
		}
	}
	const topPair = (m: Map<string, number>): string =>
		[...m].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k}=${v}`)
			.join(" ");
	if (tbaseCandidates.size) {
		console.log(
			`detected TBase interface candidates: ${topPair(tbaseCandidates)}`,
		);
	}
	if (tenumCandidates.size) {
		console.log(
			`detected TEnum interface candidates: ${topPair(tenumCandidates)}`,
		);
	}
}

function tTypeFromByte(b: number): TType | null {
	switch (b) {
		case 2:
			return TType.BOOL;
		case 3:
			return TType.BYTE;
		case 4:
			return TType.DOUBLE;
		case 6:
			return TType.I16;
		case 8:
			return TType.I32;
		case 10:
			return TType.I64;
		case 11:
			return TType.STRING;
		case 12:
			return TType.STRUCT;
		case 13:
			return TType.MAP;
		case 14:
			return TType.SET;
		case 15:
			return TType.LIST;
		default:
			return null;
	}
}

/** Map a Thrift TField (name, ttype, fid) + the owning class's instance
 *  fields to a sync_thrift FieldDef. For struct/container fields we attempt
 *  to recover the inner type from the matching instance-field declaration,
 *  paired by ORDINAL position with the TField list. */
function buildFieldDef(
	tfield: { name: string; ttype: number; fid: number },
	index: number,
	instanceFields: Array<{ name: string; type: string }>,
): FieldDef {
	const tt = tTypeFromByte(tfield.ttype);
	let typeExpr: TypeExpr;
	if (tt === null) {
		// unknown ttype — fall back to string (most permissive)
		typeExpr = { kind: "primitive", ttype: TType.STRING, raw: "string" };
	} else if (
		tt === TType.BOOL || tt === TType.BYTE || tt === TType.DOUBLE ||
		tt === TType.I16 || tt === TType.I32 || tt === TType.I64 ||
		tt === TType.STRING
	) {
		typeExpr = { kind: "primitive", ttype: tt, raw: TType[tt].toLowerCase() };
	} else {
		// STRUCT / MAP / SET / LIST — try to resolve target class via instance field
		const inst = instanceFields[index];
		const refName = inst ? javaTypeToShortName(inst.type) : null;
		if (tt === TType.STRUCT && refName) {
			typeExpr = { kind: "ref", name: refName };
		} else if (tt === TType.LIST) {
			// We can't see the element type from the .field declaration of a List
			// (it would require generic signature parsing). Default to string.
			typeExpr = {
				kind: "list",
				elem: { kind: "primitive", ttype: TType.STRING, raw: "string" },
			};
		} else if (tt === TType.SET) {
			typeExpr = {
				kind: "set",
				elem: { kind: "primitive", ttype: TType.STRING, raw: "string" },
			};
		} else if (tt === TType.MAP) {
			typeExpr = {
				kind: "map",
				key: { kind: "primitive", ttype: TType.STRING, raw: "string" },
				value: { kind: "primitive", ttype: TType.STRING, raw: "string" },
			};
		} else {
			typeExpr = { kind: "ref", name: refName ?? "any" };
		}
	}
	return {
		fid: tfield.fid,
		name: tfield.name,
		requiredness: "default",
		typeExpr,
	};
}

/** Lpkg/Foo$Bar;  →  Bar  (Java inner classes via $)
 *  Lpkg/Foo;     →  Foo  */
function javaTypeToShortName(jvmType: string): string | null {
	const m = FQCN_RE.exec(jvmType);
	if (!m) return null;
	const fqcn = m[1];
	const tail = fqcn.split("/").pop()!;
	return tail.split("$").pop()!;
}

function buildIDL(classes: SmaliClass[]): IDL {
	const idl: IDL = {
		enums: new Map(),
		structs: new Map(),
		services: new Map(),
		typedefs: new Map(),
		consts: new Map(),
	};

	for (const c of classes) {
		// Preserve enclosing-class prefixes so SquareService's inner method-arg
		// classes (e.g. SquareService$sendMessage_args) don't collide with
		// TalkService's identically-named ones. linejs convention is to join
		// with underscore: SquareService_sendMessage_args.
		const short = c.name.split("/").pop()!.replaceAll("$", "_");
		// Thrift detection — both gates are structural, not name-based, so the
		// extractor works against any LINE build regardless of how the Thrift
		// library got shaded by R8/ProGuard:
		//
		//   - Thrift struct: <clinit> contains ≥1 invoke of <init>(String, B, S)
		//                    (TField constructor signature)
		//   - Thrift enum:   class declared with the `enum` modifier AND <clinit>
		//                    contains ≥1 invoke of <init>(String, I, I) where the
		//                    target is the enum class itself (Thrift's generated
		//                    enum-member ctor takes name, ordinal, value)
		const looksLikeThriftEnum = c.modifiers.has("enum") &&
			c.enclosingClinit.enumConstantCalls.length > 0;
		const looksLikeThriftStruct = !c.modifiers.has("enum") &&
			c.enclosingClinit.tfieldCalls.length > 0;

		if (looksLikeThriftEnum) {
			const members: EnumMember[] = c.enclosingClinit.enumConstantCalls.map((
				m,
			) => ({
				name: m.name,
				value: m.value,
			}));
			idl.enums.set(short, { name: short, members });
			continue;
		}

		if (looksLikeThriftStruct) {
			const fields: FieldDef[] = c.enclosingClinit.tfieldCalls.map((tf, i) =>
				buildFieldDef(tf, i, c.instanceFields)
			);
			fields.sort((a, b) => a.fid - b.fid);
			idl.structs.set(short, { name: short, kind: "struct", fields });
		}
	}

	return idl;
}

/** R8-synthetic class names (one to three lowercase chars + optional digit).
 *  These are obfuscated method-arg / -result holder structs whose canonical
 *  names have been erased; importing them as new top-level entries in
 *  thrift.ts would be noise. The matcher still gets a shot at them — if a
 *  short-named extracted struct has the same field shape as an existing
 *  linejs entry, sync_thrift's Jaccard matcher will route any new fields to
 *  that entry, so we only drop the *new-type* output, not the source. */
function isR8SyntheticName(s: string): boolean {
	return /^[a-z]{1,3}[0-9]?$/.test(s);
}

// =========================================================================
// Walk smali dir
// =========================================================================

async function loadAllClasses(dir: string, opts: Args): Promise<SmaliClass[]> {
	const classes: SmaliClass[] = [];
	let scanned = 0;
	const t0 = performance.now();
	for await (
		const entry of walk(dir, { exts: [".smali"], includeDirs: false })
	) {
		if (opts.includePkg && !opts.includePkg.test(entry.path)) continue;
		const src = await Deno.readTextFile(entry.path);
		// Cheap pre-filter: skip files that obviously don't touch Thrift.
		// We only need files that either have an `<init>(Ljava/lang/String;BS)V`
		// (TField call) or `Lorg/apache/thrift/` (TBase/TEnum implementation).
		if (
			!src.includes("(Ljava/lang/String;BS)V") &&
			!src.includes("Lorg/apache/thrift/")
		) continue;
		const cls = parseSmaliFile(src, entry.path);
		if (cls) classes.push(cls);
		scanned++;
		if (scanned % 1000 === 0) {
			const dt = (performance.now() - t0) / 1000;
			console.log(
				`  scanned ${scanned} files (${(scanned / dt).toFixed(0)}/s)...`,
			);
		}
		if (opts.limit > 0 && classes.length >= opts.limit) break;
	}
	const dt = ((performance.now() - t0) / 1000).toFixed(1);
	console.log(`scan done: ${classes.length} candidate classes in ${dt}s`);
	return classes;
}

// =========================================================================
// Container element-type inference from $StandardScheme.read() smali
//
// Thrift's generated read() walks every field with a switch over `fid`.
// Within each case, container fields produce a recognisable pair of calls:
//
//     invoke-virtual {iprot}, L<TProtocol>;->readListBegin()L<TList>;
//     ...loop body...
//     invoke-virtual {iprot}, L<TProtocol>;->readListEnd()V
//
// The loop body itself reveals the *element type* via either:
//   - a `new-instance LElementStruct;` followed by the struct's read() call
//     (struct element — ttype STRUCT, class is LElementStruct)
//   - or a single `invoke-virtual {iprot}, L<TProtocol>;->XXX()<retType>` whose
//     return type IS the wire-encoded primitive (Z→bool, B→byte, S→i16, I→i32,
//     J→i64, D→double, Ljava/lang/String;→string)
//
// We don't need to fully interpret control flow — a forward scan from the
// readListBegin / readSetBegin / readMapBegin marker until the matching
// readListEnd marker is enough to spot the element-read call. Nested
// containers are resolved recursively by chaining the same logic at each
// readXxxBegin.
//
// Shading-tolerant: we detect the begin/end calls by their *return type*
// (TList / TSet / TMap shaded classes are unique per kind) rather than by
// method name. Once the begin call's return-class is observed we know the
// container ttype, and the corresponding end call shares that class.
// =========================================================================

interface ContainerElementResult {
	/** Map from fid → resolved TypeExpr for the field, where the new inferred
	 *  inner element types are now known. Only fields whose read() implied a
	 *  more specific element type than the IDL pass produced are returned. */
	byFid: Map<number, TypeExpr>;
}

const RET_TO_TTYPE: Record<string, TType> = {
	"Z": TType.BOOL,
	"B": TType.BYTE,
	"S": TType.I16,
	"I": TType.I32,
	"J": TType.I64,
	"D": TType.DOUBLE,
	"Ljava/lang/String;": TType.STRING,
};

function primitiveTypeExprFromReturnType(ret: string): TypeExpr | null {
	const tt = RET_TO_TTYPE[ret];
	if (tt === undefined) return null;
	return { kind: "primitive", ttype: tt, raw: TType[tt].toLowerCase() };
}

/** A single fid-case block in the read() method body. We slice the smali
 *  text for a case by tracking forward from one `:cond_N` label (or pswitch
 *  case label) up to either `goto :goto_0` (the main loop continuation) or
 *  the next case label. */
interface FidCase {
	fid: number;
	body: string;
}

function sliceFidCases(readMethodBody: string): FidCase[] {
	// We look for the fid-dispatch chain. Thrift's javac/D8 emits either:
	//   if-eq p0, v_N, :cond_K       ; fid → label
	//   if-ne p0, v_N, :cond_K       ; same shape, inverted
	//   packed-switch p0, :pswitch_data_0
	// The if-chain form is most common in obfuscated builds. We capture each
	// (fid_const, target_label) pair from the const → if-eq sequence, then
	// for each pair extract the block of code starting at `:target_label`
	// until the next `goto` or label.
	const lines = readMethodBody.split("\n").map((l) => l.trim());

	// Map register → most recent int const, so we can resolve fid in `if-eq p0, vN`.
	const regInt = new Map<string, number>();
	const fidToLabel = new Map<number, string>();
	for (const line of lines) {
		const cm = /^const(?:\/4|\/16|)?\s+(\w+),\s+(-?\w+)$/.exec(line);
		if (cm) {
			const v = cm[2].startsWith("0x") || cm[2].startsWith("-0x")
				? parseInt(cm[2], 16)
				: parseInt(cm[2], 10);
			if (!Number.isNaN(v)) regInt.set(cm[1], v);
			continue;
		}
		const ifm = /^if-(?:eq|ne)\s+\w+,\s+(\w+),\s+(:cond_\w+|:pswitch_\w+|:goto_\w+)/.exec(line);
		if (ifm) {
			const fid = regInt.get(ifm[1]);
			if (fid !== undefined && fid >= 1 && fid <= 1024) {
				fidToLabel.set(fid, ifm[2]);
			}
			continue;
		}
	}

	// Locate label positions.
	const labelLine = new Map<string, number>();
	for (let i = 0; i < lines.length; i++) {
		const l = lines[i];
		if (l.startsWith(":")) {
			labelLine.set(l, i);
		}
	}

	// For each fid, slice from its label forward until a `goto` that returns
	// to the main loop (`:goto_0`). That gives us the case body.
	const out: FidCase[] = [];
	for (const [fid, label] of fidToLabel) {
		const start = labelLine.get(label);
		if (start === undefined) continue;
		let end = lines.length;
		for (let i = start + 1; i < lines.length; i++) {
			const l = lines[i];
			if (l.startsWith("goto") && /:goto_(\w+)/.test(l)) {
				// stop after this line
				end = i + 1;
				break;
			}
			// Or stop if we encounter a label that's any OTHER fid's case.
			if (l.startsWith(":") && [...fidToLabel.values()].includes(l)) {
				end = i;
				break;
			}
		}
		out.push({ fid, body: lines.slice(start, end).join("\n") });
	}
	return out;
}

/** Within a case body, look for the container element-read pattern. Returns
 *  a refined TypeExpr or null if we couldn't infer anything new. */
function inferElementType(caseBody: string, currentExpr: TypeExpr): TypeExpr | null {
	// Identify whether the case is for LIST/SET/MAP by the begin-call return-class.
	// shaded begin-call returns:
	//   readListBegin → Ljn8/j;     (example shading)
	//   readSetBegin  → Ljn8/m;     (different class)
	//   readMapBegin  → Ljn8/h;     (different class)
	// We don't hardcode the class name; we look for the unique pattern of
	//   move-result-object pX
	//   iget pX, pX, L<TList-like>;->b:I    ; size field
	// In all builds, the size field is at instance-position `b` (after `a` =
	// element ttype) — but to be safe we treat any iget-I on the return-class
	// as the size.
	//
	// Element-read identification: the first invoke-virtual {p1} on the
	// protocol that's NOT a begin/end and that has a non-void return type is
	// the primitive element-read. A `new-instance` immediately followed by an
	// `invoke-direct <init>()` is the struct element-read.

	// Quick gate: is there a primitive element-read?
	const lines = caseBody.split("\n").map((l) => l.trim());

	// Find struct element-read first (more specific).
	for (let i = 0; i < lines.length; i++) {
		const ni = /^new-instance\s+\w+,\s+(L[^;]+;)/.exec(lines[i]);
		if (!ni) continue;
		const cls = ni[1];
		if (cls.startsWith("Ljava/")) continue;
		// Look ahead for an <init>()V on the same class
		for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
			const id = /^invoke-direct\s+\{[^}]+\},\s+(L[^;]+;)->\<init\>\(\)V$/.exec(lines[j]);
			if (id && id[1] === cls) {
				// Element is this struct. Construct element ref.
				const short = cls.replace(/^L|;$/g, "").split("/").pop()!.replaceAll("$", "_");
				const elemExpr: TypeExpr = { kind: "ref", name: short };
				return wrapInCurrentContainer(currentExpr, elemExpr);
			}
		}
	}

	// Find primitive element-read via the protocol object (p1).
	for (const line of lines) {
		const iv = /^invoke-virtual\s+\{p1\},\s+L[^;]+;->\w+\(\)(\w+|L[^;]+;)$/.exec(line);
		if (!iv) continue;
		const ret = iv[1];
		// Skip begin/end-like calls (V return is end, complex returns are
		// container begins). Only primitive returns are useful here.
		const elem = primitiveTypeExprFromReturnType(ret);
		if (elem) {
			return wrapInCurrentContainer(currentExpr, elem);
		}
	}

	return null;
}

/** Re-wrap an inferred element type in the same container kind as
 *  currentExpr. If currentExpr is list/set, we replace .elem; if map, we
 *  put the inferred type as .value (key inference is left as a future
 *  improvement — Thrift map keys are almost always string/i32/i64 and our
 *  Jaccard matcher already routes those correctly via the IDL pass). */
function wrapInCurrentContainer(currentExpr: TypeExpr, elem: TypeExpr): TypeExpr | null {
	if (currentExpr.kind === "list" || currentExpr.kind === "set") {
		return { ...currentExpr, elem };
	}
	if (currentExpr.kind === "map") {
		return { ...currentExpr, value: elem };
	}
	return null;
}

/** Walk a struct's StandardScheme.read() and return refined container
 *  element types per fid. Returns an empty map if no scheme file is
 *  located.
 *
 *  In LINE's APK two naming conventions coexist:
 *
 *    - Canonical packages keep readable inner-class names:
 *        com/.../Foo.smali  +  com/.../Foo$FooStandardScheme.smali
 *    - Obfuscated packages reduce all inner classes to single letters:
 *        fh8/u6.smali  +  fh8/u6$a.smali / u6$b.smali / u6$c.smali / …
 *
 *  We probe every sibling that starts with `<struct>$` and pick whichever
 *  one has a `void (TProtocol, TBase)` method whose body contains the
 *  TField → `iget-short` fid extraction. That picks the StandardScheme
 *  unambiguously: TupleScheme uses bitset reads (no per-field fid switch),
 *  the _Fields enum has no such methods, and the Factory inner classes
 *  return a scheme instance rather than reading.
 */
async function inferStandardSchemeElements(
	structSmaliPath: string,
): Promise<ContainerElementResult> {
	const out: ContainerElementResult = { byFid: new Map() };

	// Normalize Windows backslashes to forward slashes so our path math
	// (lastIndexOf("/"), basename extraction) works on either OS.
	const path = structSmaliPath.replaceAll("\\", "/");
	const m = /^(.*?)\.smali$/.exec(path);
	if (!m) return out;
	const stem = m[1];
	const slash = stem.lastIndexOf("/");
	if (slash < 0) return out;
	const dir = stem.slice(0, slash);
	const tail = stem.slice(slash + 1);

	// Candidate scheme files: first the canonical `<stem>$<stem>StandardScheme`,
	// then every other sibling `<stem>$*.smali`.
	const candidates: string[] = [`${dir}/${tail}$${tail}StandardScheme.smali`];
	for await (const entry of Deno.readDir(dir)) {
		if (!entry.isFile) continue;
		if (!entry.name.endsWith(".smali")) continue;
		const prefix = `${tail}$`;
		if (!entry.name.startsWith(prefix)) continue;
		if (entry.name === `${tail}$${tail}StandardScheme.smali`) continue;
		candidates.push(`${dir}/${entry.name}`);
	}

	for (const candidate of candidates) {
		let src: string;
		try {
			src = await Deno.readTextFile(candidate);
		} catch {
			continue;
		}
		// Two-method check: scheme classes have exactly read + write, both with
		// signature `(<TProtocol>;<TBase>;)V`. We don't care which is read vs
		// write — only one of them contains the fid dispatch.
		const methodBlocks = extractMethodBlocks(src);
		const voidPairMethods = methodBlocks.filter((mm) =>
			mm.sig.endsWith(")V") && /^\(L[^;]+;L[^;]+;\)V$/.test(mm.sig)
		);
		if (voidPairMethods.length === 0) continue;
		let readMethod: SmaliMethod | null = null;
		for (const mm of voidPairMethods) {
			// fid extraction lives on `iget-short ..., L<TField>;->c:S` (the
			// TField.id field is a `short`). The TupleScheme alternative uses
			// bitsets and does not load a short from any field.
			if (mm.body.includes("iget-short") && /->[abc]:S/.test(mm.body)) {
				readMethod = mm;
				break;
			}
		}
		if (!readMethod) continue;
		for (const fc of sliceFidCases(readMethod.body)) {
			const elem = inferRawElement(fc.body);
			if (elem) out.byFid.set(fc.fid, elem);
		}
		return out;
	}
	return out;
}

interface SmaliMethod {
	name: string;
	sig: string;
	body: string;
}

function extractMethodBlocks(src: string): SmaliMethod[] {
	const out: SmaliMethod[] = [];
	const lines = src.split("\n");
	let i = 0;
	while (i < lines.length) {
		const hdr = /^\.method\s+(?:[\w]+\s+)*(\w+)\((.*?)\)(.+)$/.exec(lines[i].trim());
		if (!hdr) {
			i++;
			continue;
		}
		const name = hdr[1];
		const sig = `(${hdr[2]})${hdr[3]}`;
		const body: string[] = [];
		i++;
		while (i < lines.length && !lines[i].trim().startsWith(".end method")) {
			body.push(lines[i]);
			i++;
		}
		out.push({ name, sig, body: body.join("\n") });
		i++;
	}
	return out;
}

/** Independent of outer container: produce just the element TypeExpr. */
function inferRawElement(caseBody: string): TypeExpr | null {
	const lines = caseBody.split("\n").map((l) => l.trim());

	// Struct element-read
	for (let i = 0; i < lines.length; i++) {
		const ni = /^new-instance\s+\w+,\s+(L[^;]+;)/.exec(lines[i]);
		if (!ni) continue;
		const cls = ni[1];
		if (cls.startsWith("Ljava/")) continue;
		for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
			const id = /^invoke-direct\s+\{[^}]+\},\s+(L[^;]+;)->\<init\>\(\)V$/.exec(lines[j]);
			if (id && id[1] === cls) {
				const short = cls.replace(/^L|;$/g, "").split("/").pop()!.replaceAll(
					"$",
					"_",
				);
				return { kind: "ref", name: short };
			}
		}
	}

	// Primitive element-read via the TProtocol object. We accept any
	// `invoke-virtual {p1}, L<anything>;->m()<retType>` where retType is one
	// of our known primitives. (D8 sometimes assigns the protocol to a
	// different register on the path through goto :goto_0; the most common
	// is p1 because the read method is `read(this, protocol, struct)`
	// → parameters are p0=this, p1=protocol, p2=struct.)
	for (const line of lines) {
		const iv = /^invoke-virtual\s+\{\w+\},\s+L[^;]+;->\w+\(\)(\w+|L[^;]+;)$/.exec(line);
		if (!iv) continue;
		const ret = iv[1];
		const elem = primitiveTypeExprFromReturnType(ret);
		if (elem) return elem;
	}

	return null;
}

/** Apply container-element refinement to an IDL produced by buildIDL.
 *  Each struct in `idl` is paired with its source smali file via `pathByStruct`. */
async function refineContainerElements(
	idl: IDL,
	pathByStruct: Map<string, string>,
): Promise<{ updated: number; structsTouched: number }> {
	let updated = 0;
	let structsTouched = 0;
	for (const struct of idl.structs.values()) {
		const path = pathByStruct.get(struct.name);
		if (!path) continue;
		const containerFids = struct.fields
			.filter((f) =>
				f.typeExpr.kind === "list" || f.typeExpr.kind === "set" ||
				f.typeExpr.kind === "map"
			)
			.map((f) => f.fid);
		if (containerFids.length === 0) continue;

		const result = await inferStandardSchemeElements(path);
		let touched = false;
		for (const f of struct.fields) {
			const inferredElem = result.byFid.get(f.fid);
			if (!inferredElem) continue;
			const wrapped = wrapInCurrentContainer(f.typeExpr, inferredElem);
			if (!wrapped) continue;
			// Only update if the inferred element differs from the current one.
			if (sameTypeExpr(wrapped, f.typeExpr)) continue;
			f.typeExpr = wrapped;
			updated++;
			touched = true;
		}
		if (touched) structsTouched++;
	}
	return { updated, structsTouched };
}

function sameTypeExpr(a: TypeExpr, b: TypeExpr): boolean {
	if (a.kind !== b.kind) return false;
	switch (a.kind) {
		case "primitive":
			return b.kind === "primitive" && a.ttype === b.ttype;
		case "ref":
			return b.kind === "ref" && a.name === b.name;
		case "list":
		case "set":
			return (b.kind === "list" || b.kind === "set") && sameTypeExpr(a.elem, b.elem);
		case "map":
			return b.kind === "map" && sameTypeExpr(a.key, b.key) && sameTypeExpr(a.value, b.value);
	}
}

// =========================================================================
// Verification: detect TYPE MISMATCHES between APK-extracted IDL and linejs
//
// `computeDiff` is additive — it tells you what's *missing* in linejs that
// the APK has. It deliberately does not flag fields where the APK and linejs
// disagree on a property (ttype, name, fid). Those silent mismatches are the
// most dangerous kind of staleness: code compiles and tests pass, but
// serialization writes the wrong type onto the wire.
//
// We do an independent pass over matched struct/enum pairs and emit:
//
//   - struct field with same name + same fid but different ttype  (likely
//     LINE changed a primitive width / promoted to struct / etc.)
//   - struct field with same fid but different name               (rename)
//   - struct field with same name but different fid               (slot renumber)
//   - enum value with same numeric value but different member name (rename)
//
// Findings here are reported to stderr; with --strict the process exits 1
// when any mismatch is present.
// =========================================================================

interface FieldMismatch {
	struct: { canonical: string; linejs: string };
	apk: { fid: number; name: string; ttype: number };
	linejs: { fid: number; name: string; ttype: number };
	kind: "ttype-differs" | "name-differs-same-fid" | "fid-differs-same-name";
}

interface EnumMismatch {
	enum: { canonical: string; linejs: string };
	apk: { value: number; name: string };
	linejs: { value: number; name: string };
	kind: "name-differs-same-value";
}

/** Compute the wire-protocol ttype of a linejs field record.
 *
 *   In linejs's thrift.ts dict, a field that references an *enum* type is
 *   stored as `"struct": "<EnumName>"` (same shape as a struct ref), even
 *   though the Thrift wire format encodes enums as i32. Without this awareness
 *   the verifier sees APK ttype=8 (i32) vs linejs "struct" (resolved as 12)
 *   and reports a phantom mismatch on every enum-typed field — there are
 *   hundreds of these in LINE's schema.
 *
 *   We resolve the ref against the live linejs dict: if the target entry is
 *   recorded as an enum (object form `{ "0": "NAME" }`) we return I32,
 *   otherwise STRUCT.
 */
function fieldTtype(f: LineField, thrift: LineThrift): number {
	if (typeof f.type === "number") return f.type;
	if (typeof f.struct === "string") {
		const target = thrift[f.struct];
		if (target && !Array.isArray(target)) return TType.I32; // enum on the wire
		return TType.STRUCT;
	}
	if (f.list !== undefined) return TType.LIST;
	if (f.set !== undefined) return TType.SET;
	if (f.map !== undefined) return TType.MAP;
	return TType.STRING;
}

function fieldTypeExprTtype(t: TypeExpr): number {
	switch (t.kind) {
		case "primitive":
			return t.ttype;
		case "ref":
			return TType.STRUCT;
		case "list":
			return TType.LIST;
		case "set":
			return TType.SET;
		case "map":
			return TType.MAP;
	}
}

function verifyMatches(
	idl: IDL,
	thrift: LineThrift,
	matchThreshold: number,
	overrides: Record<string, string> = {},
): { fieldMismatches: FieldMismatch[]; enumMismatches: EnumMismatch[] } {
	const linejsEnums = new Map<string, LineEnum>();
	const linejsStructs = new Map<string, LineStruct>();
	for (const [name, v] of Object.entries(thrift)) {
		if (Array.isArray(v)) linejsStructs.set(name, v as LineStruct);
		else linejsEnums.set(name, v as LineEnum);
	}

	const jaccard = (a: Iterable<string>, b: Iterable<string>): number => {
		const A = new Set(a);
		const B = new Set(b);
		if (A.size === 0 && B.size === 0) return 1;
		let inter = 0;
		for (const x of A) if (B.has(x)) inter++;
		const union = A.size + B.size - inter;
		return union === 0 ? 1 : inter / union;
	};

	// ------------------------------------------------------------------
	// Stage 1: compute candidate matches APK→linejs with scores.
	// ------------------------------------------------------------------
	interface StructCand {
		apkName: string;
		apkStruct: StructDef;
		linejsName: string;
		score: number;
		fieldCount: number;
	}
	const structCands: StructCand[] = [];
	for (const canonical of idl.structs.values()) {
		// Honor explicit RPC-cross-reference overrides first — they're identity
		// bindings established by wire-protocol invariants and supersede Jaccard.
		const override = overrides[canonical.name];
		if (override && linejsStructs.has(override)) {
			structCands.push({
				apkName: canonical.name,
				apkStruct: canonical,
				linejsName: override,
				score: 1,
				fieldCount: canonical.fields.length,
			});
			continue;
		}
		const direct = linejsStructs.get(canonical.name);
		if (direct) {
			structCands.push({
				apkName: canonical.name,
				apkStruct: canonical,
				linejsName: canonical.name,
				score: 1,
				fieldCount: canonical.fields.length,
			});
			continue;
		}
		const myFields = canonical.fields.map((f) => f.name);
		let best: { name: string; score: number } | null = null;
		for (const [name, s] of linejsStructs) {
			const score = jaccard(myFields, s.map((f) => f.name));
			if (!best || score > best.score) best = { name, score };
		}
		if (best && best.score >= matchThreshold) {
			structCands.push({
				apkName: canonical.name,
				apkStruct: canonical,
				linejsName: best.name,
				score: best.score,
				fieldCount: canonical.fields.length,
			});
		}
	}

	// Stage 2: resolve 1:N collisions on the linejs side. A small struct
	// (≤ 3 fields) like `*_args = {request}` or `*_result = {success}` will
	// trivially match dozens of other small structs by Jaccard. Keeping all
	// of those mismatches reports the same linejs entry over and over with
	// contradictory APK content. Reduce each linejs target to its single
	// best APK candidate; demote the rest to "no-match" so they don't get
	// verified (their content is highly suspect anyway).
	const bestByLinejs = new Map<string, StructCand>();
	for (const c of structCands) {
		const cur = bestByLinejs.get(c.linejsName);
		if (!cur || c.score > cur.score) {
			bestByLinejs.set(c.linejsName, c);
		}
	}
	const acceptedStructCands = new Set<StructCand>();
	for (const c of bestByLinejs.values()) acceptedStructCands.add(c);

	const fieldMismatches: FieldMismatch[] = [];
	const enumMismatches: EnumMismatch[] = [];

	for (const cand of acceptedStructCands) {
		const canonical = cand.apkStruct;
		const matchStruct = linejsStructs.get(cand.linejsName)!;
		const match = { name: cand.linejsName, struct: matchStruct };

		// Tiny obfuscated structs are still high-noise even after collision
		// resolution: a 1-field linejs entry can match many distinct APK
		// classes with the same lone field name. If the *match score wasn't
		// 1.0* and either side has fewer than 3 fields, the pairing is
		// effectively a guess — don't surface mismatches against it.
		const linejsSize = matchStruct.length;
		if (cand.score < 1.0 && (cand.fieldCount < 3 || linejsSize < 3)) {
			continue;
		}

		// Cross-check fields. APK is the source of truth.
		const linejsByFid = new Map(match.struct.map((f) => [f.fid, f]));
		const linejsByName = new Map(match.struct.map((f) => [f.name, f]));
		for (const apkField of canonical.fields) {
			const linejsByFidHit = linejsByFid.get(apkField.fid);
			const linejsByNameHit = linejsByName.get(apkField.name);

			const apkT = fieldTypeExprTtype(apkField.typeExpr);

			if (
				linejsByFidHit && linejsByNameHit && linejsByFidHit === linejsByNameHit
			) {
				// Same fid+name; verify ttype agreement.
				const linejsT = fieldTtype(linejsByFidHit, thrift);
				if (linejsT !== apkT) {
					fieldMismatches.push({
						struct: { canonical: canonical.name, linejs: match.name },
						apk: { fid: apkField.fid, name: apkField.name, ttype: apkT },
						linejs: {
							fid: linejsByFidHit.fid,
							name: linejsByFidHit.name,
							ttype: linejsT,
						},
						kind: "ttype-differs",
					});
				}
				continue;
			}
			if (
				linejsByFidHit && linejsByFidHit.name !== apkField.name &&
				!linejsByNameHit
			) {
				fieldMismatches.push({
					struct: { canonical: canonical.name, linejs: match.name },
					apk: { fid: apkField.fid, name: apkField.name, ttype: apkT },
					linejs: {
						fid: linejsByFidHit.fid,
						name: linejsByFidHit.name,
						ttype: fieldTtype(linejsByFidHit, thrift),
					},
					kind: "name-differs-same-fid",
				});
				continue;
			}
			if (linejsByNameHit && linejsByNameHit.fid !== apkField.fid) {
				fieldMismatches.push({
					struct: { canonical: canonical.name, linejs: match.name },
					apk: { fid: apkField.fid, name: apkField.name, ttype: apkT },
					linejs: {
						fid: linejsByNameHit.fid,
						name: linejsByNameHit.name,
						ttype: fieldTtype(linejsByNameHit, thrift),
					},
					kind: "fid-differs-same-name",
				});
			}
		}
	}

	// Enums — same two-stage approach (candidates → resolve collisions →
	// drop tiny matches with score < 1.0).
	interface EnumCand {
		apkName: string;
		apkEnum: EnumDef;
		linejsName: string;
		score: number;
		memberCount: number;
	}
	const enumCands: EnumCand[] = [];
	for (const canonical of idl.enums.values()) {
		const direct = linejsEnums.get(canonical.name);
		if (direct) {
			enumCands.push({
				apkName: canonical.name,
				apkEnum: canonical,
				linejsName: canonical.name,
				score: 1,
				memberCount: canonical.members.length,
			});
			continue;
		}
		const myNames = canonical.members.map((m) => m.name);
		let best: { name: string; score: number } | null = null;
		for (const [name, e] of linejsEnums) {
			const score = jaccard(myNames, Object.values(e));
			if (!best || score > best.score) best = { name, score };
		}
		if (best && best.score >= matchThreshold) {
			enumCands.push({
				apkName: canonical.name,
				apkEnum: canonical,
				linejsName: best.name,
				score: best.score,
				memberCount: canonical.members.length,
			});
		}
	}
	const bestEnumByLinejs = new Map<string, EnumCand>();
	for (const c of enumCands) {
		const cur = bestEnumByLinejs.get(c.linejsName);
		if (!cur || c.score > cur.score) bestEnumByLinejs.set(c.linejsName, c);
	}
	for (const cand of bestEnumByLinejs.values()) {
		const matchEnum = linejsEnums.get(cand.linejsName)!;
		const linejsMemberCount = Object.keys(matchEnum).length;
		if (cand.score < 1.0 && (cand.memberCount < 4 || linejsMemberCount < 4)) {
			continue;
		}
		for (const apkMember of cand.apkEnum.members) {
			const linejsName = matchEnum[String(apkMember.value)];
			if (linejsName && linejsName !== apkMember.name) {
				enumMismatches.push({
					enum: { canonical: cand.apkName, linejs: cand.linejsName },
					apk: { value: apkMember.value, name: apkMember.name },
					linejs: { value: apkMember.value, name: linejsName },
					kind: "name-differs-same-value",
				});
			}
		}
	}

	return { fieldMismatches, enumMismatches };
}

// =========================================================================
// Rewrite mismatches in thrift.ts
//
// Mismatch resolution is in-place by design: we find the exact source-line
// span of the existing field/enum-value entry inside thrift.ts and splice
// in a replacement. We never delete a struct or enum entry wholesale —
// linejs may have entries that this APK build doesn't surface (other
// bundles, removed-but-still-referenced types) and silently dropping those
// would break linejs callers.
//
// Field-rewrite locates by struct + fid (not name): when the mismatch is
// "name changed at same fid", fid is the stable key. Enum-rewrite locates
// by value.
// =========================================================================

function emitTypeRefRaw(t: TypeExpr): {
	type?: number;
	struct?: string;
	list?: number | string;
	set?: number | string;
	map?: number | string;
	key?: number | string;
} {
	switch (t.kind) {
		case "primitive":
			return { type: t.ttype };
		case "ref":
			return { struct: t.name };
		case "list": {
			const inner = emitTypeRefRaw(t.elem);
			return { list: inner.type ?? inner.struct ?? TType.STRING };
		}
		case "set": {
			const inner = emitTypeRefRaw(t.elem);
			return { set: inner.type ?? inner.struct ?? TType.STRING };
		}
		case "map": {
			const valInner = emitTypeRefRaw(t.value);
			const keyInner = emitTypeRefRaw(t.key);
			return {
				map: valInner.type ?? valInner.struct ?? TType.STRING,
				key: keyInner.type ?? keyInner.struct ?? TType.STRING,
			};
		}
	}
}

function emitFieldObject(f: FieldDef, indent = "\t\t"): string {
	const ref = emitTypeRefRaw(f.typeExpr);
	const inner = `${indent}\t`;
	const lines: string[] = [
		`${inner}"fid": ${f.fid},`,
		`${inner}"name": "${f.name}",`,
	];
	if (ref.type !== undefined) lines.push(`${inner}"type": ${ref.type},`);
	if (ref.struct !== undefined) {
		lines.push(`${inner}"struct": "${ref.struct}",`);
	}
	if (ref.list !== undefined) {
		lines.push(
			`${inner}"list": ${
				typeof ref.list === "number" ? ref.list : `"${ref.list}"`
			},`,
		);
	}
	if (ref.set !== undefined) {
		lines.push(
			`${inner}"set": ${
				typeof ref.set === "number" ? ref.set : `"${ref.set}"`
			},`,
		);
	}
	if (ref.map !== undefined) {
		lines.push(
			`${inner}"map": ${
				typeof ref.map === "number" ? ref.map : `"${ref.map}"`
			},`,
		);
		if (ref.key !== undefined) {
			lines.push(
				`${inner}"key": ${
					typeof ref.key === "number" ? ref.key : `"${ref.key}"`
				},`,
			);
		}
	}
	return `${indent}{\n${lines.join("\n")}\n${indent}},`;
}

/** Find the source range of a field object inside a struct's block. The
 *  struct block is `"<name>": [ … ]`. Each field entry begins with `\t\t{`
 *  and ends with `\t\t},`. We walk entries linearly and return the one
 *  whose `"fid": <fid>,` line is inside. */
function findFieldEntry(
	src: string,
	structName: string,
	fid: number,
): { start: number; end: number } | null {
	const marker = `\t"${structName}": [`;
	const startIdx = src.indexOf(marker);
	if (startIdx < 0) return null;
	let i = startIdx + marker.length;
	let depth = 1;
	let inStr: false | '"' | "'" = false;
	let entryStart = -1;
	const fidLine = `\t\t\t"fid": ${fid},`;
	while (i < src.length && depth > 0) {
		const c = src[i];
		if (inStr) {
			if (c === "\\") {
				i += 2;
				continue;
			}
			if (c === inStr) inStr = false;
			i++;
			continue;
		}
		if (c === '"' || c === "'") {
			inStr = c;
			i++;
			continue;
		}
		if (c === "[") depth++;
		else if (c === "]") {
			depth--;
			if (depth === 0) break;
		} else if (c === "{" && depth === 1) {
			entryStart = src.lastIndexOf("\n", i) + 1;
		} else if (c === "}" && entryStart >= 0) {
			// inclusive of trailing comma + newline
			let end = i + 1;
			if (src[end] === ",") end++;
			if (src[end] === "\n") end++;
			const entry = src.slice(entryStart, end);
			if (entry.includes(fidLine)) {
				return { start: entryStart, end };
			}
			entryStart = -1;
		}
		i++;
	}
	return null;
}

/** Same idea, but for the value→name line inside an enum block. */
function findEnumValueLine(
	src: string,
	enumName: string,
	value: number,
): { start: number; end: number; line: string } | null {
	const marker = `\t"${enumName}": {`;
	const startIdx = src.indexOf(marker);
	if (startIdx < 0) return null;
	// Search forward for the line `\t\t"<value>": "..."` up to the closing `\t}`.
	const valueLineRe = new RegExp(
		`\\t\\t"${value}":\\s*"([^"]*)",`,
		"g",
	);
	valueLineRe.lastIndex = startIdx;
	const m = valueLineRe.exec(src);
	if (!m) return null;
	const lineStart = src.lastIndexOf("\n", m.index) + 1;
	const lineEnd = src.indexOf("\n", m.index) + 1;
	return { start: lineStart, end: lineEnd, line: m[0] };
}

function applyRewrites(
	src: string,
	fieldMismatches: FieldMismatch[],
	enumMismatches: EnumMismatch[],
	apkIdl: IDL,
): {
	src: string;
	appliedField: number;
	appliedEnum: number;
	missed: string[];
} {
	let cur = src;
	let appliedField = 0;
	let appliedEnum = 0;
	const missed: string[] = [];

	// Group field rewrites by linejs struct name; within each, sort by
	// descending source position to splice without invalidating later offsets.
	type Rewrite = {
		linejsStruct: string;
		fidInLinejs: number;
		apkField: FieldDef;
	};
	const rewrites: Rewrite[] = [];
	for (const m of fieldMismatches) {
		// Find the APK FieldDef object (by canonical struct + fid).
		const apkStruct = apkIdl.structs.get(m.struct.canonical);
		if (!apkStruct) {
			missed.push(`apk struct missing: ${m.struct.canonical}`);
			continue;
		}
		const apkField = apkStruct.fields.find((f) => f.fid === m.apk.fid);
		if (!apkField) {
			missed.push(`apk field missing: ${m.struct.canonical} fid=${m.apk.fid}`);
			continue;
		}
		// The fid we locate in linejs is the *linejs* fid (where the existing
		// entry currently sits). For `ttype-differs` and `name-differs-same-fid`
		// the fid is unchanged; for `fid-differs-same-name` the linejs fid is
		// what we delete, then we insert the APK entry (which carries the new
		// fid).
		rewrites.push({
			linejsStruct: m.struct.linejs,
			fidInLinejs: m.linejs.fid,
			apkField,
		});
	}

	// Sort by descending source position to splice safely.
	type Located = { range: { start: number; end: number }; rewrite: Rewrite };
	const located: Located[] = [];
	for (const rw of rewrites) {
		const range = findFieldEntry(cur, rw.linejsStruct, rw.fidInLinejs);
		if (!range) {
			missed.push(
				`field not located: ${rw.linejsStruct} fid=${rw.fidInLinejs}`,
			);
			continue;
		}
		located.push({ range, rewrite: rw });
	}
	located.sort((a, b) => b.range.start - a.range.start);
	for (const loc of located) {
		const replacement = emitFieldObject(loc.rewrite.apkField) + "\n";
		cur = cur.slice(0, loc.range.start) + replacement +
			cur.slice(loc.range.end);
		appliedField++;
	}

	// Enum value rewrites
	type EnumLoc = { range: { start: number; end: number }; replacement: string };
	const enumLocs: EnumLoc[] = [];
	for (const m of enumMismatches) {
		const hit = findEnumValueLine(cur, m.enum.linejs, m.apk.value);
		if (!hit) {
			missed.push(
				`enum value not located: ${m.enum.linejs} value=${m.apk.value}`,
			);
			continue;
		}
		const replacement = `\t\t"${m.apk.value}": "${m.apk.name}",\n`;
		enumLocs.push({ range: { start: hit.start, end: hit.end }, replacement });
	}
	enumLocs.sort((a, b) => b.range.start - a.range.start);
	for (const loc of enumLocs) {
		cur = cur.slice(0, loc.range.start) + loc.replacement +
			cur.slice(loc.range.end);
		appliedEnum++;
	}

	return { src: cur, appliedField, appliedEnum, missed };
}

// =========================================================================
// Main
// =========================================================================

/** RPC-name cross-reference: build an APK→linejs name override map by linking
 *  each service method's argsClass / resultClass (extracted by
 *  extract_services.ts) to the canonical linejs entry named after the wire
 *  RPC. The RPC string is a Thrift wire-format invariant — it travels in
 *  every send call — so this provides a stable identity that survives any
 *  amount of R8 shading.
 *
 *  Looks for linejs entries named (in priority order):
 *    1) `<rpcName>_args` / `<rpcName>_result` (Talk-style: unqualified)
 *    2) `<serviceName>_<rpcName>_args` / ..._result (Square-style: qualified)
 *
 *  If neither matches we leave the obfuscated APK class to the regular
 *  Jaccard matcher; this is purely additive disambiguation. */
function buildRpcCrossRefOverrides(
	servicesJson: Array<{
		name: string;
		clientClass: string;
		methods: Array<{
			rpcName: string;
			argsClass: string;
			resultClass: string;
		}>;
	}>,
	thrift: LineThrift,
): Record<string, string> {
	const overrides: Record<string, string> = {};
	for (const svc of servicesJson) {
		for (const m of svc.methods) {
			const tryNames = (suffix: "args" | "result"): string[] => {
				const names: string[] = [];
				names.push(`${m.rpcName}_${suffix}`);
				names.push(`${svc.name}_${m.rpcName}_${suffix}`);
				return names;
			};
			const argsClassShort = m.argsClass
				? m.argsClass.replace(/^L|;$/g, "").split("/").pop()!.replaceAll("$", "_")
				: "";
			const resultClassShort = m.resultClass
				? m.resultClass.replace(/^L|;$/g, "").split("/").pop()!.replaceAll("$", "_")
				: "";
			if (argsClassShort && !overrides[argsClassShort]) {
				for (const candidate of tryNames("args")) {
					if (thrift[candidate] && Array.isArray(thrift[candidate])) {
						overrides[argsClassShort] = candidate;
						break;
					}
				}
			}
			if (resultClassShort && !overrides[resultClassShort]) {
				for (const candidate of tryNames("result")) {
					if (thrift[candidate] && Array.isArray(thrift[candidate])) {
						overrides[resultClassShort] = candidate;
						break;
					}
				}
			}
		}
	}
	return overrides;
}

async function main() {
	const args = parseArgs(Deno.args);
	console.log(`smali root: ${args.smaliDir}`);
	console.log(`match threshold: ${args.matchThreshold}`);

	const classes = await loadAllClasses(args.smaliDir, args);
	reportShadedInterfaces(classes);

	// Build a map from struct short-name → source .smali path, used by the
	// container element-type inference pass to locate each struct's sibling
	// $StandardScheme.smali.
	const pathByStruct = new Map<string, string>();
	for (const c of classes) {
		const short = c.name.split("/").pop()!.replaceAll("$", "_");
		// Only register classes that look like Thrift structs (have TField
		// calls) — buildIDL applies further filters but this is enough to
		// avoid clobbering with unrelated classes.
		if (c.enclosingClinit.tfieldCalls.length > 0 && !c.modifiers.has("enum")) {
			if (!pathByStruct.has(short)) pathByStruct.set(short, c.filePath);
		}
	}

	// Slice into (structs/enums) and report what we found before matching.
	const idl = buildIDL(classes);
	console.log();
	console.log(`extracted IDL:`);
	console.log(`  enums:   ${idl.enums.size}`);
	console.log(`  structs: ${idl.structs.size}`);

	// Refine container element types by parsing each struct's
	// $StandardScheme.read() method. Without this pass list/set/map fields
	// default to <string>; the read() body tells us the actual element type.
	const refineResult = await refineContainerElements(idl, pathByStruct);
	console.log(
		`container element inference: refined ${refineResult.updated} field(s) across ${refineResult.structsTouched} struct(s)`,
	);

	// Load linejs Thrift dict via dynamic import.
	const thriftPath = fromFileUrl(
		import.meta.resolve("../../packages/types/thrift.ts"),
	);
	const mod = await import(`file://${thriftPath.replaceAll("\\", "/")}`);
	const thrift = mod.Thrift as LineThrift;
	console.log(`linejs Thrift entries: ${Object.keys(thrift).length}`);

	const idx = indexLineThrift(thrift);

	// RPC-name cross-reference: if the operator supplied a services report
	// (from extract_services.ts), use the wire RPC strings to disambiguate
	// obfuscated `*_args` / `*_result` classes — the matcher would otherwise
	// have to guess from {request}-shaped Jaccard collisions. This is a
	// sustainable disambiguation: the RPC strings are wire-format invariants
	// that survive any R8 shading, so the mapping recomputes correctly on a
	// future build without human intervention.
	let overrides: Record<string, string> = {};
	if (args.servicesReport) {
		try {
			const svcJson = JSON.parse(await Deno.readTextFile(args.servicesReport));
			overrides = buildRpcCrossRefOverrides(svcJson, thrift);
			console.log(
				`RPC cross-reference: ${Object.keys(overrides).length} obfuscated class(es) bound to linejs names via wire RPC`,
			);
		} catch (e) {
			console.warn(`could not read services report: ${(e as Error).message}`);
		}
	}

	// Pre-flight verification: catch type mismatches in already-mapped fields.
	// These never surface in computeDiff (which is additive only) but are the
	// highest-risk silent-staleness bugs.
	const mismatches = verifyMatches(idl, thrift, args.matchThreshold, overrides);
	const totalMismatch = mismatches.fieldMismatches.length +
		mismatches.enumMismatches.length;
	if (totalMismatch) {
		console.error(`\n=== mismatches (APK ≠ linejs) ===`);
		for (const m of mismatches.fieldMismatches) {
			console.error(
				`  ${m.kind}: ${m.struct.canonical} (linejs=${m.struct.linejs})`,
			);
			console.error(
				`    apk    fid=${m.apk.fid} name=${m.apk.name} ttype=${m.apk.ttype}`,
			);
			console.error(
				`    linejs fid=${m.linejs.fid} name=${m.linejs.name} ttype=${m.linejs.ttype}`,
			);
		}
		for (const m of mismatches.enumMismatches) {
			console.error(
				`  ${m.kind}: ${m.enum.canonical} (linejs=${m.enum.linejs})`,
			);
			console.error(`    apk    value=${m.apk.value} name=${m.apk.name}`);
			console.error(`    linejs value=${m.linejs.value} name=${m.linejs.name}`);
		}
		console.error(
			`(${totalMismatch} mismatch(es) — these will NOT be auto-fixed by --apply)`,
		);
	} else {
		console.log(`\nno type/name/fid mismatches between APK and linejs`);
	}

	const rawDiff = computeDiff(idl, thrift, idx, overrides, args.matchThreshold);

	// Drop new-type entries with obfuscated synthetic names: they'd land in
	// thrift.ts as anonymous noise. Existing-entry adds (struct field adds,
	// enum value adds) are kept regardless of the source class's name.
	const droppedNewTypes = rawDiff.newTypes.filter((nt) =>
		isR8SyntheticName(nt.canonicalName)
	);
	const diff = {
		...rawDiff,
		newTypes: rawDiff.newTypes.filter((nt) =>
			!isR8SyntheticName(nt.canonicalName)
		),
	};
	if (droppedNewTypes.length) {
		console.log(
			`(dropped ${droppedNewTypes.length} obfuscated new types: ${
				droppedNewTypes.slice(0, 8).map((t) => t.canonicalName).join(", ")
			}${droppedNewTypes.length > 8 ? ", ..." : ""})`,
		);
	}

	console.log();
	console.log(`=== diff summary ===`);
	console.log(`enum value adds:   ${diff.enumValueAdds.length}`);
	console.log(`struct field adds: ${diff.structFieldAdds.length}`);
	console.log(`new types:         ${diff.newTypes.length}`);

	const head = <T>(arr: T[], n: number): string =>
		arr.slice(0, n).map((x) => String(x)).join(", ") +
		(arr.length > n ? `, ... (+${arr.length - n})` : "");

	if (diff.enumValueAdds.length) {
		const byEnum = new Map<string, string[]>();
		for (const a of diff.enumValueAdds) {
			if (!byEnum.has(a.enumName)) byEnum.set(a.enumName, []);
			byEnum.get(a.enumName)!.push(`${a.value}=${a.memberName}`);
		}
		console.log(`\nenum adds:`);
		let i = 0;
		for (const [k, vs] of byEnum) {
			if (i++ >= 20) {
				console.log(`  ... (+${byEnum.size - 20} more)`);
				break;
			}
			console.log(`  ${k}: ${head(vs, 8)}`);
		}
	}
	if (diff.structFieldAdds.length) {
		const byStruct = new Map<string, string[]>();
		for (const a of diff.structFieldAdds) {
			if (!byStruct.has(a.structName)) byStruct.set(a.structName, []);
			byStruct.get(a.structName)!.push(`fid${a.field.fid}=${a.field.name}`);
		}
		console.log(`\nstruct adds:`);
		let i = 0;
		for (const [k, vs] of byStruct) {
			if (i++ >= 20) {
				console.log(`  ... (+${byStruct.size - 20} more)`);
				break;
			}
			console.log(`  ${k}: ${head(vs, 8)}`);
		}
	}
	if (diff.newTypes.length) {
		console.log(
			`\nnew types: ${
				head(diff.newTypes.map((t) => `${t.kind}:${t.canonicalName}`), 25)
			}`,
		);
	}

	if (args.report) {
		await Deno.writeTextFile(
			args.report,
			JSON.stringify({ diff, mismatches }, null, 2),
		);
		console.log(`\nReport written: ${args.report}`);
	}

	const wantWrite = args.apply || args.rewriteMismatches;
	if (wantWrite) {
		const orig = await Deno.readTextFile(thriftPath);
		let patched = orig;
		if (args.apply) {
			patched = applyDiff(patched, diff);
			console.log(`\nApplied additive diff to ${thriftPath}`);
		}
		if (args.rewriteMismatches && totalMismatch > 0) {
			// Two-tier safety filter for field rewrites:
			//   tier A (always safe): direct-name match — APK canonical name
			//                         equals linejs entry name
			//   tier B (also safe):   Jaccard-only match BUT the matched
			//                         linejs entry's field-name set is unique
			//                         across the whole linejs Thrift dict.
			//                         Uniqueness means there's no other
			//                         linejs struct with the same shape, so
			//                         the obfuscated APK class can only be
			//                         this entry — a 100%-Jaccard match
			//                         cannot be aliasing some sibling that
			//                         happens to share fields.
			// Anything still ambiguous after both gates is skipped.
			//
			// Enum value-name rewrites stay behind --rewrite-enums because
			// even unique-shape enums turn out to be unsafe (e.g. CarrierCode
			// renumberings vs unrelated enums with one shared member name).
			const fieldNameSetKey = (fields: LineField[]): string =>
				fields.map((f) => f.name).slice().sort().join("|");
			const linejsShapeCount = new Map<string, number>();
			for (const v of Object.values(thrift)) {
				if (!Array.isArray(v)) continue;
				const key = fieldNameSetKey(v as LineField[]);
				linejsShapeCount.set(key, (linejsShapeCount.get(key) ?? 0) + 1);
			}
			const isUniqueShape = (linejsName: string): boolean => {
				const entry = thrift[linejsName];
				if (!Array.isArray(entry)) return false;
				const key = fieldNameSetKey(entry as LineField[]);
				return (linejsShapeCount.get(key) ?? 0) === 1;
			};

			const safeFieldMismatches = mismatches.fieldMismatches.filter((m) =>
				m.struct.canonical === m.struct.linejs ||
				isUniqueShape(m.struct.linejs) ||
				overrides[m.struct.canonical] === m.struct.linejs
			);
			const safeEnumMismatches = args.rewriteEnums
				? mismatches.enumMismatches.filter((m) =>
					m.enum.canonical === m.enum.linejs
				)
				: [];
			const skippedField = mismatches.fieldMismatches.length -
				safeFieldMismatches.length;
			if (skippedField > 0) {
				console.log(
					`  (${skippedField} field mismatch(es) skipped — Jaccard-only match on a non-unique linejs shape)`,
				);
			}
			const result = applyRewrites(
				patched,
				safeFieldMismatches,
				safeEnumMismatches,
				idl,
			);
			patched = result.src;
			console.log(
				`Rewrote ${result.appliedField} field + ${result.appliedEnum} enum mismatches`,
			);
			if (result.missed.length) {
				console.error(
					`  ${result.missed.length} rewrite(s) could not be located:`,
				);
				for (const m of result.missed.slice(0, 10)) {
					console.error(`    ${m}`);
				}
			}
		}
		await Deno.writeTextFile(thriftPath, patched);
	} else {
		console.log(
			`\n(dry-run; pass --apply and/or --rewrite-mismatches to write)`,
		);
	}

	if (args.strict && totalMismatch > 0 && !args.rewriteMismatches) {
		console.error(`\n--strict: failing due to ${totalMismatch} mismatch(es)`);
		Deno.exit(1);
	}
}

if (import.meta.main) {
	await main();
}
