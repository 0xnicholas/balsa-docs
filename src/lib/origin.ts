/**
 * The deployed origin's three derived surfaces (#29, delivery.md §3.4 / §13.4): the
 * `<link rel="canonical">` every page carries, the sitemap the build emits, and the
 * `robots.txt` that names it. All three follow `src/lib/site.ts` — the one place that names
 * a host — so the switch from the temporary platform domain to `docs.<apex>` moved one
 * constant and nothing else.
 *
 * The rules live here and are unit-tested; `scripts/check-origin.mjs` runs them against
 * `dist/` in `pnpm verify`, and `scripts/gen-robots.mjs` renders the robots file in the
 * build tail. Which of the three can exist without an origin is a property of the artifact:
 * with `site` unset the build emits **no** canonical and **no** sitemap (delivery.md §3.4's
 * temporary-domain stage), and robots.txt is rendered without a `Sitemap:` line — the sitemap
 * protocol requires an absolute URL, so a relative one would be a lie rather than a fallback.
 */

import { routeOfHtmlPath } from './agent-surface.ts';

/** The crawler file the build writes (delivery.md §2.3: the asset wins over the host's text). */
export const robotsFile = 'robots.txt';
/** The sitemap index `@astrojs/sitemap` writes; `Sitemap:` points at it, not at a shard. */
export const sitemapIndexFile = 'sitemap-index.xml';
/** Site-root path of the sitemap index. */
export const sitemapIndexPath = `/${sitemapIndexFile}`;

/** A built HTML page, as the gates read it out of `dist/`: its path and its contents. */
export type BuiltPage = { path: string; html: string };

/**
 * The origin without a trailing slash — the form all three surfaces compare against. `site` is
 * authored without one (`src/lib/site.ts`); normalizing here keeps a value that gained one from
 * making three rules that must agree disagree (and from writing a `//` into an expectation).
 */
function originOf(site: string): string {
	return site.replace(/\/+$/, '');
}

// ─── canonical links (delivery.md §3.4) ────────────────────────────────────────────────

const canonicalLinkPattern = /<link\b[^>]*\brel=["']?canonical["']?[^>]*>/gi;
const hrefPattern = /\bhref=["']([^"']*)["']/i;

/** Every canonical `href` in the page — a head that states two of them is a defect. */
export function canonicalHrefs(html: string): string[] {
	return [...html.matchAll(canonicalLinkPattern)]
		.map((match) => hrefPattern.exec(match[0])?.[1])
		.filter((href): href is string => href !== undefined);
}

/**
 * The route a built HTML file serves as a canonical page, or `null` when it is not one: the
 * site-root redirect stub (it 301s to `/docs/`, delivery.md §4.1), the custom 404 (an error
 * page, and `@astrojs/sitemap` excludes it for the same reason), and anything that is not a
 * page at all. The route carries the trailing slash of delivery.md §4.3.
 */
export function canonicalRouteOf(htmlFile: string): string | null {
	if (htmlFile === '404.html') return null;
	const route = routeOfHtmlPath(htmlFile);
	if (route === null || route === '/') return null;
	return route;
}

/**
 * Every built page must point at itself on the deployed origin — that is what "canonical 归
 * docs" (delivery.md §3.3.2) means on the artifact: a page on the temporary platform domain
 * re-serves the same bytes, and its canonical is the one thing that tells a crawler which
 * host owns the URL. While no origin is known there is nothing to compare against, and §3.4
 * rules that state canonical-less on purpose.
 */
export function canonicalIssues(input: { pages: readonly BuiltPage[]; site: string | undefined }): string[] {
	if (input.site === undefined) return [];

	const issues: string[] = [];
	for (const page of input.pages) {
		const route = canonicalRouteOf(page.path);
		if (route === null) continue;

		const hrefs = canonicalHrefs(page.html);
		const expected = `${originOf(input.site)}${route}`;
		if (hrefs.length === 0) {
			issues.push(
				`dist/${page.path} has no <link rel="canonical"> — every page points at itself on ${input.site} (delivery.md §3.4)`,
			);
		} else if (hrefs.length > 1) {
			issues.push(
				`dist/${page.path} carries ${hrefs.length} <link rel="canonical"> (${hrefs.join(', ')}) — a head states exactly one`,
			);
		} else if (hrefs[0] !== expected) {
			issues.push(
				`dist/${page.path} canonical points at ${hrefs[0]}, expected ${expected} — the origin and the route both come from the page's own address (delivery.md §3.4)`,
			);
		}
	}
	return issues;
}

// ─── sitemap (delivery.md §13.4) ───────────────────────────────────────────────────────

const locPattern = /<loc>([^<]*)<\/loc>/g;

/** Every `<loc>` value of a sitemap or sitemap index, in document order. */
export function sitemapLocations(xml: string): string[] {
	return [...xml.matchAll(locPattern)]
		.map((match) => match[1] ?? '')
		.map((loc) => loc.trim())
		.filter((loc) => loc !== '');
}

/**
 * The sitemap must list exactly this version's pages — every one of them, once, on the
 * deployed origin — and nothing else. The set is the content tree's routes (the same set the
 * ledger gates compare against), so the two shapes of wrong entry are both caught: a URL the
 * site does not address (a `.md` twin, an llms file, the 404, the redirect stub) and a page
 * the sitemap dropped. `@astrojs/sitemap` writes the index plus numbered shards; the shards
 * are read from the build output, so an index pointing at a file that does not exist shows up
 * as one of the two.
 */
export function sitemapIssues(input: {
	index: string | null;
	shards: ReadonlyMap<string, string>;
	site: string | undefined;
	routes: readonly string[];
}): string[] {
	if (input.site === undefined) return [];

	if (input.index === null) {
		return [
			`dist/${sitemapIndexFile} is missing from the build output — \`site\` is set, so the build emits a sitemap (delivery.md §3.4 / §13.4)`,
		];
	}

	const issues: string[] = [];
	const origin = originOf(input.site);
	const known = new Set(input.routes);
	const listed = new Set<string>();

	// The two classes of problem are checked in causal order, and the first one short-circuits the
	// next: a shard the index never wrote makes every page below it "missing", and a sitemap on
	// the wrong host makes the whole page set look wrong. Either way the next run, after the
	// first class is fixed, reports the second.
	const shardLocs: string[] = [];
	for (const loc of sitemapLocations(input.index)) {
		if (!loc.startsWith(`${origin}/`)) {
			issues.push(`dist/${sitemapIndexFile} lists ${loc}, which is not on ${origin} (delivery.md §13.4)`);
			continue;
		}
		const shard = loc.slice(origin.length + 1);
		if (!input.shards.has(shard)) {
			issues.push(`dist/${sitemapIndexFile} lists ${loc}, but no ${shard} was written — the index and its shards ship together`);
			continue;
		}
		shardLocs.push(...sitemapLocations(input.shards.get(shard) ?? ''));
	}
	if (issues.length > 0) return issues;

	const foreign = shardLocs.filter((loc) => !loc.startsWith(`${origin}/`));
	if (foreign.length > 0) {
		return foreign.map((loc) => `the sitemap lists ${loc}, which is not on ${origin} (delivery.md §13.4)`);
	}

	for (const loc of shardLocs) {
		const route = loc.slice(origin.length);
		if (!known.has(route)) {
			issues.push(
				`the sitemap lists ${loc}, which does not resolve to a page — only HTML canonical routes belong in it (agent-surface.md §5.1.4)`,
			);
			continue;
		}
		if (listed.has(route)) {
			issues.push(`the sitemap lists ${loc} twice`);
			continue;
		}
		listed.add(route);
	}

	for (const route of input.routes) {
		if (!listed.has(route)) issues.push(`the sitemap is missing ${origin}${route} — every page of this version is listed`);
	}

	return issues;
}

// ─── robots.txt (delivery.md §2.3 / §3.4) ──────────────────────────────────────────────

const robotsComment = '# Written by the build from src/lib/site.ts (delivery.md §3.4). Edit that file, not this one.';

/**
 * The robots file: allow-all — the site is public documentation, there is nothing to keep out
 * — plus the `Sitemap:` line that tells a crawler where the sitemap is. The URL is absolute by
 * the protocol's own requirement, which is why the line exists only once the origin does.
 */
export function renderRobots(site: string | undefined): string {
	const lines = [robotsComment, 'User-Agent: *', 'Allow: /', ''];
	if (site !== undefined) lines.push(`Sitemap: ${originOf(site)}${sitemapIndexPath}`);
	return `${lines.join('\n')}\n`;
}

/**
 * The shipped file must be the rendering above, byte for byte. The host serves its own
 * managed robots.txt — a Content Signals policy text with no directives — whenever the build
 * does not write one (delivery.md §2.3, measured in #40), so "the file is missing" and "the
 * file is not ours" are the two ways this goes wrong, and they are different problems.
 */
export function robotsIssues(input: { text: string | null; site: string | undefined }): string[] {
	if (input.text === null) {
		return [
			`dist/${robotsFile} is missing from the build output — \`pnpm build\` writes it (scripts/gen-robots.mjs); without it the host serves its own managed text (delivery.md §2.3)`,
		];
	}

	const expected = renderRobots(input.site);
	if (input.text === expected) return [];

	const quote = (line: string) => `\`${line}\``;
	const lines = (text: string) => text.split('\n').filter((line) => line.trim() !== '');
	const shipped = lines(input.text);
	const missing = lines(expected).filter((line) => !shipped.includes(line));
	const unexpected = shipped.filter((line) => !lines(expected).includes(line));
	const detail = [
		missing.length > 0 ? `missing ${missing.map(quote).join(', ')}` : null,
		unexpected.length > 0 ? `not expecting ${unexpected.map(quote).join(', ')}` : null,
	]
		.filter((part): part is string => part !== null)
		.join(', ');

	return [
		`dist/${robotsFile} is not the rendering of src/lib/site.ts — ${detail} (delivery.md §3.4: the origin has one source; §2.3: the built asset has to win over the host's managed text)`,
	];
}

// ─── og:image (brand-visual.md §3.1) ───────────────────────────────────────────────────

/**
 * The default OG image, absolute as soon as the origin is known. A crawler that reads the tag
 * from the temporary platform domain or a preview URL has to fetch the image from the site
 * that owns the page, not from the host that re-served it.
 */
export function ogImageUrl(site: string | undefined): string {
	return site === undefined ? '/og.png' : new URL('/og.png', site).href;
}
