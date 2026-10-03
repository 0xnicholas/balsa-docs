import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	canonicalHrefs,
	canonicalIssues,
	canonicalRouteOf,
	renderRobots,
	robotsIssues,
	sitemapIssues,
	sitemapLocations,
} from './origin.ts';

/**
 * The deployed origin's three derived surfaces (#29, delivery.md §3.4 / §13.4): the canonical
 * link on every page, the sitemap the build emits, and the robots.txt that names the sitemap.
 * Every rule is exercised on both sides — the value the origin produces, and the failure each
 * one is there to catch (a canonical on the temporary domain, a `.md` twin in the sitemap, a
 * page the sitemap dropped, a robots.txt still carrying the platform's managed text).
 */

const origin = 'https://docs.oribos.dev';

/** A built page carrying `href` as its canonical link. */
const builtPage = (route: string, href?: string | undefined) => ({
	path: route === '/' ? 'index.html' : `${route.slice(1)}index.html`,
	html: `<html><head>${href === undefined ? '' : `<link rel="canonical" href="${href}"/>`}</head><body></body></html>`,
});

describe('canonical links (delivery.md §3.4: canonical 归 docs)', () => {
	it('reads the canonical href, and nothing when the page has none', () => {
		assert.deepEqual(canonicalHrefs('<link rel="canonical" href="https://docs.oribos.dev/docs/"/>'), [
			'https://docs.oribos.dev/docs/',
		]);
		assert.deepEqual(canonicalHrefs('<link rel="alternate" href="/docs.md"/>'), []);
		assert.deepEqual(canonicalHrefs(''), []);
	});

	it('resolves every built page to a canonical route, and refuses the non-canonical two', () => {
		assert.equal(canonicalRouteOf('docs/index.html'), '/docs/');
		assert.equal(canonicalRouteOf('docs/concepts/agents/index.html'), '/docs/concepts/agents/');
		// The stub 301s to /docs/ and the custom 404 is an error page: neither is a canonical page.
		assert.equal(canonicalRouteOf('index.html'), null);
		assert.equal(canonicalRouteOf('404.html'), null);
		assert.equal(canonicalRouteOf('_astro/app.css'), null);
	});

	it('passes when every page points at its own route on the origin', () => {
		const pages = [
			builtPage('/docs/', `${origin}/docs/`),
			builtPage('/docs/concepts/agents/', `${origin}/docs/concepts/agents/`),
		];
		assert.deepEqual(canonicalIssues({ pages, site: origin }), []);
	});

	it('fails a page with no canonical, and one pointing at the temporary platform domain', () => {
		const missing = canonicalIssues({ pages: [builtPage('/docs/')], site: origin });
		assert.equal(missing.length, 1);
		assert.match(missing[0] ?? '', /docs\/index\.html has no <link rel="canonical">/);

		const temporary = canonicalIssues({
			pages: [builtPage('/docs/', 'https://oribos-docs.oribos-docs.workers.dev/docs/')],
			site: origin,
		});
		assert.equal(temporary.length, 1);
		assert.match(temporary[0] ?? '', /points at https:\/\/oribos-docs\.oribos-docs\.workers\.dev/);
	});

	it('fails a canonical that names another route, and one the head states twice', () => {
		const wrongRoute = canonicalIssues({
			pages: [builtPage('/docs/concepts/agents/', `${origin}/docs/concepts/tools/`)],
			site: origin,
		});
		assert.equal(wrongRoute.length, 1);
		assert.match(wrongRoute[0] ?? '', /expected https:\/\/docs\.oribos\.dev\/docs\/concepts\/agents\//);

		const twice = canonicalIssues({
			pages: [
				{
					path: 'docs/index.html',
					html: `<link rel="canonical" href="${origin}/docs/"/><link rel="canonical" href="${origin}/docs/"/>`,
				},
			],
			site: origin,
		});
		assert.equal(twice.length, 1);
		assert.match(twice[0] ?? '', /2 <link rel="canonical">/);
	});

	it('requires a canonical at all only once the origin is known', () => {
		const pages = [builtPage('/docs/')];
		assert.deepEqual(canonicalIssues({ pages, site: undefined }), []);
		assert.deepEqual(canonicalIssues({ pages: [builtPage('/docs/', '/docs/')], site: undefined }), []);
	});

	it('reads a trailing slash off the origin instead of writing one into the expectation', () => {
		const pages = [builtPage('/docs/', `${origin}/docs/`)];
		assert.deepEqual(canonicalIssues({ pages, site: `${origin}/` }), []);
		assert.equal(renderRobots(`${origin}/`), renderRobots(origin));
	});
});

describe('sitemap (delivery.md §13.4: sitemap 内域 == 正式域, HTML canonical 全集)', () => {
	const routes = ['/docs/', '/docs/concepts/agents/'];
	const shard = (locs: readonly string[]) =>
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locs
			.map((loc) => `<url><loc>${loc}</loc></url>`)
			.join('')}</urlset>`;
	const index = (locs: readonly string[]) =>
		`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locs
			.map((loc) => `<sitemap><loc>${loc}</loc></sitemap>`)
			.join('')}</sitemapindex>`;
	const built = { index: index([`${origin}/sitemap-0.xml`]), shards: new Map([['sitemap-0.xml', shard(routes.map((route) => `${origin}${route}`))]]) };

	it('reads the <loc> values of both file shapes', () => {
		assert.deepEqual(sitemapLocations(built.index), [`${origin}/sitemap-0.xml`]);
		assert.deepEqual(sitemapLocations(built.shards.get('sitemap-0.xml') ?? ''), [
			`${origin}/docs/`,
			`${origin}/docs/concepts/agents/`,
		]);
		assert.deepEqual(sitemapLocations('not xml at all'), []);
	});

	it('passes when the index and its shards list exactly this version’s pages on the origin', () => {
		assert.deepEqual(sitemapIssues({ ...built, site: origin, routes }), []);
	});

	it('fails <loc> values that carry another host', () => {
		const issues = sitemapIssues({
			index: index([`${origin}/sitemap-0.xml`]),
			shards: new Map([
				[
					'sitemap-0.xml',
					shard([`${origin}/docs/`, 'https://oribos-docs.oribos-docs.workers.dev/docs/concepts/agents/']),
				],
			]),
			site: origin,
			routes,
		});
		assert.equal(issues.length, 1);
		assert.match(issues[0] ?? '', /is not on https:\/\/docs\.oribos\.dev/);
	});

	it('fails a `.md` twin, the llms files and an unaddressed route in the sitemap', () => {
		const issues = sitemapIssues({
			index: index([`${origin}/sitemap-0.xml`]),
			shards: new Map([
				[
					'sitemap-0.xml',
					shard([
						`${origin}/docs/`,
						`${origin}/docs/concepts/agents.md`,
						`${origin}/llms.txt`,
						`${origin}/404/`,
					]),
				],
			]),
			site: origin,
			routes,
		});
		assert.equal(issues.length, 4);
		assert.match(issues[0] ?? '', /does not resolve to a page/);
		assert.match(issues[1] ?? '', /does not resolve to a page/);
		assert.match(issues[2] ?? '', /does not resolve to a page/);
		assert.match(issues[3] ?? '', /is missing https:\/\/docs\.oribos\.dev\/docs\/concepts\/agents\//);
	});

	it('fails a sitemap that is absent, has no shard, or points at a shard the build did not write', () => {
		const missing = sitemapIssues({ index: null, shards: new Map(), site: origin, routes });
		assert.equal(missing.length, 1);
		assert.match(missing[0] ?? '', /sitemap-index\.xml is missing/);

		const dangling = sitemapIssues({
			index: index([`${origin}/sitemap-1.xml`]),
			shards: new Map([['sitemap-0.xml', shard([`${origin}/docs/`, `${origin}/docs/concepts/agents/`])]]),
			site: origin,
			routes,
		});
		assert.equal(dangling.length, 1);
		assert.match(dangling[0] ?? '', /sitemap-1\.xml/);
	});

	it('takes an absent origin as “no sitemap is expected”', () => {
		assert.deepEqual(sitemapIssues({ index: null, shards: new Map(), site: undefined, routes }), []);
	});

	it('tolerates a trailing slash on the origin it compares against', () => {
		assert.deepEqual(sitemapIssues({ ...built, site: `${origin}/`, routes }), []);
	});
});

describe('robots.txt (delivery.md §2.3: the asset wins over the platform’s managed text)', () => {
	it('renders allow-all plus the sitemap line on the origin', () => {
		const rendered = renderRobots(origin);
		assert.match(rendered, /^User-Agent: \*$/m);
		assert.match(rendered, /^Allow: \/$/m);
		assert.match(rendered, new RegExp(`^Sitemap: ${origin}/sitemap-index\\.xml$`, 'm'));
		assert.equal(rendered.endsWith('\n'), true);
	});

	it('leaves the Sitemap line out while no origin is known — a relative one is invalid', () => {
		const rendered = renderRobots(undefined);
		assert.match(rendered, /^User-Agent: \*$/m);
		assert.doesNotMatch(rendered, /^Sitemap:/m);
	});

	it('passes on its own rendering, both with and without an origin', () => {
		assert.deepEqual(robotsIssues({ text: renderRobots(origin), site: origin }), []);
		assert.deepEqual(robotsIssues({ text: renderRobots(undefined), site: undefined }), []);
	});

	it('fails a robots.txt the build did not write, and one still serving the platform text', () => {
		const missing = robotsIssues({ text: null, site: origin });
		assert.equal(missing.length, 1);
		assert.match(missing[0] ?? '', /robots\.txt is missing/);

		const managed = robotsIssues({
			text: '# Content Signals\n# Search\nUser-Agent: *\nContent-Signal: search=yes\n',
			site: origin,
		});
		assert.equal(managed.length, 1);
		assert.match(managed[0] ?? '', /Sitemap: https:\/\/docs\.oribos\.dev\/sitemap-index\.xml/);
	});

	it('fails a robots.txt that names the temporary platform domain', () => {
		const issues = robotsIssues({
			text: `${renderRobots(origin)}`.replace(origin, 'https://oribos-docs.oribos-docs.workers.dev'),
			site: origin,
		});
		assert.equal(issues.length, 1);
		assert.match(issues[0] ?? '', /sitemap-index\.xml/);
	});
});
