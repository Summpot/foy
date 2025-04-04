import { type ChildProcess, spawn } from "node:child_process";
import pathLib, { extname } from "node:path";
import cac from "cac";
import chalk from "chalk";
import { initDefaultCli } from "./default-cli";
import { fs } from "./fs";
import { logger } from "./logger";
import { getGlobalTaskManager } from "./task-manager";
import { Is } from "./utils";

const { foyFiles, registers, defaultCli } = initDefaultCli();
async function main() {
	const pkg = await fs.readJson("./package.json");
	const isESM = pkg.type === "module";
	const deps = { ...pkg.dependencies, ...pkg.devDependencies };
	const results: ChildProcess[] = [];
	for (const foyFile of foyFiles) {
		let executor = defaultCli.options.executor;
		if (!executor) {
			executor = "node";

			if ([".ts", ".cts", ".tsx", ".ctsx"].includes(extname(foyFile))) {
				if ("jiti" in deps) {
					executor = "jiti";
				} else if ("@swc-node/register" in deps) {
					if (isESM) {
						registers.push("@swc-node/register/esm-register");
					} else {
						registers.push("@swc-node/register");
					}
				} else if ("swc-node" in deps) {
					executor = "swc-node";
				} else if ("tsx" in deps) {
					executor = "tsx";
				} else if ("ts-node" in deps) {
					executor = isESM ? "ts-node-esm" : "ts-node";
				} else {
					logger.error("no tsx/ts-node/swc-node or @swc-node/register found");
					process.exit(1);
				}
			}
		}
		const args = [
			...registers.map((r) => `--${isESM ? "import" : "require"} ${r}`),
			foyFile,
			...process.argv.slice(2),
		];
		let NODE_OPTIONS = process.env.NODE_OPTIONS ?? "";
		[
			["--inspect", defaultCli.options.inspect],
			["--inspectBrk", defaultCli.options.inspectBrk],
		].map(([inspect, inspectVal]) => {
			if (inspectVal) {
				if (typeof inspectVal === "string") {
					inspect += `=${inspectVal}`;
				}
				NODE_OPTIONS += ` ${inspect}`;
			}
		});
		results.push(
			spawn(executor, args, {
				stdio: "inherit",
				shell: process.platform === "win32",
				cwd: process.cwd(),
				env: {
					...process.env,
					NODE_OPTIONS,
				},
			}),
		);
	}
	for (const p of results) {
		await new Promise<void>((resolve) => p.on("exit", () => resolve()));
		if (p.exitCode !== 0 && p.exitCode !== null) {
			process.exitCode = p.exitCode;
		}
	}
	// fix zombie process sometimes
	process.on("SIGINT", () => {
		for (const p of results) {
			p.kill(9);
		}
	});
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
