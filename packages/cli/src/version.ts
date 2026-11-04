import pkg from "../package.json" with { type: "json" };

/**
 * Version reported by `line --version` and the MCP server.
 *
 * Single-sourced from package.json so a release bump (the publish workflow
 * rewrites the manifest) never needs a second edit here.
 */
export const VERSION: string = pkg.version;
