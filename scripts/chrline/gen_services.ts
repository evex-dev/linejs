/**
 * @description Generate linejs service modules from CHRLINE-Patch's Python
 *              service classes.
 *
 * CHRLINE-Patch defines, for each LINE service (TalkService, ShopService,
 * RelationService, …), a Python class whose top-level metadata gives us
 * the wire endpoint and request/response type codes, and whose `def`
 * declarations give us the RPC method names. linejs has the matching
 * `<methodName>_args` / `<methodName>_result` Thrift definitions already
 * (synced from the APK in @evex/linejs-types@2.6.2-rc2+) — we just need
 * thin TypeScript wrappers that route each method through
 * `client.request.request`.
 *
 * Reuses the existing convention from the hand-written services
 * (`packages/linejs/base/service/talk/mod.ts`, `relation/mod.ts`, etc.):
 *
 *     async <method>(
 *         ...param: Parameters<typeof LINEStruct.<method>_args>
 *     ): Promise<LINETypes.<method>_result["success"]> {
 *         return await this.client.request.request(
 *             LINEStruct.<method>_args(...param),
 *             "<method>",
 *             this.protocolType,
 *             true,
 *             this.requestPath,
 *         );
 *     }
 *
 * For each generated service:
 *   - the class is emitted at `packages/linejs/base/service/<short>/mod.ts`
 *   - the short directory name is the service-class name with the
 *     `Service` suffix stripped and lowercased
 *   - methods are only included when linejs already has both
 *     `<method>_args` and `<method>_result` in `packages/types/thrift.ts`,
 *     so the generated TS type-checks against the published types package
 *
 * Usage:
 *   deno run -A scripts/chrline/gen_services.ts \
 *       --chrline ../../refs/CHRLINE-Patch \
 *       [--out packages/linejs/base/service] \
 *       [--service Settings] [--service ShopService] \
 *       [--apply]
 *
 *   --service <name>  filter to specific services (without "Service" suffix)
 *   --apply           write modules; default is dry-run (prints summary)
 *
 * Service skip list (already hand-written):
 *   auth, call, channel, liff, livetalk, relation, square, talk
 */
import { fromFileUrl, resolve as pathResolve } from "https://deno.land/std@0.224.0/path/mod.ts";
import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

interface Args {
	chrline: string;
	out: string;
	apply: boolean;
	serviceFilter: Set<string> | null;
}

function parseArgs(argv: string[]): Args {
	const out: Args = { chrline: "", out: "", apply: false, serviceFilter: null };
	const filter = new Set<string>();
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		switch (a) {
			case "--chrline":
				out.chrline = argv[++i];
				break;
			case "--out":
				out.out = argv[++i];
				break;
			case "--apply":
				out.apply = true;
				break;
			case "--service":
				filter.add(argv[++i]);
				break;
			default:
				throw new Error(`unknown arg: ${a}`);
		}
	}
	if (!out.chrline) throw new Error("--chrline <path> is required");
	if (filter.size > 0) out.serviceFilter = filter;
	return out;
}

interface ChrLineService {
	className: string; // e.g. "ShopService"
	endpoint: string; // e.g. "/TSHOP4"
	reqType: number; // protocol type code
	methods: string[]; // RPC names
}

const SKIP_LIST = new Set([
	"AuthService",
	"CallService",
	"ChannelService",
	"LiffService",
	"RelationService",
	"SquareLiveTalkService",
	"SquareService",
	"TalkService",
	// BaseService is not an RPC service
	"BaseService",
]);

async function parseChrLineService(path: string): Promise<ChrLineService | null> {
	const src = await Deno.readTextFile(path);
	const classMatch = /^class (\w+Service)\b/m.exec(src);
	if (!classMatch) return null;
	const className = classMatch[1];
	if (SKIP_LIST.has(className)) return null;

	const endpointMatch = /__ENDPOINT\s*=\s*"([^"]+)"/.exec(src);
	const reqTypeMatch = /__REQ_TYPE\s*=\s*(\d+)/.exec(src);
	if (!endpointMatch || !reqTypeMatch) return null;

	// CHRLINE-Patch methods are declared as `def methodName(self, …):`
	// with `METHOD_NAME = "methodName"` on the next non-blank line.
	// Use METHOD_NAME as the source of truth so private helpers (defs
	// starting with `_`) get filtered automatically.
	const methodNames: string[] = [];
	const methodNameRe = /METHOD_NAME\s*=\s*"(\w+)"/g;
	let m: RegExpExecArray | null;
	const seen = new Set<string>();
	while ((m = methodNameRe.exec(src)) !== null) {
		const n = m[1];
		// CHRLINE-Patch sometimes ships multiple `def` overloads that share
		// a METHOD_NAME (e.g. ShopAuthService.establishE2EESession with
		// different request shapes). De-dupe — the first occurrence wins;
		// linejs's single Thrift `*_args` covers the canonical signature.
		if (seen.has(n)) continue;
		seen.add(n);
		methodNames.push(n);
	}
	if (methodNames.length === 0) return null;

	return {
		className,
		endpoint: endpointMatch[1],
		reqType: Number(reqTypeMatch[1]),
		methods: methodNames,
	};
}

function shortDirName(serviceClassName: string): string {
	// "ShopService" → "shop"; "PrimaryAccountInitService" → "primaryaccountinit".
	// We lowercase the entire dropped-suffix name to match linejs's existing
	// directory convention (`talk/`, `square/`, etc.).
	return serviceClassName.replace(/Service$/, "").toLowerCase();
}

function errorName(serviceClassName: string): string {
	return `${serviceClassName}Error`;
}

function emitModule(
	svc: ChrLineService,
	methodsInThrift: Set<string>,
	thrift: Record<string, unknown>,
): { content: string; included: string[]; skipped: string[] } {
	const included: string[] = [];
	const skipped: string[] = [];
	for (const m of svc.methods) {
		if (methodsInThrift.has(m)) included.push(m);
		else skipped.push(m);
	}

	const methodBodies = included.map((name) => {
		const ret = hasSuccessField(name, thrift)
			? `LINETypes.${name}_result["success"]`
			: "void";
		return `	async ${name}(
		...param: Parameters<typeof LINEStruct.${name}_args>
	): Promise<${ret}> {
		return await this.client.request.request(
			LINEStruct.${name}_args(...param),
			"${name}",
			this.protocolType,
			true,
			this.requestPath,
		);
	}`;
	}).join("\n\n");

	const content = `// Generated by scripts/chrline/gen_services.ts from CHRLINE-Patch's
// ${svc.className}.  Manual edits are fine — re-running the generator only
// touches services whose CHRLINE-Patch counterpart has changed.
import { type BaseClient } from "../../core/mod.ts";
import type { ProtocolKey } from "../../thrift/mod.ts";
import type { BaseService } from "../types.ts";
import { LINEStruct } from "../../thrift/mod.ts";
import type * as LINETypes from "@evex/linejs-types";

export class ${svc.className} implements BaseService {
	client: BaseClient;
	protocolType: ProtocolKey = ${svc.reqType};
	requestPath = "${svc.endpoint}";
	errorName = "${errorName(svc.className)}";
	constructor(client: BaseClient) {
		this.client = client;
	}

${methodBodies}
}
`;
	return { content, included, skipped };
}

async function loadThrift(linejsRoot: string): Promise<Record<string, unknown>> {
	const thriftPath = `${linejsRoot}/packages/types/thrift.ts`;
	const mod = await import(`file://${thriftPath.replaceAll("\\", "/")}`);
	return mod.Thrift as Record<string, unknown>;
}

interface FieldRec { fid: number; name: string }
/** Returns true if `<method>_result` has a fid-0 "success" field — i.e. the
 *  RPC returns a value. Result structs for `void` methods only carry the
 *  exception field at fid 1 / 2, no success slot. */
function hasSuccessField(method: string, thrift: Record<string, unknown>): boolean {
	const entry = thrift[`${method}_result`];
	if (!Array.isArray(entry)) return false;
	return (entry as FieldRec[]).some((f) => f.fid === 0);
}

async function main() {
	const args = parseArgs(Deno.args);
	const here = pathResolve(fromFileUrl(import.meta.url), "..");
	// Walk up until we find packages/linejs/deno.json (the linejs package root).
	let linejsRoot = here;
	while (true) {
		try {
			await Deno.stat(`${linejsRoot}/packages/linejs/deno.json`);
			break;
		} catch {
			const parent = pathResolve(linejsRoot, "..");
			if (parent === linejsRoot) throw new Error("could not locate linejs root");
			linejsRoot = parent;
		}
	}
	const outRoot = args.out
		? pathResolve(args.out)
		: `${linejsRoot}/packages/linejs/base/service`;

	console.log(`linejs root: ${linejsRoot}`);
	console.log(`CHRLINE-Patch: ${args.chrline}`);
	console.log(`service out:  ${outRoot}`);

	const thrift = await loadThrift(linejsRoot);
	const hasArgs = (m: string) => Array.isArray(thrift[`${m}_args`]);
	const hasResult = (m: string) => Array.isArray(thrift[`${m}_result`]);
	const knownMethods = new Set<string>();
	for (const k of Object.keys(thrift)) {
		const m = /^([a-z]\w*)_args$/.exec(k);
		if (m && hasResult(m[1])) knownMethods.add(m[1]);
	}
	console.log(`linejs has ${knownMethods.size} method args/result pairs in thrift.ts`);

	// Collect CHRLINE service files.
	const servicesDir = `${args.chrline}/CHRLINE/services`;
	const collected: ChrLineService[] = [];
	for await (const entry of walk(servicesDir, { exts: [".py"], includeDirs: false })) {
		if (!entry.name.endsWith("Service.py")) continue;
		const svc = await parseChrLineService(entry.path);
		if (!svc) continue;
		if (args.serviceFilter) {
			const short = svc.className.replace(/Service$/, "");
			if (
				!args.serviceFilter.has(svc.className) &&
				!args.serviceFilter.has(short)
			) continue;
		}
		collected.push(svc);
	}
	collected.sort((a, b) => a.className.localeCompare(b.className));
	console.log(`parsed ${collected.length} CHRLINE-Patch service(s)`);

	let totalIncluded = 0;
	let totalSkipped = 0;
	const generated: string[] = [];
	for (const svc of collected) {
		const { content, included, skipped } = emitModule(svc, knownMethods, thrift);
		if (included.length === 0) {
			console.log(`  ${svc.className}: no methods present in linejs Thrift — skipping`);
			continue;
		}
		const dir = `${outRoot}/${shortDirName(svc.className)}`;
		const file = `${dir}/mod.ts`;
		console.log(
			`  ${svc.className} (${svc.endpoint}, type=${svc.reqType}): ` +
				`${included.length} method(s)${skipped.length > 0 ? `, skipped ${skipped.length} (no matching args/result)` : ""}`,
		);
		if (skipped.length > 0 && skipped.length <= 5) {
			console.log(`    skipped: ${skipped.join(", ")}`);
		}
		totalIncluded += included.length;
		totalSkipped += skipped.length;
		if (args.apply) {
			await Deno.mkdir(dir, { recursive: true });
			await Deno.writeTextFile(file, content);
			generated.push(file);
		}
	}

	console.log();
	console.log(`summary: ${totalIncluded} methods generated across ${collected.length} services, ` +
		`${totalSkipped} skipped (missing args/result in linejs/types)`);
	if (args.apply) {
		console.log(`wrote ${generated.length} module(s)`);
	} else {
		console.log(`(dry-run; pass --apply to write the modules)`);
	}
}

if (import.meta.main) {
	await main();
}
