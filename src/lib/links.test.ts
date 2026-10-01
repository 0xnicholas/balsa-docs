import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	anchorHrefs,
	anchorsInHtml,
	classifyHref,
	linkIssues,
	targetCandidates,
	type DistIndex,
} from './links.ts';

/**
 * The link gate's rules (#28, delivery.md §5 ③). These cases pin what counts as a broken
 * link in the built site: unresolvable root-relative targets, root-relative targets with a
 * missing anchor, and relative links (built pages address the site from the root, §4.3).
 * External links are out of scope on purpose — the gate never hits the network.
 *
 * The gate itself (over a real `dist/`) is driven end to end in `gate-scripts.test.ts`.
 */

/** A tiny in-memory asset directory: pages and their anchors. */
function indexOf(pages: Record<string, string>, assets: string[] = []): DistIndex {
	const ids = new Map(Object.entries(pages).map(([file, html]) => [file, anchorsInHtml(html)]));
	return {
		files: new Set([...Object.keys(pages), ...assets]),
		idsOf: (file) => ids.get(file) ?? new Set(),
	};
}

const issues = (hrefs: string[], index: DistIndex) =>
	linkIssues(
		hrefs.map((href) => ({ page: 'docs/index.html', href })),
		index,
	);

describe('anchors in a built page', () => {
	it('reads `<a href>` in both quote styles and ignores everything else', () => {
		const html = [
			'<a class="x" href="/docs/">one</a>',
			"<a href='/docs/#install'>two</a>",
			'<a name="legacy">no href</a>',
			'<link rel="canonical" href="/docs/">not an anchor</link>',
			'<img src="/og.png">',
		].join('\n');
		assert.deepEqual(anchorHrefs(html), ['/docs/', '/docs/#install']);
	});

	it('collects `id` and legacy `<a name>` anchors, not `<meta name>` or form fields', () => {
		const html = [
			'<html><head><meta name="viewport" content="width=device-width"></head>',
			'<body id="top"><a name="legacy"></a><h2 id=\'quoted\'>Heading</h2>',
			'<input name="query" id="search">',
		].join('\n');
		assert.deepEqual([...anchorsInHtml(html)].sort(), ['legacy', 'quoted', 'search', 'top']);
		assert.equal(anchorsInHtml('<meta name="description" content="x">').has('description'), false);
		assert.equal(anchorsInHtml('<p>no anchors here</p>').size, 0);
	});
});

describe('classifying a href (delivery.md §5 ③)', () => {
	it('separates external links, same-page fragments and root-relative paths', () => {
		assert.deepEqual(classifyHref('https://github.com/0xnicholas/balsa-framework'), {
			kind: 'external',
			href: 'https://github.com/0xnicholas/balsa-framework',
		});
		assert.deepEqual(classifyHref('mailto:someone@example.com'), {
			kind: 'external',
			href: 'mailto:someone@example.com',
		});
		assert.deepEqual(classifyHref('//example.com/x.js'), { kind: 'external', href: '//example.com/x.js' });
		assert.deepEqual(classifyHref('#installation'), { kind: 'fragment', fragment: 'installation' });
		assert.deepEqual(classifyHref('#'), { kind: 'fragment', fragment: '' });
		assert.deepEqual(classifyHref('/docs/get-started/quickstart/?q=1'), {
			kind: 'internal',
			path: '/docs/get-started/quickstart/',
			fragment: null,
		});
		assert.deepEqual(classifyHref('/docs/concepts/agents.md#step-one'), {
			kind: 'internal',
			path: '/docs/concepts/agents.md',
			fragment: 'step-one',
		});
	});

	it('keeps relative links in the `other` bucket — they get reported, not resolved', () => {
		assert.deepEqual(classifyHref('../concepts/agents/'), { kind: 'other', href: '../concepts/agents/' });
		assert.deepEqual(classifyHref('docs/agents'), { kind: 'other', href: 'docs/agents' });
	});

	it('treats an empty href as “this page” and `javascript:` as reportable', () => {
		assert.deepEqual(classifyHref(''), { kind: 'fragment', fragment: '' });
		assert.deepEqual(classifyHref('javascript:void(0)'), { kind: 'other', href: 'javascript:void(0)' });
		assert.deepEqual(classifyHref('data:text/plain,hi'), { kind: 'external', href: 'data:text/plain,hi' });
	});

	it('treats a text-fragment directive as an anchor that cannot be checked', () => {
		assert.deepEqual(classifyHref('/docs/#:~:text=install'), {
			kind: 'internal',
			path: '/docs/',
			fragment: '',
		});
	});
});

describe('resolving a target against the asset directory', () => {
	it('follows the host order: directory index, `.html`, then the file itself', () => {
		assert.deepEqual(targetCandidates('/'), ['index.html']);
		assert.deepEqual(targetCandidates('/docs/'), ['docs/index.html']);
		assert.deepEqual(targetCandidates('/docs/get-started/quickstart'), [
			'docs/get-started/quickstart/index.html',
			'docs/get-started/quickstart.html',
			'docs/get-started/quickstart',
		]);
		assert.deepEqual(targetCandidates('/favicon.svg'), [
			'favicon.svg/index.html',
			'favicon.svg.html',
			'favicon.svg',
		]);
	});
});

describe('link issues', () => {
	const index = indexOf({
		'docs/index.html': '<h1 id="install">Install</h1>',
		'docs/get-started/quickstart/index.html': '<h1 id="_top">Quickstart</h1>',
		'index.html': '<a href="/docs/">redirect stub</a>',
	});

	it('accepts links to pages, twins, assets, fragments and external sites', () => {
		const withAssets = indexOf(
			{
				'docs/index.html': '<h1 id="install">Install</h1><a name="legacy"></a>',
				'docs/get-started/quickstart/index.html': '<h1 id="_top">Quickstart</h1>',
				'index.html': '<a href="/docs/">redirect stub</a>',
			},
			['docs.md', 'docs/get-started/quickstart.md', 'favicon.svg', 'llms.txt', 'og.png', '_astro/app.css'],
		);
		assert.deepEqual(
			issues(
				[
					'/docs/',
					'/docs/#install',
					'/docs/#legacy',
					'/docs/get-started/quickstart/#_top',
					'/docs/get-started/quickstart.md',
					'/favicon.svg',
					'/llms.txt',
					'/_astro/app.css',
					'https://example.com/anything',
					'mailto:someone@example.com',
					'#install',
					'',
				],
				withAssets,
			),
			[],
		);
	});

	it('reports a target nothing serves', () => {
		assert.deepEqual(issues(['/docs/project/deployment'], index), [
			'docs/index.html: `/docs/project/deployment` resolves to no file in the asset directory — nothing serves that path',
		]);
	});

	it('reports an anchor the target page does not carry', () => {
		assert.deepEqual(issues(['/docs/#overview'], index), [
			'docs/index.html: `/docs/#overview` has no anchor `#overview` on docs/index.html — the fragment matches no `id`',
		]);
		assert.deepEqual(issues(['#overview'], index), [
			'docs/index.html: `#overview` has no anchor `#overview` on docs/index.html — the fragment matches no `id`',
		]);
	});

	it('decodes percent-encoded paths and anchors before looking them up', () => {
		const encoded = indexOf({ 'docs/a b/index.html': '<h1 id="x y">X</h1>' });
		assert.deepEqual(issues(['/docs/a%20b/#x%20y'], encoded), []);
	});

	it('reports relative links and `javascript:` hrefs instead of guessing', () => {
		assert.match(issues(['../concepts/agents/'], index).join('\n'), /neither root-relative nor external/);
		assert.deepEqual(issues(['javascript:void(0)'], index), [
			'docs/index.html: `javascript:void(0)` is neither root-relative nor external — built pages address the site from the root (delivery.md §4.3)',
		]);
	});
});
