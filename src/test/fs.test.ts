import assert, { deepStrictEqual, strictEqual } from "assert";
import * as os from "os";
import * as pathLib from "path";
import { beforeAll, beforeEach, describe, it } from "vitest";
import { fs } from "../fs";

const baseDir = os.tmpdir() + "/foy-fs-test";
describe("fs", () => {
	beforeAll(async () => {
		if (fs.existsSync(baseDir)) {
			await fs.rmrf(baseDir);
		}
		assert.ok(!fs.existsSync(baseDir));
		console.log("baseDir", baseDir);
	});
	it("copy file", async () => {
		await fs.outputFile(`${baseDir}/test`, "aaa");
		await fs.copy(`${baseDir}/test`, `${baseDir}/test2`);
		const s = await fs.readFile(`${baseDir}/test`, "utf8");
		strictEqual(s, "aaa");
	});
	it("json", async () => {
		const o1 = { aa: 1 };
		fs.outputJsonSync(`${baseDir}/json/dir/1`, o1);
		deepStrictEqual(fs.readJsonSync(`${baseDir}/json/dir/1`), o1);

		const o2 = { aa: 2 };
		await fs.outputJson(`${baseDir}/json/dir/2`, o2);
		deepStrictEqual(await fs.readJson(`${baseDir}/json/dir/2`), o2);
	});
	it("copy dir", async () => {
		fs.outputFileSync(`${baseDir}/dir1/dir2/test`, "aaa");
		let s = await fs.readFile(`${baseDir}/dir1/dir2/test`, "utf8");
		strictEqual(s, "aaa");
		await fs.copy(`${baseDir}/dir1`, `${baseDir}/dir2`);
		s = await fs.readFile(`${baseDir}/dir2/dir2/test`, "utf8");
		strictEqual(s, "aaa");
		// override

		await fs.outputFile(`${baseDir}/dir1/dir2/test`, "aaa");
		s = await fs.readFile(`${baseDir}/dir2/dir2/test`, "utf8");
		strictEqual(s, "aaa");
		await fs.copy(`${baseDir}/dir1`, `${baseDir}/dir2`, { overwrite: false });
		await fs.copy(`${baseDir}/dir1`, `${baseDir}/dir2`, { overwrite: true });
		s = await fs.readFile(`${baseDir}/dir2/dir2/test`, "utf8");
		strictEqual(s, "aaa");
	});

	it("iter", async () => {
		await fs.outputFile(`${baseDir}/dir1/dir2/test`, "aaa");
		await fs.outputFile(`${baseDir}/dir1/test`, "bbb");
		let paths = [] as string[];
		await fs.iter(`${baseDir}/dir1`, (file, stat) => {
			paths.push(pathLib.relative(baseDir, file));
		});
		deepStrictEqual(paths.sort(), ["dir1/dir2", "dir1/dir2/test", "dir1/test"]);
		paths = [];
		await fs.iter(`${baseDir}/dir1`, (file, stat) => {
			file = pathLib.relative(baseDir, file);
			paths.push(file);
			if (file === "dir1/dir2") return true;
		});
		deepStrictEqual(paths.sort(), ["dir1/dir2", "dir1/test"]);
	});

	it("symlink copy", async () => {
		const symlinkDir = `${baseDir}/symlink_copy`;
		await fs.outputFile(`${symlinkDir}/file1`, "aa");
		await fs.outputFile(`${symlinkDir}/dir1/dir2/file1`, "aa");
		await fs.symlink(`${symlinkDir}/file1`, `${symlinkDir}/link1`);
		await fs.symlink(`${symlinkDir}/dir1`, `${symlinkDir}/linkdir1`);
		await fs.copy(`${symlinkDir}/link1`, `${symlinkDir}/copy/link1`);

		assert.ok(!(await fs.isSymbolicLink(`${symlinkDir}/copy/link1`)));

		await fs.copy(`${symlinkDir}/linkdir1`, `${symlinkDir}/copy/linkdir1`);

		assert.ok(!(await fs.isSymbolicLink(`${symlinkDir}/copy/linkdir1`)));
		assert.ok(await fs.exists(`${symlinkDir}/copy/linkdir1/dir2/file1`));
	});

	it("symlink rmrf", async () => {
		const symlinkDir = `${baseDir}/symlink_rmrf`;
		await fs.outputFile(`${symlinkDir}/file1`, "aa");
		await fs.outputFile(`${symlinkDir}/dir1/dir2/file1`, "aa");

		await fs.symlink(`${symlinkDir}/file1`, `${symlinkDir}/link1`);
		await fs.rmrf(`${symlinkDir}/link1`);
		assert.ok(
			await fs.exists(`${symlinkDir}/file1`),
			"await fs.exists(`${symlinkDir}/file1`)",
		);
		assert.ok(
			!(await fs.exists(`${symlinkDir}/link1`)),
			"await fs.exists(`${symlinkDir}/link1`)",
		);

		await fs.symlink(`${symlinkDir}/dir1`, `${symlinkDir}/linkdir1`);
		await fs.rmrf(`${symlinkDir}/linkdir1`);
		assert.ok(
			await fs.exists(`${symlinkDir}/dir1`),
			"await fs.exists(`${symlinkDir}/dir1`)",
		);
		assert.ok(
			!(await fs.exists(`${symlinkDir}/linkdir1`)),
			"await fs.exists(`${symlinkDir}/linkdir1`)",
		);
	});
});
