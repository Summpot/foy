import type { ChildProcess } from "child_process";
import pathLib from "path";
import { Stream, Writable } from "stream";
import {
	type Options as ExecaOptions,
	type Result,
	type ResultPromise,
	execa,
} from "execa";
import { fs, type WatchDirOptions } from "./fs";
import { logger as _logger, logger } from "./logger";
import { DefaultLogFile, Is, sleep } from "./utils";
const shellParser = require("shell-parser");
export { execa };

function _exec(cmd: string, options?: ExecaOptions) {
	const [file, ...args] = shellParser(cmd);
	return execa(file, args, {
		stdio: "inherit",
		...options,
	});
}
export function exec(
	command: string,
	options?: ExecaOptions,
): ResultPromise<ExecaOptions>;
export function exec(
	commands: string[],
	options?: ExecaOptions,
): Promise<Result<ExecaOptions>[]>;
export function exec(commands: string | string[], options?: ExecaOptions): any {
	if (Is.str(commands)) {
		return _exec(commands, options);
	}

	const rets: Result<ExecaOptions>[] = [];
	let retsP: Promise<Result<ExecaOptions>[]> = Promise.resolve(null as any);
	for (const cmd of commands) {
		retsP = retsP.then(() => {
			return _exec(cmd, options).then((r) => {
				rets.push(r);
				return rets;
			});
		});
	}
	return retsP;
}
export const spawn = execa;

export class ShellContext {
	private _cwdStack = [process.cwd()];
	private _env: { [k: string]: string | undefined } = {};
	logCommand = false;
	sleep = sleep;
	/**
	 * get current word directory
	 */
	get cwd() {
		return this._cwdStack[this._cwdStack.length - 1];
	}
	protected _logger = logger;
	private readonly _process: {
		current: ChildProcess | null;
	} = { current: null };
	/**
	 * change work directory
	 * @param dir
	 */
	cd(dir: string) {
		this._cwdStack[this._cwdStack.length - 1] = pathLib.resolve(
			this._cwdStack[this._cwdStack.length - 1],
			dir,
		);
		return this;
	}
	/**
	 * like pushd in shell
	 * @param dir
	 */
	pushd(dir: string) {
		this._cwdStack.push(
			pathLib.resolve(this._cwdStack[this._cwdStack.length - 1], dir),
		);
		return this;
	}
	/**
	 * like popd in shell
	 */
	popd() {
		this._cwdStack.pop();
		return this;
	}
	/**
	 * execute command(s)
	 * @param command
	 * @param options
	 */
	exec(command: string, options?: ExecaOptions): ResultPromise<ExecaOptions>;
	exec(
		commands: string[],
		options?: ExecaOptions,
	): Promise<Result<ExecaOptions>[]>;
	exec(commands: string | string[], options?: ExecaOptions): any {
		this._logCmd(commands);
		const p = exec(commands as any, {
			cwd: this.cwd,
			env: {
				...process.env,
				...this._env,
			},
			stdio: "inherit",
			...options,
		});
		// tslint:disable-next-line:no-floating-promises
		this._process.current = p;
		return p;
	}
	/**
	 * exec (multi-line) cmd in *unix platforms,
	 * via `this.spawn('$SHELL', ['-i','-c', cmd])`
	 * @param cmd
	 * @param options
	 * @returns
	 */
	exec_unix(cmd: string, options?: ExecaOptions) {
		return this.spawn("$SHELL", ["-i", "-c", cmd]);
	}
	/**
	 * spawn file
	 * @param file
	 * @param args
	 * @param options
	 */
	spawn(
		file: string,
		args: string[] = [],
		options?: ExecaOptions,
	): ResultPromise<ExecaOptions> {
		const command =
			file + " " + args.map((a) => `"${a.replace(/"/g, '\\"')}"`).join(" ");
		this._logCmd(command);
		const p = spawn(file, args, {
			cwd: this.cwd,
			env: {
				...process.env,
				...this._env,
			},
			stdio: "inherit",
			...options,
		});
		// tslint:disable-next-line:no-floating-promises
		p.catch((err) => {
			this._logger.error("Exec failed: ", command);
			throw err;
		});
		this._process.current = p;
		p.finally(() => {
			this._process.current = null;
		});
		return p;
	}
	/**
	 * set/get/delete env
	 * set: ctx.env('key', 'val')
	 * set: ctx.env('key=val')
	 * delete: ctx.env('key', void 0)
	 * @param key
	 */
	env(key: string): this;
	env(key: string, val: string | undefined): this;
	env(key: string, val?: string): string | undefined | this {
		if (arguments.length === 1) {
			[key, val] = key.split("=", 2);
		}
		if (Is.defined(val)) {
			this._env[key] = val;
		} else {
			delete this._env[key];
		}
		return this;
	}
	/**
	 * restart processes when file changes
	 * @example
	 *  ctx.monitor('./src', 'tsc')
	 *  ctx.monitor('./src', 'webpack')
	 *  ctx.monitor('./src', 'foy watch')
	 *  ctx.monitor('./src', ['rm -rf dist', 'foy watch'])
	 *  ctx.monitor('./src', async p => {
	 *    await fs.rmrf('dist')
	 *    p.current = ctx.exec('webpack serve')
	 *  })
	 */
	monitor(
		dir: string,
		run: ((p: { current: ChildProcess | null }) => void) | string | string[],
		options: WatchDirOptions & {
			ignore?: (event: string, file: string | null) => boolean;
		} = {},
	) {
		const p = this._process;
		if (typeof run === "string") {
			const cmd = run;
			run = (p) => (p.current = this.exec(cmd));
		}
		if (Array.isArray(run)) {
			const cmds = run;
			run = async (p) => {
				for (const cmd of cmds.slice(0, -1)) {
					await this.exec(cmd);
				}
				p.current = this.exec(cmds.slice(-1)[0]);
			};
		}
		fs.watchDir(dir, options, async (event, file) => {
			if (options.ignore && options.ignore(event, file)) {
				return;
			}
			while (p.current && !p.current.killed && p.current.exitCode === null) {
				p.current.kill();
				await sleep(100);
			}
			run(p);
		});
		run(p);
	}
	/**
	 * reset env to default
	 */
	resetEnv() {
		this._env = {};
		return this;
	}
	private _logCmd(cmd: string | string[]) {
		if (this.logCommand) {
			let env = Object.keys(this._env)
				.map((k) => `${k}=${this._env[k] || ""}`)
				.join(" ");
			if (env) {
				env += " ";
			}
			cmd = Array.isArray(cmd) ? cmd : [cmd];
			cmd.forEach((cmd) => {
				this._logger.info(`$ ${env}${cmd}`);
			});
		}
	}
}

export async function shell(callback: (ctx: ShellContext) => Promise<any>) {
	return callback(new ShellContext());
}
