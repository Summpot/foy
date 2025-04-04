import * as path from "path";
import { beforeAll, beforeEach, describe, it } from "vitest";
import { expect } from "vitest";
import { exec } from "../exec";
import { fs } from "../fs";
import { task } from "../task";
import { hashAny } from "../utils";

describe("utils", () => {
	it("hashAny", () => {
		expect(hashAny("aa")).toBe("📝aa");
		expect(hashAny(1)).toBe("1");
		expect(hashAny(null)).toBe("null");
		expect(hashAny(undefined)).toBe("undefined");
		const fn = (f) => f;
		expect(hashAny(fn)).toBe(hashAny(fn));
		expect(hashAny(fn)).toBe("⭕️1");
		expect(hashAny(fn)).not.toBe(hashAny((f) => f));
		class A {}
		expect(hashAny({ aa: fn, bb: new A() })).toBe(
			'Object{"aa":"⭕️1","bb":"A{}"}',
		);
		expect(hashAny({ aa: fn })).toBe('Object{"aa":"⭕️1"}');
		expect(hashAny({ aa: fn })).toBe(hashAny({ aa: fn }));
		expect(hashAny({ aa: fn })).not.toBe(hashAny({ aa: (f) => f }));
	});
});
