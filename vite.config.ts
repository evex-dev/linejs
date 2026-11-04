import { defineConfig } from "vite-plus";

// Lint/format configuration lives here only: `vp fmt` / `vp check` are run from
// the repository root and apply these settings to every workspace package.
export default defineConfig({
	fmt: {
		semi: true,
		singleQuote: false,
		useTabs: true,
		ignorePatterns: ["**/dist/**", "**/node_modules/**", "**/coverage/**", "resources/**"],
	},
	test: {
		include: ["scripts/**/*.test.ts"],
		exclude: ["**/node_modules/**"],
		environment: "node",
	},
});
