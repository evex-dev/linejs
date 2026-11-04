/**
 * @description Guard that `packages/types/line_types.ts` and
 *              `packages/linejs/base/thrift/readwrite/struct.ts` are exactly
 *              what the generators produce from `packages/types/thrift.ts`.
 *
 * Both files are generated but tracked, so nothing stops a hand edit from
 * landing in one of them. That used to happen: `Pb1_C13097n4.keyData` was
 * widened to `string | Buffer` by hand, the generator did not know the field
 * was Thrift `binary`, and the next APK sync silently reverted it — taking
 * E2EE key registration out of the type check with it. struct.ts had drifted the
 * other way and was missing a writer the schema had gained.
 *
 * A regeneration that is not a no-op means the schema and the committed
 * artefacts disagree; either re-run the generators or (if the difference is
 * intentional) teach the generators to produce it.
 */
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assert, test } from "vite-plus/test";
import { main as genTypedef } from "./gen_typedef.ts";
import { main as genStruct } from "./gen_struct.ts";
import { Thrift } from "../../packages/types/thrift.ts";

const linejsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** Format `paths` with the repo's own Vite+ formatter settings (tabs, double
 *  quotes, semicolons) from the root vite.config.ts. The generators emit
 *  deliberately sloppy source and the pipeline formats afterwards, so the
 *  committed files can only be compared post-fmt. `vp` runs from
 *  `packages/linejs` so relative paths keep their usual meaning; the fmt
 *  settings themselves come from the workspace root. */
async function vpFmt(paths: string[]): Promise<void> {
	const result = spawnSync(
		process.platform === "win32" ? "pnpm.cmd" : "pnpm",
		["exec", "vp", "fmt", ...paths, "--write"],
		{
			cwd: resolve(linejsRoot, "packages/linejs"),
			encoding: "utf8",
		},
	);
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(`vp fmt failed: ${result.stderr ?? ""}`);
	}
}

test("regenerating the Thrift artefacts on a clean tree is a no-op", async () => {
	const tmp = await mkdtemp(join(linejsRoot, ".regen-"));
	try {
		const genTypes = join(tmp, "line_types.ts");
		const genWriters = join(tmp, "struct.ts");

		genTypedef(Thrift as Parameters<typeof genTypedef>[0], genTypes);
		genStruct(Thrift as Parameters<typeof genStruct>[0], genWriters);
		await vpFmt([genTypes, genWriters]);

		for (const [generated, committed] of [
			[genTypes, join(linejsRoot, "packages/types/line_types.ts")],
			[genWriters, join(linejsRoot, "packages/linejs/base/thrift/readwrite/struct.ts")],
		]) {
			const normalizeNewlines = (text: string) => text.replaceAll("\r\n", "\n");
			assert.deepEqual(
				normalizeNewlines(await readFile(generated, "utf8")),
				normalizeNewlines(await readFile(committed, "utf8")),
				`${committed} differs from what the generators produce — re-run\n` +
					`  node scripts/thrift/gen_typedef.ts\n` +
					`  node scripts/thrift/gen_struct.ts\n` +
					`then \`pnpm exec vp fmt\`, or teach the generator to emit the hand edit.`,
			);
		}
	} finally {
		await rm(tmp, { recursive: true, force: true });
	}
});

test("thrift.ts binary markers survive into both generated artefacts", async () => {
	// The regression that motivated the marker: a Thrift `binary` field is
	// ttype STRING on the wire, so nothing but this flag distinguishes it.
	const binaryFields = Object.entries(Thrift)
		.filter(([, v]) => Array.isArray(v))
		.flatMap(([name, v]) =>
			(v as Array<{ name: string; binary?: boolean }>)
				.filter((f) => f.binary)
				.map((f) => `${name}.${f.name}`),
		);
	assert.isOk(binaryFields.length > 0, "expected at least one binary field declared in thrift.ts");

	const types = await readFile(join(linejsRoot, "packages/types/line_types.ts"), "utf8");
	assert.isOk(types.includes("keyData: string | Buffer;"));

	const writers = await readFile(
		join(linejsRoot, "packages/linejs/base/thrift/readwrite/struct.ts"),
		"utf8",
	);
	assert.isOk(writers.includes('import type { Buffer } from "node:buffer";'));
	assert.isOk(writers.includes("param.keyData as string | Buffer | undefined"));
	// Binary *containers* deliberately carry no cast: NestedArray's list/set/map
	// arms end in `unknown[]`, so the element type is unconstrained, while the
	// scalar arm is `string | Buffer | undefined` and PartialDeep breaks Buffer
	// assignability. If someone narrows those arms, the type check will fail
	// here rather than in a generated file nobody reads.
	assert.isOk(writers.includes("[11, param.chunks]"));
	assert.isOk(writers.includes("[11, param.encryptedSharedKeys]"));
});
