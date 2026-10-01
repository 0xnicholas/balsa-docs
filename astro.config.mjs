// Site skeleton (#17). Combo list: docs/spec/stack.md §4; nested `/docs` route: §3.2;
// frontmatter contract: §5. IA (urls, sidebar, families): docs/spec/ia.md §1/§2/§4/§7.
// API reference tree: docs/spec/api-reference.md §2 (pipeline) / §4 (cleanup + diff gate).
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import starlightDotMd from 'starlight-dot-md';
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc';
import {
	apiSidebarFile,
	apiSidebarLabel,
	apiTreeAvailable,
	apiTreeOutput,
	normalizeApiTree,
	rootReadme,
	apiTreeRoot,
} from './src/lib/api-tree.ts';
import { parseTokenCss, themeColorValues } from './src/lib/brand-tokens.ts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

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

// The generated API tree (api-reference.md §2/§4). Generation needs the pinned
// balsa-framework checkout at the fixed path `.framework/balsa-framework` (api-reference.md
// §4 F9: entry paths are baked into every generated page, so there is exactly one path);
// without it — the platform build of #27 must not need a framework checkout — the committed
// tree is rendered as-is and the sidebar is the committed snapshot below: the same group the
// plugin builds, in its committed form.
const apiTreeEnabled = apiTreeAvailable(rootDir);

/**
 * The Reference family's group. With the framework present, `starlight-typedoc` replaces
 * the placeholder with the group it builds from the generated tree (api-reference.md §3 F7);
 * `apiSidebarSnapshot()` then commits that group to `api-sidebar.json`. Without the
 * framework the snapshot is the sidebar, so the committed tree stays navigable everywhere.
 */
const apiSidebarGroup = apiTreeEnabled ? typeDocSidebarGroup : readApiSidebarSnapshot();

function readApiSidebarSnapshot() {
	const file = path.join(rootDir, apiSidebarFile);
	try {
		return JSON.parse(readFileSync(file, 'utf8'));
	} catch (error) {
		throw new Error(
			`${apiSidebarFile} is missing or unreadable (${error.message}) — it is committed beside the generated tree; regenerate with \`pnpm regen:api\``,
		);
	}
}

/**
 * Commit the sidebar group the typedoc plugin just built (api-reference.md §3 F7 + §4):
 * the committed tree must stay navigable in builds that have no framework checkout. Runs
 * after `starlight-typedoc`, whose `updateConfig` this hook sees (Starlight runs plugin
 * hooks in order and passes the accumulated config).
 *
 * `astro preview` is the exception: it serves the built `dist/` and starlight-typedoc
 * returns before generating, so there is no group to capture — and the placeholder it would
 * have replaced never renders. Skipping is the whole job: writing here would rewrite the
 * artifact on a command that is documented to consume it as committed (api-reference.md
 * §4 F10), and demanding the replaced group would break preview outright.
 */
function apiSidebarSnapshot() {
	return {
		name: 'balsa-api-sidebar-snapshot',
		hooks: {
			'config:setup'({ command, config }) {
				if (command === 'preview') return;

				const group = config.sidebar?.find(
					(item) => typeof item === 'object' && item !== null && 'items' in item && item.label === apiSidebarLabel,
				);
				if (!group) {
					throw new Error(
						`the \`${apiSidebarLabel}\` sidebar placeholder was not replaced by starlight-typedoc — check the plugin order in astro.config.mjs`,
					);
				}
				writeFileSync(
					path.join(rootDir, apiSidebarFile),
					`${JSON.stringify(group, null, '\t')}\n`,
				);
			},
		},
	};
}

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
			// Content slices #21–#25 add their entries as pages land. The API Reference group
			// is the Reference family (ia.md §2/§7) — it sits before Project & ecosystem.
			sidebar: [
				{
					label: 'Get started',
					items: [
						{ label: 'Introduction', slug: 'docs' },
						{ label: 'Installation', slug: 'docs/get-started/installation' },
						{ label: 'Quickstart', slug: 'docs/get-started/quickstart' },
						{ label: 'Concepts overview', slug: 'docs/get-started/concepts-overview' },
					],
				},
				{
					// Concepts follows the family order of ia.md §7 (agents → tools → models → memory →
					// workflows).
					label: 'Concepts',
					items: [
						{ label: 'Agents', slug: 'docs/concepts/agents' },
						{ label: 'Tools', slug: 'docs/concepts/tools' },
						{ label: 'Models', slug: 'docs/concepts/models' },
						{ label: 'Memory', slug: 'docs/concepts/memory' },
						{ label: 'Workflows', slug: 'docs/concepts/workflows' },
					],
				},
				{
					// Guides follows the family order of ia.md §7. The family's sub-types group the
					// sidebar, never the URL (ia.md §4): both first-launch guides pages carry
					// `subtype: walkthrough`.
					label: 'Guides',
					items: [
						{
							label: 'Walkthrough',
							items: [
								{ label: 'Examples', slug: 'docs/guides/examples' },
								{ label: 'Walkthrough: minimal-agent', slug: 'docs/guides/minimal-agent' },
							],
						},
					],
				},
				apiSidebarGroup,
				{
					// Project & ecosystem (ia.md §7): project status and the agent guide.
					label: 'Project & ecosystem',
					items: [{ label: 'Docs for AI agents', slug: 'docs/project/docs-for-agents' }],
				},
			],
			plugins: [
				// `.md` twin per page (agent-surface.md §2): `/docs/get-started/quickstart.md`.
				// The plugin only reads the default `docs` collection (stack.md §8).
				starlightDotMd(),
				// TypeDoc tree generation + sidebar group. Entry points and tsconfig live in
				// the committed `typedoc.json` (stack.md §13.1: TypeDoc options go in a config
				// file, not inline) — the same file the CLI validation pass in
				// `scripts/regen-api-tree.mjs` runs, so the zero-warning red line and the
				// generation always look at the same entry set.
				...(apiTreeEnabled
					? [
							starlightTypeDoc({
								output: apiTreeOutput,
								sidebar: { label: apiSidebarLabel, collapsed: true },
							}),
							apiSidebarSnapshot(),
						]
					: []),
			],
		}),
		// Normalize step, api-reference.md §4 ③: starlight-typedoc generated the tree inside
		// Starlight's `config:setup`, which runs before this integration's hook — so dev,
		// build and CI all clean the orphan root README and stamp the generated marker
		// before the content collections load.
		{
			name: 'balsa-api-tree',
			hooks: {
				'astro:config:setup': ({ command, logger }) => {
					// `preview` consumes the committed artifact as committed (api-reference.md §4 F10):
					// no generation ran, so there is nothing to normalize.
					if (command === 'preview') return;

					const report = normalizeApiTree(rootDir);
					if (report.removed.length > 0) {
						logger.info(`removed ${apiTreeRoot}/${rootReadme} (orphan page, api-reference.md §1)`);
					}
					if (report.marked.length > 0) {
						logger.info(`marked ${report.marked.length} generated page(s)`);
					}
				},
			},
		},
	],
});
