// Site skeleton (#17). Combo list: docs/spec/stack.md §4; nested `/docs` route: §3.2;
// frontmatter contract: §5. IA (urls, sidebar, families): docs/spec/ia.md §1/§2/§4/§7.
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import starlightDotMd from 'starlight-dot-md';
import { parseTokenCss, themeColorValues } from './src/lib/brand-tokens.ts';

// The token stylesheet is the single source for the theme-color pair (brand-visual.md §3.3):
// each value is that theme's resolved `--sl-color-black`, injected at build time. A
// stylesheet the parser cannot read fails the config — the same shape `pnpm verify` gates.
const tokenCss = readFileSync(new URL('./src/styles/global.css', import.meta.url), 'utf8');
const parsedTokens = parseTokenCss(tokenCss);
if (parsedTokens.errors.length > 0) {
	throw new Error(
		`src/styles/global.css is not a valid brand token layer:\n${parsedTokens.errors.join('\n')}`,
	);
}
const themeColor = themeColorValues(parsedTokens.tokens);

// `redirects.json` is the ledger and the single source of truth (#18, delivery.md §4.1);
// `dist/_redirects` (the real 301s the host serves) is generated from the same file by
// `scripts/gen-redirects.mjs` in the build tail. These entries mirror it for `astro dev`
// and for a preview that is not behind the platform yet — the platform takes redirects
// before files, so the generated file wins in production.
const ledger = JSON.parse(readFileSync(new URL('./redirects.json', import.meta.url), 'utf8'));

export default defineConfig({
	// `site` stays unset until the platform host (#27) and the real domain (#29) land —
	// delivery.md §3.4 allows running on the temporary platform domain meanwhile.
	//
	// `base` stays unset on purpose (stack.md §3.2): `/docs` comes from the nested
	// `src/content/docs/docs/**` directory. Setting `base: '/docs'` would move the
	// site-root namespace (`/llms.txt`, `<route>.md`) under `/docs`.
	redirects: Object.fromEntries(
		ledger.map((entry) => [entry.from, { status: entry.code, destination: entry.to }]),
	),
	vite: { plugins: [tailwindcss()] },
	integrations: [
		starlight({
			// Wordmark text is the logo slot (brand-visual.md §3.1); assets land with #19.
			title: 'Balsa',
			description: 'Documentation for Balsa, a lightweight TypeScript agent framework.',
			customCss: ['./src/styles/global.css'],
			// Browser chrome colour per OS scheme (brand-visual.md §3.3), and the site-wide
			// default OG of §3.1. `og:image` stays root-relative while `site` is unset — it
			// becomes absolute when the platform/domain slices land (#27/#29).
			head: [
				{
					tag: 'meta',
					attrs: {
						name: 'theme-color',
						media: '(prefers-color-scheme: light)',
						content: themeColor.light,
					},
				},
				{
					tag: 'meta',
					attrs: {
						name: 'theme-color',
						media: '(prefers-color-scheme: dark)',
						content: themeColor.dark,
					},
				},
				{ tag: 'meta', attrs: { property: 'og:image', content: '/og.png' } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
			],
			// Explicit sidebar, manual order, no autogenerate (ia.md §4, stack.md §5).
			// Families are sidebar groups; only families with published pages are listed.
			// Content slices #21–#25 add their entries as pages land.
			sidebar: [
				{
					label: 'Get started',
					items: [
						{ label: 'Introduction', slug: 'docs' },
						{ label: 'Quickstart', slug: 'docs/get-started/quickstart' },
					],
				},
			],
			// `.md` twin per page (agent-surface.md §2): `/docs/get-started/quickstart.md`.
			// The plugin only reads the default `docs` collection (stack.md §8).
			plugins: [starlightDotMd()],
		}),
	],
});
