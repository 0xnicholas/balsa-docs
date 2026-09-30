#!/usr/bin/env node
/**
 * The WCAG AA gate over the brand token layer (#19, brand-visual.md §5①). The audited
 * source is `src/styles/global.css` — the same file the site loads — so the gate cannot
 * drift from what ships: a token edit that drops a pair below 4.5:1 turns this red.
 *
 * `§5①` reduces the palette to 8 rendered pairs (body / headings / link × page & sidebar,
 * accent-low chip, button invert, muted meta) × 2 themes = the 16 checks below.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-contrast.mjs [--root <dir>] [--css <file>]
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/cli.mjs';
import { auditTokens, parseTokenCss } from '../src/lib/brand-tokens.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), {
	values: ['root', 'css'],
});

if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

const repoRoot = options.root ?? root;
const cssFile = options.css ?? path.join(repoRoot, 'src/styles/global.css');

let css;
try {
	css = readFileSync(cssFile, 'utf8');
} catch (error) {
	console.error(`✗ cannot read the token stylesheet \`${cssFile}\`: ${error.message}`);
	process.exit(1);
}

const { tokens, errors: parseErrors } = parseTokenCss(css);
if (parseErrors.length > 0) {
	for (const error of parseErrors) console.error(`✗ ${error}`);
	console.error(`\n${parseErrors.length} token-layer problem(s) — the AA audit cannot run.`);
	process.exit(1);
}

const { rows, errors: auditErrors } = auditTokens(tokens);
for (const error of auditErrors) console.error(`✗ ${error}`);

const failed = rows.filter((row) => !row.pass);
const label = (text, width) => text.padEnd(width);

// One report block per theme: the ratio, the pair it was measured on, and the floor.
for (const theme of ['dark', 'light']) {
	console.log(`\n${theme}`);
	for (const row of rows.filter((item) => item.theme === theme)) {
		const mark = row.pass ? 'ok  ' : 'FAIL';
		console.log(
			`  ${mark} ${label(`${row.ratio.toFixed(2)}:1`, 8)} ${label(row.label, 34)} (min ${row.min})`,
		);
	}
}

console.log(`\n${rows.length} checks · ${rows.length - failed.length} pass · ${failed.length} fail`);

if (failed.length > 0 || auditErrors.length > 0) {
	console.error('\nFailing pairs (brand-visual.md §5① — the palette itself is pinned, do not tune it in passing):');
	for (const row of failed) {
		console.error(`  ${row.theme} — ${row.label}: ${row.ratio.toFixed(2)}:1`);
		console.error(`    fg ${row.fg} on bg ${row.bg}`);
	}
	process.exit(1);
}

console.log('\nBrand tokens clear WCAG AA in both themes.');
