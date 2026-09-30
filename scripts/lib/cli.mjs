/**
 * Shared plumbing for the repo gate scripts (#18): argument parsing, subprocess capture,
 * and the diff excerpt the generator/drift gates print when they go red. The ✓/✗ report
 * style follows #17's `scripts/check-frontmatter.mjs` / `check-routes.mjs`.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

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
