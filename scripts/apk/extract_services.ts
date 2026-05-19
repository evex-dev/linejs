/**
 * @description Extract Thrift service signatures (service name → method → args/result/throws)
 *              from a decompiled (apktool) smali tree of a LINE Android APK.
 *
 * After R8/ProGuard, Thrift-generated `$Iface.smali` files are stripped of
 * abstract method declarations (no methods at all — the interface is
 * accessed indirectly via the concrete Client). The Client class IS retained,
 * with one method per RPC. Each method has a stable structural pattern:
 *
 *     .method public final <obf>(Largs;)Lret;
 *         new-instance v0, LService$method_args;
 *         invoke-direct {v0}, ...args;-><init>()V
 *         iput-object p1, v0, ...args;->FIELD:Largs;   ; arg(s)
 *         const-string p1, "methodName"                ; <- RPC name (wire)
 *         invoke-virtual {p0, p1, v0}, LThriftClient;->send(String,TBase)V
 *         new-instance v0, LService$method_result;
 *         invoke-direct {v0}, ...result;-><init>()V
 *         invoke-virtual {p0, p1, v0}, LThriftClient;->recv(String,TBase)V
 *         ...
 *     .end method
 *
 * From the args/result classes we get the canonical service + method names
 * (the smali class is Lpkg/Service$method_(args|result);). The wire method
 * name is recovered from the const-string immediately preceding the send
 * call. The Java method signature gives the request and response types.
 *
 * Usage:
 *   deno run -A scripts/apk/extract_services.ts --smali <dir> [--report <path>]
 *                                                [--include-pkg <regex>]
 */
import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

interface Args {
	smaliDir: string;
	report: string;
	includePkg: RegExp | null;
}

function parseArgs(argv: string[]): Args {
	const out: Args = { smaliDir: "", report: "", includePkg: null };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		switch (a) {
			case "--smali":
				out.smaliDir = argv[++i];
				break;
			case "--report":
				out.report = argv[++i];
				break;
			case "--include-pkg":
				out.includePkg = new RegExp(argv[++i]);
				break;
			default:
				throw new Error(`unknown arg: ${a}`);
		}
	}
	if (!out.smaliDir) throw new Error("--smali <dir> is required");
	return out;
}

interface ServiceMethod {
	/** Wire RPC name as it appears in the const-string before the send call. */
	rpcName: string;
	/** Short name parsed from the args inner-class (`Service$method_args`). */
	argsClassMethodName: string;
	/** FQCN of the args holder struct (canonical name). */
	argsClass: string;
	/** FQCN of the result holder struct. */
	resultClass: string;
	/** Java method signature: parameter types in order. */
	paramTypes: string[];
	/** Java method return type (`Lvoid;` for void-returning RPCs). */
	returnType: string;
	/** Obfuscated method name in the Client class (single letter typically). */
	obfMethodName: string;
}

interface ServiceDef {
	/** Canonical service name from the Client class enclosing-class
	 *  (e.g. `SquareService`, `TalkService`). */
	name: string;
	/** FQCN of the Client class. */
	clientClass: string;
	methods: ServiceMethod[];
}

// =========================================================================
// Smali parser — focused on $Client.smali method bodies
// =========================================================================

function shortName(fqcn: string): string {
	// `Lcom/linecorp/.../SquareService$Client;` → `SquareService`
	// `Lpkg/SomeService$Client$inner;` → still `SomeService` (strip after first $)
	const noL = fqcn.replace(/^L|;$/g, "");
	const tail = noL.split("/").pop()!;
	return tail.split("$")[0];
}

function parseClientSmali(src: string, _path: string): ServiceDef | null {
	const lines = src.split("\n");
	let clientClass = "";
	for (const raw of lines) {
		const line = raw.trim();
		if (line.startsWith(".class")) {
			const m = /(L[^;]+;)$/.exec(line);
			if (m) clientClass = m[1];
			break;
		}
	}
	if (!clientClass) return null;

	const serviceName = shortName(clientClass);
	const methods: ServiceMethod[] = [];

	// Walk method-by-method.
	let i = 0;
	while (i < lines.length) {
		const ln = lines[i].trim();
		// .method <modifiers> <name>(params)return
		const methodHeader = /^\.method\s+(?:[\w]+\s+)*(\w+)\((.*?)\)(.+)$/.exec(
			ln,
		);
		if (!methodHeader) {
			i++;
			continue;
		}
		const obfMethodName = methodHeader[1];
		const params = methodHeader[2];
		const ret = methodHeader[3];
		if (obfMethodName === "<init>" || obfMethodName === "<clinit>") {
			i = skipToEndMethod(lines, i);
			continue;
		}
		const paramTypes = splitJvmParamList(params);
		// Walk method body.
		const body: string[] = [];
		let j = i + 1;
		while (j < lines.length) {
			const inner = lines[j].trim();
			if (inner.startsWith(".end method")) {
				break;
			}
			body.push(inner);
			j++;
		}
		const method = analyseClientMethod(
			body,
			obfMethodName,
			paramTypes,
			ret,
		);
		if (method) methods.push(method);
		i = j + 1;
	}

	if (methods.length === 0) return null;
	return { name: serviceName, clientClass, methods };
}

function skipToEndMethod(lines: string[], start: number): number {
	for (let i = start + 1; i < lines.length; i++) {
		if (lines[i].trim().startsWith(".end method")) return i + 1;
	}
	return lines.length;
}

const PRIM_TOKENS: Record<string, string> = {
	"V": "V",
	"Z": "Z",
	"B": "B",
	"S": "S",
	"C": "C",
	"I": "I",
	"J": "J",
	"F": "F",
	"D": "D",
};

function splitJvmParamList(params: string): string[] {
	// Parse a JVM parameter list like `(Lpkg/A;Lpkg/B;[I)` (without parens).
	const out: string[] = [];
	let i = 0;
	while (i < params.length) {
		const c = params[i];
		if (c === "[") {
			let j = i;
			while (params[j] === "[") j++;
			if (params[j] === "L") {
				const semi = params.indexOf(";", j);
				out.push(params.slice(i, semi + 1));
				i = semi + 1;
			} else if (PRIM_TOKENS[params[j]]) {
				out.push(params.slice(i, j + 1));
				i = j + 1;
			} else {
				i++;
			}
		} else if (c === "L") {
			const semi = params.indexOf(";", i);
			if (semi < 0) break;
			out.push(params.slice(i, semi + 1));
			i = semi + 1;
		} else if (PRIM_TOKENS[c]) {
			out.push(c);
			i++;
		} else {
			i++;
		}
	}
	return out;
}

interface RegVal {
	kind: "string" | "new";
	value: string;
}

/** Look inside one Client method body for these structural signals:
 *
 *   - The first `new-instance` after the method header is the args holder
 *     (canonical builds: `Service$method_args`; obfuscated builds: a
 *     short-named struct).
 *   - The RPC wire name is recovered from a `const-string` whose register
 *     is immediately passed as arg 1 to a 2-arg `(Ljava/lang/String;L…;)V`
 *     method on the receiver (i.e. the shaded `TServiceClient::send`).
 *   - A second `new-instance` after the send call is the result holder.
 *
 * We require the RPC string to be present (it's the wire identity of the
 * method; without it the record is unactionable). We do *not* require the
 * args/result class names to follow the canonical `$method_args` /
 * `$method_result` naming, because LINE's obfuscated services don't.
 */
function analyseClientMethod(
	body: string[],
	obfMethodName: string,
	paramTypes: string[],
	returnType: string,
): ServiceMethod | null {
	const regs = new Map<string, RegVal>();
	let argsClass: string | null = null;
	let resultClass: string | null = null;
	let rpcNameFromString: string | null = null;
	let sawSendCall = false;

	for (const line of body) {
		const cs = /^const-string(?:\/jumbo)?\s+(\w+),\s+"((?:\\.|[^"\\])*)"$/.exec(line);
		if (cs) {
			regs.set(cs[1], { kind: "string", value: cs[2] });
			continue;
		}
		const ni = /^new-instance\s+(\w+),\s+(L[^;]+;)/.exec(line);
		if (ni) {
			const cls = ni[2];
			regs.set(ni[1], { kind: "new", value: cls });
			// First new-instance pre-send → args; first new-instance post-send → result.
			if (!sawSendCall) {
				if (!argsClass) argsClass = cls;
			} else {
				if (!resultClass) resultClass = cls;
			}
			continue;
		}
		const iv =
			/^invoke-virtual\s+\{([^}]+)\},\s+L[^;]+;->\w+\(Ljava\/lang\/String;L[^)]+;\)V$/
				.exec(line);
		if (iv) {
			const callRegs = iv[1].split(",").map((s) => s.trim());
			// {receiver, nameReg, tbaseReg}
			if (callRegs.length >= 2) {
				const nameReg = callRegs[1];
				const v = regs.get(nameReg);
				if (v && v.kind === "string" && !rpcNameFromString) {
					rpcNameFromString = v.value;
					sawSendCall = true;
				}
			}
		}
	}

	if (!rpcNameFromString) return null;
	const argsMethodName = argsClass ? /\$(\w+)_args;$/.exec(argsClass)?.[1] ?? "" : "";

	return {
		rpcName: rpcNameFromString,
		argsClassMethodName: argsMethodName,
		argsClass: argsClass ?? "",
		resultClass: resultClass ?? "",
		paramTypes,
		returnType,
		obfMethodName,
	};
}

// =========================================================================
// Walker
// =========================================================================

/** Identify the shaded Apache Thrift TServiceClient by structural shape:
 *  any class under `org/apache/thrift/` whose body declares exactly two
 *  methods of signature `(Ljava/lang/String;L<TBase-like>;)V` (the send +
 *  recv methods). The class letter rotates between builds (observed `p` in
 *  26.6.2) so name-based detection isn't viable. */
async function locateThriftServiceClient(dir: string): Promise<string | null> {
	const tryDirs = [
		`${dir}/smali_classes5/org/apache/thrift`,
		`${dir}/smali_classes4/org/apache/thrift`,
		`${dir}/smali_classes6/org/apache/thrift`,
		`${dir}/smali_classes3/org/apache/thrift`,
		`${dir}/smali/org/apache/thrift`,
	];
	for (const d of tryDirs) {
		try {
			for await (const e of Deno.readDir(d)) {
				if (!e.isFile || !e.name.endsWith(".smali")) continue;
				const path = `${d}/${e.name}`;
				const src = await Deno.readTextFile(path);
				const sendRecvCount = [...src.matchAll(
					/^\.method\s+(?:[\w]+\s+)*\w+\(Ljava\/lang\/String;L[^;]+;\)V$/gm,
				)].length;
				if (sendRecvCount !== 2) continue;
				// Also expect a constructor taking a TProtocol-shaped reference.
				if (!/^\.method[^\n]*<init>\(L[^;]+;(?:L[^;]+;)?\)V$/m.test(src)) continue;
				const cm = /^\.class[^\n]+\s+(L[^;]+;)$/m.exec(src);
				if (cm) return cm[1];
			}
		} catch {
			// directory absent
		}
	}
	return null;
}

async function walkServices(dir: string, opts: Args): Promise<ServiceDef[]> {
	const services: ServiceDef[] = [];
	const seenClasses = new Set<string>();

	// Pre-locate the shaded TServiceClient super-class. Any user class
	// extending it directly is a Thrift Client — this catches the heavily-
	// obfuscated TalkService/RelationService etc. where the canonical
	// `$Client` inner-class name has been stripped by R8.
	const tServiceClient = await locateThriftServiceClient(dir);
	if (tServiceClient) {
		console.log(`detected shaded TServiceClient: ${tServiceClient}`);
	} else {
		console.log(
			`warning: could not locate shaded TServiceClient — falling back to canonical *$Client.smali only`,
		);
	}

	let scanned = 0;
	const t0 = performance.now();
	for await (
		const entry of walk(dir, { exts: [".smali"], includeDirs: false })
	) {
		if (opts.includePkg && !opts.includePkg.test(entry.path)) continue;
		const src = await Deno.readTextFile(entry.path);

		const canonicalClient = entry.path.endsWith("$Client.smali");
		const structuralClient = tServiceClient
			? src.includes(`.super ${tServiceClient}`)
			: false;
		if (!canonicalClient && !structuralClient) continue;
		if (!src.includes("Ljava/lang/String;L")) continue;

		const svc = parseClientSmali(src, entry.path);
		if (!svc) continue;
		if (seenClasses.has(svc.clientClass)) continue;
		seenClasses.add(svc.clientClass);
		services.push(svc);

		scanned++;
		if (scanned % 50 === 0) {
			const dt = (performance.now() - t0) / 1000;
			console.log(
				`  scanned ${scanned} Client candidates (${(scanned / dt).toFixed(0)}/s)...`,
			);
		}
	}
	const dt = ((performance.now() - t0) / 1000).toFixed(1);
	console.log(`walk done: ${services.length} services in ${dt}s`);
	return services;
}

// =========================================================================
// Main
// =========================================================================

if (import.meta.main) {
	const args = parseArgs(Deno.args);
	console.log(`smali root: ${args.smaliDir}`);

	const services = await walkServices(args.smaliDir, args);
	const totalMethods = services.reduce((n, s) => n + s.methods.length, 0);
	console.log();
	console.log(`=== summary ===`);
	console.log(`services: ${services.length}`);
	console.log(`methods:  ${totalMethods}`);
	services.sort((a, b) => b.methods.length - a.methods.length);
	for (const s of services.slice(0, 25)) {
		console.log(`  ${s.methods.length.toString().padStart(4)}  ${s.name}`);
	}
	if (services.length > 25) {
		console.log(`  ... (+${services.length - 25} more)`);
	}

	if (args.report) {
		await Deno.writeTextFile(args.report, JSON.stringify(services, null, 2));
		console.log(`\nReport written: ${args.report}`);
	}
}
