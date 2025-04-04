#!/usr/bin/env node

import os from "os";
import pathLib from "path";
import cac from "cac";
import chalk from "chalk";
import { initDefaultCli } from "./default-cli";
import { fs } from "./fs";
import { logger } from "./logger";
import { getGlobalTaskManager } from "./task-manager";
import { Is } from "./utils";

export function runCli() {
	const { defaultCli, defaultHelpMsg, outputCompletion, taskArgs } =
		initDefaultCli();
	const taskCli = cac("foy");

	const taskManager = getGlobalTaskManager();
	taskManager.getTasks().forEach((t) => {
		const strict = taskManager.globalOptions.strict || t.strict;
		const cmd = taskCli.command(t.name, t.desc, {
			allowUnknownOptions: !strict,
		});
		if (t.optionDefs) {
			t.optionDefs.forEach((def) => cmd.option(...def));
		}
		cmd.action(async (...args) => {
			const options = args.pop();
			const { globalOptions } = taskManager;
			globalOptions.rawArgs = taskCli.rawArgs;
			globalOptions.options = options;
			await taskManager.run(t.name, {
				options,
				rawArgs: taskCli.rawArgs.slice(3),
			});
		});
	});

	taskCli.help((sections) => {
		if (!taskCli.matchedCommand) {
			const last = sections[sections.length - 1];
			const lines = last.body.split("\n");
			lines.pop();
			last.body = defaultHelpMsg;
		}
		console.log(
			sections
				.map((section) => {
					return section.title
						? `${section.title}:\n${section.body}`
						: section.body;
				})
				.join("\n\n"),
		);
		process.exit(0);
	});

	outputCompletion(taskCli);

	taskCli.on("command:*", () => {
		console.error(`error: Unknown command \`${taskCli.args.join(" ")}\`\n\n`);
		process.exit(1);
	});

	taskCli.parse([...taskArgs]);

	if (process.argv.length === 2) {
		taskCli.outputHelp();
	}
}

let timer: any;
export function deferRunCli() {
	if (timer) return;
	timer && clearTimeout(timer);
	timer = setTimeout(runCli);
}
