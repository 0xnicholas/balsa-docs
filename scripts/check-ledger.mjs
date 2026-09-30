#!/usr/bin/env node
/**
 * The four redirect-ledger gates (#18, delivery.md §4.2). The ledger is `redirects.json`;
 * the current page set comes from the content tree, the baseline page set from git, so a
 * route that disappears without a ledger entry turns the run red.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-ledger.mjs [--root <dir>] [--ledger <file>] [--baseline <git-ref>]
 *
 * Baseline ref: `--baseline`, else `$BASELINE_REF`, else `HEAD`. CI passes the PR base
 * commit (or the previous commit on a push) so "上一版页面集合" really is the previous
 * version; locally `HEAD` compares against the last commit, which catches a page deleted
 * in the working tree but never registered.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, readJson, run } from './lib/cli.mjs';
import { contentRoot, pageRoutesFromRepoPaths } from '../src/lib/pages.ts';
import { pageFiles } from '../src/lib/read-pages.ts';
import { parseLedger, unregisteredRemovals, unresolvableTargets } from '../src/lib/ledger.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), {
	values: ['root', 'ledger', 'baseline'],
});

if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

const repoRoot = options.root ?? root;
const ledgerFile = options.ledger ?? path.join(repoRoot, 'redirects.json');
const baselineRef = options.baseline ?? process.env.BASELINE_REF ?? 'HEAD';

const failures = [];

/** Gate 2 — schema: code domain, unique `from`, ceiling, line length. */
const ledger = readJson(ledgerFile);
let entries = [];
if (ledger.error) {
	failures.push(ledger.error);
} else {
	const parsed = parseLedger(ledger.value);
	entries = parsed.entries;
	failures.push(...parsed.errors.map((error) => `redirects.json: ${error}`));
	if (parsed.errors.length === 0) {
		console.log(
			`✓ schema: ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} — codes in {301,302,307,308}, \`from\` unique, under the platform ceiling`,
		);
	}
}

/** Gate 1 — every internal target resolves in this version's page set. */
const currentRoutes = pageRoutesFromRepoPaths(pageFiles(repoRoot));
const unresolvable = unresolvableTargets(entries, currentRoutes);
failures.push(...unresolvable);
if (unresolvable.length === 0) {
	console.log(`✓ targets: all ${entries.length} target(s) resolve in ${currentRoutes.length} page(s)`);
}

/** Gate 3 — a route removed since the baseline must be registered as a `from`. */
const baseline = run('git', [
	'-C',
	repoRoot,
	'ls-tree',
	'-r',
	'--name-only',
	baselineRef,
	'--',
	contentRoot,
]);
if (baseline.ok) {
	const baselineRoutes = pageRoutesFromRepoPaths(
		baseline.stdout.split('\n').filter((line) => line !== ''),
	);
	const removals = unregisteredRemovals(baselineRoutes, currentRoutes, entries);
	failures.push(...removals);
	if (removals.length === 0) {
		console.log(
			`✓ removals: no page disappeared between ${baselineRef} (${baselineRoutes.length}) and this version (${currentRoutes.length}) unregistered`,
		);
	}
} else {
	failures.push(
		`cannot read the baseline page set from \`${baselineRef}\`: ${baseline.stderr.trim() || 'git failed'}`,
	);
}

/** Gate 4 — the ledger is the only place redirects are written. */
const handwritten = [
	...(existsSync(path.join(repoRoot, 'public/_redirects')) ? ['public/_redirects'] : []),
	...trackedRedirectFiles(repoRoot),
];
failures.push(
	...handwritten.map(
		(file) =>
			`${file} is a handwritten \`_redirects\` — the ledger is the single source of truth (delivery.md §4.2.4); delete it and register the entry in redirects.json`,
	),
);
if (handwritten.length === 0) {
	console.log('✓ single source: no tracked `_redirects` outside the generated dist/ artifact');
}

if (failures.length > 0) {
	console.error('');
	for (const failure of failures) console.error(`✗ ${failure}`);
	console.error(`\n${failures.length} ledger gate(s) failed (delivery.md §4.2).`);
	process.exit(1);
}

console.log('\nRedirect ledger holds.');

/** Tracked files named `_redirects`, whatever their directory. */
function trackedRedirectFiles(repoRoot) {
	const tracked = run('git', ['-C', repoRoot, 'ls-files', '-z']);
	if (!tracked.ok) return [];
	return tracked.stdout
		.split('\0')
		.filter((file) => file !== '' && path.basename(file) === '_redirects');
}
