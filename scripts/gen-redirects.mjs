#!/usr/bin/env node
/**
 * `dist/_redirects` generator (#18, delivery.md §4.1): `redirects.json` is the ledger and
 * the single source of truth, this file is a build artifact and is never edited by hand.
 *
 * The build tail runs it without flags (`pnpm build`); `--check` re-renders and compares
 * against the artifact on disk, which is how `pnpm verify` proves two things at once
 * (§4.2.4): the generator is idempotent (re-running diffs nothing), and the generated
 * file is exactly what the ledger says — no second place writes redirects.
 *
 * Usage:
 *   node --experimental-strip-types scripts/gen-redirects.mjs [--root <dir>] [--ledger <file>] [--out <file>] [--check]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { firstDifference, parseArgs, readJson } from './lib/cli.mjs';
import { formatRedirects, parseLedger } from '../src/lib/ledger.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), {
	values: ['root', 'ledger', 'out'],
	flags: ['check'],
});

if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

const repoRoot = options.root ?? root;
const ledgerFile = options.ledger ?? path.join(repoRoot, 'redirects.json');
const outFile = options.out ?? path.join(repoRoot, 'dist', '_redirects');

const ledger = readJson(ledgerFile);
if (ledger.error) {
	console.error(`✗ ${ledger.error}`);
	process.exit(1);
}

const { entries, errors: ledgerErrors } = parseLedger(ledger.value);
if (ledgerErrors.length > 0) {
	console.error(`✗ ${path.relative(repoRoot, ledgerFile)} is not a legal ledger:`);
	for (const error of ledgerErrors) console.error(`  - ${error}`);
	process.exit(1);
}

const rendered = formatRedirects(entries);
const label = path.relative(repoRoot, outFile);

if (options.check) {
	if (!existsSync(outFile)) {
		console.error(`✗ ${label} is missing — run \`pnpm build\` before the generator check`);
		process.exit(1);
	}
	const onDisk = readFileSync(outFile, 'utf8');
	if (onDisk !== rendered) {
		console.error(`✗ ${label} differs from redirects.json — the ledger is the single source of truth:`);
		console.error(`  ${firstDifference(onDisk, rendered)}`);
		process.exit(1);
	}
	console.log(`✓ ${label} matches the ledger byte for byte (${entries.length} entries, idempotent)`);
	process.exit(0);
}

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, rendered);
console.log(`✓ ${label} written from redirects.json (${entries.length} entries)`);
