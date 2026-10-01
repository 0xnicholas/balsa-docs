#!/usr/bin/env node
/**
 * `/llms.txt` and `/llms-manifest.json` (#26, agent-surface.md §3/§4): both are derived from
 * the content tree alone and written into `dist/` — nothing is committed, so there is no
 * second copy to drift and nothing to diff (§9). The build tail runs it (`pnpm build`), the
 * same place `dist/_redirects` comes from.
 *
 * Every rule lives in `src/lib/agent-surface.ts`; this file reads the repository, applies
 * them and writes the two files. Pages are read from `src/content/docs/**`, so the two
 * artifacts and the build always describe the same content.
 *
 * Usage:
 *   node --experimental-strip-types scripts/gen-agent-surface.mjs \
 *     [--root <dir>] [--out <dir>] [--site <origin>] [--generated-at <iso>] [--pin <sha>]
 *
 * `--site` defaults to the deployed origin in `src/lib/site.ts`; `--generated-at` exists so a
 * caller can pin a timestamp (the field is recorded and never compared — §12.5).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, pinnedRefOf } from './lib/cli.mjs';
import {
	apiModuleEntries,
	buildManifest,
	frameworkVersion,
	renderLlmsTxt,
	surfacePages,
} from '../src/lib/agent-surface.ts';
import { site as siteOrigin } from '../src/lib/site.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), {
	values: ['root', 'out', 'site', 'generated-at', 'pin'],
});

if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

const repoRoot = options.root ?? root;
const outDir = options.out ?? path.join(repoRoot, 'dist');
const origin = options.site ?? siteOrigin;
const generatedAt = options['generated-at'] ?? new Date().toISOString();

const pinned = pinnedRefOf(repoRoot, options);
if (pinned.error) {
	console.error(`✗ ${pinned.error}`);
	process.exit(1);
}

const { routes, pages, issues } = surfacePages(repoRoot);
const failures = [...issues];

// The module groups point at representative pages (agent-surface.md §12.3): a renamed symbol
// has to fail here, at generation time, not in a reader's browser. Assertion ② re-checks the
// same links against `dist/` (`scripts/check-agent-surface.mjs`).
const modules = apiModuleEntries();
const known = new Set(routes);
for (const entry of modules) {
	if (!known.has(entry.route)) {
		failures.push(
			`apiModulePages['${entry.packageValue}'] → ${entry.route} is not a page — the module group needs a new representative page`,
		);
	}
}

if (failures.length > 0) {
	for (const failure of failures) console.error(`✗ ${failure}`);
	console.error(`\n${failures.length} problem(s) — no agent-surface file was written.`);
	process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const llmsFile = path.join(outDir, 'llms.txt');
const manifestFile = path.join(outDir, 'llms-manifest.json');

writeFileSync(llmsFile, renderLlmsTxt({ site: origin, pages, modules }));
const manifest = buildManifest({
	site: origin,
	pin: pinned.pin,
	version: frameworkVersion,
	generatedAt,
	pages,
});
writeFileSync(manifestFile, `${JSON.stringify(manifest, null, '\t')}\n`);

console.log(
	`✓ ${path.relative(repoRoot, llmsFile)} written — ${pages.length} page(s), ${modules.length} module groups, ${
		origin === undefined ? 'root-relative links (the origin is not set yet)' : `links against ${origin}`
	}`,
);
console.log(
	`✓ ${path.relative(repoRoot, manifestFile)} written — pin ${pinned.pin.slice(0, 12)}, ${Object.keys(manifest.packages).length} package(s)`,
);
