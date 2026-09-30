#!/usr/bin/env node
/**
 * The brand-layer gate (#19) over the built site — the part of brand-visual.md that is
 * only true once the build has run: the token set really ships, the placeholder assets
 * exist with the pinned shape, the head carries the §3.3 `theme-color` pair and the
 * §3.1 default OG, the override registry is still empty, and no font CDN slipped in.
 *
 * Everything it reads comes from the repository (`src/styles/global.css`, `astro.config.mjs`)
 * or from `dist/` — nothing is hard-coded a second time except the §3.1 asset shape.
 *
 * Usage:
 *   node scripts/check-brand.mjs [--root <dir>] [--dist <dir>]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/cli.mjs';
import { hslToHex, parseTokenCss, themeColorValues } from '../src/lib/brand-tokens.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), {
	values: ['root', 'dist'],
});

if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

const repoRoot = options.root ?? root;
const dist = options.dist ?? path.join(repoRoot, 'dist');
const failures = [];

const { tokens, errors: tokenErrors } = parseTokenCss(
	readFileSync(path.join(repoRoot, 'src/styles/global.css'), 'utf8'),
);
if (tokenErrors.length > 0) {
	for (const error of tokenErrors) console.error(`✗ ${error}`);
	console.error(`\n${tokenErrors.length} token-layer problem(s) — the brand assets cannot be checked.`);
	process.exit(1);
}
const themeColor = themeColorValues(tokens);

/** 1 — the §2.2 token set is really in the shipped CSS, value for value. */
const shippedCss = readDistCss(dist);
const missingTokens = Object.values(tokens)
	.flatMap((set) => Object.entries(set))
	.filter(([, value]) => !shippedCss.includes(hslToHex(value)))
	.map(([name]) => name);
failures.push(
	...missingTokens.map(
		(name) =>
			`${name} is not in the built CSS — the hand-written token block did not survive the build`,
	),
);
if (missingTokens.length === 0) {
	console.log(`✓ tokens: all ${Object.keys(tokens.dark).length + Object.keys(tokens.light).length} §2.2 values ship in \`dist/_astro/*.css\``);
}

/** 2 — placeholder assets, in the §3.1 shape. */
const favicon = path.join(dist, 'favicon.svg');
if (!existsSync(favicon)) {
	failures.push('dist/favicon.svg is missing — Starlight links `/favicon.svg` (brand-visual.md §3.1)');
} else {
	const svg = readFileSync(favicon, 'utf8');
	const values = ['#9e630a', '#efd29f'];
	const missing = [
		...values.filter((value) => !svg.includes(value)),
		...(!svg.includes('prefers-color-scheme') ? ['prefers-color-scheme'] : []),
	];
	if (missing.length > 0) {
		failures.push(`dist/favicon.svg is not the dual-value placeholder — missing ${missing.join(', ')}`);
	} else {
		console.log('✓ favicon: single glyph, both values (#9e630a / #efd29f) switch on prefers-color-scheme');
	}
}

const ogImage = path.join(dist, 'og.png');
if (!existsSync(ogImage)) {
	failures.push('dist/og.png is missing — the §3.1 default OG does not ship');
} else {
	const png = readFileSync(ogImage);
	const [width, height] = readPngSize(png);
	if (png.subarray(0, 8).toString('latin1') !== '\x89PNG\r\n\x1a\n' || width !== 1200 || height !== 630) {
		failures.push(
			`dist/og.png is not a 1200×630 PNG (got ${width}×${height}) — OG dimensions are pinned in §3.1`,
		);
	} else {
		console.log('✓ og: dist/og.png is a 1200×630 PNG');
	}
}

/** 3 — the head wiring on a rendered page: theme-color ×2, OG image, favicon. */
const page = path.join(dist, 'docs/index.html');
if (!existsSync(page)) {
	failures.push('dist/docs/index.html is missing — cannot check the head wiring');
} else {
	const html = readFileSync(page, 'utf8');
	const expectTags = [
		['light theme-color', `<meta name="theme-color" media="(prefers-color-scheme: light)" content="${themeColor.light}"`],
		['dark theme-color', `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="${themeColor.dark}"`],
		['default OG image', '<meta property="og:image" content="/og.png"'],
		['OG width', '<meta property="og:image:width" content="1200"'],
		['OG height', '<meta property="og:image:height" content="630"'],
		['favicon link', 'rel="shortcut icon"'],
		['favicon href', 'href="/favicon.svg"'],
	];
	const absent = expectTags.filter(([, needle]) => !html.includes(needle)).map(([label]) => label);
	failures.push(...absent.map((label) => `dist/docs/index.html has no ${label}`));
	if (absent.length === 0) {
		console.log(
			`✓ head: theme-color ${themeColor.light}/${themeColor.dark}, default OG 1200×630, favicon — all on the splash page`,
		);
	}

	/** 3b — the splash structure rendered (and the MDX did not leak as text). */
	const splashShapes = [
		['hero', 'class="hero'],
		['card grid', 'card-grid'],
	];
	const missingShapes = splashShapes
		.filter(([, needle]) => !html.includes(needle))
		.map(([label]) => label);
	if (missingShapes.length > 0) {
		failures.push(`dist/docs/index.html is not the splash layout — missing ${missingShapes.join(', ')}`);
	} else if (html.includes('<CardGrid')) {
		failures.push('dist/docs/index.html leaks raw MDX (`<CardGrid`) — the component did not render');
	} else {
		console.log('✓ splash: hero + card grid rendered from built-in components (no raw MDX leak)');
	}
}

/** 4 — the override registry stays empty: Astro/Starlight config has no `components:` key. */
// Comments are stripped first — a config that *talks about* `components:` is not an override
// (line comments after a `:` survive, so a social URL cannot swallow the rest of a line).
const configSource = readFileSync(path.join(repoRoot, 'astro.config.mjs'), 'utf8')
	.replace(/\/\*[\s\S]*?\*\//g, '')
	.replace(/(?<!:)\/\/[^\n]*/g, '');
if (/\bcomponents\s*:/.test(configSource)) {
	failures.push(
		'astro.config.mjs registers a `components:` override — the override registry is empty (brand-visual.md §4); adding one is a spec change',
	);
} else {
	console.log('✓ overrides: none registered (`components:` absent from the config)');
}

/** 5 — no font CDN: the system stack only (brand-visual.md §3.2). */
const fontCdnPatterns = [/fonts\.googleapis\.com/, /fonts\.gstatic\.com/, /use\.typekit\.net/, /fonts\.bunny\.net/];
const styleAssets = readAll(path.join(dist, '_astro')).filter((file) => file.endsWith('.css'));
const pageAssets = readAll(path.join(dist, 'docs')).filter((file) => file.endsWith('.html'));
const leaked = [...styleAssets, ...pageAssets].filter((file) =>
	fontCdnPatterns.some((pattern) => pattern.test(readFileSync(file, 'utf8'))),
);
failures.push(...leaked.map((file) => `${path.relative(repoRoot, file)} references a font CDN — §3.2 forbids external fonts`));
const embedded = styleAssets.filter((file) => readFileSync(file, 'utf8').includes('@font-face'));
failures.push(...embedded.map((file) => `${path.relative(repoRoot, file)} declares @font-face — §3.2 keeps the system stack until the brand font lands`));
if (leaked.length === 0 && embedded.length === 0) {
	console.log('✓ fonts: system stack only — no font CDN, no @font-face in the built stylesheets');
}

if (failures.length > 0) {
	console.error('');
	for (const failure of failures) console.error(`✗ ${failure}`);
	console.error(`\n${failures.length} brand-layer check(s) failed (brand-visual.md §3/§4/§5).`);
	process.exit(1);
}

console.log('\nBrand layer ships as specified.');

/** Concatenated `dist/_astro/*.css` — the built token blocks, minified but value-preserving. */
function readDistCss(distDir) {
	return readAll(path.join(distDir, '_astro'))
		.filter((file) => file.endsWith('.css'))
		.map((file) => readFileSync(file, 'utf8'))
		.join('\n');
}

/** Every file under `dir`, recursively; missing directories yield an empty list. */
function readAll(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(dir, entry.name);
		return entry.isDirectory() ? readAll(full) : [full];
	});
}

/** PNG dimensions from the IHDR chunk (bytes 16–24); no image library needed. */
function readPngSize(png) {
	if (png.length < 24) return [0, 0];
	return [png.readUInt32BE(16), png.readUInt32BE(20)];
}
