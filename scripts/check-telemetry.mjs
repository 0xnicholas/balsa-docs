#!/usr/bin/env node
/**
 * The zero-telemetry audit (#28, delivery.md §7 / handoff.md §3.5 O6) over the built site:
 * no analytics script, no consent banner, no third-party cookie — the three things O6 names.
 * Rules live in `src/lib/telemetry.ts` (unit-tested there); this script walks `dist/`, reports
 * one ✓ line per rule and fails on the first real signature.
 *
 * What it cannot see is what the host adds afterwards (an edge-injected beacon, a response
 * header). That half is platform-side and lives with delivery.md §10 / #40.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-telemetry.mjs [--root <dir>] [--dist <dir>]
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { filesUnder, parseArgs } from './lib/cli.mjs';
import { codeContextOf, cookieWriteIssues, telemetryMarkerIssues, thirdPartySubresourceIssues } from '../src/lib/telemetry.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), { values: ['root', 'dist'] });

if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

const repoRoot = options.root ?? root;
const dist = options.dist ?? path.join(repoRoot, 'dist');
if (!existsSync(dist)) {
	console.error(`✗ ${path.relative(repoRoot, dist)} is missing — \`pnpm build\` writes it before this gate runs`);
	process.exit(1);
}

const files = filesUnder(dist).map((relative) => ({ path: relative, text: readFileSync(path.join(dist, relative), 'utf8') }));
const pages = files.filter((file) => file.path.endsWith('.html'));
/** Shipped code: HTML reduced to its code context, JS/CSS as they are. */
const code = files
	.map((file) => ({ path: file.path, text: file.path.endsWith('.html') ? codeContextOf(file.text) : file.text }))
	.filter((file) => /\.(?:html|js|css)$/.test(file.path));
/** Where a cookie write can hide: the shipped scripts **and** the inline `<script>` blocks. */
const scripts = code.filter((file) => /\.(?:js|html)$/.test(file.path));

const failures = [];
const report = (issues, summary) => {
	failures.push(...issues);
	if (issues.length === 0) console.log(`✓ ${summary}`);
};

const scriptTags = pages.reduce((count, page) => count + [...page.text.matchAll(/<script\b[^>]*\bsrc\s*=/gi)].length, 0);

report(
	thirdPartySubresourceIssues(pages),
	`third-party runtime: ${scriptTags} \`<script src>\` tag(s) across ${pages.length} page(s), every subresource served from the asset directory`,
);
report(
	telemetryMarkerIssues(code),
	`vendors: no analytics / marketing / consent signature in ${code.length} shipped HTML/JS/CSS file(s)`,
);
report(cookieWriteIssues(scripts), `cookies: ${scripts.length} shipped script(s) and inline script block(s) carry no cookie write`);

if (failures.length > 0) {
	console.error('');
	for (const failure of failures) console.error(`✗ ${failure}`);
	console.error(`\n${failures.length} zero-telemetry violation(s) (delivery.md §7).`);
	process.exit(1);
}

console.log('\nZero telemetry holds (repo side — an edge-injected beacon is delivery.md §10 / #40).');
