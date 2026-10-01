#!/usr/bin/env node
/**
 * The repo-side platform contract (#27, delivery.md §2 / §10.8) — the part of the hosting
 * slice that holds without a Cloudflare account: the Node pin (`.nvmrc`), the static-assets
 * configuration (`wrangler.jsonc`), the header rules (`public/_headers`, and their copy at
 * the asset root) and the Pagefind index plus the search UI the built pages mount for it.
 *
 * What it deliberately does *not* check is everything the host does with these files:
 * permanent redirect codes, preview noindex, the platform's own MIME defaults before the
 * override. Those need a deployment; delivery.md §13 is the checklist for them, and the
 * rules here are unit-tested in `src/lib/platform.ts`.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-platform.mjs [--root <dir>] [--dist <dir>]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { builtPages, parseArgs } from './lib/cli.mjs';
import { pageRoutesFromRepoPaths } from '../src/lib/pages.ts';
import {
	assetsDirectory,
	headerContractIssues,
	headersAsset,
	headersSource,
	htmlHandling,
	nodePinIssues,
	nodeVersionFile,
	notFoundHandling,
	pagefindEntryFile,
	pagefindIndexIssues,
	pagefindOutput,
	parseHeaders,
	requiredHeaders,
	searchElement,
	searchUiIssues,
	workerName,
	wranglerConfigFile,
	wranglerConfigIssues,
} from '../src/lib/platform.ts';
import { pageFiles } from '../src/lib/read-pages.ts';

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

const failures = [];

/** Collect a check's failures and print its ✓ line only when it has none. */
const report = (issues, summary) => {
	failures.push(...issues);
	if (issues.length === 0) console.log(`✓ ${summary}`);
};

/** Read a repo file, or record why the gate cannot run that check. */
const readSource = (relative, why) => {
	const absolute = path.join(repoRoot, relative);
	if (existsSync(absolute)) return readFileSync(absolute, 'utf8');
	failures.push(`${relative} is missing — ${why}`);
	return null;
};

/** 1 — the Node pin (delivery.md §2.4): what the platform build image and CI both read. */
const pin = readSource(nodeVersionFile, 'the platform build image and CI both read it (delivery.md §2.4)');
if (pin !== null) {
	report(nodePinIssues(pin), `${nodeVersionFile}: Node ${pin.trim()} — the pin delivery.md §2.4 fixes`);
}

/** 2 — the assets configuration (delivery.md §2.1). */
const config = readSource(wranglerConfigFile, 'it is the deployment configuration (delivery.md §2.1)');
if (config !== null) {
	report(
		wranglerConfigIssues(config),
		`${wranglerConfigFile}: \`${workerName}\` serves ${assetsDirectory} with ${htmlHandling} + ${notFoundHandling}, no Worker script`,
	);
}

/** 3 — the header rules (delivery.md §2.3, agent-surface.md §5). */
const headersText = readSource(
	headersSource,
	'the `.md` MIME and the llms discovery headers ride on it (agent-surface.md §5)',
);
if (headersText !== null) {
	const parsed = parseHeaders(headersText);
	report(
		[...parsed.errors, ...headerContractIssues(parsed.rules)],
		`${headersSource}: ${parsed.rules.length} rules carry the ${requiredHeaders.length} required entries (twin MIME, /llms.txt MIME, immutable assets, Link + X-Llms-Txt)`,
	);
}

/** 4 — the rules really ship: the build copies them to the asset root, byte for byte. */
if (headersText !== null) {
	const shipped = path.join(dist, headersAsset);
	if (!existsSync(shipped)) {
		failures.push(
			`dist/${headersAsset} is missing — ${headersSource} has to reach the asset directory for the host to read it (delivery.md §2.1)`,
		);
	} else if (readFileSync(shipped, 'utf8') !== headersText) {
		failures.push(`dist/${headersAsset} differs from ${headersSource} — edit the source, not the copy`);
	} else {
		console.log(`✓ dist/${headersAsset}: byte-identical to ${headersSource}`);
	}
}

/** 5 — the Pagefind index (delivery.md §10.8): search is the zero-SaaS dependency. */
const pagefindDir = path.join(dist, pagefindOutput);
const pages = pageRoutesFromRepoPaths(pageFiles(repoRoot)).length;
if (!existsSync(pagefindDir)) {
	failures.push(`dist/${pagefindOutput}/ is missing — the build has to emit the search index (delivery.md §10.8)`);
} else {
	const files = pagefindFiles(pagefindDir);
	report(
		pagefindIndexIssues({ files, entry: readPagefindEntry(pagefindDir), pages }),
		`dist/${pagefindOutput}/: ${files.length} index file(s) covering all ${pages} page(s) of this version`,
	);

	/** 6 — the index is only search if the pages mount the UI that queries it. */
	const htmlPages = builtPages(dist);
	report(
		searchUiIssues(htmlPages),
		`the built pages mount the search UI (\`${searchElement}\`): ${htmlPages.length} HTML file(s)` +
			' (the redirect stub renders nothing and is not a page)',
	);
}

if (failures.length > 0) {
	console.error('');
	for (const failure of failures) console.error(`✗ ${failure}`);
	console.error(`\n${failures.length} platform contract problem(s) (delivery.md §2).`);
	process.exit(1);
}

console.log('\nPlatform contract holds (repo side — deployment checks live in delivery.md §13).');

/** The Pagefind manifest, or `null` when it is absent or unreadable (the gate reports it). */
function readPagefindEntry(directory) {
	const file = path.join(directory, pagefindEntryFile);
	if (!existsSync(file)) return null;
	try {
		return JSON.parse(readFileSync(file, 'utf8'));
	} catch {
		return null;
	}
}

/** Every file under the Pagefind output, as paths relative to it (directories excluded). */
function pagefindFiles(directory) {
	return readdirSync(directory, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => path.relative(directory, path.join(entry.parentPath, entry.name)));
}
