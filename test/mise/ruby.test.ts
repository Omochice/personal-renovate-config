import { expect, expectTypeOf, describe, it } from "vitest";
import config from "../../mise/ruby.json";
import RE2 from "re2";

const regexps: RE2[][] = config.customManagers.map((c) =>
	c.matchStrings.map((re) => new RE2(re)),
);

describe("check configuration existing", () => {
	it("should be array", () => {
		expect(Array.isArray(config));
	});
	it("should be array of regexp", () => {
		expectTypeOf(regexps).toEqualTypeOf<RE2[][]>();
	});
});

describe("ruby", () => {
	const testCases = [
		{
			it: 'should parse quote with "',
			input: 'ruby = "3.2.3"  # renovate: mise',
			currentValue: "3.2.3",
		},
		{
			it: "should perse even if it includes 'v' too",
			input: 'ruby = "v3.2.3"  # renovate: mise',
			currentValue: "3.2.3",
		},
		{
			it: "should perse even if it is quoted with single quote too",
			input: "ruby = '3.3.0'  # renovate: mise",
			currentValue: "3.3.0",
		},
	] as const;

	for (const testCase of testCases) {
		it(testCase.it, () => {
			const re = regexps[0].map((r) => new RE2(r, "gm"));
			const matches = re
				.map((r) => Array.from(testCase.input.matchAll(r)).map((e) => e.groups))
				.filter((match) => match.length !== 0)
				.flat();
			expect(matches.length).toBe(1);
			expect(matches[0]?.currentValue).toBe(testCase.currentValue);
		});
	}
});
