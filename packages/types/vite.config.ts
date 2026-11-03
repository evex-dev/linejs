import { defineConfig } from "vite-plus";

export default defineConfig({
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
