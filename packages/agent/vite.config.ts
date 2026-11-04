import { defineConfig } from "vite-plus";

export default defineConfig({
	pack: {
		entry: {
			mod: "mod.ts",
			client: "client.ts",
			line_ai: "line_ai.ts",
		},
		dts: true,
		format: ["esm"],
		sourcemap: true,
	},
	test: {
		include: ["**/*.test.ts"],
		exclude: ["**/node_modules/**", "dist/**"],
		environment: "node",
	},
});
