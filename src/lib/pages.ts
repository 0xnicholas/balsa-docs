/**
 * The page set — routes derived from the content tree (`src/content/docs/**`).
 *
 * Both the redirect ledger gates (#18) and the frontmatter value-domain checks need to
 * know which URLs this version serves: delivery.md §4.2 compares "上一版页面集合 − 当前
 * 页面集合" against the ledger, and §4.2.1 resolves every `to` against the same set.
 * The route is mechanical — the file path *slugified*, which is what Starlight serves — so
 * it never needs a build or a content-collection read. Slugifying matters for the generated
 * API tree (#20), whose files keep the symbol's case and may sit under `@oribos/`:
 * `agent/classes/Agent.md` → `/docs/reference/api/agent/classes/agent/`.
 *
 * Files that do not produce a page (Starlight partials, the custom 404, non-Markdown
 * files) are dropped: they are not addressed by the ledger.
 */

import { slug } from 'github-slugger';

/** Family slugs (ia.md §2) — `/docs/<family>/<slug>` is the capped URL shape. */
export const familySlugs = ['get-started', 'concepts', 'guides', 'reference', 'project'] as const;
export type Family = (typeof familySlugs)[number];

/** Content root, repo-relative (stack.md §5). */
export const contentRoot = 'src/content/docs';

const pageExtensions = ['.md', '.mdx'];

/** Route for one content path, or `null` when the file is not a page. */
export function routeFromContentPath(relativePath: string): string | null {
	const segments = relativePath.split('/');
	const basename = segments.at(-1) ?? '';
	if (segments.some((segment) => segment === '..' || segment === '')) return null;
	if (segments.some((segment) => segment.startsWith('_') && segment !== basename)) return null;
	if (basename.startsWith('_')) return null;
	if (basename === '404.md' || basename === '404.mdx') return null;

	const extension = pageExtensions.find((candidate) => basename.endsWith(candidate));
	if (!extension) return null;

	const stem = basename.slice(0, -extension.length);
	const directories = segments.slice(0, -1);
	const urlSegments = (stem === 'index' ? directories : [...directories, stem]).map((segment) =>
		slug(segment),
	);
	if (stem === 'index') {
		return urlSegments.length === 0 ? '/' : `/${urlSegments.join('/')}/`;
	}
	return `/${urlSegments.join('/')}/`;
}

/** Sorted, de-duplicated page set for a list of content-root-relative paths. */
export function pageRoutesFromPaths(relativePaths: readonly string[]): string[] {
	const routes = new Set<string>();
	for (const relativePath of relativePaths) {
		const route = routeFromContentPath(relativePath);
		if (route !== null) routes.add(route);
	}
	return [...routes].sort();
}

/**
 * Page set for a list of repo-relative paths. Paths outside `src/content/docs/` are
 * dropped; the returned routes keep the order of `pageRoutesFromPaths`.
 */
export function pageRoutesFromRepoPaths(repoPaths: readonly string[]): string[] {
	const relative = repoPaths
		.filter((repoPath) => repoPath.startsWith(`${contentRoot}/`))
		.map((repoPath) => repoPath.slice(contentRoot.length + 1));
	return pageRoutesFromPaths(relative);
}

/**
 * The family a route belongs to (ia.md §2). `/docs` is the Introduction root exception
 * and sits in Get started; routes outside `/docs/<family>/` have no family.
 */
export function familyOf(route: string): Family | null {
	if (route === '/docs/' || route === '/docs') return 'get-started';
	const [prefix, segment] = route.split('/').filter(Boolean);
	if (prefix !== 'docs' || segment === undefined) return null;
	return (familySlugs as readonly string[]).includes(segment) ? (segment as Family) : null;
}
