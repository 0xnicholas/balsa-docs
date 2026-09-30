// PROTOTYPE (#16) — throwaway Starlight instance. Not the real site build.
// Answers: token-only depth (Q1) · splash landing at /docs (Q2) · warm-wood accent values (Q4).
// Combo list follows docs/spec/stack.md §4; content layout follows §3.2 (nested `docs/` dir).
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { generateTokenCss } from './src/lib/brand-tokens.mjs';

/**
 * Pre-paint: resolve palette/depth from the URL, then localStorage, then defaults,
 * and stamp them on <html> so the generated token CSS applies before first paint.
 */
const prototypeBootstrap = `(() => {
  const params = new URLSearchParams(location.search);
  const stored = (() => { try { return JSON.parse(localStorage.getItem('proto:brand') || '{}'); } catch { return {}; } })();
  const root = document.documentElement;
  root.dataset.palette = params.get('palette') || stored.palette || 'a';
  root.dataset.depth = params.get('depth') || stored.depth || 'accent';
})();`;

export default defineConfig({
	site: 'https://balsa-docs-prototype.invalid',
	// IA §2: site root → /docs. Static build emits meta-refresh; a real 301 is the host's job (#10).
	redirects: { '/': '/docs' },
	vite: { plugins: [tailwindcss()] },
	integrations: [
		starlight({
			title: 'Balsa',
			description: 'Prototype instance for the brand & visual decisions (ticket #16).',
			customCss: ['./src/styles/global.css'],
			// Coverage list (stack.md §9), registration count = 1. Only the Footer is overridden;
			// nothing else in the upstream implementation is forked or taken over.
			components: { Footer: './src/components/BrandFooter.astro' },
			head: [
				// Brand tokens for every (palette × depth × theme) combination, generated from
				// src/lib/brand-tokens.mjs. Unlayered, so they beat Starlight's own @layer rules.
				{ tag: 'style', content: generateTokenCss() },
				{ tag: 'script', content: prototypeBootstrap },
			],
			// Five families are sidebar groups, not nav lanes (ia.md §1). Explicit order, no autogenerate.
			// Reference family is absent on purpose: 0 pages at launch (ia.md §2), first page lands P1.
			sidebar: [
				{
					label: 'Get started',
					items: [
						{ label: 'Introduction', slug: 'docs' },
						{ label: 'Installation', slug: 'docs/get-started/installation' },
						{ label: 'Quickstart', slug: 'docs/get-started/quickstart' },
						{ label: 'Project structure', slug: 'docs/get-started/project-structure' },
					],
				},
				{
					label: 'Concepts',
					items: [
						{ label: 'Agents', slug: 'docs/concepts/agents' },
						{ label: 'Tools', slug: 'docs/concepts/tools' },
						{ label: 'Streaming', slug: 'docs/concepts/streaming' },
						{ label: 'Sessions', slug: 'docs/concepts/sessions' },
						{ label: 'Memory', slug: 'docs/concepts/memory' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Guide index', slug: 'docs/guides' },
						{ label: 'Your first agent', slug: 'docs/guides/first-agent' },
					],
				},
				{
					label: 'Project & ecosystem',
					items: [{ label: 'Docs for agents', slug: 'docs/project/docs-for-agents' }],
				},
			],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/0xnicholas/balsa-docs' }],
		}),
	],
});
