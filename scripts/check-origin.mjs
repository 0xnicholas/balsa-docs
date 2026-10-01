#!/usr/bin/env node
/**
 * The deployed origin's three derived surfaces (#29, delivery.md §3.4 / §13.4) — the half of
 * the domain switch that the repository can prove on its own, without DNS:
 *
 *   ① every built page carries exactly one `<link rel="canonical">`, and it is that page's own
 *      route on the origin `src/lib/site.ts` names (the temporary platform domain re-serves the
 *      same bytes, so this tag is what tells a crawler which host owns the URL);
 *   ② the sitemap lists exactly this version's pages, once each, on that origin — no `.md`
 *      twin, no llms file, no `404`, no redirect stub (agent-surface.md §5.1.4);
 *   ③ `dist/robots.txt` is the rendering of that same origin, not the host's managed text.
 *
 * The rules live in `src/lib/origin.ts` (unit-tested there); this file only reads `dist/` and
 * the content tree. What it cannot see is the other half of #29 — that `docs.<apex>` actually
 * resolves, that the certificate was issued, and what the temporary domain answers meanwhile.
 * Those need DNS and a deployment, and they live in delivery.md §13.4.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-origin.mjs [--root <dir>] [--dist <dir>]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { builtPages, parseArgs } from './lib/cli.mjs';
import {
	canonicalIssues,
	canonicalRouteOf,
	robotsFile,
	robotsIssues,
	sitemapIndexFile,
	sitemapIssues,
} from '../src/lib/origin.ts';
import { pageRoutesFromRepoPaths } from '../src/lib/pages.ts';
import { pageFiles } from '../src/lib/read-pages.ts';
import { site as siteOrigin } from '../src/lib/site.ts';

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

/** This version's pages — the same route set the ledger gates compare a version against. */
const routes = pageRoutesFromRepoPaths(pageFiles(repoRoot));

/** Every built HTML page, as `{ path, html }` with the path relative to the asset root. */
const pages = builtPages(dist);

/** `sitemap-index.xml` and its numbered shards; `null` when the index was not written. */
const sitemapIndex = readText(path.join(dist, sitemapIndexFile));
const shards = new Map(
	readdirSync(dist, { withFileTypes: true })
		.filter((entry) => entry.isFile() && /^sitemap-.*\.xml$/.test(entry.name) && entry.name !== sitemapIndexFile)
		.map((entry) => [entry.name, readFileSync(path.join(dist, entry.name), 'utf8')]),
);

const failures = [];
const report = (issues, summary) => {
	failures.push(...issues);
	if (issues.length === 0) console.log(`✓ ${summary}`);
};

report(
	canonicalIssues({ pages, site: siteOrigin }),
	`canonical: ${pages.filter((page) => canonicalRouteOf(page.path) !== null).length} page(s) of ${pages.length} built HTML file(s) point at their own route on ${siteOrigin ?? 'the origin (none set)'} — the redirect stub and the 404 are not pages`,
);
report(
	sitemapIssues({ index: sitemapIndex, shards, site: siteOrigin, routes }),
	`sitemap: ${sitemapIndexFile} + ${shards.size} shard(s), exactly this version's ${routes.length} page(s) on ${siteOrigin ?? 'the origin (none set)'}`,
);
report(
	robotsIssues({ text: readText(path.join(dist, robotsFile)), site: siteOrigin }),
	`${robotsFile}: allow-all, \`Sitemap: ${siteOrigin ?? '(no origin)'}/sitemap-index.xml\``,
);

if (failures.length > 0) {
	console.error('');
	for (const failure of failures) console.error(`✗ ${failure}`);
	console.error(`\n${failures.length} origin surface problem(s) (delivery.md §3.4 / §13.4).`);
	process.exit(1);
}

console.log('\nThe origin surfaces hold (DNS and the certificate are the other half of #29: delivery.md §13.4).');

/** A file's text, or `null` when it does not exist — "missing" is a gate finding, not a crash. */
function readText(file) {
	return existsSync(file) ? readFileSync(file, 'utf8') : null;
}
