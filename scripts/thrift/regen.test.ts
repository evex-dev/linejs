/**
 * @description Guard that `packages/types/line_types.ts` and
 *              `packages/linejs/base/thrift/readwrite/struct.ts` are exactly
 *              what the generators produce from `packages/types/thrift.ts`.
 *
 * Both files are generated but tracked, so nothing stops a hand edit from
 * landing in one of them. That used to happen: `Pb1_C13097n4.keyData` was
 * widened to `string | Buffer` by hand, the generator did not know the field
 * was Thrift `binary`, and the next APK sync silently reverted it — taking
 * E2EE key registration out of `deno check` with it. struct.ts had drifted the
 * other way and was missing a writer the schema had gained.
 *
 * A regeneration that is not a no-op means the schema and the committed
 * artefacts disagree; either re-run the generators or (if the difference is
 * intentional) teach the generators to produce it.
 */
import { assertEquals } from "@std/assert";
import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts";
import { main as genTypedef } from "./gen_typedef.ts";
import { main as genStruct } from "./gen_struct.ts";
import { Thrift } from "../../packages/types/thrift.ts";

const linejsRoot = fromFileUrl(import.meta.resolve("../../"));

/** Format `paths` with the repo's own `deno fmt` settings. The generators emit
 *  deliberately sloppy source and the pipeline formats afterwards, so the
 *  committed files can only be compared post-fmt. The scratch files live under
 *  the repo root so `deno fmt` picks up the same deno.json the real run uses. */
async function denoFmt(paths: string[]): Promise<void> {
	const cmd = new Deno.Command(Deno.execPath(), {
		args: ["fmt", ...paths],
		stdout: "null",
		stderr: "piped",
	});
	const { code, stderr } = await cmd.output();
	if (code !== 0) {
		throw new Error(`deno fmt failed: ${new TextDecoder().decode(stderr)}`);
	}
}

Deno.test("regenerating the Thrift artefacts on a clean tree is a no-op", async () => {
	const tmp = await Deno.makeTempDir({ dir: linejsRoot, prefix: ".regen-" });
	try {
		const genTypes = `${tmp}/line_types.ts`;
		const genWriters = `${tmp}/struct.ts`;

		genTypedef(Thrift as Parameters<typeof genTypedef>[0], genTypes);
		genStruct(Thrift as Parameters<typeof genStruct>[0], genWriters);
		await denoFmt([genTypes, genWriters]);

		for (
			const [generated, committed] of [
				[genTypes, `${linejsRoot}packages/types/line_types.ts`],
				[
					genWriters,
					`${linejsRoot}packages/linejs/base/thrift/readwrite/struct.ts`,
				],
			]
		) {
			assertEquals(
				await Deno.readTextFile(generated),
				await Deno.readTextFile(committed),
				`${committed} differs from what the generators produce — re-run\n` +
					`  deno run -A --allow-write scripts/thrift/gen_typedef.ts\n` +
					`  deno run -A --allow-write scripts/thrift/gen_struct.ts\n` +
					`then deno fmt, or teach the generator to emit the hand edit.`,
			);
		}
	} finally {
		await Deno.remove(tmp, { recursive: true });
	}
});

Deno.test("thrift.ts binary markers survive into both generated artefacts", async () => {
	// The regression that motivated the marker: a Thrift `binary` field is
	// ttype STRING on the wire, so nothing but this flag distinguishes it.
	const binaryFields = Object.entries(Thrift)
		.filter(([, v]) => Array.isArray(v))
		.flatMap(([name, v]) =>
			(v as Array<{ name: string; binary?: boolean }>)
				.filter((f) => f.binary)
				.map((f) => `${name}.${f.name}`)
		);
	assertEquals(
		binaryFields.length > 0,
		true,
		"expected at least one binary field declared in thrift.ts",
	);

	const types = await Deno.readTextFile(
		`${linejsRoot}packages/types/line_types.ts`,
	);
	assertEquals(types.includes("keyData: string | Buffer;"), true);

	const writers = await Deno.readTextFile(
		`${linejsRoot}packages/linejs/base/thrift/readwrite/struct.ts`,
	);
	assertEquals(
		writers.includes('import type { Buffer } from "node:buffer";'),
		true,
	);
	assertEquals(
		writers.includes("param.keyData as string | Buffer | undefined"),
		true,
	);
	// Binary *containers* deliberately carry no cast: NestedArray's list/set/map
	// arms end in `unknown[]`, so the element type is unconstrained, while the
	// scalar arm is `string | Buffer | undefined` and PartialDeep breaks Buffer
	// assignability. If someone narrows those arms, deno check will fail here
	// rather than in a generated file nobody reads.
	assertEquals(writers.includes("[11, param.chunks]"), true);
	assertEquals(writers.includes("[11, param.encryptedSharedKeys]"), true);
});
