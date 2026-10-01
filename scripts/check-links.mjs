#!/usr/bin/env node
/**
 * The link gate (#28, delivery.md §5 ③) over the built site. The spec left the selection to
 * implementation ("链接检查（含锚点存活，选型属实施）"); this is the self-written one — no new
 * dependency, the same report style as the other gates, and no network access.
 *
 * What it holds (rules in `src/lib/links.ts`, unit-tested there):
 *
 *   - every `<a href>` in every built page is root-relative or external;
 *   - every root-relative target is served by a file in the asset directory — pages, `.md`
 *     twins, `_astro/*` assets, `favicon.svg` / `og.png`, `/llms.txt` / `/llms-manifest.json`,
 *     the Pagefind runtime;
 *   - every fragment resolves to an `id` on the target page (same-page fragments included).
 *
 * Scope note (same reasoning as `src/lib/links.ts`): the `.md` twins are source text, so they
 * are not re-parsed here — their links are the source links the rendered page carries, and the
 * `/llms.txt` link set is already asserted in `scripts/check-agent-surface.mjs`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-links.mjs [--root <dir>] [--dist <dir>]
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { filesUnder, parseArgs } from './lib/cli.mjs';
import { anchorHrefs, anchorsInHtml, classifyHref, linkIssues } from '../src/lib/links.ts';

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

const files = new Set(filesUnder(dist));
const pages = [...files].filter((file) => file.endsWith('.html'));
if (pages.length === 0) {
	console.error(`✗ ${path.relative(repoRoot, dist)} carries no HTML page — the gate has nothing to check`);
	process.exit(1);
}

const anchors = new Map();
const links = [];
for (const page of pages) {
	const html = readFileSync(path.join(dist, page), 'utf8');
	anchors.set(page, anchorsInHtml(html));
	for (const href of anchorHrefs(html)) links.push({ page, href });
}

const failures = linkIssues(links, {
	files,
	idsOf: (file) => anchors.get(file) ?? new Set(),
});

if (failures.length > 0) {
	console.error('');
	for (const failure of failures.slice(0, 20)) console.error(`✗ ${failure}`);
	if (failures.length > 20) console.error(`  … and ${failures.length - 20} more`);
	console.error(`\n${failures.length} broken link(s) in ${pages.length} built page(s) (delivery.md §5 ③).`);
	process.exit(1);
}

const counts = { internal: 0, fragment: 0, external: 0 };
for (const { href } of links) {
	const kind = classifyHref(href).kind;
	if (kind === 'external') counts.external += 1;
	else if (kind === 'fragment') counts.fragment += 1;
	else if (kind === 'internal') counts.internal += 1;
}
console.log(
	`✓ links: ${links.length} anchor(s) in ${pages.length} page(s) resolve — ` +
		`${counts.internal} root-relative (${counts.fragment} same-page fragment(s)), ` +
		`${counts.external} external skipped (never fetched)`,
);
console.log('\nLink integrity holds.');
