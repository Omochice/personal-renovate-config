import jsonata from "jsonata";
import { describe, it, expect } from "vitest";
import { parseYaml } from "./yaml";
import { customManagers } from "../gitlab.json";

describe("GitLab JSONata Tests", () => {
	it("should extract image name and version", async () => {
		const input = `
spec:
  inputs:
    job-stage:
      default: test
---

"without-label":
  stage: $[[ inputs.job-stage ]]
  image: alpine
  script:
    - scan-website-1

"with-label":
  stage: $[[ inputs.job-stage ]]
  image: node:slim
  script:
    - scan-website-2

"with-version-label":
  stage: $[[ inputs.job-stage ]]
  image: davidanson/markdownlint-cli2:v0.13.0
  script:
    - scan-website-2

"with-name-and-entrypoint":
  stage: $[[ inputs.job-stage ]]
  image:
    name: davidanson/markdownlint-cli2:v0.13.0
    entrypoint: [""]
  script:
    - scan-website-2

"without-image":
  stage: $[[ inputs.job-stage ]]
  script:
    - scan-website-2
    `.trim();
		const expression = jsonata(customManagers[0].matchStrings[0]);
		const documents = parseYaml(input);
		const result = await expression.evaluate(documents);
		// NOTE: strip `sequence: true` by Array.from
		expect(Array.from(result)).toEqual([
			{ depName: "alpine", currentValue: "latest" },
			{ depName: "node", currentValue: "slim" },
			{ depName: "davidanson/markdownlint-cli2", currentValue: "v0.13.0" },
			{ depName: "davidanson/markdownlint-cli2", currentValue: "v0.13.0" },
		]);
	});
});
