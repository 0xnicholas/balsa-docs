/**
 * PROTOTYPE — single source of truth for the brand token candidates.
 * Throwaway scaffolding for ticket #16; the real site will hand-write these tokens.
 *
 * Three palettes ("warm wood" hue directions) x two depth rungs, each resolved
 * for both Starlight themes. Values are HSL triplets so they can be emitted as
 * `hsl()` custom properties verbatim.
 *
 * Depth rungs:
 *   accent  — accent tokens only; every neutral stays Starlight's default.
 *   warm    — accent tokens + a warm-tinted neutral scale (wood throughout).
 *   override— as `warm`, plus one registered `components:` override (Footer).
 */

/** @typedef {{ h: number, s: number, l: number }} Hsl */

export const palettes = {
	a: {
		id: 'a',
		name: 'Amber',
		nameZh: '琥珀',
		note: 'Saturated amber; the brightest, most "lit" of the three.',
		accent: {
			dark: { low: [36, 45, 20], mid: [36, 82, 55], high: [38, 72, 78] },
			light: { low: [38, 85, 90], mid: [36, 88, 33], high: [36, 84, 23] },
		},
	},
	b: {
		id: 'b',
		name: 'Bronze',
		nameZh: '青铜',
		note: 'Muted brown-gold; reads as aged metal, quietest of the three.',
		accent: {
			dark: { low: [28, 32, 20], mid: [28, 52, 52], high: [30, 52, 77] },
			light: { low: [30, 55, 90], mid: [28, 52, 40], high: [28, 50, 30] },
		},
	},
	c: {
		id: 'c',
		name: 'Clay',
		nameZh: '陶土',
		note: 'Red-shifted terracotta; warmest and most distinctive of the three.',
		accent: {
			dark: { low: [18, 40, 20], mid: [18, 60, 56], high: [20, 66, 79] },
			light: { low: [20, 70, 90], mid: [18, 64, 43], high: [18, 60, 32] },
		},
	},
	stock: {
		id: 'stock',
		name: 'Starlight default',
		nameZh: '默认',
		note: 'Upstream indigo on upstream greys — the reference point.',
		referenceOnly: true,
		accent: {
			dark: { low: [224, 54, 20], mid: [224, 100, 60], high: [224, 100, 85] },
			light: { low: [234, 88, 90], mid: [234, 90, 60], high: [234, 80, 30] },
		},
	},
};

/** Palettes the switcher cycles through (the reference entry is not selectable). */
export const selectablePalettes = Object.values(palettes).filter((p) => !p.referenceOnly);

/** Warm-tinted neutral scale (the "warm wood" paper/charcoal), by theme. */
const warmNeutrals = {
	dark: {
		white: [35, 15, 97],
		'gray-1': [35, 12, 92],
		'gray-2': [35, 8, 77],
		'gray-3': [35, 7, 58],
		'gray-4': [35, 7, 38],
		'gray-5': [35, 8, 24],
		'gray-6': [35, 10, 16],
		black: [30, 12, 10],
	},
	light: {
		white: [30, 14, 12],
		'gray-1': [35, 15, 16],
		'gray-2': [35, 12, 24],
		'gray-3': [35, 10, 38],
		'gray-4': [35, 10, 55],
		'gray-5': [35, 15, 80],
		'gray-6': [35, 20, 93],
		'gray-7': [35, 30, 98],
		black: [36, 40, 99],
	},
};

/** Starlight's stock neutral scale (depth rung `accent`, and the audit baseline). */
const stockNeutrals = {
	dark: {
		white: [0, 0, 100],
		'gray-1': [224, 20, 94],
		'gray-2': [224, 6, 77],
		'gray-3': [224, 6, 56],
		'gray-4': [224, 7, 36],
		'gray-5': [224, 10, 23],
		'gray-6': [224, 14, 16],
		black: [224, 10, 10],
	},
	light: {
		white: [224, 10, 10],
		'gray-1': [224, 14, 16],
		'gray-2': [224, 10, 23],
		'gray-3': [224, 7, 36],
		'gray-4': [224, 6, 56],
		'gray-5': [224, 6, 77],
		'gray-6': [224, 20, 94],
		'gray-7': [224, 19, 97],
		black: [0, 0, 100],
	},
};

/** Reverse of Starlight's own mapping: neutral name -> the role it plays. */
function neutralTokens(scale) {
	return {
		'--sl-color-white': scale.white,
		'--sl-color-gray-1': scale['gray-1'],
		'--sl-color-gray-2': scale['gray-2'],
		'--sl-color-gray-3': scale['gray-3'],
		'--sl-color-gray-4': scale['gray-4'],
		'--sl-color-gray-5': scale['gray-5'],
		'--sl-color-gray-6': scale['gray-6'],
		'--sl-color-gray-7': scale['gray-7'] ?? scale['gray-6'],
		'--sl-color-black': scale.black,
	};
}

/**
 * Full token map for one (palette, depth, theme) combination.
 * @param {'a'|'b'|'c'} palette
 * @param {'accent'|'warm'|'override'} depth
 * @param {'dark'|'light'} theme
 */
export function resolveTokens(palette, depth, theme) {
	const p = palettes[palette].accent[theme];
	const scale =
		depth === 'accent' || palette === 'stock' ? stockNeutrals[theme] : warmNeutrals[theme];
	const tokens = neutralTokens(scale);

	tokens['--sl-color-accent-low'] = p.low;
	tokens['--sl-color-accent'] = p.mid;
	tokens['--sl-color-accent-high'] = p.high;

	// Starlight derives these two from the accent triplet; keep them derived.
	const isDark = theme === 'dark';
	tokens['--sl-color-text-accent'] = isDark ? p.high : p.mid;
	tokens['--sl-color-text-invert'] = isDark ? p.low : scale.black;
	tokens['--sl-color-bg-accent'] = isDark ? p.high : p.mid;

	return tokens;
}

export const depths = [
	{ id: 'accent', label: 'token-only', note: 'accent tokens only · stock neutrals' },
	{ id: 'warm', label: '+ warm neutrals', note: 'accent tokens + wood-tinted greys' },
	{ id: 'override', label: '+ 1 override', note: 'as warm + registered Footer override' },
];

/* ---------------------------------------------------------------- colour math */

export const hsl = ([h, s, l]) => `hsl(${h}, ${s}%, ${l}%)`;

function hslToRgb([h, s, l]) {
	const sat = s / 100;
	const lig = l / 100;
	const k = (n) => (n + h / 30) % 12;
	const a = sat * Math.min(lig, 1 - lig);
	const f = (n) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return [f(0), f(8), f(4)].map((c) => Math.round(c * 255));
}

function relativeLuminance(hslTuple) {
	const [r, g, b] = hslToRgb(hslTuple).map((v) => {
		const c = v / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 contrast ratio between two HSL triplets. */
export function contrastRatio(a, b) {
	const [l1, l2] = [relativeLuminance(a), relativeLuminance(b)];
	const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
	return (hi + 0.05) / (lo + 0.05);
}

/** The pairs Starlight actually renders, per theme. Threshold: WCAG AA (4.5:1). */
export function auditPairs(palette, depth, theme) {
	const scale =
		depth === 'accent' || palette === 'stock' ? stockNeutrals[theme] : warmNeutrals[theme];
	const acc = palettes[palette].accent[theme];
	const isDark = theme === 'dark';
	const bg = scale.black;
	const surface = isDark ? scale['gray-6'] : scale['gray-7'] ?? scale['gray-6'];
	const link = isDark ? acc.high : acc.mid;
	return [
		{ label: 'body text on page bg', fg: scale['gray-2'], bg, min: 4.5 },
		{ label: 'body text on nav/sidebar surface', fg: scale['gray-2'], bg: surface, min: 4.5 },
		{ label: 'headings on page bg', fg: scale.white, bg, min: 4.5 },
		{ label: 'accent link on page bg', fg: link, bg, min: 4.5 },
		{ label: 'accent link on nav/sidebar surface', fg: link, bg: surface, min: 4.5 },
		{ label: 'accent text on accent-low chip', fg: isDark ? acc.high : acc.high, bg: isDark ? acc.low : acc.low, min: 4.5 },
		{
			label: 'inverted label on accent button',
			fg: isDark ? acc.low : scale.black,
			bg: isDark ? acc.high : acc.mid,
			min: 4.5,
		},
		{ label: 'muted meta text on page bg', fg: scale['gray-3'], bg, min: 4.5 },
	];
}

/** All nine (palette x depth) combinations, both themes. */
export function audit() {
	const rows = [];
	for (const paletteId of Object.keys(palettes)) {
		for (const { id: depth } of depths) {
			for (const theme of ['dark', 'light']) {
				for (const pair of auditPairs(paletteId, depth, theme)) {
					const ratio = contrastRatio(pair.fg, pair.bg);
					rows.push({
						palette: paletteId,
						depth,
						theme,
						label: pair.label,
						ratio,
						min: pair.min,
						pass: ratio >= pair.min,
					});
				}
			}
		}
	}
	return rows;
}

/** Token CSS for every combination — injected at build time (see astro.config.mjs). */
export function generateTokenCss() {
	const lines = [
		'/* GENERATED from src/lib/brand-tokens.mjs — do not edit by hand. PROTOTYPE. */',
	];
	for (const paletteId of selectablePalettes.map((p) => p.id)) {
		for (const { id: depth } of depths) {
			const sel = (theme) =>
				`:root[data-palette='${paletteId}'][data-depth='${depth}']${theme === 'light' ? "[data-theme='light']" : ''}`;
			for (const theme of ['dark', 'light']) {
				lines.push(`${sel(theme)} {`);
				for (const [name, value] of Object.entries(resolveTokens(paletteId, depth, theme))) {
					lines.push(`\t${name}: ${hsl(value)};`);
				}
				lines.push('}');
			}
		}
	}
	return lines.join('\n');
}
