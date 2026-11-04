import { chmod, readFile, writeFile } from "node:fs/promises";

const entry = new URL("../dist/line.mjs", import.meta.url);
let source = await readFile(entry, "utf8");

if (!source.startsWith("#!")) {
	source = `#!/usr/bin/env node\n${source}`;
	await writeFile(entry, source, "utf8");
}

await chmod(entry, 0o755).catch(() => {
	// Windows has no POSIX file modes; npm still creates the .cmd shim.
});
