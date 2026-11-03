import { defineConfig } from "vite-plus";

export default defineConfig({
	fmt: {
		semi: true,
		singleQuote: false,
		useTabs: true,
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
