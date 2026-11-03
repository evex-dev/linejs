/**
 * @description Drive apktool (smali) and jadx (Java) decompilation of an APK.
 *
 * apktool gives stable smali output suitable for *programmatic* pattern matching
 * (e.g. Thrift TField call sites), while jadx gives human-readable Java for
 * inspection. The two are produced into sibling directories so downstream tools
 * (extract_thrift.ts) can pick whichever surface is convenient.
 *
 * Usage:
 *   node scripts/apk/decompile.ts --apk <path> [--out <dir>]
 *                                 [--apktool-only | --jadx-only]
 *                                 [--threads N]
 *
 *   --apk <path>     APK file (typically base.apk)
 *   --out <dir>      Output root. Default: <linejs>/apks/decompiled/<apk-stem>/
 *                    Inside: smali/  java/  (each is one of the tool's roots)
 *   --apktool-only   Skip jadx
 *   --jadx-only      Skip apktool
 *   --threads N      jadx thread count (default = host CPU count)
 *
 * The two tools run concurrently when both are requested. Stdout/stderr are
 * streamed line-by-line with a per-tool prefix so the combined log is readable.
 *
 * Tool resolution, in order:
 *   1. env `APKTOOL_JAR` / `JADX_BIN` — an explicit path always wins.
 *   2. a `bin/` ancestor directory holding `apktool.jar` / `jadx/bin/jadx[.bat]`
 *      — the original android-reverse workspace layout.
 *   3. `apktool` / `jadx` on PATH — how the distro packages ship them
 *      (Arch: `android-apktool`, `jadx`).
 *
 * Only the tool that is actually going to run has to resolve: `--apktool-only`
 * does not require jadx to be installed.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve as pathResolve } from "node:path";
import { createInterface } from "node:readline";
import type { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));

function isDirectory(path: string): boolean {
	try {
		return statSync(path).isDirectory();
	} catch {
		return false;
	}
}

function isFile(path: string): boolean {
	try {
		return statSync(path).isFile();
	} catch {
		return false;
	}
}

interface Args {
	apk: string;
	out: string;
	apktoolOnly: boolean;
	jadxOnly: boolean;
	threads: number;
}

function parseArgs(argv: string[]): Args {
	const out: Args = {
		apk: "",
		out: "",
		apktoolOnly: false,
		jadxOnly: false,
		threads: navigator.hardwareConcurrency ?? 4,
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		switch (a) {
			case "--apk":
				out.apk = argv[++i];
				break;
			case "--out":
				out.out = argv[++i];
				break;
			case "--apktool-only":
				out.apktoolOnly = true;
				break;
			case "--jadx-only":
				out.jadxOnly = true;
				break;
			case "--threads":
				out.threads = Number(argv[++i]);
				break;
			case "--help":
			case "-h":
				console.log(import.meta.url);
				process.exit(0);
			default:
				throw new Error(`unknown arg: ${a}`);
		}
	}
	if (!out.apk) throw new Error("--apk is required");
	if (out.apktoolOnly && out.jadxOnly) {
		throw new Error("--apktool-only and --jadx-only are mutually exclusive");
	}
	return out;
}

/** Walk up from `start` looking for a directory that contains a child named
 *  `marker`. `kind` distinguishes the `bin/` workspace probe (a directory)
 *  from the `pnpm-workspace.yaml` repo-root probe (a file) — without it the
 *  repo-root walk runs off the end and lands on `/`. */
async function findUpDir(
	start: string,
	marker: string,
	kind: "dir" | "file" = "dir",
): Promise<string | null> {
	let dir = start;
	while (true) {
		const found = kind === "dir" ? isDirectory(`${dir}/${marker}`) : isFile(`${dir}/${marker}`);
		if (found) return dir;
		const parent = pathResolve(dir, "..");
		if (parent === dir) return null;
		dir = parent;
	}
}

/** How to invoke one tool: a program plus the arguments that must precede the
 *  tool's own. `java -jar apktool.jar` and a packaged `apktool` launcher differ
 *  only in this prefix, so callers can stay ignorant of which one we found. */
export interface ToolInvocation {
	cmd: string;
	prefixArgs: string[];
	/** Human-readable provenance, for the log line. */
	source: string;
}

export interface Toolchain {
	apktool: ToolInvocation | null;
	jadx: ToolInvocation | null;
}

/** `exists()` that answers "no" instead of throwing. Probing a speculative
 *  path like `<root>/bin/jadx/bin/jadx` can traverse *through* a regular file
 *  (`/bin/jadx` is the packaged binary on Arch), and stat then fails with
 *  ENOTDIR rather than reporting absence. */
async function safeExists(path: string): Promise<boolean> {
	try {
		return existsSync(path);
	} catch {
		return false;
	}
}

/** Is `name` an executable we can reach through PATH? */
async function onPath(name: string): Promise<boolean> {
	// `--version` is the one flag both apktool and jadx accept; apktool
	// exits non-zero on an unknown flag, so only spawn success matters.
	const result = spawnSync(name, ["--version"], { stdio: "ignore" });
	return result.error === undefined;
}

async function resolveApktool(workspaceRoot: string | null): Promise<ToolInvocation | null> {
	const fromEnv = process.env.APKTOOL_JAR;
	if (fromEnv) {
		if (!(await safeExists(fromEnv))) {
			throw new Error(`APKTOOL_JAR is set but not found at ${fromEnv}`);
		}
		return {
			cmd: "java",
			prefixArgs: ["-jar", fromEnv],
			source: "APKTOOL_JAR",
		};
	}
	if (workspaceRoot) {
		const jar = `${workspaceRoot}/bin/apktool.jar`;
		if (await safeExists(jar)) {
			return { cmd: "java", prefixArgs: ["-jar", jar], source: jar };
		}
	}
	if (await onPath("apktool")) {
		return { cmd: "apktool", prefixArgs: [], source: "PATH" };
	}
	return null;
}

async function resolveJadx(workspaceRoot: string | null): Promise<ToolInvocation | null> {
	const fromEnv = process.env.JADX_BIN;
	if (fromEnv) {
		if (!(await safeExists(fromEnv))) {
			throw new Error(`JADX_BIN is set but not found at ${fromEnv}`);
		}
		return { cmd: fromEnv, prefixArgs: [], source: "JADX_BIN" };
	}
	if (workspaceRoot) {
		for (const rel of ["bin/jadx/bin/jadx", "bin/jadx/bin/jadx.bat"]) {
			const p = `${workspaceRoot}/${rel}`;
			if (await safeExists(p)) return { cmd: p, prefixArgs: [], source: p };
		}
	}
	if (await onPath("jadx")) {
		return { cmd: "jadx", prefixArgs: [], source: "PATH" };
	}
	return null;
}

/** Resolve only the tools that are going to be used. `need` says which. */
export async function resolveToolchain(need: {
	apktool: boolean;
	jadx: boolean;
}): Promise<Toolchain> {
	const here = scriptDir;
	// A `bin/` hit at the filesystem root is `/bin`, not a checkout — ignore it.
	const found = await findUpDir(here, "bin");
	const workspaceRoot = found === null || found === pathResolve(found, "..") ? null : found;
	const apktool = need.apktool ? await resolveApktool(workspaceRoot) : null;
	const jadx = need.jadx ? await resolveJadx(workspaceRoot) : null;
	if (need.apktool && !apktool) {
		throw new Error(
			"apktool not found: set APKTOOL_JAR, or install it on PATH (Arch: `pacman -S --needed base-devel && yay -S android-apktool`)",
		);
	}
	if (need.jadx && !jadx) {
		throw new Error("jadx not found: set JADX_BIN, or install it on PATH (Arch: `pacman -S jadx`)");
	}
	return { apktool, jadx };
}

/** Default decompile root for an APK, alongside the APKs themselves so a
 *  single ignore rule (`apks/`) keeps multi-GB smali trees out of git. */
export function defaultDecompileRoot(linejsRoot: string, apkPath: string): string {
	const apkName = apkPath.split(/[/\\]/).pop() ?? "apk";
	const stem = apkName.replace(/\.apk$/i, "");
	return `${linejsRoot}/apks/decompiled/${stem}`;
}

/** Spawn a process and stream its stdout/stderr line-by-line with a prefix. */
async function runStreamed(
	prefix: string,
	cmd: string,
	args: string[],
	opts: { env?: Record<string, string> } = {},
): Promise<number> {
	const t0 = performance.now();
	console.log(`[${prefix}] $ ${cmd} ${args.join(" ")}`);
	const proc = spawn(cmd, args, {
		env: opts.env ? { ...process.env, ...opts.env } : process.env,
		stdio: ["ignore", "pipe", "pipe"],
	});

	const pipe = async (stream: Readable, channel: "stdout" | "stderr") => {
		const lines = createInterface({ input: stream, crlfDelay: Infinity });
		for await (const line of lines) {
			const sink = channel === "stderr" ? console.error : console.log;
			sink(`[${prefix}] ${line}`);
		}
	};

	const closed = new Promise<number>((resolvePromise, reject) => {
		proc.on("error", reject);
		proc.on("close", (code) => resolvePromise(code ?? 1));
	});

	await Promise.all([pipe(proc.stdout!, "stdout"), pipe(proc.stderr!, "stderr")]);

	const code = await closed;
	const dt = ((performance.now() - t0) / 1000).toFixed(1);
	console.log(`[${prefix}] exit=${code}  ${dt}s`);
	return code;
}

async function runApktool(toolchain: Toolchain, apk: string, outDir: string): Promise<number> {
	// apktool d <apk> -o <out> --no-res --force
	//   --no-res: skip resource decoding (we only need smali for code analysis)
	//   --force:  overwrite existing output
	const tool = toolchain.apktool!;
	return runStreamed("apktool", tool.cmd, [
		...tool.prefixArgs,
		"d",
		apk,
		"-o",
		outDir,
		"--no-res",
		"--force",
	]);
}

async function runJadx(
	toolchain: Toolchain,
	apk: string,
	outDir: string,
	threads: number,
): Promise<number> {
	// jadx -d <out> -j <threads> --no-res --show-bad-code <apk>
	//   --no-res:        skip resources
	//   --show-bad-code: emit decompile-failed methods as comments rather than
	//                    dropping them silently (useful for completeness)
	const tool = toolchain.jadx!;
	return runStreamed("jadx", tool.cmd, [
		...tool.prefixArgs,
		"-d",
		outDir,
		"-j",
		String(threads),
		"--no-res",
		"--show-bad-code",
		apk,
	]);
}

if (import.meta.main) {
	const args = parseArgs(process.argv.slice(2));
	const toolchain = await resolveToolchain({
		apktool: !args.jadxOnly,
		jadx: !args.apktoolOnly,
	});
	const apkPath = pathResolve(args.apk);
	if (!existsSync(apkPath)) {
		console.error(`apk not found: ${apkPath}`);
		process.exit(2);
	}

	const linejsRoot = await findUpDir(scriptDir, "pnpm-workspace.yaml", "file");
	if (!linejsRoot && !args.out) {
		console.error("could not locate the linejs root (no pnpm-workspace.yaml ancestor); pass --out");
		process.exit(2);
	}
	const outRoot = args.out ? pathResolve(args.out) : defaultDecompileRoot(linejsRoot!, apkPath);
	const smaliRoot = `${outRoot}/smali`;
	const javaRoot = `${outRoot}/java`;

	await mkdir(outRoot, { recursive: true });

	console.log(`apk:       ${apkPath}`);
	console.log(`out:       ${outRoot}`);
	if (toolchain.apktool) {
		console.log(`apktool:   ${toolchain.apktool.source}`);
	}
	if (toolchain.jadx) console.log(`jadx:      ${toolchain.jadx.source}`);

	const tasks: Promise<{ name: string; code: number }>[] = [];
	if (!args.jadxOnly) {
		tasks.push(
			runApktool(toolchain, apkPath, smaliRoot).then((code) => ({
				name: "apktool",
				code,
			})),
		);
	}
	if (!args.apktoolOnly) {
		tasks.push(
			runJadx(toolchain, apkPath, javaRoot, args.threads).then((code) => ({
				name: "jadx",
				code,
			})),
		);
	}

	const results = await Promise.all(tasks);
	let failed = 0;
	for (const r of results) {
		if (r.code !== 0) failed++;
		console.log(`summary: ${r.name} -> ${r.code}`);
	}
	console.log(`smali root: ${smaliRoot}`);
	console.log(`java root:  ${javaRoot}`);

	process.exit(failed === 0 ? 0 : 1);
}
