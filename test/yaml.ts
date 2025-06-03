import { parseAllDocuments } from "yaml";

interface YamlOptionsMultiple<ResT = unknown> {
	failureBehaviour?: "throw" | "filter";
	removeTemplates?: boolean;
	uniqueKeys?: boolean;
	customSchema?: unknown;
}

function stripTemplates(content: string): string {
	return content.replace(/\{\{[^}]*\}\}/g, "null").replace(/\{%[^%]*%\}/g, "");
}

function massageContent(
	content: string,
	options?: YamlOptionsMultiple,
): string {
	if (options?.removeTemplates) {
		return stripTemplates(content);
	}
	return content;
}

function prepareParseOption(options: YamlOptionsMultiple | undefined): any {
	return {
		prettyErrors: true,
		uniqueKeys: !options?.removeTemplates,
		strict: false,
		...options,
	};
}

class AggregateError extends Error {
	readonly errors: Error[];

	constructor(errors: Error[], message?: string) {
		super(message);
		this.name = "AggregateError";
		this.errors = errors;
	}
}

/**
 * Minimal implementation of a YAML parser that can handle multiple documents same as renovate.
 *
 * @param content The YAML content to parse.
 * @param options Optional configuration for parsing.
 */
export function parseYaml<ResT = unknown>(
	content: string,
	options?: YamlOptionsMultiple<ResT>,
): ResT[] {
	const massagedContent = massageContent(content, options);

	const rawDocuments = parseAllDocuments(
		massagedContent,
		prepareParseOption(options),
	);

	const results: ResT[] = [];

	for (const rawDocument of rawDocuments) {
		const errors = rawDocument.errors;

		if (errors?.length) {
			const error = new AggregateError(errors, "Failed to parse YAML file");
			if (options?.failureBehaviour === "filter") {
				console.debug("Failed to parse YAML file");
				continue;
			}
			throw error;
		}

		const document = rawDocument.toJS({ maxAliasCount: 10000 });

		results.push(document as ResT);
	}

	return results;
}
