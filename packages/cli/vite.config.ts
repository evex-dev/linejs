import { defineConfig } from "vite-plus";

export default defineConfig({
	pack: {
		entry: {
			line: "src/bin.ts",
		},
		dts: false,
		format: ["esm"],
		sourcemap: true,
	},
	test: {
		include: ["test/**/*.test.ts"],
		exclude: ["**/node_modules/**", "dist/**"],
		environment: "node",
	},
});
