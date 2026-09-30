/**
 * Page reader for the repo gates: repo path + route + raw frontmatter mapping.
 *
 * The build's content-collection schema (src/content.config.ts) is the authority on
 * frontmatter shape; this reader exists because the cross-file rules of delivery.md §5①
 * run as standalone scripts (before or beside a build) and need the values, not a
 * rendered site. It deliberately does not re-implement the schema.
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { contentRoot, routeFromContentPath } from './pages.ts';
import type { ContentPage } from './content-values.ts';

export type PageParse = { page: ContentPage } | { errors: string[] };

const frontmatterPattern = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

/** Parse one Markdown/MDX page. `repoPath` is repo-relative and used for messages. */
export function parsePageFile(source: string, repoPath: string): PageParse {
	const relative = repoPath.startsWith(`${contentRoot}/`)
		? repoPath.slice(contentRoot.length + 1)
		: null;
	if (relative === null) {
		return { errors: [`${repoPath}: not inside ${contentRoot}/`] };
	}

	const route = routeFromContentPath(relative);
	if (route === null) {
		return { errors: [`${repoPath}: not a page (Starlight partial, 404 or non-Markdown)`] };
	}

	const match = frontmatterPattern.exec(source);
	if (!match) {
		return { errors: [`${repoPath}: missing a frontmatter block (--- … ---)`] };
	}

	let parsed: unknown;
	try {
		parsed = parseYaml(match[1]);
	} catch (error) {
		return { errors: [`${repoPath}: frontmatter is not valid YAML — ${(error as Error).message}`] };
	}
	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
		return { errors: [`${repoPath}: frontmatter must be a YAML mapping`] };
	}

	return { page: { path: repoPath, route, frontmatter: parsed as Record<string, unknown> } };
}

/** Every page file under `<rootDir>/src/content/docs`, repo-relative and sorted. */
export function pageFiles(rootDir: string): string[] {
	return walk(path.join(rootDir, contentRoot), contentRoot).filter(
		(repoPath) => routeFromContentPath(repoPath.slice(contentRoot.length + 1)) !== null,
	);
}

/** Every page under `<rootDir>/src/content/docs`, sorted by path, plus parse errors. */
export function readPages(rootDir: string): { pages: ContentPage[]; errors: string[] } {
	const pages: ContentPage[] = [];
	const errors: string[] = [];

	for (const repoPath of pageFiles(rootDir)) {
		const result = parsePageFile(readFileSync(path.join(rootDir, repoPath), 'utf8'), repoPath);
		if ('page' in result) pages.push(result.page);
		else errors.push(...result.errors);
	}

	pages.sort((left, right) => left.path.localeCompare(right.path));
	return { pages, errors };
}

function walk(directory: string, repoDirectory: string): string[] {
	let entries;
	try {
		entries = readdirSync(directory, { withFileTypes: true });
	} catch {
		return [];
	}

	const found: string[] = [];
	for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
		const repoPath = `${repoDirectory}/${entry.name}`;
		if (entry.isDirectory()) {
			found.push(...walk(path.join(directory, entry.name), repoPath));
		} else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
			found.push(repoPath);
		}
	}
	return found;
}
