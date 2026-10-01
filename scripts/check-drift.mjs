#!/usr/bin/env node
/**
 * Verbatim drift gate (#18, handoff S8 / content-boundary.md §4). Every
 * `<!-- balsa:verbatim file="…" lines="…" -->` block is diffed against its file in
 * balsa-framework at the pinned ref — or at the page's own `source` ref when the page
 * deliberately lags the pin, which is only allowed behind the pin (an ancestor of it).
 * `.mdx` pages carry the marker as an MDX expression comment (#19) — same body, different
 * wrapper, because MDX cannot hold HTML comments. The wrapper must match the page language:
 * the other form is an error too (#21) — in `.md` the MDX form renders as visible text, and
 * in `.mdx` the HTML form never reaches the parser, so neither may pass as a silent skip.
 * Framework content is read with `git show <sha>:<path>`, so the checkout may sit on any
 * branch as long as the pinned commit is present in it.
 *
 * Usage:
 *   node --experimental-strip-types scripts/check-drift.mjs [--root <dir>] [--framework <dir>] [--pin <sha>]
 *
 * Framework dir: `--framework`, else `$BALSA_FRAMEWORK_DIR`, else the sibling checkout
 * `../balsa-framework`. Pin: `--pin`, else the `commit` in `pinned-ref.json`.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { frameworkDirOf, gitAt, parseArgs, pinnedRefOf } from './lib/cli.mjs';
import { sourcePointerIssues } from '../src/lib/content-values.ts';
import { checkVerbatimDrift } from '../src/lib/drift.ts';
import { readPages } from '../src/lib/read-pages.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), {
	values: ['root', 'framework', 'pin'],
});

if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

const repoRoot = options.root ?? root;
const frameworkDir = frameworkDirOf(repoRoot, options);

const pinned = pinnedRefOf(repoRoot, options);
if (pinned.error) {
	console.error(`✗ ${pinned.error}`);
	process.exit(1);
}
const pin = pinned.pin;

if (!existsSync(frameworkDir)) {
	console.error(`✗ no balsa-framework checkout at ${frameworkDir}`);
	console.error(
		'  clone it beside this repo (or set BALSA_FRAMEWORK_DIR / --framework); CI checks it out at the pinned SHA',
	);
	process.exit(1);
}

const git = gitAt(frameworkDir);

if (!git('cat-file', '-e', `${pin}^{commit}`).ok) {
	console.error(`✗ pinned commit ${pin} is not in ${frameworkDir}`);
	console.error('  fetch the framework history, or re-pin with a commit that exists');
	process.exit(1);
}

const { pages, errors: pageErrors } = readPages(repoRoot);
if (pageErrors.length > 0) {
	for (const error of pageErrors) console.error(`✗ ${error}`);
	process.exit(1);
}

const result = checkVerbatimDrift({
	pin,
	pages: pages.map((page) => ({
		path: page.path,
		markdown: readFileSync(path.join(repoRoot, page.path), 'utf8'),
		sourceRefs: Array.isArray(page.frontmatter.source)
			? page.frontmatter.source.filter(
					(pointer) => pointer !== null && typeof pointer === 'object' && typeof pointer.file === 'string',
				)
			: undefined,
	})),
	readSource: (ref, file) => {
		const blob = git('show', `${ref}:${file}`);
		return blob.ok ? blob.stdout : null;
	},
});

// A page may lag the pin through a `source` ref, but only behind it: a sideways or future
// ref would make "升钉时 CI 全量重检" meaningless (content-boundary.md §4).
const { pointers } = sourcePointerIssues(pages, pin);
const sideways = pointers.filter(
	(pointer) =>
		pointer.ref !== pin && !git('merge-base', '--is-ancestor', pointer.ref, pin).ok,
);
for (const pointer of sideways) {
	result.issues.push({
		page: pointer.page,
		line: null,
		file: pointer.file,
		ref: pointer.ref,
		message: `lag ref ${pointer.ref} is not behind the pin ${pin} (content-boundary.md §4)`,
		detail: [],
	});
}

if (result.issues.length > 0) {
	for (const issue of result.issues) {
		const at = issue.line === null ? issue.page : `${issue.page}:${issue.line}`;
		const source = issue.file === null ? '' : ` ${issue.file} @ ${issue.ref}`;
		console.error(`✗ ${at}${source}`);
		console.error(`  ${issue.message}`);
		for (const line of issue.detail) console.error(`    ${line}`);
	}
	console.error(
		`\n${result.issues.length} drift issue(s) across ${result.stats.pages} page(s) at ${pin} (content-boundary.md §4).`,
	);
	process.exit(1);
}

const marked = result.stats.verbatim + result.stats.adapted;
console.log(
	`✓ drift: ${result.stats.verbatim} verbatim block(s) match the pin ${pin.slice(0, 7)} (${result.stats.adapted} adapted of ${marked} marked, ${result.stats.pages} page(s))`,
);
if (marked === 0) {
	console.log('  no provenance-marked blocks yet: content slices add them as pages copy from the framework');
}
console.log(`  framework: ${frameworkDir}`);
