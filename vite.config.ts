import { defineConfig } from "vite-plus";

export default defineConfig({
	fmt: {
		semi: true,
		singleQuote: false,
		useTabs: true,
	},
	test: {
		include: ["scripts/**/*.test.ts"],
		exclude: ["**/node_modules/**"],
		environment: "node",
	},
});
