#!/usr/bin/env node
/**
 * Frontmatter value domain (#18, delivery.md §5①) — the cross-file rules the content
 * collection schema cannot express (stack.md §13.1):
 *
 * - `subtype` only on Guides pages, `order` unique inside a family (ia.md §4) — always run;
 * - the `packages` domain in `src/lib/frontmatter.ts` equals `@balsa/core`'s real `exports`
 *   at the pinned ref, every page's `packages` sits inside that surface, and every
 *   `source` pointer resolves at its ref — these need the framework checkout.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-content.mjs [--root <dir>] [--framework <dir>] [--pin <sha>] [--require-framework]
 *
 * Without a framework checkout the framework leg is skipped with a note; CI runs this
 * with `--require-framework` (and `BALSA_FRAMEWORK_DIR` pointing at the pinned checkout).
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, readJson, run } from './lib/cli.mjs';
import { packageValues } from '../src/lib/frontmatter.ts';
import {
	exportSurfaceIssues,
	orderIssues,
	sourcePointerIssues,
	subtypeIssues,
} from '../src/lib/content-values.ts';
import { readPages } from '../src/lib/read-pages.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), {
	values: ['root', 'framework', 'pin'],
	flags: ['require-framework'],
});

if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

const repoRoot = options.root ?? root;
const frameworkDir = path.resolve(
	options.framework ?? process.env.BALSA_FRAMEWORK_DIR ?? path.join(repoRoot, '..', 'balsa-framework'),
);

const failures = [];
const { pages, errors: pageErrors } = readPages(repoRoot);
failures.push(...pageErrors);

/** Pages that are not in a family, and Guides-only `subtype`, are content-model mistakes. */
const localIssues = [...subtypeIssues(pages), ...orderIssues(pages)];
failures.push(...localIssues.map((issue) => `${issue.page}: ${issue.message}`));
if (localIssues.length === 0) {
	console.log(`✓ frontmatter: subtype/order rules hold across ${pages.length} page(s)`);
}

const pinFile = path.join(repoRoot, 'pinned-ref.json');
const pinned = readJson(pinFile);
const pin = options.pin ?? (pinned.error ? undefined : pinned.value?.commit);
const havePin = typeof pin === 'string' && pin !== '';

const corePackageFile = path.join(frameworkDir, 'packages', 'core', 'package.json');
const haveFramework = existsSync(frameworkDir) && existsSync(corePackageFile);

if (!haveFramework) {
	if (options['require-framework']) {
		console.error(`✗ no balsa-framework checkout at ${frameworkDir} (packages/core/package.json not found)`);
		console.error('  clone it beside this repo, or set BALSA_FRAMEWORK_DIR / --framework');
		process.exit(1);
	}
	console.log(
		`… framework checks skipped: no checkout at ${frameworkDir} (CI runs them with --require-framework)`,
	);
} else if (!havePin) {
	failures.push(pinned.error ?? `${path.relative(repoRoot, pinFile)} must carry the balsa-framework \`commit\` SHA`);
} else if (!run('git', ['-C', frameworkDir, 'cat-file', '-e', `${pin}^{commit}`]).ok) {
	failures.push(`pinned commit ${pin} is not in ${frameworkDir} — fetch the framework history or re-pin`);
} else {
	const core = readJson(corePackageFile);
	if (core.error) {
		failures.push(core.error);
	} else {
		const surfaceIssues = exportSurfaceIssues(pages, {
			exports: core.value.exports ?? {},
			packageName: core.value.name,
			domain: packageValues,
		});
		failures.push(...surfaceIssues.map((issue) => `${issue.page}: ${issue.message}`));
		if (surfaceIssues.length === 0) {
			console.log(
				`✓ packages: frontmatter domain equals ${core.value.name}'s export surface at ${pin.slice(0, 7)} (${Object.keys(core.value.exports ?? {}).length} entries)`,
			);
		}
	}

	const { pointers, issues } = sourcePointerIssues(pages, pin);
	failures.push(...issues.map((issue) => `${issue.page}: ${issue.message}`));
	const unresolved = pointers.filter(
		(pointer) => !run('git', ['-C', frameworkDir, 'cat-file', '-e', `${pointer.ref}:${pointer.file}`]).ok,
	);
	failures.push(
		...unresolved.map(
			(pointer) =>
				`${pointer.page}: \`source\` pointer ${pointer.file} does not exist at ${pointer.ref} (ia.md §4, content-boundary.md §4)`,
		),
	);
	if (unresolved.length === 0) {
		console.log(
			`✓ sources: ${pointers.length} pointer(s) resolve at the pinned/lagged refs${pointers.length === 0 ? ' (no source pointers yet)' : ''}`,
		);
	}
}

if (failures.length > 0) {
	console.error('');
	for (const failure of failures) console.error(`✗ ${failure}`);
	console.error(`\n${failures.length} frontmatter value-domain check(s) failed (delivery.md §5①).`);
	process.exit(1);
}

console.log('\nFrontmatter value domain holds.');
