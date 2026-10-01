import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	alternateLink,
	apiModuleEntries,
	apiModuleIssues,
	apiModulePages,
	buildManifest,
	frameworkVersion,
	headLinkIssues,
	htmlOfTwin,
	htmlPath,
	llmsIndexIssues,
	llmsTxtLinks,
	manifestIssues,
	renderLlmsTxt,
	routeOfHtmlPath,
	twinIssues,
	twinPath,
	writingRuleIssues,
	type SurfacePage,
} from './agent-surface.ts';
import { apiTreeRoot } from './api-tree.ts';
import { packageValues } from './frontmatter.ts';

/**
 * The agent surface's rules (agent-surface.md §2/§3/§4/§9): the twin path, the `/llms.txt`
 * index, the package-to-page manifest, and the three CI assertions. The scripts that write
 * the artifacts and assert them against `dist/` are thin wrappers — everything that decides
 * content lives here, and these cases pin it.
 */

/** A page as the surface sees it; `description` is derived so fixtures stay one-liners. */
const indexPage = (
	route: string,
	title: string,
	family: SurfacePage['family'],
	order?: number,
	packages: readonly string[] = [],
): SurfacePage => ({
	route,
	title,
	description: `${title} — fixture description.`,
	family,
	packages,
	...(order === undefined ? {} : { order }),
});

/** One generated page per module group — the shape a complete tree has. */
const moduleTree = (): string[] =>
	apiModuleEntries().map((entry) => `${apiTreeRoot}/${entry.module}/index.md`);

describe('twin path (agent-surface.md §2)', () => {
	const cases: [route: string, twin: string][] = [
		['/docs/', '/docs.md'],
		['/docs/get-started/quickstart/', '/docs/get-started/quickstart.md'],
		['/docs/reference/api/agent/classes/agent/', '/docs/reference/api/agent/classes/agent.md'],
		// The extension endpoint is always slash-less (ia.md §6, #8 D3).
		['/404', '/404.md'],
	];

	for (const [route, twin] of cases) {
		it(`${route} → ${twin}`, () => {
			assert.equal(twinPath(route), twin);
		});
	}
});

describe('built paths', () => {
	it('maps a route to the HTML file the build emits', () => {
		assert.equal(htmlPath('/docs/'), 'docs/index.html');
		assert.equal(htmlPath('/docs/concepts/agents/'), 'docs/concepts/agents/index.html');
		assert.equal(htmlPath('/404'), '404.html');
	});

	it('maps an HTML file back to its route', () => {
		assert.equal(routeOfHtmlPath('docs/concepts/agents/index.html'), '/docs/concepts/agents/');
		assert.equal(routeOfHtmlPath('404.html'), '/404');
		assert.equal(routeOfHtmlPath('index.html'), '/');
		assert.equal(routeOfHtmlPath('pagefind/pagefind.js'), null);
	});

	it('finds the HTML file that serves a twin, in both output shapes', () => {
		const html = new Set(['docs/index.html', 'docs/concepts/agents/index.html', '404.html']);
		assert.equal(htmlOfTwin('docs.md', html), 'docs/index.html');
		assert.equal(htmlOfTwin('docs/concepts/agents.md', html), 'docs/concepts/agents/index.html');
		assert.equal(htmlOfTwin('404.md', html), '404.html');
		assert.equal(htmlOfTwin('docs/removed.md', html), null);
	});
});

describe('the ten API module groups (agent-surface.md §3)', () => {
	it('is one entry per export-surface value, named by the entry shim', () => {
		const entries = apiModuleEntries();
		assert.equal(entries.length, packageValues.length);
		for (const entry of entries) {
			assert.ok(packageValues.includes(entry.packageValue as (typeof packageValues)[number]), entry.packageValue);
			assert.ok(entry.route.startsWith('/docs/reference/api/'), entry.route);
		}
		assert.deepEqual(
			entries.map((entry) => entry.module),
			['@balsa/core', 'agent', 'durable-agent', 'memory', 'model', 'observability', 'schedules', 'signals', 'tools', 'workflows'],
		);
	});

	it('points every module at the page the import map’s Signatures column links', () => {
		assert.deepEqual(apiModulePages, {
			'@balsa/core': { route: '/docs/reference/api/balsa/core/functions/createapp/', title: 'createApp' },
			'@balsa/core/agent': { route: '/docs/reference/api/agent/classes/agent/', title: 'Agent' },
			'@balsa/core/model': { route: '/docs/reference/api/model/type-aliases/chunk/', title: 'Chunk' },
			'@balsa/core/tools': { route: '/docs/reference/api/tools/functions/createtool/', title: 'createTool' },
			'@balsa/core/memory': { route: '/docs/reference/api/memory/classes/memory/', title: 'Memory' },
			'@balsa/core/workflows': {
				route: '/docs/reference/api/workflows/functions/createworkflow/',
				title: 'createWorkflow',
			},
			'@balsa/core/observability': {
				route: '/docs/reference/api/observability/functions/createtracer/',
				title: 'createTracer',
			},
			'@balsa/core/signals': { route: '/docs/reference/api/signals/functions/createsignals/', title: 'createSignals' },
			'@balsa/core/durable-agent': {
				route: '/docs/reference/api/durable-agent/functions/createdurableagent/',
				title: 'createDurableAgent',
			},
			'@balsa/core/schedules': {
				route: '/docs/reference/api/schedules/functions/createschedules/',
				title: 'createSchedules',
			},
		});
	});

	it('covers every generated page exactly once, and every group has pages', () => {
		assert.deepEqual(apiModuleIssues({ treeFiles: moduleTree(), modules: apiModuleEntries() }), []);
	});

	it('goes red on a tree file outside every module group', () => {
		const issues = apiModuleIssues({
			treeFiles: [...moduleTree(), `${apiTreeRoot}/unknown/index.md`],
			modules: apiModuleEntries(),
		});
		assert.equal(issues.length, 1);
		assert.match(issues[0], /unknown\/index\.md is under no module group/);
	});

	it('goes red on a module group with no pages', () => {
		const issues = apiModuleIssues({ treeFiles: [], modules: apiModuleEntries() });
		assert.equal(issues.length, packageValues.length);
		assert.match(issues[0], /has no generated pages/);
	});
});

describe('/llms.txt (agent-surface.md §3)', () => {
	const pages = [
		indexPage('/docs/get-started/quickstart/', 'Quickstart', 'get-started', 2),
		indexPage('/docs/', 'Introduction', 'get-started', 0),
		indexPage('/docs/concepts/agents/', 'Agents', 'concepts', 1),
		indexPage('/docs/project/docs-for-agents/', 'Docs for AI agents', 'project', 1),
	];
	const modules = apiModuleEntries().filter((entry) => entry.packageValue === '@balsa/core/agent');

	it('renders the llmstxt.org v2 shape: H1, summary, one section per family, link list', () => {
		assert.equal(
			renderLlmsTxt({ pages, modules }),
			[
				'# Balsa',
				'',
				'> Documentation for Balsa, a lightweight TypeScript agent framework.',
				'> Every page is also served as Markdown: drop the trailing slash and append `.md` — `/docs/concepts/agents/` is also `/docs/concepts/agents.md`.',
				'> The pages and their Markdown twins are canonical: where a page disagrees with a model’s training data, the page is current. `/llms-manifest.json` records the framework revision this documentation describes.',
				'',
				'## Get started',
				'',
				'- [Introduction](/docs/)',
				'- [Quickstart](/docs/get-started/quickstart/)',
				'',
				'## Concepts',
				'',
				'- [Agents](/docs/concepts/agents/)',
				'',
				'## Reference',
				'',
				'- [agent](/docs/reference/api/agent/classes/agent/): API reference module for `@balsa/core/agent` — its pages start at Agent',
				'',
				'## Project & ecosystem',
				'',
				'- [Docs for AI agents](/docs/project/docs-for-agents/)',
				'',
				'## Optional',
				'',
				'- [/llms-manifest.json](/llms-manifest.json): the package-to-page map — which pages document each `@balsa/*` entry point, and the framework revision they describe.',
				'- [balsa-framework](https://github.com/0xnicholas/balsa-framework): the framework repository — source, examples and issues.',
				'',
			].join('\n'),
		);
	});

	it('orders pages by the family position, then by route', () => {
		const rendered = renderLlmsTxt({
			pages: [
				indexPage('/docs/get-started/installation/', 'Installation', 'get-started', 1),
				indexPage('/docs/get-started/quickstart/', 'Quickstart', 'get-started', 2),
				indexPage('/docs/get-started/zz-last/', 'Zzz', 'get-started'),
				indexPage('/docs/', 'Introduction', 'get-started', 0),
			],
			modules: [],
		});
		assert.deepEqual(llmsTxtLinks(rendered), [
			'/docs/',
			'/docs/get-started/installation/',
			'/docs/get-started/quickstart/',
			'/docs/get-started/zz-last/',
			'/llms-manifest.json',
			'https://github.com/0xnicholas/balsa-framework',
		]);
	});

	it('writes absolute links once the site origin is known', () => {
		const rendered = renderLlmsTxt({ site: 'https://docs.balsa.dev', pages, modules });
		assert.ok(rendered.includes('- [Introduction](https://docs.balsa.dev/docs/)'));
		assert.ok(rendered.includes('(https://docs.balsa.dev/llms-manifest.json)'));
		// The framework repository stays where it is.
		assert.ok(rendered.includes('(https://github.com/0xnicholas/balsa-framework)'));
	});
});

describe('/llms-manifest.json (agent-surface.md §4)', () => {
	const memory = indexPage('/docs/concepts/memory/', 'Memory', 'concepts', 4, ['@balsa/core/memory', '@balsa/core']);
	const quickstart = indexPage('/docs/get-started/quickstart/', 'Quickstart', 'get-started', 2, ['@balsa/core']);

	it('keys `packages` by the export surface and maps pages to their package values', () => {
		const manifest = buildManifest({
			pin: 'a'.repeat(40),
			version: null,
			generatedAt: '2026-10-03T00:00:00.000Z',
			pages: [memory, quickstart],
		});

		assert.deepEqual(Object.keys(manifest.packages), [...packageValues]);
		const entry = (route: string, title: string, family: SurfacePage['family']) => ({
			path: route,
			title,
			description: `${title} — fixture description.`,
			family,
		});
		const memoryEntry = entry('/docs/concepts/memory', 'Memory', 'concepts');
		// Family order decides the list: Get started first, then Concepts.
		assert.deepEqual(manifest.packages['@balsa/core'], [
			entry('/docs/get-started/quickstart', 'Quickstart', 'get-started'),
			memoryEntry,
		]);
		assert.deepEqual(manifest.packages['@balsa/core/memory'], [memoryEntry]);
		// A page that documents no package maps nowhere.
		assert.deepEqual(manifest.packages['@balsa/core/tools'], []);
	});

	it('carries the site, the pinned ref and the version field', () => {
		const manifest = buildManifest({
			site: 'https://docs.balsa.dev',
			pin: 'b'.repeat(40),
			version: null,
			generatedAt: '2026-10-03T00:00:00.000Z',
			pages: [],
		});
		assert.equal(manifest.site, 'https://docs.balsa.dev');
		assert.deepEqual(manifest.framework, { pin: 'b'.repeat(40), version: null });
		assert.equal(manifest.generatedAt, '2026-10-03T00:00:00.000Z');
	});

	it('writes `site: null` while the origin is undecided (delivery.md §3.4)', () => {
		const manifest = buildManifest({ pin: 'c'.repeat(40), version: null, generatedAt: 'x', pages: [] });
		assert.equal(manifest.site, null);
	});
});

describe('assertion ②b — the manifest says what the tree says (agent-surface.md §4)', () => {
	const pages = [
		indexPage('/docs/concepts/memory/', 'Memory', 'concepts', 4, ['@balsa/core/memory']),
		indexPage('/docs/get-started/quickstart/', 'Quickstart', 'get-started', 2, ['@balsa/core']),
	];
	const pin = 'd'.repeat(40);
	const source = `${JSON.stringify(
		buildManifest({ pin, version: frameworkVersion, generatedAt: '2026-10-03T00:00:00.000Z', pages }),
		null,
		'\t',
	)}\n`;

	const check = (overrides: Partial<Parameters<typeof manifestIssues>[0]> = {}) =>
		manifestIssues({ source, pages, pin, ...overrides });

	it('is green when the artifact matches the content tree', () => {
		assert.deepEqual(check(), []);
	});

	it('is green with an origin once the site origin is set', () => {
		const site = 'https://docs.balsa.dev';
		const withSite = `${JSON.stringify(
			buildManifest({ site, pin, version: frameworkVersion, generatedAt: 'x', pages }),
		)}\n`;
		assert.deepEqual(check({ source: withSite, site }), []);
	});

	it('goes red when a package key is missing', () => {
		const manifest = JSON.parse(source);
		delete manifest.packages['@balsa/core/memory'];
		const issues = check({ source: JSON.stringify(manifest) });
		assert.ok(issues.some((issue) => /`packages` keys must be the export surface/.test(issue)));
	});

	it('goes red when a page list drifts from the tree', () => {
		const manifest = JSON.parse(source);
		manifest.packages['@balsa/core'].push({ path: '/docs/gone', title: 'Gone', description: '…', family: 'concepts' });
		const issues = check({ source: JSON.stringify(manifest) });
		assert.deepEqual(issues, [
			'`packages.@balsa/core` does not match the pages that document it in the content tree',
		]);
	});

	it('goes red on a pin, a version or a site that disagree, and on a broken file', () => {
		const manifest = JSON.parse(source);
		manifest.framework.pin = 'e'.repeat(40);
		manifest.framework.version = '0.1.0';
		manifest.site = 'https://example.invalid';
		const issues = check({ source: JSON.stringify(manifest) });
		assert.equal(issues.length, 3);
		assert.ok(issues.some((issue) => /`framework.pin` is "e{40}", expected d{40}/.test(issue)));
		assert.ok(issues.some((issue) => /`framework.version` is "0\.1\.0", expected null/.test(issue)));
		assert.ok(issues.some((issue) => /`site` is "https:\/\/example\.invalid", expected null/.test(issue)));

		assert.match(check({ source: 'not json' })[0], /is not valid JSON/);
		assert.match(check({ source: '[]' })[0], /must be a JSON object/);
	});
});

describe('assertion ① — every HTML route has a twin (agent-surface.md §9.1)', () => {
	const routes = ['/docs/', '/docs/concepts/agents/'];
	const files = ['docs/index.html', 'docs.md', 'docs/concepts/agents/index.html', 'docs/concepts/agents.md'];

	it('is green when both directions hold', () => {
		assert.deepEqual(twinIssues({ routes, files: [...files, '404.html', '404.md'] }), []);
	});

	it('goes red when a page’s twin is missing', () => {
		const issues = twinIssues({ routes, files: files.filter((file) => file !== 'docs/concepts/agents.md') });
		assert.equal(issues.length, 1);
		assert.match(issues[0], /\/docs\/concepts\/agents\/: no Markdown twin at docs\/concepts\/agents\.md/);
	});

	it('goes red when a page’s HTML is missing', () => {
		const issues = twinIssues({ routes, files: files.filter((file) => file !== 'docs/index.html') });
		assert.equal(issues.length, 1);
		assert.match(issues[0], /\/docs\/: docs\/index\.html is not in the build output/);
	});

	it('goes red on a twin whose page is gone', () => {
		const issues = twinIssues({ routes, files: [...files, 'docs/removed.md'] });
		assert.equal(issues.length, 1);
		assert.match(issues[0], /docs\/removed\.md: no HTML page/);
	});

	it('ignores the site-root redirect stub (delivery.md §4.1)', () => {
		assert.deepEqual(twinIssues({ routes, files: [...files, 'index.html'] }), []);
	});

	it('reads the head link a page advertises', () => {
		assert.equal(
			alternateLink('<link rel="alternate" type="text/markdown" href="/docs/concepts/agents.md"/>'),
			'/docs/concepts/agents.md',
		);
		assert.equal(alternateLink('<link rel="canonical" href="/docs/concepts/agents/"/>'), null);
	});

	it('is green when every page advertises its twin, and red otherwise', () => {
		const pages = [
			{ path: 'docs/index.html', alternate: '/docs.md' },
			{ path: 'docs/concepts/agents/index.html', alternate: '/docs/concepts/agents.md' },
			{ path: 'index.html', alternate: null },
		];
		assert.deepEqual(headLinkIssues(pages), []);

		const missing = headLinkIssues(pages.map((page) => ({ ...page, alternate: null })));
		assert.equal(missing.length, 2);
		assert.match(missing[0], /docs\/index\.html: no <link rel="alternate" type="text\/markdown"> pointing at \/docs\.md/);

		const wrong = headLinkIssues([{ path: 'docs/index.html', alternate: '/docs/concepts/agents.md' }]);
		assert.match(wrong[0], /points at \/docs\/concepts\/agents\.md, expected \/docs\.md/);
	});
});

describe('assertion ② — the index and the content set agree (agent-surface.md §9.2)', () => {
	const pages = [
		indexPage('/docs/', 'Introduction', 'get-started', 0, ['@balsa/core']),
		indexPage('/docs/concepts/agents/', 'Agents', 'concepts', 1, ['@balsa/core/agent']),
	];
	const modules = apiModuleEntries().filter((entry) => entry.packageValue === '@balsa/core/agent');
	const files = ['llms.txt', 'llms-manifest.json'];
	const source = renderLlmsTxt({ pages, modules });

	const check = (overrides: Partial<Parameters<typeof llmsIndexIssues>[0]> = {}) =>
		llmsIndexIssues({ source, routes: pages.map((page) => page.route), modules, files, ...overrides });

	it('is green when the links are exactly the pages plus the module entries', () => {
		assert.deepEqual(check(), []);
	});

	it('goes red on a link no page serves, and on the page it replaced', () => {
		const issues = check({ source: source.replace('/docs/concepts/agents/)', '/docs/concepts/gone/)') });
		assert.equal(issues.length, 2);
		assert.match(issues.join('\n'), /\/docs\/concepts\/gone\/ is not part of the content set/);
		assert.match(issues.join('\n'), /\/docs\/concepts\/agents\/ is missing from \/llms\.txt/);
	});

	it('goes red when a page is listed twice', () => {
		const issues = check({ source: `${source}- [Introduction](/docs/)\n` });
		assert.equal(issues.length, 1);
		assert.match(issues[0], /\/docs\/ is listed 2 times/);
	});

	it('goes red when a generated page is listed instead of its module group', () => {
		const issues = check({
			source: source.replace('(/docs/)', '(/docs/reference/api/agent/interfaces/agentconfig/)'),
		});
		assert.equal(issues.length, 2);
		assert.match(issues.join('\n'), /agentconfig\/ is not part of the content set/);
		assert.ok(issues.some((issue) => /\/docs\/ is missing from \/llms\.txt/.test(issue)));
	});

	it('ignores external links and accepts the machine files', () => {
		assert.deepEqual(check(), []);
	});
});

describe('assertion ③ — writing rules ①② (agent-surface.md §6/§9.3)', () => {
	const page = (body: string) => `---\ntitle: Fixture\ndescription: Fixture page.\n---\n\n${body}`;

	it('is green on labelled fences, headings from h2 and no jumps', () => {
		const source = page(
			['## Section', '', '```ts', 'const x = 1;', '```', '', '### Deeper', '', '~~~bash', 'echo hi', '~~~', ''].join(
				'\n',
			),
		);
		assert.deepEqual(writingRuleIssues([{ path: 'fixture.md', source }]), []);
	});

	// `page()` puts the body's first line at file line 6: the messages count from the file,
	// not from the body, so a red gate points at the line to open.
	it('goes red on a fence without a language, and names the file line', () => {
		const source = page(['## Section', '', '```', 'const x = 1;', '```', ''].join('\n'));
		const issues = writingRuleIssues([{ path: 'fixture.md', source }]);
		assert.equal(issues.length, 1);
		assert.match(issues[0], /fixture\.md:8: fenced code block without a language/);
	});

	it('goes red on a body H1, a first h3, a jump and a setext H1', () => {
		assert.match(writingRuleIssues([{ path: 'h1.md', source: page('# Body title\n') }])[0], /h1\.md:6: body H1/);
		assert.match(
			writingRuleIssues([{ path: 'h3.md', source: page('### Too deep\n') }])[0],
			/h3\.md:6: first heading is h3/,
		);
		assert.match(
			writingRuleIssues([{ path: 'jump.md', source: page('## Section\n\n#### Jumped\n') }])[0],
			/jump\.md:8: heading jumps from h2 to h4/,
		);
		assert.match(
			writingRuleIssues([{ path: 'setext.md', source: page('Body title\n=====\n') }])[0],
			/setext\.md:7: setext H1/,
		);
	});

	it('reads no headings or fences inside code blocks', () => {
		const source = page(['## Section', '', '~~~md', '```', '# not a heading', '```', '~~~', ''].join('\n'));
		assert.deepEqual(writingRuleIssues([{ path: 'fixture.md', source }]), []);
	});
});
