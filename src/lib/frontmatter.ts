import { z } from 'astro/zod';

/**
 * The frontmatter field table — ia.md §4 (field / owner / value domain) and stack.md §5 —
 * plus the one page shape that is not authored: the generated API tree.
 *
 * `frontmatterFields` (bottom of this file) is what `docsSchema({ extend })` deep-merges
 * into Starlight's own schema (stack.md §13.1, verified in #17); the union lets both shapes
 * into the same `docs` collection without weakening the rules for either.
 *
 * Fields Starlight already owns (`sidebar.order`, `template`, `hero`, …) stay untouched:
 * the project's `order` below is a flat, family-scoped field, not `sidebar.order`.
 */

/**
 * `@balsa/*` values a page may point at: the default project's export surface — root export
 * plus its 9 subpaths (content-boundary.md §6, api-reference.md §1). Widened when the
 * framework adds exports (M5 capability packages). The pin-level check that this list
 * equals the real `package.json` exports runs in `scripts/check-content.mjs` (#18).
 */
export const packageValues = [
	'@balsa/core',
	'@balsa/core/agent',
	'@balsa/core/durable-agent',
	'@balsa/core/memory',
	'@balsa/core/model',
	'@balsa/core/observability',
	'@balsa/core/schedules',
	'@balsa/core/signals',
	'@balsa/core/tools',
	'@balsa/core/workflows',
] as const;

/**
 * Full 40-character lowercase commit SHA — the shape of a `source.ref` lag and of the
 * repo-wide pinned ref (content-boundary.md §4 / stack.md §13.1). Exported so the
 * value-domain gate applies exactly this rule (`src/lib/content-values.ts`).
 */
export const commitShaPattern = /^[0-9a-f]{40}$/;

/**
 * Source-material pointer: the upstream file a page was rewritten from, plus the framework
 * commit it was written against (content-boundary.md §2.1-4 / §4). `ref` may be omitted to
 * mean "the repo-wide pinned ref" (#18); it is only set when a page deliberately lags it,
 * and then it must be an ancestor of the pin (scripts/check-drift.mjs).
 */
const sourcePointer = z.object({
	/** Path inside balsa-framework, e.g. `docs/architecture/agents.md`. */
	file: z.string().min(1),
	/** Full commit SHA the page was written against; omitted = the pinned ref. */
	ref: z
		.string()
		.regex(commitShaPattern, 'expected a full 40-character lowercase commit SHA')
		.optional(),
});

/**
 * The authored-page field table: every page a human writes carries these fields, and the
 * build rejects a violation. The generated API tree is the one exemption — it is TypeDoc's
 * output, not authored content, and its pages carry `generated: true` instead (see below).
 */
export const contentFields = z.object({
	/** Page title; also the sidebar label unless overridden. */
	title: z.string().min(1),
	/** One-line summary: search results, llms.txt entries, manifest descriptions. */
	description: z.string().min(1),
	/** Owning project: `balsa` (default) or a lower-case project slug — ia.md §4/§5, ADR-0001. */
	project: z
		.string()
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'expected a lower-case project slug (letters, digits, single hyphens)')
		.default('balsa'),
	/**
	 * Guides sub-type; drives sidebar sub-grouping, never the URL (ia.md §4). The
	 * Guides-family restriction is a cross-file rule: the value-domain script (#18) checks it.
	 */
	subtype: z.enum(['walkthrough', 'migration']).optional(),
	/** Manual position inside a family; no value = append (ia.md §4). */
	order: z.number().int().optional(),
	/**
	 * Packages/subpaths this page documents — content-boundary.md §6. Empty is allowed for
	 * pages outside the five families (e.g. the 404 page); it maps nowhere in the manifest.
	 */
	packages: z.array(z.enum(packageValues)),
	/**
	 * Pages rewritten from internal material must carry a pointer; originally-written pages
	 * (e.g. the agent guide, agent-surface.md §7) have no upstream and omit it.
	 */
	source: z.array(sourcePointer).optional(),
});

/**
 * The generated API tree's pages (api-reference.md §2): `/docs/reference/api/**` is written
 * by TypeDoc on every regeneration and only carries the plugin's own frontmatter — `title`,
 * `editUrl`, `next`/`prev`. The tree is a repository asset (`git diff` is the API-change
 * surface), not a page anyone authors, so the content field table above does not apply to
 * it and this marker is the discriminator that keeps both shapes in one collection.
 *
 * The marker is written by the pipeline's normalize step (astro.config.mjs), never by hand:
 * `scripts/check-api-tree.mjs` fails on a marker inside or outside the tree alike.
 */
export const generatedFields = z.object({
	generated: z.literal(true),
});

/**
 * What `docsSchema({ extend })` merges into Starlight's schema (stack.md §13.1): the field
 * table for authored pages, or the marker for a generated API page. `deepMergeSchemas`
 * merges each union member, so `title` (Starlight) stays required in both shapes while the
 * required content fields are enforced on authored pages only.
 */
export const frontmatterFields = z.union([contentFields, generatedFields]);
