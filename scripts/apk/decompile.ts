/**
 * @description Drive apktool (smali) and jadx (Java) decompilation of an APK.
 *
 * apktool gives stable smali output suitable for *programmatic* pattern matching
 * (e.g. Thrift TField call sites), while jadx gives human-readable Java for
 * inspection. The two are produced into sibling directories so downstream tools
 * (extract_thrift.ts) can pick whichever surface is convenient.
 *
 * Usage:
 *   deno run -A scripts/apk/decompile.ts --apk <path> [--out <dir>]
 *                                         [--apktool-only | --jadx-only]
 *                                         [--threads N]
 *
 *   --apk <path>     APK file (typically base.apk)
 *   --out <dir>      Output root. Default: <workspace>/decompiled/<apk-stem>/
 *                    Inside: smali/  java/  (each is one of the tool's roots)
 *   --apktool-only   Skip jadx
 *   --jadx-only      Skip apktool
 *   --threads N      jadx thread count (default = host CPU count)
 *
 * The two tools run concurrently when both are requested. Stdout/stderr are
 * streamed line-by-line with a per-tool prefix so the combined log is readable.
 *
 * The script resolves apktool.jar / jadx.bat by walking parents of this file
 * looking for a `bin/` directory — i.e. the android-reverse workspace root.
 * Override via env vars APKTOOL_JAR / JADX_BIN if you place them elsewhere.
 */
import {
	fromFileUrl,
	resolve as pathResolve,
} from "https://deno.land/std@0.224.0/path/mod.ts";
import { exists } from "https://deno.land/std@0.224.0/fs/exists.ts";
import { TextLineStream } from "https://deno.land/std@0.224.0/streams/text_line_stream.ts";

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
				Deno.exit(0);
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

/** Walk up from `start` looking for a directory that contains a child named `marker`. */
async function findUpDir(
	start: string,
	marker: string,
): Promise<string | null> {
	let dir = start;
	while (true) {
		if (await exists(`${dir}/${marker}`, { isDirectory: true })) return dir;
		const parent = pathResolve(dir, "..");
		if (parent === dir) return null;
		dir = parent;
	}
}

interface Toolchain {
	apktoolJar: string;
	jadxBin: string;
	workspaceRoot: string;
}

async function resolveToolchain(): Promise<Toolchain> {
	const here = pathResolve(fromFileUrl(import.meta.url), "..");
	const workspaceRoot = await findUpDir(here, "bin");
	if (!workspaceRoot) {
		throw new Error("could not find workspace root (no `bin/` ancestor)");
	}
	const apktoolJar = Deno.env.get("APKTOOL_JAR") ??
		`${workspaceRoot}/bin/apktool.jar`;
	const jadxBin = Deno.env.get("JADX_BIN") ??
		`${workspaceRoot}/bin/jadx/bin/jadx.bat`;
	for (const [name, path] of [["apktool.jar", apktoolJar], ["jadx", jadxBin]]) {
		if (!(await exists(path))) {
			throw new Error(`${name} not found at ${path}`);
		}
	}
	return { apktoolJar, jadxBin, workspaceRoot };
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
	const proc = new Deno.Command(cmd, {
		args,
		stdout: "piped",
		stderr: "piped",
		env: opts.env,
	}).spawn();

	const pipe = async (
		stream: ReadableStream<Uint8Array>,
		channel: "stdout" | "stderr",
	) => {
		const lines = stream
			.pipeThrough(new TextDecoderStream("utf-8", { fatal: false }))
			.pipeThrough(new TextLineStream());
		for await (const line of lines) {
			const sink = channel === "stderr" ? console.error : console.log;
			sink(`[${prefix}] ${line}`);
		}
	};

	await Promise.all([
		pipe(proc.stdout, "stdout"),
		pipe(proc.stderr, "stderr"),
	]);

	const status = await proc.status;
	const dt = ((performance.now() - t0) / 1000).toFixed(1);
	console.log(`[${prefix}] exit=${status.code}  ${dt}s`);
	return status.code;
}

async function runApktool(
	toolchain: Toolchain,
	apk: string,
	outDir: string,
): Promise<number> {
	// apktool d <apk> -o <out> --no-res --force
	//   --no-res: skip resource decoding (we only need smali for code analysis)
	//   --force:  overwrite existing output
	return runStreamed("apktool", "java", [
		"-jar",
		toolchain.apktoolJar,
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
	return runStreamed("jadx", toolchain.jadxBin, [
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
	const args = parseArgs(Deno.args);
	const toolchain = await resolveToolchain();
	const apkPath = pathResolve(args.apk);
	if (!(await exists(apkPath))) {
		console.error(`apk not found: ${apkPath}`);
		Deno.exit(2);
	}

	const apkName = apkPath.split(/[/\\]/).pop() ?? "apk";
	const stem = apkName.replace(/\.apk$/i, "");
	const outRoot = args.out
		? pathResolve(args.out)
		: pathResolve(toolchain.workspaceRoot, "decompiled", stem);
	const smaliRoot = `${outRoot}/smali`;
	const javaRoot = `${outRoot}/java`;

	await Deno.mkdir(outRoot, { recursive: true });

	console.log(`apk:       ${apkPath}`);
	console.log(`out:       ${outRoot}`);
	console.log(`workspace: ${toolchain.workspaceRoot}`);

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

	Deno.exit(failed === 0 ? 0 : 1);
}
