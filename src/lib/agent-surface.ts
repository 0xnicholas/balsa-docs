/**
 * The agent surface — `/llms.txt`, `/llms-manifest.json`, and the rules behind the twin
 * checks (agent-surface.md §2/§3/§4/§9).
 *
 * Three artifacts, one source: the per-page `<route>.md` twin comes from the content
 * sources themselves (`starlight-dot-md`, §2), and the two site-root files are derived
 * from the same pages by `scripts/gen-agent-surface.mjs` at build time — nothing is
 * committed, so there is no second copy to drift (§9).
 *
 * This module owns every rule that decides content. `scripts/gen-agent-surface.mjs` renders
 * the two files from it; `scripts/check-agent-surface.mjs` runs the three CI assertions of
 * §9 against `dist/` with it. Both scripts only read the filesystem and print.
 *
 * The twin path is mechanical (`route + '.md'`, §2), and the head link that advertises it
 * (`rel="alternate" type="text/markdown"`, §5.2) is injected from `twinPath` too, by the
 * Starlight route middleware in `src/lib/agent-surface-head-link.ts`.
 */

import { apiTreeRoot, entryShimOf, moduleNameOf } from './api-tree.ts';
import { packageValues } from './frontmatter.ts';
import { isRecord } from './guards.ts';
import { familySlugs, familyOf, type Family } from './pages.ts';
import { frontmatterPattern, readPages } from './read-pages.ts';
import { siteDescription, siteTitle } from './site.ts';

/** The framework repository, linked from `## Optional` (agent-surface.md §3). */
export const frameworkRepository = 'https://github.com/0xnicholas/balsa-framework';

/** The site-root redirect stub (delivery.md §4.1) — served, but not a page and no twin. */
export const siteRootRedirectFile = 'index.html';

/* ------------------------------------------------------------------ routes and twins (§2) */

/**
 * URL of a page's Markdown twin: the route plus `.md`. Extension endpoints never carry a
 * trailing slash (ia.md §6): `/docs/concepts/agents/` → `/docs/concepts/agents.md`, and the
 * landing page `/docs/` → `/docs.md`.
 */
export function twinPath(route: string): string {
	return `${route.replace(/\/$/, '')}.md`;
}

/** The HTML file the build emits for a route: `/docs/` → `docs/index.html`, `/404` → `404.html`. */
export function htmlPath(route: string): string {
	return route.endsWith('/') ? `${route.slice(1)}index.html` : `${route.slice(1)}.html`;
}

/** The route an emitted HTML file serves — `null` for anything that is not a page. */
export function routeOfHtmlPath(file: string): string | null {
	if (!file.endsWith('.html')) return null;
	if (file === siteRootRedirectFile) return '/';
	if (file.endsWith('/index.html')) return `/${file.slice(0, -'index.html'.length)}`;
	return `/${file.slice(0, -'.html'.length)}`;
}

/**
 * The HTML file serving a twin, trying both output shapes the build uses: pages live at
 * `<route>index.html`, the custom 404 at `404.html` (delivery.md §2.1).
 */
export function htmlOfTwin(twin: string, htmlFiles: ReadonlySet<string>): string | null {
	const base = twin.replace(/\.md$/, '');
	const page = `${base}/index.html`;
	if (htmlFiles.has(page)) return page;
	const file = `${base}.html`;
	return htmlFiles.has(file) ? file : null;
}

/* ------------------------------------------------------ the ten API module groups (§3/§12.3) */

/**
 * One API reference module group as `/llms.txt` lists it: the whole generated tree is
 * summarised by these ten entries rather than by its 239 symbol pages (§3).
 */
export type ApiModuleEntry = {
	/** Module group name — the entry shim's file name (`@balsa/core`, `agent`, …). */
	module: string;
	/** The export-surface value it documents (`@balsa/core/agent`) — content-boundary.md §6. */
	packageValue: string;
	/** The page the index links to. */
	route: string;
	/** That page's title, as the generated frontmatter carries it. */
	title: string;
};

/**
 * Representative page per module group — **the same page the Import map's `Signatures`
 * column links** (reference/import-map.md), so the machine index and the handwritten facade
 * point at one page per module. The generated tree has no module landing pages
 * (api-reference.md §8: the family has no index page), so the entry is a real symbol page.
 *
 * Hand-kept on purpose: a symbol page that moves must show up here, and assertion ② turns a
 * dead link red (§9.2). The record is keyed by the export surface, so a new subpath cannot
 * leave a module group unlisted without a type error.
 */
export const apiModulePages: Record<(typeof packageValues)[number], { route: string; title: string }> = {
	'@balsa/core': { route: '/docs/reference/api/balsa/core/functions/createapp/', title: 'createApp' },
	'@balsa/core/agent': { route: '/docs/reference/api/agent/classes/agent/', title: 'Agent' },
	'@balsa/core/durable-agent': {
		route: '/docs/reference/api/durable-agent/functions/createdurableagent/',
		title: 'createDurableAgent',
	},
	'@balsa/core/memory': { route: '/docs/reference/api/memory/classes/memory/', title: 'Memory' },
	'@balsa/core/model': { route: '/docs/reference/api/model/type-aliases/chunk/', title: 'Chunk' },
	'@balsa/core/observability': {
		route: '/docs/reference/api/observability/functions/createtracer/',
		title: 'createTracer',
	},
	'@balsa/core/schedules': {
		route: '/docs/reference/api/schedules/functions/createschedules/',
		title: 'createSchedules',
	},
	'@balsa/core/signals': { route: '/docs/reference/api/signals/functions/createsignals/', title: 'createSignals' },
	'@balsa/core/tools': { route: '/docs/reference/api/tools/functions/createtool/', title: 'createTool' },
	'@balsa/core/workflows': {
		route: '/docs/reference/api/workflows/functions/createworkflow/',
		title: 'createWorkflow',
	},
};

/** The ten module-group entries, in export-surface order. */
export function apiModuleEntries(): ApiModuleEntry[] {
	return packageValues.map((packageValue) => ({
		module: moduleNameOf(entryShimOf(packageValue)),
		packageValue,
		...apiModulePages[packageValue],
	}));
}

/**
 * The generated tree is partitioned by module group: every tree page sits under exactly one
 * module's directory, and every module has pages. A new TypeDoc subpath therefore cannot
 * appear in the tree without a matching entry in `apiModulePages` — and a page that escapes
 * every group cannot hide in the index's blind spot (§9.2).
 */
export function apiModuleIssues(input: {
	treeFiles: readonly string[];
	modules: readonly ApiModuleEntry[];
}): string[] {
	const issues: string[] = [];
	const counts = new Map<string, number>(input.modules.map((entry) => [entry.module, 0]));

	for (const file of input.treeFiles) {
		const owners = input.modules.filter((entry) => file.startsWith(`${apiTreeRoot}/${entry.module}/`));
		if (owners.length !== 1) {
			const groups = owners.map((entry) => entry.module).join(', ');
			issues.push(
				owners.length === 0
					? `${file} is under no module group — expected one of: ${input.modules.map((entry) => entry.module).join(', ')}`
					: `${file} is under more than one module group: ${groups}`,
			);
			continue;
		}
		counts.set(owners[0].module, (counts.get(owners[0].module) ?? 0) + 1);
	}

	for (const [module, count] of counts) {
		if (count === 0) issues.push(`module group ${module} has no generated pages`);
	}

	return issues;
}

/* -------------------------------------------------------------------- /llms.txt (§3) */

/**
 * A page as the agent surface sees it: the fields the index and the manifest are built from
 * (`title`/`description`/`packages`/`family` come from frontmatter, `order` positions the
 * page inside its family — ia.md §4).
 */
export type SurfacePage = {
	/** Page route, trailing slash (`/docs/concepts/agents/`). */
	route: string;
	title: string;
	description: string;
	family: Family;
	/** `@balsa/*` values the page documents; `[]` maps nowhere (content-boundary.md §6). */
	packages: readonly string[];
	order?: number;
};

/**
 * The `version` half of the manifest's version answer (agent-surface.md §4): `null` until the
 * packages are on npm. The 0.1.0 switch is an explicit PR (delivery.md §8-G1) — setting it here
 * moves the generator and the gate together.
 */
export const frameworkVersion: string | null = null;

/** Family headings, in the family order of ia.md §1 — the sidebar's own labels. */
const familyTitles: Record<Family, string> = {
	'get-started': 'Get started',
	concepts: 'Concepts',
	guides: 'Guides',
	reference: 'Reference',
	project: 'Project & ecosystem',
};

/**
 * The content tree as the agent surface reads it: every page route, the authored pages the two
 * files describe, and the problems that stop generation. The generated tree is read but not
 * described — its pages carry no `description`, and the module groups stand in for them
 * (src/lib/frontmatter.ts's marker is the discriminator).
 *
 * The generator and the gate both call this, so what is written and what is asserted can never
 * read the tree differently.
 */
export function surfacePages(rootDir: string): {
	routes: string[];
	pages: SurfacePage[];
	issues: string[];
} {
	const { pages, errors } = readPages(rootDir);
	const issues = [...errors];
	const routes: string[] = [];
	const authored: SurfacePage[] = [];

	for (const page of pages) {
		routes.push(page.route);
		if (page.frontmatter.generated === true) continue;

		const { title, description, packages, order } = page.frontmatter;
		const family = familyOf(page.route);
		if (family === null) {
			issues.push(`${page.path}: ${page.route} is not inside one of the five families (ia.md §1)`);
			continue;
		}
		if (typeof title !== 'string' || title === '') {
			issues.push(`${page.path}: \`title\` must be a non-empty string`);
			continue;
		}
		if (typeof description !== 'string' || description === '') {
			issues.push(`${page.path}: \`description\` must be a non-empty string (it becomes a manifest entry)`);
			continue;
		}
		if (!Array.isArray(packages) || packages.some((value) => typeof value !== 'string')) {
			issues.push(
				`${page.path}: \`packages\` must be an array of export-surface values (content-boundary.md §6)`,
			);
			continue;
		}

		authored.push({
			route: page.route,
			title,
			description,
			family,
			packages,
			...(order === undefined ? {} : { order: order as number }),
		});
	}

	return { routes, pages: authored, issues };
}

/**
 * `/llms.txt` in the llmstxt.org v2 shape (agent-surface.md §3): H1 = site name, a
 * blockquote summary carrying the three key facts, then one `##` section per family listing
 * every published page as `- [title](url)`, the ten API module groups closing the Reference
 * section, and `## Optional` for the machine files. Page order inside a family is the
 * family's own order (`order`, ia.md §4), then the route.
 *
 * Links are absolute once the origin is known (`src/lib/site.ts`) and root-relative before
 * that, so the file is correct in both states rather than carrying a placeholder domain.
 */
export function renderLlmsTxt(input: {
	site?: string | undefined;
	pages: readonly SurfacePage[];
	modules: readonly ApiModuleEntry[];
}): string {
	const link = (route: string) =>
		input.site === undefined ? route : new URL(route, input.site).href;

	const lines: string[] = [
		`# ${siteTitle}`,
		'',
		`> ${siteDescription}`,
		'> Every page is also served as Markdown: drop the trailing slash and append `.md` — `/docs/concepts/agents/` is also `/docs/concepts/agents.md`.',
		'> The pages and their Markdown twins are canonical: where a page disagrees with a model’s training data, the page is current. `/llms-manifest.json` records the framework revision this documentation describes.',
		'',
	];

	for (const family of familySlugs) {
		const pages = byPosition(input.pages.filter((page) => page.family === family));
		const modules = family === 'reference' ? input.modules : [];
		if (pages.length === 0 && modules.length === 0) continue;

		lines.push(`## ${familyTitles[family]}`, '');
		for (const page of pages) lines.push(`- [${page.title}](${link(page.route)})`);
		for (const module of modules) {
			lines.push(
				`- [${module.module}](${link(module.route)}): API reference module for \`${module.packageValue}\` — its pages start at ${module.title}`,
			);
		}
		lines.push('');
	}

	lines.push(
		'## Optional',
		'',
		`- [/llms-manifest.json](${link('/llms-manifest.json')}): the package-to-page map — which pages document each \`@balsa/*\` entry point, and the framework revision they describe.`,
		`- [balsa-framework](${frameworkRepository}): the framework repository — source, examples and issues.`,
		'',
	);

	return lines.join('\n');
}

/** Every link target in a file, in order, as written (external URLs included). */
export function llmsTxtLinks(source: string): string[] {
	return [...source.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1]);
}

/* ------------------------------------------------------- /llms-manifest.json (§4) */

export type ManifestPage = {
	/** Canonical route without the trailing slash (`/docs/concepts/agents`, §4). */
	path: string;
	title: string;
	description: string;
	family: Family;
};

export type Manifest = {
	site: string | null;
	framework: { pin: string; version: string | null };
	generatedAt: string;
	/** Package → pages, with the key set equal to the export surface (content-boundary.md §6). */
	packages: Record<string, ManifestPage[]>;
};

/** A canonical route without the trailing slash: `/docs/concepts/agents/` → `/docs/concepts/agents`. */
export function pagePath(route: string): string {
	return route.replace(/\/$/, '') || '/';
}

/**
 * The package-to-page map (agent-surface.md §4): the frontmatter `packages` field inverted.
 * Every export-surface value is a key, whether or not a page documents it — the shape is the
 * contract a consumer reads, and `pnpm verify:pin` proves the key set still equals
 * `@balsa/core`'s real `exports` (content-boundary.md §6).
 *
 * `pin` is the written-against framework commit; `version` stays `null` until the packages
 * are on npm (delivery.md §8-G1 switches it in an explicit PR). `generatedAt` is recorded
 * and never compared — the file is a build product, not a repository asset (§9).
 */
export function buildManifest(input: {
	site?: string | undefined;
	pin: string;
	version: string | null;
	generatedAt: string;
	pages: readonly SurfacePage[];
}): Manifest {
	const packages: Record<string, ManifestPage[]> = Object.fromEntries(
		packageValues.map((value) => [value, []]),
	);

	for (const page of byFamily(input.pages)) {
		for (const value of page.packages) {
			const entries = packages[value];
			if (entries === undefined) {
				throw new Error(
					`${page.route}: \`packages\` value ${value} is not part of the export surface (content-boundary.md §6)`,
				);
			}
			entries.push({
				path: pagePath(page.route),
				title: page.title,
				description: page.description,
				family: page.family,
			});
		}
	}

	return {
		site: input.site ?? null,
		framework: { pin: input.pin, version: input.version },
		generatedAt: input.generatedAt,
		packages,
	};
}

/**
 * ②b The manifest says what the content tree says (§4): the key set is the export surface, and
 * every page list is the one the tree produces. The artifact is re-derived and compared here
 * rather than trusted — a hand-edited, stale or half-written file is what a gate is for.
 * `generatedAt` is the one field left out: it is recorded, never compared (§12.5).
 */
export function manifestIssues(input: {
	source: string;
	pages: readonly SurfacePage[];
	pin: string;
	site?: string | undefined;
}): string[] {
	let manifest: unknown;
	try {
		manifest = JSON.parse(input.source);
	} catch (error) {
		return [`/llms-manifest.json is not valid JSON — ${(error as Error).message}`];
	}

	if (!isRecord(manifest)) return ['/llms-manifest.json must be a JSON object'];

	const issues: string[] = [];
	const expected = buildManifest({
		site: input.site,
		pin: input.pin,
		version: frameworkVersion,
		generatedAt: '',
		pages: input.pages,
	});

	if ((manifest.site ?? null) !== expected.site) {
		issues.push(`\`site\` is ${JSON.stringify(manifest.site ?? null)}, expected ${JSON.stringify(expected.site)}`);
	}

	const framework = isRecord(manifest.framework) ? manifest.framework : {};
	if (framework.pin !== expected.framework.pin) {
		issues.push(`\`framework.pin\` is ${JSON.stringify(framework.pin ?? null)}, expected ${input.pin}`);
	}
	if (framework.version !== expected.framework.version) {
		issues.push(
			`\`framework.version\` is ${JSON.stringify(framework.version ?? null)}, expected ${JSON.stringify(expected.framework.version)} (src/lib/agent-surface.ts)`,
		);
	}

	if (!isRecord(manifest.packages)) {
		return [...issues, '\`packages\` must be an object keyed by the export surface'];
	}

	const listed = Object.keys(manifest.packages).sort();
	const surface: string[] = [...packageValues].sort();
	if (listed.join() !== surface.join()) {
		const missing = surface.filter((value) => !listed.includes(value));
		const extra = listed.filter((value) => !surface.includes(value));
		issues.push(
			`\`packages\` keys must be the export surface — missing: ${missing.join(', ') || 'none'}; not exported: ${extra.join(', ') || 'none'}`,
		);
	}

	for (const value of packageValues) {
		if (JSON.stringify(manifest.packages[value]) !== JSON.stringify(expected.packages[value])) {
			issues.push(`\`packages.${value}\` does not match the pages that document it in the content tree`);
		}
	}

	return issues;
}

/* -------------------------------------------------------------- the three assertions (§9) */

/**
 * The route a page file serves and the twin that must sit beside it — or `null` when the file
 * is not a page: the site-root redirect stub (delivery.md §4.1), or something the build emitted
 * that the site does not address as a route.
 */
function pageFileOf(file: string): { route: string; twin: string } | null {
	if (file === siteRootRedirectFile) return null;
	const route = routeOfHtmlPath(file);
	return route === null ? null : { route, twin: twinPath(route).slice(1) };
}

/**
 * ① Every HTML route has a `.md` twin — and every twin has a page, so a stale or orphan
 * `.md` cannot survive either.
 *
 * `routes` is the page set the content tree serves (404 excluded: it is not addressed by
 * ia.md §7, but its twin is covered by the `dist`-side direction below); `files` are
 * `dist`-relative paths.
 */
export function twinIssues(input: { routes: readonly string[]; files: readonly string[] }): string[] {
	const html = new Set(input.files.filter((file) => file.endsWith('.html')));
	const twins = new Set(input.files.filter((file) => file.endsWith('.md')));
	const checked = new Set(input.routes);
	const covered = new Set(input.routes.map((route) => twinPath(route).slice(1)));
	const issues: string[] = [];

	for (const route of input.routes) {
		const page = htmlPath(route);
		if (!html.has(page)) issues.push(`${route}: ${page} is not in the build output`);
		const twin = twinPath(route).slice(1);
		if (!twins.has(twin)) issues.push(`${route}: no Markdown twin at ${twin}`);
	}

	for (const file of html) {
		const page = pageFileOf(file);
		// Routes the content tree serves were checked above; this direction covers the pages
		// that are not part of that set (the custom 404) and any twin the plugin emitted for
		// something the tree does not serve.
		if (page === null || checked.has(page.route)) continue;
		if (!twins.has(page.twin)) issues.push(`${file}: no Markdown twin at ${page.twin}`);
	}

	for (const twin of twins) {
		if (covered.has(twin)) continue;
		if (htmlOfTwin(twin, html) === null) issues.push(`${twin}: no HTML page serves this twin`);
	}

	return issues;
}

/**
 * ①b Every page advertises its twin in the head (agent-surface.md §5.2). The tag is the
 * discovery mechanism llmstxt.org defines, and the site injects it itself — the plugin does
 * not — so the assertion is what keeps that injection wired.
 */
export function headLinkIssues(pages: readonly { path: string; alternate: string | null }[]): string[] {
	const issues: string[] = [];

	for (const { path: file, alternate } of pages) {
		const page = pageFileOf(file);
		if (page === null) continue;
		if (alternate === null) {
			issues.push(
				`${file}: no <link rel="alternate" type="text/markdown"> pointing at ${twinPath(page.route)} (agent-surface.md §5.2)`,
			);
		} else if (alternate !== twinPath(page.route)) {
			issues.push(`${file}: the Markdown twin link points at ${alternate}, expected ${twinPath(page.route)}`);
		}
	}

	return issues;
}

/** The Markdown twin a page's HTML advertises, or `null` when the head carries no link. */
export function alternateLink(html: string): string | null {
	const match = /<link rel="alternate" type="text\/markdown" href="([^"]+)"/.exec(html);
	return match === null ? null : match[1];
}

/**
 * ② The index and the content set agree: every link resolves to a published page (or to a
 * machine file served at the site root), every authored page is listed exactly once, and
 * the generated tree appears as its ten module groups — not as 239 individual links, and
 * not as a blind spot either (§9.2).
 */
export function llmsIndexIssues(input: {
	source: string;
	/** The routes `/llms.txt` must list one by one: the authored pages. */
	routes: readonly string[];
	modules: readonly ApiModuleEntry[];
	/** `dist`-relative paths of everything the build serves. */
	files: readonly string[];
	site?: string | undefined;
}): string[] {
	const issues: string[] = [];
	const expected = new Set([...input.routes, ...input.modules.map((entry) => entry.route)]);
	const served = new Set(input.files.map((file) => `/${file}`));
	const listed = new Map<string, number>();

	for (const link of internalLinks(input.source, input.site)) {
		listed.set(link, (listed.get(link) ?? 0) + 1);
		if (!expected.has(link) && !served.has(link)) {
			issues.push(
				`${link} is not part of the content set (published pages plus the ten API module groups)`,
			);
		}
	}

	for (const [link, count] of listed) {
		if (count > 1) issues.push(`${link} is listed ${count} times in /llms.txt`);
	}

	for (const route of expected) {
		if (!listed.has(route)) issues.push(`${route} is missing from /llms.txt`);
	}

	return issues;
}

/**
 * ③ Writing rules ①②, mechanically (agent-surface.md §6/§9.3): every fenced code block
 * carries a language, and headings are one level at a time under the page title (which is
 * the document's only H1 — a body H1 or a setext H1 would add a second one).
 *
 * `files` are the twins the build emitted, which are the sources plus frontmatter — the
 * bytes an agent actually reads.
 */
export function writingRuleIssues(files: readonly { path: string; source: string }[]): string[] {
	const issues: string[] = [];

	for (const { path: file, source } of files) {
		const block = frontmatterPattern.exec(source);
		// Line numbers are file-absolute, so a gate message points at the line to open.
		const offset = block === null ? 0 : block[0].split('\n').length - 1;
		const body = block === null ? source : source.slice(block[0].length);

		let fence: { marker: string; length: number } | null = null;
		let previous = 1;
		let sawHeading = false;

		for (const [index, line] of body.split('\n').entries()) {
			const lineNumber = offset + index + 1;

			const fenceMatch = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(line);
			if (fenceMatch) {
				const [, , marker, info] = fenceMatch;
				if (fence === null) {
					if (info.trim() === '') {
						issues.push(`${file}:${lineNumber}: fenced code block without a language (agent-surface.md §6-1)`);
					}
					fence = { marker: marker[0], length: marker.length };
				} else if (marker[0] === fence.marker && marker.length >= fence.length && info.trim() === '') {
					fence = null;
				}
				continue;
			}
			if (fence !== null) continue;

			const heading = /^(#{1,6})\s+\S/.exec(line);
			if (heading) {
				const level = heading[1].length;
				if (level === 1) {
					issues.push(
						`${file}:${lineNumber}: body H1 — the page title is the document’s only H1 (agent-surface.md §6-2)`,
					);
				} else if (!sawHeading && level > 2) {
					issues.push(
						`${file}:${lineNumber}: first heading is h${level}; under the page title it must be h2 (agent-surface.md §6-2)`,
					);
				} else if (sawHeading && level > previous + 1) {
					issues.push(
						`${file}:${lineNumber}: heading jumps from h${previous} to h${level} (agent-surface.md §6-2)`,
					);
				}
				sawHeading = true;
				previous = level;
				continue;
			}

			if (/^={3,}\s*$/.test(line)) {
				issues.push(`${file}:${lineNumber}: setext H1 — the page title is the document’s only H1 (agent-surface.md §6-2)`);
			}
		}
	}

	return issues;
}

/* ----------------------------------------------------------------------------- helpers */

/** Family order (ia.md §1), then the family's own `order`, then the route. */
function byFamily(pages: readonly SurfacePage[]): SurfacePage[] {
	return [...pages].sort((left, right) => {
		const family = familySlugs.indexOf(left.family) - familySlugs.indexOf(right.family);
		if (family !== 0) return family;
		return comparePosition(left, right);
	});
}

/** The page order inside one family: `order` first, pages without one last, ties by route. */
function byPosition(pages: readonly SurfacePage[]): SurfacePage[] {
	return [...pages].sort(comparePosition);
}

function comparePosition(left: SurfacePage, right: SurfacePage): number {
	const order = (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER);
	if (order !== 0) return order;
	return left.route.localeCompare(right.route);
}

/**
 * The links that point at this site, as paths. External URLs are none of the index's
 * business (the framework repository lives on GitHub), unless the origin under test is their
 * own — which is the case once `src/lib/site.ts` is set and the links become absolute.
 */
function internalLinks(source: string, site: string | undefined): string[] {
	const origin = site === undefined ? undefined : new URL(site).origin;
	const links: string[] = [];

	for (const target of llmsTxtLinks(source)) {
		if (target.startsWith('/')) {
			links.push(target);
			continue;
		}
		if (!/^https?:\/\//.test(target)) continue;
		const url = new URL(target);
		if (origin !== undefined && url.origin === origin) links.push(url.pathname);
	}

	return links;
}
