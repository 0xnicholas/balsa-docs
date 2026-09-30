/**
 * The brand token layer — `src/styles/global.css` is the single source of truth for the
 * warm-wood palette (brand-visual.md §2.2), and this module is the only reader of it:
 * the CI audit (`scripts/check-contrast.mjs`), the theme-color meta pair, and the unit
 * tests all go through `parseTokenCss`. Pure rules only; callers do the filesystem work.
 *
 * Two contracts the spec pins and this module enforces:
 *
 *  1. **The §2.2 table is complete.** A missing slot is an error, not a silent fallback
 *     to Starlight's stock value — that failure mode is invisible in the rendered page.
 *     Derived slots (`--sl-color-text-accent` and friends) must *not* be hand-written:
 *     Starlight maps them from the accent triplet, and hand-writing them forks upstream.
 *  2. **AA holds.** §5① reduces the palette to 8 rendered pairs × 2 themes; each pair is
 *     checked against WCAG AA (4.5:1) with the contrast maths below.
 */

export type Theme = 'light' | 'dark';
/** Token name → declared value, e.g. `--sl-color-accent` → `hsl(36, 82%, 55%)`. */
export type TokenSet = Record<string, string>;

/** The slots §2.2 hands over per theme; light adds `--sl-color-gray-7` (no dark slot). */
export const requiredTokens = {
	dark: [
		'--sl-color-white',
		'--sl-color-gray-1',
		'--sl-color-gray-2',
		'--sl-color-gray-3',
		'--sl-color-gray-4',
		'--sl-color-gray-5',
		'--sl-color-gray-6',
		'--sl-color-black',
		'--sl-color-accent-low',
		'--sl-color-accent',
		'--sl-color-accent-high',
	],
	light: [
		'--sl-color-white',
		'--sl-color-gray-1',
		'--sl-color-gray-2',
		'--sl-color-gray-3',
		'--sl-color-gray-4',
		'--sl-color-gray-5',
		'--sl-color-gray-6',
		'--sl-color-gray-7',
		'--sl-color-black',
		'--sl-color-accent-low',
		'--sl-color-accent',
		'--sl-color-accent-high',
	],
} as const satisfies Record<Theme, readonly string[]>;

/**
 * Slots Starlight derives from the triplet above (§2.2, "派生量不手写"):
 * `--sl-color-text-accent`, `--sl-color-text-invert`, `--sl-color-bg-accent`.
 */
export const derivedTokens = [
	'--sl-color-text-accent',
	'--sl-color-text-invert',
	'--sl-color-bg-accent',
] as const;

export type Hsl = { h: number; s: number; l: number };

/** Selector that scopes a block: `:root` is Starlight's dark default, the light block is explicit. */
const themeSelectors: Array<[Theme, RegExp]> = [
	['dark', /^:root$/],
	['light', /^:root\[data-theme=(['"])light\1\]$/],
];

/** `hsl(36, 82%, 55%)` and the comma-free modern form; the §2.2 table uses the former. */
export function parseHsl(value: string): Hsl | null {
	const match = value.trim().match(/^hsl\(\s*(\d+(?:\.\d+)?)(?:,|\s)\s*(\d+(?:\.\d+)?)%(?:,|\s)\s*(\d+(?:\.\d+)?)%\s*\)$/i);
	if (!match) return null;
	return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

/**
 * Read the hand-written token blocks out of a stylesheet: every `:root` block feeds the
 * dark set, `:root[data-theme='light']` the light set. Returns `errors` instead of
 * throwing so the gate can report every problem in one run.
 */
export function parseTokenCss(css: string): { tokens: Record<Theme, TokenSet>; errors: string[] } {
	const tokens: Record<Theme, TokenSet> = { dark: {}, light: {} };
	const errors: string[] = [];
	const seen: Record<Theme, Set<string>> = { dark: new Set(), light: new Set() };

	// Comments first: a `{` inside one would derail the block scan.
	const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
	for (const [, rawSelector, body] of stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		// Whatever precedes the last `;` is an at-rule (`@import`), not part of the selector.
		const selector = rawSelector.split(';').pop()!.trim().replace(/\s+/g, ' ');
		const theme = themeSelectors.find(([, pattern]) => pattern.test(selector))?.[0];
		if (!theme) continue;

		for (const [, name, rawValue] of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
			if (!name.startsWith('--sl-color-')) continue;
			if ((derivedTokens as readonly string[]).includes(name)) {
				errors.push(
					`${name} is derived by Starlight from the accent triplet — do not hand-write it (brand-visual.md §2.2)`,
				);
				continue;
			}
			if (seen[theme].has(name)) {
				errors.push(`${name} is declared twice in the ${theme} token block`);
				continue;
			}
			seen[theme].add(name);
			tokens[theme][name] = rawValue.trim();
		}
	}

	for (const theme of ['dark', 'light'] as const) {
		for (const name of requiredTokens[theme]) {
			if (!(name in tokens[theme])) {
				errors.push(`the ${theme} token block is missing ${name} (brand-visual.md §2.2)`);
			}
		}
		for (const [name, value] of Object.entries(tokens[theme])) {
			if (parseHsl(value) === null) {
				errors.push(`${name} in the ${theme} token block is not an hsl() triplet: \`${value}\``);
			}
		}
	}

	return { tokens, errors };
}

/* ---------------------------------------------------------------- colour maths */

function rgbChannels({ h, s, l }: Hsl): [number, number, number] {
	const saturation = s / 100;
	const lightness = l / 100;
	const k = (n: number) => (n + h / 30) % 12;
	const a = saturation * Math.min(lightness, 1 - lightness);
	const f = (n: number) =>
		lightness - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return [f(0), f(8), f(4)].map((channel) => Math.round(channel * 255)) as [
		number,
		number,
		number,
	];
}

/** WCAG 2.1 relative luminance of an `hsl()` value, computed on the 8-bit channels. */
export function relativeLuminance(value: string): number {
	const hsl = parseHsl(value);
	if (hsl === null) throw new Error(`not an hsl() value: ${value}`);
	const [r, g, b] = rgbChannels(hsl).map((channel) => {
		const c = channel / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** WCAG 2.1 contrast ratio between two `hsl()` values. */
export function contrastRatio(a: string, b: string): number {
	const [first, second] = [relativeLuminance(a), relativeLuminance(b)];
	const [high, low] = first > second ? [first, second] : [second, first];
	return (high + 0.05) / (low + 0.05);
}

/** `#rrggbb` of an `hsl()` value — the shape `theme-color` meta tags need (§3.3). */
export function hslToHex(value: string): string {
	const hsl = parseHsl(value);
	if (hsl === null) throw new Error(`not an hsl() value: ${value}`);
	return `#${rgbChannels(hsl)
		.map((channel) => channel.toString(16).padStart(2, '0'))
		.join('')}`;
}

/* ---------------------------------------------------------------- rendering roles */

/**
 * Starlight's own mapping from the token table to what a page renders
 * (`@astrojs/starlight/dist/style/props.css`, read at #19): the sidebar surface is
 * `--sl-color-gray-6` in dark and falls back to the page background in light, and the
 * accent roles follow the `--sl-color-text-accent` / `text-invert` / `bg-accent` map.
 */
function renderingRoles(theme: Theme, tokens: TokenSet) {
	return {
		page: tokens['--sl-color-black']!,
		surface: theme === 'dark' ? tokens['--sl-color-gray-6']! : tokens['--sl-color-black']!,
		link: theme === 'dark' ? tokens['--sl-color-accent-high']! : tokens['--sl-color-accent']!,
		invert: theme === 'dark' ? tokens['--sl-color-accent-low']! : tokens['--sl-color-black']!,
		accentBackground:
			theme === 'dark' ? tokens['--sl-color-accent-high']! : tokens['--sl-color-accent']!,
	};
}

/** WCAG AA for normal text; §5① audits exactly these rendered pairs. */
const AA = 4.5;

export type AuditRow = {
	theme: Theme;
	label: string;
	fg: string;
	bg: string;
	ratio: number;
	min: number;
	pass: boolean;
};

/** The 8 pairs §5① enumerates — body / headings / link × page & sidebar, chip, button, muted. */
function auditPairs(theme: Theme, tokens: TokenSet) {
	const role = renderingRoles(theme, tokens);
	return [
		{ label: 'body text on page background', fg: tokens['--sl-color-gray-2']!, bg: role.page },
		{ label: 'body text on sidebar surface', fg: tokens['--sl-color-gray-2']!, bg: role.surface },
		{ label: 'headings on page background', fg: tokens['--sl-color-white']!, bg: role.page },
		{ label: 'accent link on page background', fg: role.link, bg: role.page },
		{ label: 'accent link on sidebar surface', fg: role.link, bg: role.surface },
		{ label: 'accent text on accent-low chip', fg: tokens['--sl-color-accent-high']!, bg: tokens['--sl-color-accent-low']! },
		{ label: 'inverted label on accent button', fg: role.invert, bg: role.accentBackground },
		{ label: 'muted meta text on page background', fg: tokens['--sl-color-gray-3']!, bg: role.page },
	];
}

/** Run §5① over both themes: 8 pairs × 2 themes = the 16 checks the CI gate reports. */
export function auditTokens(tokens: Record<Theme, TokenSet>): { rows: AuditRow[]; errors: string[] } {
	const rows: AuditRow[] = [];
	const errors: string[] = [];

	for (const theme of ['dark', 'light'] as const) {
		for (const { label, fg, bg } of auditPairs(theme, tokens[theme])) {
			if (typeof fg !== 'string' || typeof bg !== 'string') {
				errors.push(`${theme}: \`${label}\` needs tokens the ${theme} block does not declare`);
				continue;
			}
			const ratio = contrastRatio(fg, bg);
			rows.push({ theme, label, fg, bg, ratio, min: AA, pass: ratio >= AA });
		}
	}

	return { rows, errors };
}

/** The two `theme-color` values of §3.3: each theme's resolved `--sl-color-black`. */
export function themeColorValues(tokens: Record<Theme, TokenSet>): Record<Theme, string> {
	return {
		light: hslToHex(tokens.light['--sl-color-black']!),
		dark: hslToHex(tokens.dark['--sl-color-black']!),
	};
}
