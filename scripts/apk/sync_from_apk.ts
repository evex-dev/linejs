/**
 * @description End-to-end "drop a LINE APK, refresh linejs's Thrift schema."
 *
 * This is the user-facing pipeline. It chains:
 *
 *   1. apktool decompile (smali only — jadx output is optional, for humans)
 *   2. extract Thrift type defs from smali → diff against linejs thrift.ts
 *      → apply additive diff + safe in-place rewrites (direct-name matches)
 *   3. regenerate packages/types/line_types.ts via gen_typedef.ts
 *   4. vp fmt + tsc check (sanity)
 *
 * Anything risky (Jaccard-only mismatches, enum value renames) is *reported*
 * but not applied — the user reviews the report and decides. This keeps the
 * pipeline both automatic and non-destructive: re-running it on a future
 * APK should always succeed, and never invalidate hand-written linejs code.
 *
 * Usage:
 *   node scripts/apk/sync_from_apk.ts --apk <path>
 *                                      [--out <decompile-dir>]
 *                                      [--skip-decompile]
 *                                      [--dry-run]
 *
 *   --apk <path>        APK to ingest. Use the base.apk extracted from an
 *                       APKMirror APK Bundle.
 *   --out <dir>         Where to put decompiled output (smali + java).
 *                       Defaults to <linejs>/apks/decompiled/<apk-stem>/.
 *   --skip-decompile    Reuse an existing smali tree at --out (saves the
 *                       expensive apktool run when re-iterating).
 *   --dry-run           Report what would change without modifying
 *                       packages/types/.
 *
 * Idempotence: re-running with the same APK produces zero diff (modulo any
 * Jaccard-only mismatches that were filtered out).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultDecompileRoot } from "./decompile.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));

interface Args {
	apk: string;
	out: string;
	skipDecompile: boolean;
	dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
	const out: Args = { apk: "", out: "", skipDecompile: false, dryRun: false };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		switch (a) {
			case "--apk":
				out.apk = argv[++i];
				break;
			case "--out":
				out.out = argv[++i];
				break;
			case "--skip-decompile":
				out.skipDecompile = true;
				break;
			case "--dry-run":
				out.dryRun = true;
				break;
			default:
				throw new Error(`unknown arg: ${a}`);
		}
	}
	if (!out.apk) throw new Error("--apk <path> is required");
	return out;
}

async function findUpDir(start: string, marker: string): Promise<string> {
	let dir = start;
	while (true) {
		if (existsSync(`${dir}/${marker}`)) return dir;
		const parent = pathResolve(dir, "..");
		if (parent === dir) throw new Error(`not found: ${marker}`);
		dir = parent;
	}
}

async function runStep(
	label: string,
	cmd: string,
	args: string[],
	opts: { cwd?: string } = {},
): Promise<void> {
	console.log(`\n=== ${label} ===`);
	console.log(`$ ${cmd} ${args.join(" ")}`);
	const result = spawnSync(cmd, args, {
		stdio: "inherit",
		cwd: opts.cwd,
	});
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(`${label} failed (exit ${result.status})`);
	}
}

if (import.meta.main) {
	const args = parseArgs(process.argv.slice(2));
	const linejsRoot = await findUpDir(scriptDir, "pnpm-workspace.yaml");

	const apkAbs = pathResolve(args.apk);
	const decompileOut = args.out
		? pathResolve(args.out)
		: defaultDecompileRoot(linejsRoot, apkAbs);
	const smaliDir = `${decompileOut}/smali`;

	console.log(`apk:            ${apkAbs}`);
	console.log(`decompile out:  ${decompileOut}`);
	console.log(`linejs root:    ${linejsRoot}`);

	const node = process.execPath;
	const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
	const packageRoot = pathResolve(linejsRoot, "packages/linejs");

	if (!args.skipDecompile) {
		await runStep(
			"decompile (apktool only)",
			node,
			[
				pathResolve(linejsRoot, "scripts/apk/decompile.ts"),
				"--apk",
				apkAbs,
				"--out",
				decompileOut,
				"--apktool-only",
			],
		);
	} else if (!existsSync(smaliDir)) {
		throw new Error(`--skip-decompile passed but ${smaliDir} doesn't exist`);
	}

	const servicesReport = `${decompileOut}/services.json`;
	await runStep(
		"extract Thrift service catalog (for RPC cross-reference)",
		node,
		[
			pathResolve(linejsRoot, "scripts/apk/extract_services.ts"),
			"--smali",
			smaliDir,
			"--report",
			servicesReport,
		],
	);

	// Iterate the schema extraction until the diff converges. Each --apply
	// pass can expose new mismatches (e.g. fields whose struct refs only
	// become resolvable after the referenced type has been added on the
	// previous pass), so a single pass isn't always enough.
	const baseFlags = [
		"--smali",
		smaliDir,
		"--services-report",
		servicesReport,
		"--report",
		`${decompileOut}/extract_report.json`,
	];
	if (args.dryRun) {
		await runStep(
			"extract Thrift diff (dry-run)",
			node,
			[
				pathResolve(linejsRoot, "scripts/apk/extract_thrift.ts"),
				...baseFlags,
			],
		);
	} else {
		// Iterate apply passes. Each pass can expose new pairings because
		// the previous pass added types or updated refs the matcher couldn't
		// see before. We converge when an apply pass writes NOTHING
		// (rewrites=0, adds=0).
		for (let pass = 1; pass <= 5; pass++) {
			console.log(`\n=== extract + apply Thrift diff (pass ${pass}) ===`);
			const applyArgs = [
				pathResolve(linejsRoot, "scripts/apk/extract_thrift.ts"),
				...baseFlags,
				"--apply",
				"--rewrite-mismatches",
			];
			console.log(`$ node ${applyArgs.join(" ")}`);
			const applyProc = spawnSync(node, applyArgs, {
				cwd: linejsRoot,
				encoding: "utf8",
			});
			if (applyProc.error) throw applyProc.error;
			const applyOut = `${applyProc.stdout ?? ""}${
				applyProc.stderr ?? ""
			}`;
			console.log(applyOut.split("\n").slice(-20).join("\n"));
			if (applyProc.status !== 0) {
				throw new Error(`extract_thrift failed (exit ${applyProc.status})`);
			}

			const adds =
				/enum value adds:\s+(\d+)[^]*?struct field adds:\s+(\d+)[^]*?new types:\s+(\d+)/m
					.exec(applyOut);
			const rewrites = /Rewrote\s+(\d+)\s+field/m.exec(applyOut);
			const addsZero = adds && adds[1] === "0" && adds[2] === "0" && adds[3] === "0";
			const rewritesZero = rewrites && rewrites[1] === "0";
			if (addsZero && rewritesZero) {
				console.log(`\nschema converged after pass ${pass}`);
				break;
			}
			if (pass === 5) console.warn(`\nschema did not converge in 5 passes`);
		}
	}

	if (args.dryRun) {
		console.log(`\n(dry-run — packages/types/ left untouched)`);
		process.exit(0);
	}

	await runStep(
		"regenerate line_types.ts",
		node,
		[pathResolve(linejsRoot, "scripts/thrift/gen_typedef.ts")],
		{ cwd: linejsRoot },
	);
	await runStep(
		"regenerate struct.ts (Thrift wire writers)",
		node,
		[pathResolve(linejsRoot, "scripts/thrift/gen_struct.ts")],
		{ cwd: linejsRoot },
	);
	// Format only what the previous two steps wrote. `vp fmt packages/linejs`
	// reformats every file that predates the current formatter settings, which
	// buries a two-file schema diff under an unrelated repo-wide reformat.
	await runStep("vp fmt (generated files)", pnpm, [
		"exec",
		"vp",
		"fmt",
		pathResolve(linejsRoot, "packages/types/thrift.ts"),
		pathResolve(linejsRoot, "packages/types/line_types.ts"),
		pathResolve(
			linejsRoot,
			"packages/linejs/base/thrift/readwrite/struct.ts",
		),
		"--write",
	], { cwd: packageRoot });
	await runStep("type check (entry point)", pnpm, [
		"exec",
		"tsc",
		"--noEmit",
	], { cwd: packageRoot });
	await runStep("package tests", pnpm, ["exec", "vp", "test"], {
		cwd: packageRoot,
	});

	console.log(`\n=== sync complete ===`);
	console.log(`Report: ${decompileOut}/extract_report.json`);
	console.log(
		`Review the report's mismatches.fieldMismatches / mismatches.enumMismatches arrays`,
	);
	console.log(
		`for entries that were *not* auto-applied (Jaccard-only matches and enum renames).`,
	);
}
