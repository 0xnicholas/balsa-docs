#!/usr/bin/env node
/**
 * #17 acceptance: the URL shape of the skeleton, asserted against the built output.
 * Site `base` must stay empty (stack.md §3.2) — the site-root namespace (`<route>.md`,
 * later `/llms.txt`) must not move under `/docs`.
 *
 * Usage: node scripts/check-routes.mjs   (wired into `pnpm verify`, after `build`)
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = path.join(root, 'dist');

/** Route shape the nested directory layout has to produce. */
const present = [
	['/docs renders', 'docs/index.html'],
	['two-segment route renders', 'docs/get-started/quickstart/index.html'],
	['`/docs` twin sits at route + `.md`', 'docs.md'],
	['two-segment twin sits at route + `.md`', 'docs/get-started/quickstart.md'],
	['404 twin sits at route + `.md`', '404.md'],
	['static root redirect', 'index.html'],
];

/** Shapes that mean the site-root namespace moved under `/docs`. */
const absent = [
	['`base: /docs` would double-nest the twin', 'docs/docs.md'],
	['`/llms.txt` is a site-root file', 'docs/llms.txt'],
];

let failures = 0;

for (const [label, relative] of present) {
	if (existsSync(path.join(dist, relative))) {
		console.log(`✓ ${label}: dist/${relative}`);
	} else {
		failures += 1;
		console.error(`✗ ${label}: dist/${relative} is missing`);
	}
}

for (const [label, relative] of absent) {
	if (existsSync(path.join(dist, relative))) {
		failures += 1;
		console.error(`✗ ${label}: dist/${relative} exists`);
	} else {
		console.log(`✓ ${label}: dist/${relative} absent`);
	}
}

// The static build emits a meta-refresh for `/` → `/docs`; the real 301 is the host's
// job once the ledger lands (#18, delivery.md §4.1/§4.3).
if (existsSync(path.join(dist, 'index.html'))) {
	const rootHtml = readFileSync(path.join(dist, 'index.html'), 'utf8');
	if (rootHtml.includes('http-equiv="refresh"') && rootHtml.includes('url=/docs')) {
		console.log('✓ `/` redirects to `/docs` (meta-refresh in the static build)');
	} else {
		failures += 1;
		console.error('✗ dist/index.html does not redirect to /docs');
	}
}

if (failures > 0) {
	console.error(`\n${failures} route-shape check(s) failed.`);
	process.exit(1);
}
console.log('\nRoute shape holds.');
