import path from "node:path";
import { defineConfig } from "@rslib/core";

export default defineConfig({
	lib: [
		{
			dts: true,
			format: "esm",
			syntax: "es2021",
			source: {
				entry: {
					index: "./src/index.ts",
					cli: "./src/cli.ts",
				},
			},
		},
		{
			dts: true,
			format: "cjs",
			syntax: "es2021",
			source: {
				entry: {
					index: "./src/index.ts",
					cli: "./src/cli.ts",
				},
			},
		},
	],
	source: {
		exclude: ["./src/test"],
	},
});
