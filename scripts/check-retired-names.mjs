#!/usr/bin/env node
/**
 * Retired names (#48, delivery.md §5①): every authored content page wears current names
 * only — no `Balsats`, no `balsats-framework` / `balsats-docs` / `balsats-website`, no
 * `docs.balsats.com` / `balsats.dev` / `balsajs.dev`, no `balsats:` marker prefix. The
 * npm scope window is the one allowed form: `@balsats/<name>` may stand on a line that
 * names it as the previous/old scope (0.5.0's published scope is a fact, and Installation
 * states it).
 *
 * Pure rule: `src/lib/retired.ts`; this script only walks the content tree and reports.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-retired-names.mjs [--root <dir>]
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/cli.mjs';
import { pageFiles } from '../src/lib/read-pages.ts';
import { retiredNameIssues } from '../src/lib/retired.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), { values: ['root'] });

if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

const repoRoot = options.root ?? root;
const pages = pageFiles(repoRoot).map((repoPath) => ({
	path: repoPath,
	text: readFileSync(path.join(repoRoot, repoPath), 'utf8'),
}));
const issues = retiredNameIssues(pages);

if (issues.length > 0) {
	for (const issue of issues) {
		console.error(`✗ ${issue.page}:${issue.line} ${issue.message}`);
	}
	console.error(`\n✗ ${issues.length} retired name(s) in ${pages.length} page(s) (balsats → oribos, #48)`);
	process.exit(1);
}

console.log(`✓ retired names: ${pages.length} page(s) carry current names only (balsats → oribos, #48)`);
