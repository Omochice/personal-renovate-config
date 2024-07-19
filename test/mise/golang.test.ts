import { expect, expectTypeOf, describe, it } from "vitest";
import config from "../../mise/golang.json";

const regexps: RegExp[][] = config.customManagers.map((c) =>
	c.matchStrings.map((re) => new RegExp(re)),
);

describe("check configuration existing", () => {
	it("should be array", () => {
		expect(Array.isArray(config));
	});
	it("should be array of regexp", () => {
		expectTypeOf(regexps).toEqualTypeOf<RegExp[][]>();
	});
});

describe("golang", () => {
	const testCases = [
		{
			it: 'should parse quote with "',
			input: 'go = "1.21.6"  # renovate: mise',
			currentValue: "1.21.6",
		},
		{
			it: 'should accept "golang" too',
			input: 'golang = "1.21.6"  # renovate: mise',
			currentValue: "1.21.6",
		},
		{
			it: "should perse even if it includes 'v' too",
			input: 'go = "v1.21.6"  # renovate: mise',
			currentValue: "1.21.6",
		},
		{
			it: "should perse even if it is quoted with single quote too",
			input: "go = '1.22.0'  # renovate: mise",
			currentValue: "1.22.0",
		},
	] as const;

	for (const testCase of testCases) {
		it(testCase.it, () => {
			const re = regexps[0].map((r) => new RegExp(r, "gm"));
			const matches = re
				.map((r) => Array.from(testCase.input.matchAll(r)).map((e) => e.groups))
				.filter((match) => match.length !== 0)
				.flat();
			expect(matches.length).toBe(1);
			expect(matches[0]?.currentValue).toBe(testCase.currentValue);
		});
	}
});
