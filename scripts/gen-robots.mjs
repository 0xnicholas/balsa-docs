#!/usr/bin/env node
/**
 * `dist/robots.txt` generator (#29, delivery.md §3.4 / §13.4): the deployed origin lives in
 * `src/lib/site.ts` and nowhere else, so the file that has to name the sitemap's absolute URL
 * is rendered from it rather than authored beside it — the same shape as `_redirects` (from
 * `redirects.json`) and the two agent-surface files (from the content tree).
 *
 * The build tail runs it (`pnpm build`). `scripts/check-origin.mjs` asserts the shipped bytes
 * against the same rendering in `pnpm verify`, which is the idempotence proof: nothing else
 * can write this file.
 *
 * Why it is worth generating at all: the host serves its own managed robots.txt (a Content
 * Signals policy text with no directives) whenever the build does not write one, measured in
 * #40 — so the choice is between owning the file and living with that one (delivery.md §2.3).
 *
 * Usage:
 *   node --experimental-strip-types scripts/gen-robots.mjs [--root <dir>] [--out <dir>] [--site <origin>]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/cli.mjs';
import { renderRobots, robotsFile } from '../src/lib/origin.ts';
import { site as siteOrigin } from '../src/lib/site.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), { values: ['root', 'out', 'site'] });

if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

const repoRoot = options.root ?? root;
const outDir = options.out ?? path.join(repoRoot, 'dist');
const origin = options.site ?? siteOrigin;

const file = path.join(outDir, robotsFile);
mkdirSync(outDir, { recursive: true });
writeFileSync(file, renderRobots(origin));

console.log(
	`✓ ${path.relative(repoRoot, file)} written — ${origin === undefined ? 'allow-all, no `Sitemap:` line while the origin is unset' : `Sitemap: ${origin}/sitemap-index.xml`}`,
);
