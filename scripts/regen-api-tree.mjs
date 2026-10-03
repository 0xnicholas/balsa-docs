#!/usr/bin/env node
/**
 * Regenerate the API reference tree — the four steps of api-reference.md §4:
 *
 *   ① the pinned oribos-framework SHA is checked out at the fixed path and its `@oribos/core`
 *      `dist/` is built — entries read `dist/*.d.ts` (裁决 5), and the entry path is baked
 *      into every page as `Defined in:`, so it may never move (F9);
 *   ② `astro sync` generates the tree;
 *   ③ the cleanup step that deletes the orphan root README and stamps the generated marker
 *      is wired into the Astro plugin chain itself (astro.config.mjs), so dev, build and CI
 *      behave identically — this script only verifies that it ran;
 *   ④ `git status --porcelain` over the tree, the entry shims and the sidebar snapshot must
 *      be empty (`--check`): the committed artifact *is* the regeneration of the pinned ref.
 *
 * Ahead of ②, and separate from the four steps, runs the zero-error / zero-warning gate of
 * api-reference.md §6: a `typedoc --emit none` pass over the same `typedoc.json` with the
 * options the plugin forces. The plugin turns TypeDoc diagnostics into Astro log lines and
 * leaves the exit code alone, so the red lines need this pass of their own.
 *
 * Usage:
 *   node --experimental-strip-types scripts/regen-api-tree.mjs [--root <dir>] [--framework <dir>]
 *     [--pin <sha>] [--no-build] [--check]
 *
 * `--framework` / `$ORIBOS_FRAMEWORK_DIR` / the sibling `../oribos-framework` is the checkout the
 * pinned SHA is *materialized from* (as a git worktree); generation itself always reads the
 * fixed `.framework/oribos-framework`. CI checks the pinned SHA out at that path itself, so no
 * worktree is created there.
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { frameworkDirOf, gitAt, parseArgs, pinnedRefOf, run } from './lib/cli.mjs';
import {
	apiSidebarFile,
	apiTreeAvailable,
	apiTreePageFiles,
	apiTreeRoot,
	frameworkDir,
	generatedMarker,
	rootReadme,
} from '../src/lib/api-tree.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), {
	values: ['root', 'framework', 'pin'],
	flags: ['no-build', 'check'],
});

if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

const repoRoot = options.root ?? root;
const check = options['check'] === true;
const failures = [];
const fail = (message, hint) => {
	failures.push(message);
	if (hint) console.error(`  ${hint}`);
};
/** Last `lines` lines of captured output, indented — what a red gate prints to be actionable. */
const tail = (text, lines = 3) => text.trim().split('\n').slice(-lines).join('\n  ');

const pinned = pinnedRefOf(repoRoot, options);
if (pinned.error) {
	console.error(`✗ ${pinned.error}`);
	process.exit(1);
}
const pin = pinned.pin;
// One path for everyone: `.framework/oribos-framework` is what the entry shims and every
// generated `Defined in:` line point at (api-reference.md §4 F9).
const checkout = path.join(repoRoot, frameworkDir);

// ① checkout the pinned SHA at the fixed path.
materializeCheckout();
const git = gitAt(checkout);

if (checkoutExists()) {
	const head = git('rev-parse', 'HEAD');
	if (!head.ok) {
		fail(`${checkout} is not a git checkout`);
	} else if (head.stdout.trim() !== pin) {
		const checkoutPin = git('checkout', '--detach', pin);
		if (!checkoutPin.ok) {
			fail(
				`${checkout} is at ${head.stdout.trim().slice(0, 7)}, not the pinned ${pin.slice(0, 7)}`,
				`check the pinned commit out there: git -C ${checkout} checkout --detach ${pin}`,
			);
		}
	}
}

if (failures.length === 0 && !checkoutExists()) {
	console.error(`✗ ${checkout} does not exist and no framework source was found to materialize it`);
	process.exit(1);
}

if (failures.length === 0 && !hasCoreDist() && options['no-build'] === true) {
	fail(`${checkout}/packages/core/dist is missing and --no-build was passed`);
}

if (failures.length === 0 && !options['no-build']) {
	// The build is what `dist/*.d.ts` — the documented truth source (裁决 5) — comes from.
	const install = run('pnpm', ['install', '--filter', '@oribos/core'], { cwd: checkout });
	if (!install.ok) {
		fail(`pnpm install failed in ${checkout}`, tail(install.stderr));
	} else {
		const build = run('pnpm', ['--filter', '@oribos/core', 'build'], { cwd: checkout });
		if (!build.ok) {
			fail(`building @oribos/core failed in ${checkout}`, tail(build.stderr));
		}
	}
}

if (failures.length === 0 && !apiTreeAvailable(repoRoot)) {
	fail(
		`the generation would be skipped: ${checkout}/packages/core/dist/index.d.ts is missing`,
		'the Astro config only enables starlight-typedoc when the pinned dist is present',
	);
}

if (failures.length > 0) {
	report();
}

// The zero-error / zero-warning gate (api-reference.md §6 red lines 1–2), ahead of ②.
// Same config file the plugin reads, same TypeDoc defaults it forces (starlight-typedoc's
// `defaultTypeDocConfig`), but `--emit none`: converts and validates without writing a
// second tree.
const validation = run(
	'pnpm',
	[
		'exec',
		'typedoc',
		'--emit',
		'none',
		'--treatWarningsAsErrors',
		'--excludeInternal',
		'--excludePrivate',
		'--excludeProtected',
		'--readme',
		'none',
	],
	{ cwd: repoRoot },
);
if (validation.ok) {
	console.log('✓ typedoc: 0 errors, 0 warnings (§6 red lines 1–2)');
} else {
	console.error('✗ typedoc reported errors or warnings (§6 red lines 1–2):');
	console.error(`  ${tail(`${validation.stdout}${validation.stderr}`, 25)}`);
	process.exit(1);
}

// ② generate: `astro sync` runs the whole plugin chain — generation, then ③ cleanup.
const sync = run('pnpm', ['exec', 'astro', 'sync'], { cwd: repoRoot });
if (!sync.ok) {
	console.error('✗ astro sync failed:');
	console.error(`  ${tail(`${sync.stdout}${sync.stderr}`, 25)}`);
	process.exit(1);
}

checkNormalized(); // ③ — the cleanup step ran, and left nothing half-normalized.

// ④ the artifact equals the regeneration.
let upToDate = true;
const paths = [apiTreeRoot, apiSidebarFile, 'api-entry'];
const status = run('git', ['-C', repoRoot, 'status', '--porcelain', '--', ...paths]);
if (!status.ok) {
	fail(`git status failed in ${repoRoot}`, status.stderr.trim());
} else if (status.stdout.trim() !== '') {
	const lines = status.stdout.trim().split('\n');
	if (check) {
		upToDate = false;
		fail(
			`the committed API tree is not the regeneration of ${pin.slice(0, 7)} — ${lines.length} path(s) differ (§6 red line 3)`,
			'run `pnpm regen:api` and commit the result',
		);
		console.error(lines.slice(0, 20).join('\n'));
	} else {
		console.log(`• regenerated artifact changed (${lines.length} path(s)):`);
		console.log(lines.slice(0, 20).join('\n'));
	}
}

const pages = apiTreePageFiles(repoRoot);
console.log(
	`✓ api tree: ${pages.length} page(s) from ${pin.slice(0, 7)}${check && upToDate ? ', committed artifact is up to date' : ''}`,
);

report();

/** ① — materialize `.framework/oribos-framework` at the pin when it is not there yet. */
function materializeCheckout() {
	if (checkoutExists()) return;

	const source = frameworkDirOf(repoRoot, options);
	if (!existsSync(source)) {
		fail(
			`no oribos-framework checkout at ${checkout} and none at ${source}`,
			'clone oribos-framework beside this repo (or set ORIBOS_FRAMEWORK_DIR / --framework)',
		);
		return;
	}

	const pinExists = run('git', ['-C', source, 'cat-file', '-e', `${pin}^{commit}`]);
	if (!pinExists.ok) {
		fail(
			`the pinned commit ${pin.slice(0, 7)} is not in ${source}`,
			`fetch the framework history there, or re-pin (git -C ${source} fetch)`,
		);
		return;
	}

	mkdirSync(path.dirname(checkout), { recursive: true });
	const worktree = run('git', ['-C', source, 'worktree', 'add', '--detach', checkout, pin]);
	if (!worktree.ok) {
		fail(
			`cannot materialize ${checkout} from ${source}`,
			tail(worktree.stderr, 2),
		);
		return;
	}
	console.log(`✓ checkout: ${pin.slice(0, 7)} in ${checkout} (worktree of ${source})`);
}

/** ③ — verify the plugin chain's normalize step ran (api-reference.md §4 ③). */
function checkNormalized() {
	if (existsSync(path.join(repoRoot, apiTreeRoot, rootReadme))) {
		fail(
			`${apiTreeRoot}/${rootReadme} survived generation — the cleanup step is not wired into the plugin chain`,
		);
	}

	const unmarked = apiTreePageFiles(repoRoot).filter(
		(repoPath) =>
			!/^generated: true[ \t]*$/m.test(readFileSync(path.join(repoRoot, repoPath), 'utf8')),
	);
	if (unmarked.length > 0) {
		fail(
			`${unmarked.length} generated page(s) are missing the \`${generatedMarker}\` marker, starting with ${unmarked[0]}`,
		);
	}
}

function checkoutExists() {
	return existsSync(path.join(checkout, '.git'));
}

function hasCoreDist() {
	return existsSync(path.join(checkout, 'packages/core/dist/index.d.ts'));
}

function report() {
	if (failures.length > 0) {
		console.error('');
		for (const failure of failures) console.error(`✗ ${failure}`);
		console.error(`\n${failures.length} API tree regeneration check(s) failed.`);
	}
	process.exit(failures.length > 0 ? 1 : 0);
}
