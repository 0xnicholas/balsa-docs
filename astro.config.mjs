// Site skeleton (#17). Combo list: docs/spec/stack.md §4; nested `/docs` route: §3.2;
// frontmatter contract: §5. IA (urls, sidebar, families): docs/spec/ia.md §1/§2/§4/§7.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import starlightDotMd from 'starlight-dot-md';

export default defineConfig({
	// `site` stays unset until the platform host (#27) and the real domain (#29) land —
	// delivery.md §3.4 allows running on the temporary platform domain meanwhile.
	//
	// `base` stays unset on purpose (stack.md §3.2): `/docs` comes from the nested
	// `src/content/docs/docs/**` directory. Setting `base: '/docs'` would move the
	// site-root namespace (`/llms.txt`, `<route>.md`) under `/docs`.
	redirects: {
		// Placeholder for IA §2 (`/` → `/docs`). Static Astro emits a meta-refresh; the
		// formal ledger (`redirects.json` → `dist/_redirects`, real 301) is #18 —
		// delivery.md §4.1, and `/` → `/docs` becomes one of its entries.
		'/': '/docs',
	},
	vite: { plugins: [tailwindcss()] },
	integrations: [
		starlight({
			// Wordmark text is the logo slot (brand-visual.md §3.1); assets land with #19.
			title: 'Balsa',
			description: 'Documentation for Balsa, a lightweight TypeScript agent framework.',
			customCss: ['./src/styles/global.css'],
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
