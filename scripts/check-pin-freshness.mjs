#!/usr/bin/env node
/**
 * Pinned-ref freshness — the 🟡 of api-reference.md §6: the pin may lag the framework's
 * default branch, and that must be visible without blocking a merge.
 *
 * `git ls-remote <repo> HEAD` resolves the remote's default-branch head, so the check needs
 * no token, no API call and no framework checkout. Exit codes:
 *
 *   0 — the pin is the default-branch HEAD (or the remote could not be reached: a network
 *       hiccup must not manufacture a yellow);
 *   1 — the pin is behind/off the default branch. CI runs this step with
 *       `continue-on-error: true`, which is what makes it yellow instead of red.
 *
 * Usage: node scripts/check-pin-freshness.mjs [--root <dir>] [--repo <owner/name>]
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const args = process.argv.slice(2);
const option = (name) => {
	const index = args.indexOf(`--${name}`);
	return index === -1 ? undefined : args[index + 1];
};

const repoRoot = option('root') ?? root;

let pinned;
try {
	pinned = JSON.parse(readFileSync(path.join(repoRoot, 'pinned-ref.json'), 'utf8'));
} catch (error) {
	console.error(`::error::cannot read pinned-ref.json: ${error.message}`);
	process.exit(1);
}

const repo = option('repo') ?? pinned.repo;
const pin = pinned.commit;

const remote = spawnSync('git', ['ls-remote', `https://github.com/${repo}.git`, 'HEAD'], {
	encoding: 'utf8',
});

if (remote.status !== 0) {
	console.log(`::notice::pinned-ref freshness skipped — git ls-remote ${repo} failed`);
	process.exit(0);
}

const head = (remote.stdout.split('\n')[0] ?? '').trim().split('\t')[0];

if (head === pin) {
	console.log(`✓ pinned ref ${pin.slice(0, 7)} is ${repo}@HEAD`);
	process.exit(0);
}

console.log(
	`::warning title=Pinned ref is behind::pinned-ref.json is ${pin.slice(0, 7)}, but ${repo}@HEAD is ${head.slice(0, 7)} — re-pin in an explicit PR when the framework moves (api-reference.md §6 yellow).`,
);
process.exit(1);
