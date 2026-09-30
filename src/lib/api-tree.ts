/**
 * The generated API tree — api-reference.md §2 (pipeline), §3 (shape), §4 (regeneration),
 * §6 (CI red lines). TypeDoc writes `src/content/docs/docs/reference/api/**` from
 * balsa-framework's `dist/*.d.ts` at the pinned ref; the result is committed, so `git diff`
 * is the API-change surface a PR reviews.
 *
 * Two facts this module exists to keep straight:
 *
 * 1. **The entry paths are part of the artifact.** Every generated page embeds
 *    `Defined in: <path>:<line>` pointing at the framework's build output, so the entry set
 *    may only ever be the committed `api-entry/` shims, which in turn point at the fixed
 *    checkout `.framework/balsa-framework` (api-reference.md §4 F9). Move either and the
 *    whole tree changes.
 * 2. **The tree is not authored content.** Its pages carry the `generated: true` marker
 *    instead of the field table (`src/lib/frontmatter.ts`); `normalizeApiTree` is the single
 *    writer of that marker and of the root-README deletion (api-reference.md §1 裁决 8).
 *
 * The pure rules live here and are unit-tested; the CLI wiring lives in
 * `scripts/regen-api-tree.mjs` (regenerate + diff gate) and `scripts/check-api-tree.mjs`
 * (repo-side coherence gates), and the Astro/Bundler side in `astro.config.mjs`.
 */

import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { contentRoot } from './pages.ts';
import { packageValues } from './frontmatter.ts';
import { isRecord } from './guards.ts';

/** TypeDoc `output` option: relative to `src/content/docs` (api-reference.md §2 F3). */
export const apiTreeOutput = 'docs/reference/api';

/** Repo-relative tree root of the generated pages. */
export const apiTreeRoot = `${contentRoot}/${apiTreeOutput}`;

/** URL namespace the tree owns (ia.md §2 reserved namespace, depth-exempt). */
export const apiTreeRoute = `/${apiTreeOutput}/`;

/**
 * The fixed balsa-framework checkout the entries read (api-reference.md §4 F9). CI checks
 * the pinned SHA out here; `scripts/regen-api-tree.mjs` materializes the same path locally.
 * It is deliberately one path for everyone: the entry location is baked into the artifact.
 */
export const frameworkDir = '.framework/balsa-framework';

/** The generated-page marker's frontmatter line (`src/lib/frontmatter.ts`). */
export const generatedMarker = 'generated: true';

/** Sidebar group label the typedoc plugin builds and the snapshot commits. */
export const apiSidebarLabel = 'API Reference';

/** Committed sidebar snapshot — the no-framework build's sidebar (see astro.config.mjs). */
export const apiSidebarFile = 'api-sidebar.json';

/** Root README the plugin leaves behind: the orphan page of api-reference.md §1 裁决 8. */
export const rootReadme = 'README.md';

/**
 * Entry shim for one value of the frontmatter `packages` domain. The two lists are the same
 * contract — the `@balsa/core` export surface (content-boundary.md §6) — so they are derived
 * from one another: `@balsa/core` → `api-entry/@balsa/core.d.ts` (the shim *file name* is the
 * module name TypeDoc derives, which is why the root is not called `index`), and
 * `@balsa/core/agent` → `api-entry/agent.d.ts`.
 */
export function entryShimOf(packageValue: string): string {
	const root = packageValues[0];
	const subpath = packageValue.slice(root.length).replace(/^\//, '');
	return subpath === '' ? `api-entry/${root}.d.ts` : `api-entry/${subpath}.d.ts`;
}

/** The `dist/` entry of one export value: `@balsa/core` → `index`, `@balsa/core/tools` → `tools/index`. */
function distEntryOf(packageValue: string): string {
	const subpath = packageValue.slice(packageValues[0].length).replace(/^\//, '');
	return subpath === '' ? 'index' : `${subpath}/index`;
}

/** The 10 entry shims: one per export-surface value, in the surface's own listing order. */
export const apiTreeEntries = packageValues.map(entryShimOf);

/**
 * The one line each shim is allowed to contain: a star re-export of the framework's entry
 * for that subpath, through the fixed checkout. TypeDoc follows the re-export, so every
 * symbol keeps its real `Defined in:` source while the module *name* comes from the shim
 * file (`api-entry/@balsa/core.d.ts` → `@balsa/core`; api-reference.md §2).
 */
export function entryShimSource(packageValue: string): string {
	const up = '../'.repeat(entryShimOf(packageValue).split('/').length - 1);
	return `export * from '${up}${frameworkDir}/packages/core/dist/${distEntryOf(packageValue)}.js';`;
}

/** Module (sidebar group) name of an entry shim — the file name without `api-entry/`/`.d.ts`. */
export function moduleNameOf(entry: string): string {
	return entry.replace(/^api-entry\//, '').replace(/\.d\.ts$/, '');
}

/**
 * Insert the `generated: true` marker into a page's frontmatter block. Idempotent: a page
 * that already carries it is returned unchanged, so regeneration converges (two consecutive
 * runs must be byte-identical, api-reference.md §3 F11).
 */
export function markGeneratedPage(source: string): string {
	const match = /^(---[ \t]*\r?\n)([\s\S]*?)(\r?\n---[ \t]*)(\r?\n|$)/.exec(source);
	if (!match) return source;
	const [, open, yaml, close, tail] = match;
	if (/^generated: true[ \t]*$/m.test(yaml)) return source;
	return `${open}${generatedMarker}\n${yaml}${close}${tail}${source.slice(match[0].length)}`;
}

/** Every page file under the tree, repo-relative and sorted. */
export function apiTreePageFiles(rootDir: string): string[] {
	return walk(path.join(rootDir, apiTreeRoot), apiTreeRoot).sort((left, right) =>
		left.localeCompare(right),
	);
}

/**
 * The pipeline's cleanup + normalize step (api-reference.md §4 ③), run inside the Astro
 * plugin chain so dev, build and CI all behave the same. Deletes the orphan root README and
 * stamps every remaining page with the generated marker; returns what it changed.
 */
export function normalizeApiTree(rootDir: string): { removed: string[]; marked: string[] } {
	const removed: string[] = [];
	const marked: string[] = [];

	const readme = path.join(rootDir, apiTreeRoot, rootReadme);
	if (existsSync(readme)) {
		rmSync(readme, { force: true });
		removed.push(`${apiTreeRoot}/${rootReadme}`);
	}

	for (const repoPath of apiTreePageFiles(rootDir)) {
		const file = path.join(rootDir, repoPath);
		const source = readFileSync(file, 'utf8');
		const normalized = markGeneratedPage(source);
		if (normalized === source) continue;
		writeFileSync(file, normalized);
		marked.push(repoPath);
	}

	return { removed, marked };
}

/**
 * Whether this run can generate: the framework checkout must sit at the fixed path with a
 * built `@balsa/core` dist. Without it the committed tree is rendered as-is (the platform
 * build of #27 must not need a framework checkout), which is why the sidebar falls back to
 * the committed snapshot when this is `false`.
 */
export function apiTreeAvailable(rootDir: string): boolean {
	return existsSync(path.join(rootDir, frameworkDir, 'packages/core/dist/index.d.ts'));
}

/** Is this route inside the generated namespace? (ia.md §2) */
export function isApiTreeRoute(route: string): boolean {
	return route.startsWith(apiTreeRoute);
}

/**
 * The sidebar snapshot the no-framework build renders (`api-sidebar.json`): the group the
 * typedoc plugin built, committed. The gate re-checks the parts that can rot silently — the
 * module set (against the entry shims), every `autogenerate.directory` (against the tree),
 * and every explicit `link` (against the page set).
 *
 * `pageFiles` are repo-relative tree paths; a snapshot directory is a content-entry id, i.e.
 * the same path without `${contentRoot}/` and without the extension.
 */
export function apiSidebarIssues(
	snapshot: unknown,
	expectedModules: readonly string[],
	pageFiles: readonly string[],
	routes: readonly string[],
): string[] {
	const issues: string[] = [];

	if (!isRecord(snapshot)) return ['the snapshot is not a sidebar group object'];
	if (snapshot.label !== apiSidebarLabel) {
		issues.push(`the group label must be \`${apiSidebarLabel}\``);
	}
	if (!Array.isArray(snapshot.items)) {
		return [...issues, 'the group must carry an items array'];
	}

	const modules = snapshot.items.map((item) => {
		if (!isGroup(item)) return `(not a group: ${JSON.stringify(item)})`;
		return String(item.label);
	});
	// Set equality, not sequence: TypeDoc's default `sort` decides the group order.
	const sortedModules = [...modules].sort();
	const expected = [...expectedModules].sort();
	if (sortedModules.join('\n') !== expected.join('\n')) {
		issues.push(
			`the module groups must be the entry shims, one-for-one — expected ${expected.join(', ')}, found ${sortedModules.join(', ')}`,
		);
	}

	const routeSet = new Set(routes);
	for (const module of snapshot.items) {
		if (!isGroup(module)) continue;
		for (const kind of module.items) {
			if (!isGroup(kind)) {
				issues.push(`${String(module.label)}: kind entries must be groups`);
				continue;
			}
			issues.push(...kindIssues(String(module.label), kind, pageFiles, routeSet));
		}
	}

	return issues;
}

/**
 * One kind group: either a single `autogenerate` entry (the pages on disk are the items) or
 * explicit `link` items (the `References` group — re-exported symbols that live in another
 * module). Anything else cannot render, so it is an issue on its own.
 */
function kindIssues(
	moduleLabel: string,
	kind: Record<string, unknown> & { items: unknown[] },
	pageFiles: readonly string[],
	routes: ReadonlySet<string>,
): string[] {
	const issues: string[] = [];
	const where = `${moduleLabel} > ${String(kind.label)}`;

	for (const entry of kind.items) {
		if (!isRecord(entry)) {
			issues.push(`${where}: sidebar items must be objects`);
			continue;
		}

		if (typeof entry.link === 'string') {
			if (!routes.has(entry.link)) {
				issues.push(`${where}: link ${entry.link} is not a page in the tree`);
			}
			continue;
		}

		const directory = aggregateDirectory(entry);
		if (directory === null) {
			issues.push(`${where}: expected an \`autogenerate\` directory or a \`link\``);
			continue;
		}

		const prefix = `${contentRoot}/${directory}/`;
		if (!pageFiles.some((file) => file.startsWith(prefix))) {
			issues.push(`${where}: \`${directory}\` has no pages`);
		}
	}

	return issues;
}

function aggregateDirectory(entry: Record<string, unknown>): string | null {
	const autogenerate = entry.autogenerate;
	if (!isRecord(autogenerate)) return null;
	return typeof autogenerate.directory === 'string' ? autogenerate.directory : null;
}

function isGroup(item: unknown): item is Record<string, unknown> & { items: unknown[] } {
	return isRecord(item) && Array.isArray(item.items);
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
		if (entry.isDirectory()) found.push(...walk(path.join(directory, entry.name), repoPath));
		else if (entry.isFile() && entry.name.endsWith('.md')) found.push(repoPath);
	}
	return found;
}
