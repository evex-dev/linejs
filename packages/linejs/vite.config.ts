import { defineConfig } from "vite-plus";

export default defineConfig({
	fmt: {
		semi: true,
		singleQuote: false,
		useTabs: true,
	},
	pack: {
		entry: {
			"client/mod": "client/mod.ts",
			"base/mod": "base/mod.ts",
			"client/features/call/mod": "client/features/call/mod.ts",
			"base/storage/mod": "base/storage/mod.ts",
			"base/thrift/mod": "base/thrift/mod.ts",
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
