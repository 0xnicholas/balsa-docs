/**
 * Shared plumbing for the repo gate scripts (#18): argument parsing, subprocess capture,
 * and the diff excerpt the generator/drift gates print when they go red. The ✓/✗ report
 * style follows #17's `scripts/check-frontmatter.mjs` / `check-routes.mjs`.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Parse `--key value`, `--key=value` and boolean `--flag` options. Unknown options and
 * bare positionals are errors: a gate that silently ignores a typo is a gate that lies.
 */
export function parseArgs(argv, { values = [], flags = [] } = {}) {
	const options = {};
	const errors = [];

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (!token.startsWith('--')) {
			errors.push(`unexpected argument \`${token}\``);
			continue;
		}

		const [name, inline] = token.slice(2).split('=');
		if (values.includes(name)) {
			const value = inline ?? argv[index + 1];
			if (value === undefined || value.startsWith('--')) {
				errors.push(`--${name} needs a value`);
				continue;
			}
			if (inline === undefined) index += 1;
			options[name] = value;
		} else if (flags.includes(name) && inline === undefined) {
			options[name] = true;
		} else {
			errors.push(`unknown option \`--${name}\``);
		}
	}

	return { options, errors };
}

/** Run a command and capture its output; never throws on a non-zero exit. */
export function run(command, args, { cwd } = {}) {
	const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
	return {
		ok: result.status === 0,
		status: result.status ?? -1,
		stdout: result.stdout ?? '',
		stderr: result.stderr ?? '',
	};
}

/**
 * `git -C <directory> …` for the gates that read a framework checkout: the drift gate
 * (#18) reads it at the pinned ref, `scripts/regen-api-tree.mjs` (#20) materializes and
 * builds it there.
 */
export function gitAt(directory) {
	return (...args) => run('git', ['-C', directory, ...args]);
}

/** Read JSON with a message a human can act on; returns `{ value }` or `{ error }`. */
export function readJson(file) {
	let text;
	try {
		text = readFileSync(file, 'utf8');
	} catch (error) {
		return { error: `cannot read ${file}: ${error.message}` };
	}
	try {
		return { value: JSON.parse(text) };
	} catch (error) {
		return { error: `${file} is not valid JSON: ${error.message}` };
	}
}

/** First differing line between two texts, for a compact red message. */
export function firstDifference(actual, expected) {
	const left = actual.split('\n');
	const right = expected.split('\n');
	const length = Math.max(left.length, right.length);
	for (let index = 0; index < length; index += 1) {
		if (left[index] !== right[index]) {
			return `line ${index + 1}\n  - expected: ${right[index] ?? '(nothing)'}\n  + found:    ${left[index] ?? '(nothing)'}`;
		}
	}
	return 'the files differ only by trailing bytes';
}

/**
 * The balsa-framework checkout the pinned-ref gates read: `--framework`, else
 * `$BALSA_FRAMEWORK_DIR`, else the sibling checkout `../balsa-framework`.
 */
export function frameworkDirOf(repoRoot, options) {
	return path.resolve(
		options.framework ??
			process.env.BALSA_FRAMEWORK_DIR ??
			path.join(repoRoot, '..', 'balsa-framework'),
	);
}

/**
 * The pinned ref: `--pin`, else `commit` in `pinned-ref.json`. Returns `{ pin, file }` or
 * `{ error }` — a missing pin is a gate failure, never a silent skip.
 */
export function pinnedRefOf(repoRoot, options) {
	if (typeof options.pin === 'string' && options.pin !== '') {
		return { pin: options.pin, file: null };
	}

	const file = path.join(repoRoot, 'pinned-ref.json');
	const pinned = readJson(file);
	if (pinned.error) return { error: pinned.error };

	const commit = pinned.value?.commit;
	if (typeof commit !== 'string' || commit === '') {
		return {
			error: `${path.relative(repoRoot, file)} must carry the balsa-framework \`commit\` SHA`,
		};
	}
	return { pin: commit, file };
}
