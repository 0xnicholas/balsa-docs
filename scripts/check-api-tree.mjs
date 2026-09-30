#!/usr/bin/env node
/**
 * Repo-side API tree gates (api-reference.md §2/§3/§4). No framework checkout needed: these
 * are the invariants of the *committed* artifacts — the tree, the entry shims and the
 * sidebar snapshot — i.e. exactly what the platform build (#27) and the repo-gates CI job
 * render without ever running TypeDoc.
 *
 * 1. **Entries** — `api-entry/*.d.ts` are one-line star re-exports of the fixed checkout's
 *    `dist/` entries; the shim's file name is the module name TypeDoc derives, so the set
 *    has to be the export surface (`packages` domain) one-for-one and `typedoc.json` has to
 *    declare exactly them, in order (that order is the sidebar's module order).
 * 2. **Orphan page** — the plugin's root README stays deleted (api-reference.md §1 裁决 8).
 * 3. **Sidebar snapshot** — `api-sidebar.json` is what a no-framework build renders, so
 *    every group in it has to resolve against the committed tree (`apiSidebarIssues`).
 *
 * Usage: node --experimental-strip-types scripts/check-api-tree.mjs [--root <dir>]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, readJson } from './lib/cli.mjs';
import {
	apiSidebarFile,
	apiSidebarIssues,
	apiTreeEntries,
	apiTreePageFiles,
	apiTreeRoot,
	entryShimSource,
	moduleNameOf,
	rootReadme,
} from '../src/lib/api-tree.ts';
import { packageValues } from '../src/lib/frontmatter.ts';
import { pageRoutesFromRepoPaths } from '../src/lib/pages.ts';
import { pageFiles } from '../src/lib/read-pages.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), { values: ['root'] });

if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

const repoRoot = options.root ?? root;
const failures = [];

/** Gate 1a — the shim files: exactly one per export-surface value, each with the expected body. */
const shimDirectory = path.join(repoRoot, 'api-entry');
const shims = existsSync(shimDirectory)
	? readdirSync(shimDirectory, { recursive: true })
			.map((entry) => `api-entry/${String(entry)}`)
			.filter((entry) => entry.endsWith('.d.ts'))
			.sort()
	: [];
const expectedShims = [...apiTreeEntries].sort();

if (shims.join('\n') !== expectedShims.join('\n')) {
	failures.push(
		`api-entry/ must hold exactly the export surface's shims (content-boundary.md §6): expected ${expectedShims.join(', ')}, found ${shims.join(', ') || '(none)'}`,
	);
}

for (const [index, entry] of apiTreeEntries.entries()) {
	const file = path.join(repoRoot, entry);
	if (!existsSync(file)) continue;
	const expected = entryShimSource(packageValues[index]);
	const found = readFileSync(file, 'utf8').trim();
	if (found !== expected) {
		failures.push(
			`${entry}: a shim is exactly \`${expected}\` (api-reference.md §2) — found \`${found}\``,
		);
	}
}

if (failures.length === 0) {
	console.log(
		`✓ entries: ${apiTreeEntries.length} shim(s) hand the generation the export surface — ${apiTreeEntries.map(moduleNameOf).join(', ')}`,
	);
}

/** Gate 1b — `typedoc.json` declares those shims, in that order. */
const typedoc = readJson(path.join(repoRoot, 'typedoc.json'));
if (typedoc.error) {
	failures.push(typedoc.error);
} else {
	const declared = typedoc.value?.entryPoints;
	if (!Array.isArray(declared) || declared.join('\n') !== apiTreeEntries.join('\n')) {
		failures.push(
			`typedoc.json \`entryPoints\` must be the entry shims, in export-surface order (the declarative list the pipeline reproduces) — expected ${apiTreeEntries.join(', ')}`,
		);
	} else {
		console.log(`✓ typedoc.json: entryPoints are the ${apiTreeEntries.length} committed shims, in surface order`);
	}
}

/** Gate 2 — the orphan root README. */
if (existsSync(path.join(repoRoot, apiTreeRoot, rootReadme))) {
	failures.push(
		`${apiTreeRoot}/${rootReadme} is the plugin's orphan page — the normalize step (astro.config.mjs) must delete it (api-reference.md §1 裁决 8)`,
	);
} else {
	console.log(`✓ cleanup: ${apiTreeRoot}/${rootReadme} is absent (裁决 8)`);
}

/** Gate 3 — the sidebar snapshot against the committed tree. */
const treePages = apiTreePageFiles(repoRoot);
const snapshot = readJson(path.join(repoRoot, apiSidebarFile));
if (snapshot.error) {
	failures.push(snapshot.error);
} else {
	const issues = apiSidebarIssues(
		snapshot.value,
		apiTreeEntries.map(moduleNameOf),
		treePages,
		pageRoutesFromRepoPaths(pageFiles(repoRoot)),
	);
	failures.push(...issues.map((issue) => `${apiSidebarFile}: ${issue}`));
	if (issues.length === 0) {
		console.log(
			`✓ sidebar: ${apiSidebarFile} resolves against ${treePages.length} tree page(s) under ${apiTreeRoot}`,
		);
	}
}

if (failures.length > 0) {
	console.error('');
	for (const failure of failures) console.error(`✗ ${failure}`);
	console.error(`\n${failures.length} API tree check(s) failed (api-reference.md §2/§4).`);
	process.exit(1);
}

console.log('\nAPI tree holds.');
