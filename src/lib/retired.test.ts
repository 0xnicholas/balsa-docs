import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { retiredNameIssues, type ScannedPage } from './retired.ts';

/**
 * The retired-name rule (#48): content carries current names only, with the npm scope
 * window (`@balsats/*`, 0.5.0's published scope) allowed on a line that names it as the
 * previous/old scope. The scan is the source half of `scripts/check-retired-names.mjs`,
 * which `pnpm verify` runs beside the frontmatter gates.
 */

const page = (text: string): ScannedPage => ({ path: 'src/content/docs/docs/example.md', text });

describe('retired names in content (#48)', () => {
	it('accepts current names', () => {
		assert.deepEqual(
			retiredNameIssues([
				page('Oribos is at https://docs.oribos.dev, published under `@oribos/*`.\n'),
			]),
			[],
		);
	});

	it('reports the brand and every retired repository or domain name', () => {
		const text = [
			'Balsats is the old brand.',
			'See 0xnicholas/balsats-framework and balsats-docs.',
			'Old links: https://docs.balsats.com/ and https://balsats.dev/.',
		].join('\n');
		const issues = retiredNameIssues([page(text)]);
		assert.deepEqual(
			issues.map((issue) => issue.token),
			['Balsats', 'balsats-framework', 'balsats-docs', 'balsats.com', 'balsats.dev'],
		);
		assert.deepEqual(
			issues.map((issue) => issue.line),
			[1, 2, 2, 3, 3],
		);
	});

	it('reports the retired marker prefix and the older balsa names', () => {
		assert.deepEqual(
			retiredNameIssues([page('<!-- balsats:verbatim file="README.md" -->\nbalsa-framework\n')]).map(
				(issue) => issue.token,
			),
			['balsats', 'balsa-framework'],
		);
	});

	it('allows @balsats/<name> only where the line names the previous/old scope', () => {
		assert.deepEqual(
			retiredNameIssues([
				page('0.5.0 shipped under the previous scope, so the install line is `@balsats/core`.\n'),
				page('The old scope was `@balsats/*`; the new one is `@oribos/*`.\n'),
			]),
			[],
		);
	});

	it('still reports a stale install line in the current scope voice', () => {
		const issues = retiredNameIssues([page('npm install @balsats/core\n')]);
		assert.equal(issues.length, 1);
		assert.equal(issues[0].token, '@balsats');
	});

	it('reports a retired repository name even on a scope-window line', () => {
		const issues = retiredNameIssues([
			page('The previous scope `@balsats/core` lives in balsats-docs.\n'),
		]);
		assert.deepEqual(
			issues.map((issue) => issue.token),
			['balsats-docs'],
		);
	});
});
