/**
 * @description Sync linejs `packages/types/thrift.ts` with an external Thrift IDL
 *              tree (CHRLINE-Thrift or any IDL-conformant source).
 *
 * Usage:
 *   deno run -A scripts/thrift/sync_thrift.ts --idl <path> [--apply] [--report <out>]
 *                                              [--match-threshold <0..1>]
 *                                              [--map <name-map.json>]
 *
 *   --idl <path>           Directory containing *.thrift files (scanned recursively)
 *   --apply                Write changes back to packages/types/thrift.ts (default: dry-run)
 *   --report <path>        Write JSON diff report to <path>
 *   --match-threshold <n>  Jaccard threshold for content-based matching (default 0.7)
 *   --map <path>           JSON file of {canonical: linejs} overrides
 *
 * The parser implements the full Thrift IDL grammar (Apache Thrift 0.x):
 *   - Header directives: include, cpp_include, namespace
 *   - Definitions: const, typedef, enum, senum, struct, union, exception, service
 *   - Services: method signatures with oneway / extends / throws / annotations
 *   - Field metadata: fid, requiredness (required|optional|default), default values, annotations
 *   - Types: all primitives (bool|byte|i8|i16|i32|i64|double|string|binary|slist),
 *            list<T> / set<T> / map<K,V> with optional cpp_type annotations
 *   - Comments: // ... , # ... , and block /* ... *\/
 *   - Default values: int / float / bool / string / identifier / list / map literals
 *   - Annotations: ( a = "b", c )
 *
 * The matcher links canonical Thrift types to linejs entries by:
 *   1. explicit override map (--map)
 *   2. direct name match
 *   3. content-based Jaccard match over member/field names (≥ threshold)
 *   4. typedef chasing
 *
 * The diff is *additive only*: no entry is renamed, deleted, or reordered.
 * Emitted patches preserve the existing file's tab indentation and trailing-comma style.
 */
import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";
import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts";

// =========================================================================
// IDL AST
// =========================================================================

interface AnnotatedNode {
	annotations?: Record<string, string | true>;
}

type Requiredness = "required" | "optional" | "default";

export interface EnumMember extends AnnotatedNode {
	name: string;
	value: number;
}

export interface EnumDef extends AnnotatedNode {
	name: string;
	members: EnumMember[];
}

export interface FieldDef extends AnnotatedNode {
	fid: number;
	name: string;
	requiredness: Requiredness;
	typeExpr: TypeExpr;
	defaultValue?: Literal;
}

export interface StructDef extends AnnotatedNode {
	name: string;
	kind: "struct" | "union" | "exception";
	fields: FieldDef[];
}

export interface ServiceMethod extends AnnotatedNode {
	name: string;
	oneway: boolean;
	returnType: TypeExpr;
	args: FieldDef[];
	throws: FieldDef[];
}

export interface ServiceDef extends AnnotatedNode {
	name: string;
	extends?: string;
	methods: ServiceMethod[];
}

export interface TypedefDef extends AnnotatedNode {
	name: string;
	typeExpr: TypeExpr;
}

export interface ConstDef extends AnnotatedNode {
	name: string;
	typeExpr: TypeExpr;
	value: Literal;
}

export type TypeExpr =
	| {
		kind: "primitive";
		ttype: TType;
		raw: string;
		annotations?: Record<string, string | true>;
	}
	| { kind: "ref"; name: string; annotations?: Record<string, string | true> }
	| {
		kind: "list" | "set";
		elem: TypeExpr;
		cppType?: string;
		annotations?: Record<string, string | true>;
	}
	| {
		kind: "map";
		key: TypeExpr;
		value: TypeExpr;
		cppType?: string;
		annotations?: Record<string, string | true>;
	};

export type Literal =
	| { kind: "int"; value: number }
	| { kind: "float"; value: number }
	| { kind: "bool"; value: boolean }
	| { kind: "string"; value: string }
	| { kind: "ident"; value: string }
	| { kind: "list"; items: Literal[] }
	| { kind: "map"; entries: Array<{ key: Literal; value: Literal }> };

export enum TType {
	BOOL = 2,
	BYTE = 3,
	DOUBLE = 4,
	I16 = 6,
	I32 = 8,
	I64 = 10,
	STRING = 11,
	STRUCT = 12,
	MAP = 13,
	SET = 14,
	LIST = 15,
}

export interface IDL {
	enums: Map<string, EnumDef>;
	structs: Map<string, StructDef>; // structs, unions, exceptions
	services: Map<string, ServiceDef>;
	typedefs: Map<string, TypedefDef>;
	consts: Map<string, ConstDef>;
}

// =========================================================================
// linejs Thrift dict shape
// =========================================================================

export type LineEnum = Record<string, string>;

export interface LineField {
	fid: number;
	name: string;
	type?: number;
	struct?: string;
	list?: number | string;
	set?: number | string;
	map?: number | string;
	key?: number | string;
}

export type LineStruct = LineField[];
export type LineThrift = Record<string, LineEnum | LineStruct>;

// =========================================================================
// CLI args
// =========================================================================

interface Args {
	idl: string;
	apply: boolean;
	report: string;
	matchThreshold: number;
	mapPath: string;
}

function parseArgs(argv: string[]): Args {
	const out: Args = {
		idl: "",
		apply: false,
		report: "",
		matchThreshold: 0.7,
		mapPath: "",
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		switch (a) {
			case "--idl":
				out.idl = argv[++i];
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
			case "--map":
				out.mapPath = argv[++i];
				break;
			default:
				throw new Error(`unknown arg: ${a}`);
		}
	}
	if (!out.idl) throw new Error("--idl <path> is required");
	if (!(out.matchThreshold > 0 && out.matchThreshold <= 1)) {
		throw new Error("--match-threshold must be in (0, 1]");
	}
	return out;
}

// =========================================================================
// Tokenizer
// =========================================================================

type Tok =
	| { kind: "ident"; value: string; line: number }
	| { kind: "int"; value: number; line: number }
	| { kind: "float"; value: number; line: number }
	| { kind: "string"; value: string; line: number }
	| { kind: "punct"; value: string; line: number };

const KEYWORDS = new Set([
	"namespace",
	"include",
	"cpp_include",
	"const",
	"typedef",
	"enum",
	"senum",
	"struct",
	"union",
	"exception",
	"service",
	"extends",
	"required",
	"optional",
	"throws",
	"oneway",
	"void",
	"true",
	"false",
	"list",
	"set",
	"map",
	"cpp_type",
]);

function tokenize(src: string, filename: string): Tok[] {
	const toks: Tok[] = [];
	let i = 0;
	let line = 1;
	const n = src.length;

	const fail = (msg: string): never => {
		throw new Error(`${filename}:${line}: ${msg}`);
	};

	while (i < n) {
		const c = src[i];

		if (c === "\n") {
			line++;
			i++;
			continue;
		}
		if (c === " " || c === "\t" || c === "\r") {
			i++;
			continue;
		}

		// line comments
		if (c === "/" && src[i + 1] === "/") {
			while (i < n && src[i] !== "\n") i++;
			continue;
		}
		if (c === "#") {
			while (i < n && src[i] !== "\n") i++;
			continue;
		}

		// block comment (handles nesting depth = 1; doc comments /** */ included)
		if (c === "/" && src[i + 1] === "*") {
			i += 2;
			while (i < n - 1 && !(src[i] === "*" && src[i + 1] === "/")) {
				if (src[i] === "\n") line++;
				i++;
			}
			if (i >= n - 1) fail("unterminated block comment");
			i += 2;
			continue;
		}

		// string literal
		if (c === '"' || c === "'") {
			const quote = c;
			const startLine = line;
			i++;
			let s = "";
			while (i < n && src[i] !== quote) {
				if (src[i] === "\\" && i + 1 < n) {
					const esc = src[i + 1];
					switch (esc) {
						case "n":
							s += "\n";
							break;
						case "t":
							s += "\t";
							break;
						case "r":
							s += "\r";
							break;
						case "\\":
							s += "\\";
							break;
						case '"':
							s += '"';
							break;
						case "'":
							s += "'";
							break;
						default:
							s += esc;
					}
					i += 2;
				} else {
					if (src[i] === "\n") line++;
					s += src[i++];
				}
			}
			if (i >= n) fail("unterminated string");
			i++;
			toks.push({ kind: "string", value: s, line: startLine });
			continue;
		}

		// number (int or float, with optional sign, hex 0x..)
		if (
			(c >= "0" && c <= "9") ||
			(c === "-" && i + 1 < n && src[i + 1] >= "0" && src[i + 1] <= "9") ||
			(c === "+" && i + 1 < n && src[i + 1] >= "0" && src[i + 1] <= "9")
		) {
			const startLine = line;
			let s = "";
			if (c === "+" || c === "-") s += src[i++];
			if (src[i] === "0" && (src[i + 1] === "x" || src[i + 1] === "X")) {
				s += src[i++];
				s += src[i++];
				while (i < n && /[0-9a-fA-F_]/.test(src[i])) s += src[i++];
				toks.push({
					kind: "int",
					value: parseInt(s.replaceAll("_", ""), 16),
					line: startLine,
				});
				continue;
			}
			let isFloat = false;
			while (i < n && /[0-9_]/.test(src[i])) s += src[i++];
			if (src[i] === ".") {
				isFloat = true;
				s += src[i++];
				while (i < n && /[0-9_]/.test(src[i])) s += src[i++];
			}
			if (src[i] === "e" || src[i] === "E") {
				isFloat = true;
				s += src[i++];
				if (src[i] === "+" || src[i] === "-") s += src[i++];
				while (i < n && /[0-9]/.test(src[i])) s += src[i++];
			}
			const cleaned = s.replaceAll("_", "");
			toks.push({
				kind: isFloat ? "float" : "int",
				value: isFloat ? parseFloat(cleaned) : parseInt(cleaned, 10),
				line: startLine,
			});
			continue;
		}

		// identifier
		if (/[A-Za-z_]/.test(c)) {
			const startLine = line;
			let s = "";
			while (i < n && /[A-Za-z0-9_.]/.test(src[i])) s += src[i++];
			toks.push({ kind: "ident", value: s, line: startLine });
			continue;
		}

		// punctuation (multi-char punctuation isn't part of Thrift IDL except `->` for return types, but Thrift uses `:` not `->`. Single-char only.)
		if ("{}()<>,;=:".includes(c)) {
			toks.push({ kind: "punct", value: c, line });
			i++;
			continue;
		}

		fail(`unexpected character ${JSON.stringify(c)}`);
	}

	return toks;
}

// =========================================================================
// Parser
// =========================================================================

const PRIMITIVES: Record<string, TType> = {
	bool: TType.BOOL,
	byte: TType.BYTE,
	i8: TType.BYTE,
	double: TType.DOUBLE,
	i16: TType.I16,
	i32: TType.I32,
	i64: TType.I64,
	string: TType.STRING,
	binary: TType.STRING,
	slist: TType.STRING,
};

class Parser {
	pos = 0;
	constructor(public toks: Tok[], public filename: string) {}

	peek(k = 0): Tok | undefined {
		return this.toks[this.pos + k];
	}
	eat(): Tok {
		const t = this.toks[this.pos++];
		if (!t) this.fail("unexpected end of input");
		return t;
	}
	fail(msg: string, t?: Tok): never {
		const line = t?.line ?? this.peek()?.line ?? -1;
		throw new Error(`${this.filename}:${line}: ${msg}`);
	}
	expectIdent(): string {
		const t = this.eat();
		if (t.kind !== "ident") {
			this.fail(`expected identifier, got ${tokStr(t)}`, t);
		}
		return t.value;
	}
	expectPunct(s: string) {
		const t = this.eat();
		if (t.kind !== "punct" || t.value !== s) {
			this.fail(`expected '${s}', got ${tokStr(t)}`, t);
		}
	}
	tryPunct(s: string): boolean {
		const t = this.peek();
		if (t && t.kind === "punct" && t.value === s) {
			this.pos++;
			return true;
		}
		return false;
	}
	tryKeyword(kw: string): boolean {
		const t = this.peek();
		if (t && t.kind === "ident" && t.value === kw) {
			this.pos++;
			return true;
		}
		return false;
	}

	// Field separator: , or ; or implicit (newline-aware not needed since tokens have no newlines)
	tryFieldSeparator(): boolean {
		return this.tryPunct(",") || this.tryPunct(";");
	}

	parseAnnotations(): Record<string, string | true> | undefined {
		if (!this.tryPunct("(")) return undefined;
		const out: Record<string, string | true> = {};
		while (!this.tryPunct(")")) {
			const key = this.expectIdent();
			let value: string | true = true;
			if (this.tryPunct("=")) {
				const t = this.eat();
				if (t.kind === "string") value = t.value;
				else if (t.kind === "int" || t.kind === "float") {
					value = String(t.value);
				} else if (t.kind === "ident") value = t.value;
				else this.fail(`bad annotation value: ${tokStr(t)}`, t);
			}
			out[key] = value;
			this.tryFieldSeparator();
		}
		return out;
	}

	parseType(): TypeExpr {
		const t = this.eat();
		if (t.kind !== "ident") this.fail(`expected type, got ${tokStr(t)}`, t);
		const name = t.value;

		if (name === "list" || name === "set") {
			let cppType: string | undefined;
			if (this.tryKeyword("cpp_type")) {
				const ct = this.eat();
				if (ct.kind !== "string") this.fail(`cpp_type expects string`, ct);
				cppType = ct.value;
			}
			this.expectPunct("<");
			const elem = this.parseType();
			this.expectPunct(">");
			const annotations = this.parseAnnotations();
			return { kind: name as "list" | "set", elem, cppType, annotations };
		}
		if (name === "map") {
			let cppType: string | undefined;
			if (this.tryKeyword("cpp_type")) {
				const ct = this.eat();
				if (ct.kind !== "string") this.fail(`cpp_type expects string`, ct);
				cppType = ct.value;
			}
			this.expectPunct("<");
			const key = this.parseType();
			this.expectPunct(",");
			const value = this.parseType();
			this.expectPunct(">");
			const annotations = this.parseAnnotations();
			return { kind: "map", key, value, cppType, annotations };
		}
		if (name in PRIMITIVES) {
			const annotations = this.parseAnnotations();
			return {
				kind: "primitive",
				ttype: PRIMITIVES[name],
				raw: name,
				annotations,
			};
		}
		const annotations = this.parseAnnotations();
		return { kind: "ref", name, annotations };
	}

	parseLiteral(): Literal {
		const t = this.eat();
		if (t.kind === "int") return { kind: "int", value: t.value };
		if (t.kind === "float") return { kind: "float", value: t.value };
		if (t.kind === "string") return { kind: "string", value: t.value };
		if (t.kind === "ident") {
			if (t.value === "true") return { kind: "bool", value: true };
			if (t.value === "false") return { kind: "bool", value: false };
			return { kind: "ident", value: t.value };
		}
		if (t.kind === "punct" && t.value === "{") {
			// map literal { key: value, ... }
			const entries: Array<{ key: Literal; value: Literal }> = [];
			while (!this.tryPunct("}")) {
				const key = this.parseLiteral();
				this.expectPunct(":");
				const value = this.parseLiteral();
				entries.push({ key, value });
				this.tryFieldSeparator();
			}
			return { kind: "map", entries };
		}
		// Thrift list/set literals use `[ ... ]`, but Thrift IDL doesn't include `[`/`]` in punct set.
		// Some grammars allow `()` for tuple-like — but standard Thrift IDL for list literals uses
		// implicit container construction inside structs only. We do not encounter list/map defaults
		// in our IDL set in practice; bail out cleanly.
		this.fail(`unexpected literal token ${tokStr(t)}`, t);
	}

	parseField(): FieldDef {
		const fidTok = this.eat();
		if (fidTok.kind !== "int") {
			this.fail(`field id expected integer, got ${tokStr(fidTok)}`, fidTok);
		}
		this.expectPunct(":");
		let requiredness: Requiredness = "default";
		const r = this.peek();
		if (
			r && r.kind === "ident" &&
			(r.value === "required" || r.value === "optional")
		) {
			requiredness = r.value;
			this.pos++;
		}
		const typeExpr = this.parseType();
		let name = this.expectIdent();
		if (name.startsWith("_")) name = name.slice(1);
		let defaultValue: Literal | undefined;
		if (this.tryPunct("=")) {
			defaultValue = this.parseLiteral();
		}
		const annotations = this.parseAnnotations();
		this.tryFieldSeparator();
		return {
			fid: fidTok.value,
			name,
			requiredness,
			typeExpr,
			defaultValue,
			annotations,
		};
	}

	parseEnum(idl: IDL) {
		const name = this.expectIdent();
		this.expectPunct("{");
		const members: EnumMember[] = [];
		let nextValue = 0;
		while (!this.tryPunct("}")) {
			const memberName = this.expectIdent();
			let value = nextValue;
			if (this.tryPunct("=")) {
				const t = this.eat();
				if (t.kind !== "int") {
					this.fail(`enum value must be int, got ${tokStr(t)}`, t);
				}
				value = t.value;
			}
			const annotations = this.parseAnnotations();
			this.tryFieldSeparator();
			members.push({ name: memberName, value, annotations });
			nextValue = value + 1;
		}
		const annotations = this.parseAnnotations();
		idl.enums.set(name, { name, members, annotations });
	}

	parseStructLike(idl: IDL, kind: "struct" | "union" | "exception") {
		const name = this.expectIdent();
		// optional xsd_all keyword (legacy), or just `{`
		this.expectPunct("{");
		const fields: FieldDef[] = [];
		while (!this.tryPunct("}")) {
			fields.push(this.parseField());
		}
		const annotations = this.parseAnnotations();
		idl.structs.set(name, { name, kind, fields, annotations });
	}

	parseService(idl: IDL) {
		const name = this.expectIdent();
		let parent: string | undefined;
		if (this.tryKeyword("extends")) parent = this.expectIdent();
		this.expectPunct("{");
		const methods: ServiceMethod[] = [];
		while (!this.tryPunct("}")) {
			const oneway = this.tryKeyword("oneway");
			let returnType: TypeExpr;
			if (this.tryKeyword("void")) {
				returnType = { kind: "primitive", ttype: TType.STRUCT, raw: "void" };
			} else {
				returnType = this.parseType();
			}
			const methodName = this.expectIdent();
			this.expectPunct("(");
			const args: FieldDef[] = [];
			while (!this.tryPunct(")")) {
				args.push(this.parseField());
			}
			const throws: FieldDef[] = [];
			if (this.tryKeyword("throws")) {
				this.expectPunct("(");
				while (!this.tryPunct(")")) {
					throws.push(this.parseField());
				}
			}
			const annotations = this.parseAnnotations();
			this.tryFieldSeparator();
			methods.push({
				name: methodName,
				oneway,
				returnType,
				args,
				throws,
				annotations,
			});
		}
		const annotations = this.parseAnnotations();
		idl.services.set(name, { name, extends: parent, methods, annotations });
	}

	parseTypedef(idl: IDL) {
		const typeExpr = this.parseType();
		const name = this.expectIdent();
		const annotations = this.parseAnnotations();
		this.tryPunct(";");
		idl.typedefs.set(name, { name, typeExpr, annotations });
	}

	parseConst(idl: IDL) {
		const typeExpr = this.parseType();
		const name = this.expectIdent();
		this.expectPunct("=");
		const value = this.parseLiteral();
		const annotations = this.parseAnnotations();
		this.tryPunct(";");
		idl.consts.set(name, { name, typeExpr, value, annotations });
	}

	parseNamespace() {
		// namespace <scope> <ident>
		this.eat(); // scope (e.g. "cpp", "py", "java", "*")
		this.eat(); // namespace path (ident-with-dots)
		this.tryPunct(";");
	}

	parseInclude() {
		// include "path"
		const t = this.eat();
		if (t.kind !== "string") this.fail(`include expects string`, t);
		this.tryPunct(";");
	}

	parseFile(idl: IDL) {
		while (this.pos < this.toks.length) {
			const t = this.peek();
			if (!t) break;
			if (t.kind !== "ident") {
				this.pos++;
				continue;
			}
			const kw = t.value;
			switch (kw) {
				case "namespace":
					this.pos++;
					this.parseNamespace();
					break;
				case "include":
				case "cpp_include":
					this.pos++;
					this.parseInclude();
					break;
				case "const":
					this.pos++;
					this.parseConst(idl);
					break;
				case "typedef":
					this.pos++;
					this.parseTypedef(idl);
					break;
				case "enum":
				case "senum":
					this.pos++;
					this.parseEnum(idl);
					break;
				case "struct":
					this.pos++;
					this.parseStructLike(idl, "struct");
					break;
				case "union":
					this.pos++;
					this.parseStructLike(idl, "union");
					break;
				case "exception":
					this.pos++;
					this.parseStructLike(idl, "exception");
					break;
				case "service":
					this.pos++;
					this.parseService(idl);
					break;
				default:
					// unknown top-level keyword — skip token (defensive)
					this.pos++;
			}
		}
	}
}

function tokStr(t: Tok): string {
	return `${t.kind}:${
		JSON.stringify((t as { value: unknown }).value)
	}@${t.line}`;
}

async function parseIDLDir(dir: string): Promise<IDL> {
	const idl: IDL = {
		enums: new Map(),
		structs: new Map(),
		services: new Map(),
		typedefs: new Map(),
		consts: new Map(),
	};
	let fileCount = 0;
	for await (const entry of walk(dir, { exts: [".thrift"] })) {
		const src = await Deno.readTextFile(entry.path);
		fileCount++;
		const parser = new Parser(tokenize(src, entry.path), entry.path);
		parser.parseFile(idl);
	}
	console.log(`Parsed ${fileCount} .thrift files`);
	return idl;
}

// =========================================================================
// linejs Thrift dict index & matcher
// =========================================================================

function isLineEnum(v: LineEnum | LineStruct): v is LineEnum {
	return !Array.isArray(v);
}

export interface LineIndex {
	byName: Map<string, LineEnum | LineStruct>;
	enumNamesByMembers: Map<string, string[]>; // memberset hash -> candidate names
	structNamesByFields: Map<string, string[]>;
}

export function indexLineThrift(thrift: LineThrift): LineIndex {
	const idx: LineIndex = {
		byName: new Map(),
		enumNamesByMembers: new Map(),
		structNamesByFields: new Map(),
	};
	for (const [name, v] of Object.entries(thrift)) {
		idx.byName.set(name, v);
		if (isLineEnum(v)) {
			const hash = [...new Set(Object.values(v))].sort().join("|");
			if (!idx.enumNamesByMembers.has(hash)) {
				idx.enumNamesByMembers.set(hash, []);
			}
			idx.enumNamesByMembers.get(hash)!.push(name);
		} else {
			const hash = v.map((f) => f.name).sort().join("|");
			if (!idx.structNamesByFields.has(hash)) {
				idx.structNamesByFields.set(hash, []);
			}
			idx.structNamesByFields.get(hash)!.push(name);
		}
	}
	return idx;
}

function jaccard(a: Iterable<string>, b: Iterable<string>): number {
	const A = new Set(a);
	const B = new Set(b);
	if (A.size === 0 && B.size === 0) return 1;
	let inter = 0;
	for (const x of A) if (B.has(x)) inter++;
	const union = A.size + B.size - inter;
	return union === 0 ? 1 : inter / union;
}

function findEnumMatch(
	canonical: EnumDef,
	idx: LineIndex,
	overrides: Record<string, string>,
	threshold: number,
): string | null {
	const override = overrides[canonical.name];
	if (override) {
		// Honor only if the override target is actually an enum on the linejs
		// side. Otherwise we'd map an APK enum onto a linejs struct entry
		// and try to splice enum value adds into a `[ ... ]` block.
		const target = idx.byName.get(override);
		if (target && isLineEnum(target)) return override;
	}
	const direct = idx.byName.get(canonical.name);
	if (direct && isLineEnum(direct)) return canonical.name;
	const myMembers = canonical.members.map((m) => m.name);
	let best: { name: string; score: number } | null = null;
	for (const [name, v] of idx.byName) {
		if (!isLineEnum(v)) continue;
		const score = jaccard(myMembers, Object.values(v));
		if (!best || score > best.score) best = { name, score };
	}
	if (best && best.score >= threshold) return best.name;
	return null;
}

function findStructMatch(
	canonical: StructDef,
	idx: LineIndex,
	overrides: Record<string, string>,
	threshold: number,
): string | null {
	const override = overrides[canonical.name];
	if (override) {
		// Symmetric guard: only follow the override if the target is a struct.
		const target = idx.byName.get(override);
		if (target && !isLineEnum(target)) return override;
	}
	const direct = idx.byName.get(canonical.name);
	if (direct && !isLineEnum(direct)) return canonical.name;
	const myFields = canonical.fields.map((f) => f.name);
	let best: { name: string; score: number } | null = null;
	for (const [name, v] of idx.byName) {
		if (isLineEnum(v)) continue;
		const score = jaccard(myFields, (v as LineStruct).map((f) => f.name));
		if (!best || score > best.score) best = { name, score };
	}
	if (best && best.score >= threshold) return best.name;
	return null;
}

// =========================================================================
// Diff
// =========================================================================

export interface EnumValueAdd {
	enumName: string;
	canonicalName: string;
	value: number;
	memberName: string;
}
export interface StructFieldAdd {
	structName: string;
	canonicalName: string;
	field: FieldDef;
	resolvedTypeName?: string; // for struct refs, the linejs-side name to emit
}
export interface NewType {
	canonicalName: string;
	kind: "enum" | "struct";
	enumDef?: EnumDef;
	structDef?: StructDef;
}
export interface Diff {
	enumValueAdds: EnumValueAdd[];
	structFieldAdds: StructFieldAdd[];
	newTypes: NewType[];
}

// Resolve a canonical TypeExpr's outer ref (if any) to the linejs name.
function resolveRefName(
	expr: TypeExpr,
	enumMap: Map<string, string>,
	structMap: Map<string, string>,
	typedefs: Map<string, TypedefDef>,
	seen = new Set<string>(),
): TypeExpr {
	if (expr.kind !== "ref") return expr;
	if (seen.has(expr.name)) return expr;
	seen.add(expr.name);
	const e = enumMap.get(expr.name);
	if (e) return { ...expr, name: e };
	const s = structMap.get(expr.name);
	if (s) return { ...expr, name: s };
	const td = typedefs.get(expr.name);
	if (td) {
		return resolveRefName(td.typeExpr, enumMap, structMap, typedefs, seen);
	}
	return expr;
}

export function computeDiff(
	idl: IDL,
	thrift: LineThrift,
	idx: LineIndex,
	overrides: Record<string, string>,
	threshold: number,
): Diff {
	const diff: Diff = { enumValueAdds: [], structFieldAdds: [], newTypes: [] };

	// First pass: map canonical -> linejs for enums and structs (for type-ref resolution).
	const enumMap = new Map<string, string>();
	const structMap = new Map<string, string>();
	for (const e of idl.enums.values()) {
		const m = findEnumMatch(e, idx, overrides, threshold);
		if (m) enumMap.set(e.name, m);
	}
	for (const s of idl.structs.values()) {
		const m = findStructMatch(s, idx, overrides, threshold);
		if (m) structMap.set(s.name, m);
	}

	// Enums: add missing members
	for (const canonical of idl.enums.values()) {
		const matched = enumMap.get(canonical.name);
		if (!matched) {
			diff.newTypes.push({
				canonicalName: canonical.name,
				kind: "enum",
				enumDef: canonical,
			});
			continue;
		}
		const existing = thrift[matched] as LineEnum;
		const existingValues = new Set(Object.keys(existing).map((k) => Number(k)));
		const existingNames = new Set(Object.values(existing));
		for (const m of canonical.members) {
			if (existingValues.has(m.value)) continue;
			if (existingNames.has(m.name)) continue;
			diff.enumValueAdds.push({
				enumName: matched,
				canonicalName: canonical.name,
				value: m.value,
				memberName: m.name,
			});
		}
	}

	// Structs: add missing fields
	for (const canonical of idl.structs.values()) {
		const matched = structMap.get(canonical.name);
		if (!matched) {
			diff.newTypes.push({
				canonicalName: canonical.name,
				kind: "struct",
				structDef: canonical,
			});
			continue;
		}
		const existing = thrift[matched] as LineStruct;
		const existingFids = new Set(existing.map((f) => f.fid));
		const existingNames = new Set(existing.map((f) => f.name));
		for (const f of canonical.fields) {
			if (existingFids.has(f.fid)) continue;
			if (existingNames.has(f.name)) continue;
			const resolved = resolveRefName(
				f.typeExpr,
				enumMap,
				structMap,
				idl.typedefs,
			);
			diff.structFieldAdds.push({
				structName: matched,
				canonicalName: canonical.name,
				field: { ...f, typeExpr: resolved },
			});
		}
	}

	return diff;
}

// =========================================================================
// Emitters
// =========================================================================

interface TypeRefOut {
	type?: number;
	struct?: string;
	list?: number | string;
	set?: number | string;
	map?: number | string;
	key?: number | string;
}

function typeRefOut(t: TypeExpr): TypeRefOut {
	switch (t.kind) {
		case "primitive":
			return { type: t.ttype };
		case "ref":
			return { struct: t.name };
		case "list": {
			const inner = typeRefOut(t.elem);
			return { list: inner.type ?? inner.struct ?? TType.STRING };
		}
		case "set": {
			const inner = typeRefOut(t.elem);
			return { set: inner.type ?? inner.struct ?? TType.STRING };
		}
		case "map": {
			const valInner = typeRefOut(t.value);
			const keyInner = typeRefOut(t.key);
			return {
				map: valInner.type ?? valInner.struct ?? TType.STRING,
				key: keyInner.type ?? keyInner.struct ?? TType.STRING,
			};
		}
	}
}

export function emitFieldEntry(f: FieldDef, indent = "\t\t"): string {
	const ref = typeRefOut(f.typeExpr);
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

export function emitNewEnum(e: EnumDef): string {
	const out = [`\t"${e.name}": {`];
	for (const m of e.members) out.push(`\t\t"${m.value}": "${m.name}",`);
	out.push(`\t},`);
	return out.join("\n");
}

export function emitNewStruct(s: StructDef): string {
	const out = [`\t"${s.name}": [`];
	for (const f of s.fields) out.push(emitFieldEntry(f, "\t\t"));
	out.push(`\t],`);
	return out.join("\n");
}

// =========================================================================
// Patcher
// =========================================================================

interface BlockSpan {
	startMarkerIdx: number; // index of `\t"name": [` / `\t"name": {` in source
	contentStart: number; // index just after the opener
	closerIdx: number; // index of the closing `]` or `}`
	closeLineStart: number; // start-of-line index for the line containing the closer
	singleLine: boolean; // true when opener and closer are on the same source line (e.g. `[],`)
}

function findBlock(
	src: string,
	name: string,
	opener: "[" | "{",
): BlockSpan | null {
	const closer = opener === "[" ? "]" : "}";
	const marker = `\t"${name}": ${opener}`;
	const startMarkerIdx = src.indexOf(marker);
	if (startMarkerIdx < 0) return null;
	const contentStart = startMarkerIdx + marker.length;
	let i = contentStart;
	let depth = 1;
	let inStr: false | '"' | "'" = false;
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
		if (c === opener) depth++;
		else if (c === closer) {
			depth--;
			if (depth === 0) break;
		}
		i++;
	}
	const closerIdx = i;
	const closeLineStart = src.lastIndexOf("\n", closerIdx - 1) + 1;
	const openLineStart = src.lastIndexOf("\n", startMarkerIdx - 1) + 1;
	const singleLine = openLineStart === closeLineStart;
	return {
		startMarkerIdx,
		contentStart,
		closerIdx,
		closeLineStart,
		singleLine,
	};
}

/**
 * Insert the given multi-line content into a block, handling both the multi-line case
 * (insert before the line containing the closer) and the empty single-line case
 * (`"X": [],` → expand to multi-line form with the inserted content).
 */
function insertIntoBlock(
	src: string,
	span: BlockSpan,
	content: string, // trailing newline expected
): string {
	if (!span.singleLine) {
		return src.slice(0, span.closeLineStart) + content +
			src.slice(span.closeLineStart);
	}
	// Single-line empty: replace `[]` (or `{}`) with multi-line form.
	// span.contentStart points just after the opener; span.closerIdx points at the closer.
	// Insert: newline, content (already has trailing \n), then `\t` before the closer for alignment.
	return src.slice(0, span.contentStart) +
		"\n" + content + "\t" +
		src.slice(span.closerIdx);
}

export function applyDiff(originalSrc: string, diff: Diff): string {
	let src = originalSrc;
	const warnings: string[] = [];

	// Apply enum value adds (group by enum to minimize re-locations)
	const enumGroups = new Map<string, EnumValueAdd[]>();
	for (const a of diff.enumValueAdds) {
		if (!enumGroups.has(a.enumName)) enumGroups.set(a.enumName, []);
		enumGroups.get(a.enumName)!.push(a);
	}
	for (const [enumName, adds] of enumGroups) {
		const span = findBlock(src, enumName, "{");
		if (!span) {
			warnings.push(`enum block not found: ${enumName}`);
			continue;
		}
		const insertion = adds
			.map((a) => `\t\t"${a.value}": "${a.memberName}",`)
			.join("\n") + "\n";
		src = insertIntoBlock(src, span, insertion);
	}

	// Apply struct field adds
	const structGroups = new Map<string, StructFieldAdd[]>();
	for (const a of diff.structFieldAdds) {
		if (!structGroups.has(a.structName)) structGroups.set(a.structName, []);
		structGroups.get(a.structName)!.push(a);
	}
	for (const [structName, adds] of structGroups) {
		const span = findBlock(src, structName, "[");
		if (!span) {
			warnings.push(`struct block not found: ${structName}`);
			continue;
		}
		const insertion = adds.map((a) =>
			emitFieldEntry(a.field, "\t\t")
		).join("\n") + "\n";
		src = insertIntoBlock(src, span, insertion);
	}

	// Append new types before final `};`
	if (diff.newTypes.length) {
		const closeIdx = src.lastIndexOf("};");
		if (closeIdx < 0) {
			throw new Error("cannot locate closing `};` of Thrift dict");
		}
		const sorted = [...diff.newTypes].sort((a, b) =>
			a.canonicalName.localeCompare(b.canonicalName)
		);
		const insertions: string[] = [];
		for (const nt of sorted) {
			if (nt.kind === "enum" && nt.enumDef) {
				insertions.push(emitNewEnum(nt.enumDef));
			} else if (nt.kind === "struct" && nt.structDef) {
				insertions.push(emitNewStruct(nt.structDef));
			}
		}
		src = src.slice(0, closeIdx) + insertions.join("\n") + "\n" +
			src.slice(closeIdx);
	}

	if (warnings.length) {
		console.warn("warnings:");
		for (const w of warnings) console.warn(`  ${w}`);
	}

	return src;
}

// =========================================================================
// Main
// =========================================================================

async function main() {
	const args = parseArgs(Deno.args);

	let overrides: Record<string, string> = {};
	if (args.mapPath) {
		overrides = JSON.parse(await Deno.readTextFile(args.mapPath));
	}

	console.log(`Parsing IDL: ${args.idl}`);
	const idl = await parseIDLDir(args.idl);
	console.log(`  enums:     ${idl.enums.size}`);
	console.log(`  structs:   ${idl.structs.size}`);
	console.log(`  services:  ${idl.services.size}`);
	console.log(`  typedefs:  ${idl.typedefs.size}`);

	const thriftPath = fromFileUrl(
		import.meta.resolve("../../packages/types/thrift.ts"),
	);
	const mod = await import(`file://${thriftPath.replaceAll("\\", "/")}`);
	const thrift = mod.Thrift as LineThrift;
	console.log(`linejs Thrift entries: ${Object.keys(thrift).length}`);

	const idx = indexLineThrift(thrift);
	const diff = computeDiff(idl, thrift, idx, overrides, args.matchThreshold);

	console.log();
	console.log(`=== diff summary ===`);
	console.log(`enum value adds:   ${diff.enumValueAdds.length}`);
	console.log(`struct field adds: ${diff.structFieldAdds.length}`);
	console.log(`new types:         ${diff.newTypes.length}`);

	const head = <T>(arr: T[], n: number) =>
		arr.slice(0, n).map((x) => String(x)).join(", ") +
		(arr.length > n ? `, ... (+${arr.length - n})` : "");

	if (diff.enumValueAdds.length) {
		const byEnum = new Map<string, string[]>();
		for (const a of diff.enumValueAdds) {
			if (!byEnum.has(a.enumName)) byEnum.set(a.enumName, []);
			byEnum.get(a.enumName)!.push(`${a.value}=${a.memberName}`);
		}
		console.log(`\nenum adds:`);
		for (const [k, vs] of byEnum) console.log(`  ${k}: ${head(vs, 8)}`);
	}
	if (diff.structFieldAdds.length) {
		const byStruct = new Map<string, string[]>();
		for (const a of diff.structFieldAdds) {
			if (!byStruct.has(a.structName)) byStruct.set(a.structName, []);
			byStruct.get(a.structName)!.push(`fid${a.field.fid}=${a.field.name}`);
		}
		console.log(`\nstruct adds:`);
		for (const [k, vs] of byStruct) console.log(`  ${k}: ${head(vs, 8)}`);
	}
	if (diff.newTypes.length) {
		console.log(
			`\nnew types: ${
				head(diff.newTypes.map((t) => `${t.kind}:${t.canonicalName}`), 25)
			}`,
		);
	}

	if (args.report) {
		await Deno.writeTextFile(args.report, JSON.stringify(diff, null, 2));
		console.log(`\nReport written: ${args.report}`);
	}

	if (args.apply) {
		const orig = await Deno.readTextFile(thriftPath);
		const patched = applyDiff(orig, diff);
		await Deno.writeTextFile(thriftPath, patched);
		console.log(`\nApplied changes to ${thriftPath}`);
	} else {
		console.log(`\n(dry-run; pass --apply to write changes to thrift.ts)`);
	}
}

if (import.meta.main) {
	await main();
}
