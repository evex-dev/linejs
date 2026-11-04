import { defineConfig } from "vite-plus";

export default defineConfig({
	test: {
		include: ["**/*.test.ts"],
		exclude: ["**/node_modules/**", "dist/**"],
		environment: "node",
	},
	pack: {
		entry: {
			line_types: "line_types.ts",
			thrift: "thrift.ts",
		},
		dts: true,
		format: ["esm"],
		sourcemap: true,
	},
});
