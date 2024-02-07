import { expect, expectTypeOf, describe, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const repositoryRoot = dirname(dirname(__dirname));

const file = readFileSync(
	join(repositoryRoot, "mise", "nodejs.json"),
).toString();
const config: string[][] = JSON.parse(file)?.customManagers?.map(
	(manager: { matchStrings?: string[] }) => manager.matchStrings,
);

const regexps: RegExp[][] = config.map((matchStrings: string[]) =>
	matchStrings.map((re) => new RegExp(re)),
);

describe("check configuration existing", () => {
	it("should be array", () => {
		expect(Array.isArray(config));
	});
	it("should be array of regexp", () => {
		expectTypeOf(regexps).toEqualTypeOf<RegExp[][]>();
	});
});

describe("nodejs", () => {
	const testCases = [
		{
			it: 'should parse quote with "',
			input: 'nodejs = "20"  # renovate: mise',
			currentValue: "20",
		},
		{
			it: "should perse even if it includes 'v' too",
			input: 'nodejs = "v20"  # renovate: mise',
			currentValue: "20",
		},
		{
			it: "should perse even if it is quoted with single quote too",
			input: "nodejs = '20.11.0'  # renovate: mise",
			currentValue: "20.11.0",
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
