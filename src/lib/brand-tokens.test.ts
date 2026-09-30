import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
	auditTokens,
	contrastRatio,
	derivedTokens,
	hslToHex,
	parseTokenCss,
	requiredTokens,
	themeColorValues,
} from './brand-tokens.ts';

/**
 * The brand token layer: `src/styles/global.css` carries the hand-written token set of
 * brand-visual.md §2.2, and these cases pin the two contracts around it —
 *
 *  1. the stylesheet parses into exactly the §2.2 table (nothing missing, nothing added
 *     on the derived slots), and
 *  2. the 16 WCAG AA pairs of §5① pass, with the two ratios §2.1 publishes as the
 *     pinned reference values.
 */

const siteCss = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');

/** The §2.2 table, verbatim — the fixture for parser cases. */
const darkTokens = `--sl-color-white: hsl(35, 15%, 97%);
	--sl-color-gray-1: hsl(35, 12%, 92%);
	--sl-color-gray-2: hsl(35, 8%, 77%);
	--sl-color-gray-3: hsl(35, 7%, 58%);
	--sl-color-gray-4: hsl(35, 7%, 38%);
	--sl-color-gray-5: hsl(35, 8%, 24%);
	--sl-color-gray-6: hsl(35, 10%, 16%);
	--sl-color-black: hsl(30, 12%, 10%);
	--sl-color-accent-low: hsl(36, 45%, 20%);
	--sl-color-accent: hsl(36, 82%, 55%);
	--sl-color-accent-high: hsl(38, 72%, 78%);`;

const lightTokens = `--sl-color-white: hsl(30, 14%, 12%);
	--sl-color-gray-1: hsl(35, 15%, 16%);
	--sl-color-gray-2: hsl(35, 12%, 24%);
	--sl-color-gray-3: hsl(35, 10%, 38%);
	--sl-color-gray-4: hsl(35, 10%, 55%);
	--sl-color-gray-5: hsl(35, 15%, 80%);
	--sl-color-gray-6: hsl(35, 20%, 93%);
	--sl-color-gray-7: hsl(35, 30%, 98%);
	--sl-color-black: hsl(36, 40%, 99%);
	--sl-color-accent-low: hsl(38, 85%, 90%);
	--sl-color-accent: hsl(36, 88%, 33%);
	--sl-color-accent-high: hsl(36, 84%, 23%);`;

const stylesheet = (dark: string, light: string) =>
	`:root {\n\t${dark}\n}\n\n:root[data-theme='light'] {\n\t${light}\n}\n`;

const errorsFor = (css: string) => parseTokenCss(css).errors.join('\n');

describe('token parsing (brand-visual.md §2.2)', () => {
	it('parses the site stylesheet into both themes with no errors', () => {
		const { tokens, errors } = parseTokenCss(siteCss);
		assert.deepEqual(errors, []);
		assert.equal(Object.keys(tokens.dark).length, requiredTokens.dark.length);
		assert.equal(Object.keys(tokens.light).length, requiredTokens.light.length);
		assert.equal(tokens.dark['--sl-color-accent'], 'hsl(36, 82%, 55%)');
		assert.equal(tokens.light['--sl-color-black'], 'hsl(36, 40%, 99%)');
		assert.equal(tokens.light['--sl-color-gray-7'], 'hsl(35, 30%, 98%)');
	});

	it('requires every §2.2 slot per theme — a missing token is red, not a silent fallback', () => {
		// The dangerous shape: one token dropped, Starlight's stock value wins unnoticed.
		const missing = darkTokens.replace('\t--sl-color-gray-4: hsl(35, 7%, 38%);', '');
		assert.match(errorsFor(stylesheet(missing, lightTokens)), /--sl-color-gray-4/);
	});

	it('rejects a value that is not an hsl() triplet', () => {
		const malformed = darkTokens.replace('hsl(35, 15%, 97%)', '#fff');
		assert.match(errorsFor(stylesheet(malformed, lightTokens)), /--sl-color-white/);
	});

	it('rejects a token declared twice in the same theme', () => {
		const duplicated = `${darkTokens}\n\t--sl-color-black: hsl(30, 12%, 11%);`;
		assert.match(errorsFor(stylesheet(duplicated, lightTokens)), /--sl-color-black/);
	});

	it('rejects hand-writing a derived token (Starlight maps it from the accent triplet)', () => {
		const handWritten = `${darkTokens}\n\t--sl-color-text-accent: hsl(38, 72%, 78%);`;
		assert.match(errorsFor(stylesheet(handWritten, lightTokens)), /--sl-color-text-accent/);
		assert.ok(derivedTokens.includes('--sl-color-text-invert'));
	});
});

describe('colour maths (WCAG 2.1)', () => {
	it('computes the reference ratios', () => {
		assert.equal(contrastRatio('hsl(0, 0%, 100%)', 'hsl(0, 0%, 0%)'), 21);
	});

	it('resolves the theme-color values of §3.3 from the token table', () => {
		assert.equal(hslToHex('hsl(36, 40%, 99%)'), '#fdfdfb');
		assert.equal(hslToHex('hsl(30, 12%, 10%)'), '#1d1a16');
	});
});

describe('AA audit (brand-visual.md §5①)', () => {
	const { tokens, errors } = parseTokenCss(siteCss);
	const { rows } = auditTokens(tokens);

	it('covers 8 pairs × 2 themes = 16 checks', () => {
		assert.deepEqual(errors, []);
		assert.equal(rows.length, 16);
		assert.deepEqual(
			rows.filter((row) => row.theme === 'light').length,
			8,
		);
	});

	it('passes every check with the hand-written token set', () => {
		assert.deepEqual(
			rows.filter((row) => !row.pass).map((row) => `${row.theme}: ${row.label}`),
			[],
		);
	});

	it('pins the two published ratios of §2.1', () => {
		const lightLink = rows.find(
			(row) => row.theme === 'light' && row.label === 'accent link on page background',
		);
		const darkLink = rows.find(
			(row) => row.theme === 'dark' && row.label === 'accent link on page background',
		);
		assert.ok(lightLink && darkLink);
		assert.equal(lightLink.ratio.toFixed(2), '4.86');
		assert.equal(darkLink.ratio.toFixed(2), '11.88');
	});

	it('resolves the theme-color meta pair from the same table', () => {
		assert.deepEqual(themeColorValues(tokens), { light: '#fdfdfb', dark: '#1d1a16' });
	});
});
