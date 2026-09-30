import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	familyOf,
	pageRoutesFromPaths,
	pageRoutesFromRepoPaths,
	routeFromContentPath,
} from './pages.ts';

/**
 * The page set feeds the redirect ledger gates (delivery.md §4.2): a ledger `to` must
 * resolve here, and a route that disappears between two versions must be registered.
 * File path = URL path (stack.md §5), so these cases pin the mapping the gates rely on.
 */

describe('route from a content path', () => {
	const cases: [path: string, route: string | null][] = [
		['docs/index.md', '/docs/'],
		['docs/get-started/quickstart.md', '/docs/get-started/quickstart/'],
		['docs/concepts/durable-execution.mdx', '/docs/concepts/durable-execution/'],
		['index.md', '/'],
		// Generated API tree (#20): the file keeps the symbol's case, the URL is slugified.
		['docs/reference/api/agent/classes/Agent.md', '/docs/reference/api/agent/classes/agent/'],
		[
			'docs/reference/api/@balsa/core/functions/createApp.md',
			'/docs/reference/api/balsa/core/functions/createapp/',
		],
		[
			'docs/reference/api/tools/namespaces/StandardSchemaV1/interfaces/Props.md',
			'/docs/reference/api/tools/namespaces/standardschemav1/interfaces/props/',
		],
		// Not pages: Starlight partials, the custom 404, and non-Markdown files.
		['_partial.md', null],
		['docs/_partial.md', null],
		['docs/_snippets/code.md', null],
		['404.md', null],
		['404.mdx', null],
		['docs/notes.txt', null],
		['docs/diagram.png', null],
	];

	for (const [path, route] of cases) {
		it(`${path} → ${route ?? 'not a page'}`, () => {
			assert.equal(routeFromContentPath(path), route);
		});
	}

	it('normalizes nothing else: no trailing slash is invented for partial paths', () => {
		assert.equal(routeFromContentPath('docs/get-started/'), null);
	});
});

describe('page set', () => {
	it('sorts and de-duplicates', () => {
		assert.deepEqual(
			pageRoutesFromPaths([
				'docs/get-started/quickstart.md',
				'docs/index.md',
				'docs/get-started/quickstart.mdx',
				'404.md',
			]),
			['/docs/', '/docs/get-started/quickstart/'],
		);
	});

	it('keeps only paths under the content root', () => {
		assert.deepEqual(
			pageRoutesFromRepoPaths([
				'src/content/docs/docs/index.md',
				'src/content/i18n/en.json',
				'src/lib/pages.ts',
				'src/content/docs/docs/concepts/agents.md',
			]),
			['/docs/', '/docs/concepts/agents/'],
		);
	});
});

describe('family of a route', () => {
	const cases: [route: string, family: string | null][] = [
		['/docs/', 'get-started'],
		['/docs/get-started/installation/', 'get-started'],
		['/docs/concepts/agents/', 'concepts'],
		['/docs/guides/minimal-agent/', 'guides'],
		['/docs/reference/api/core/', 'reference'],
		['/docs/project/docs-for-agents/', 'project'],
		// Outside the five families: the site root, reserved namespaces, deeper paths.
		['/', null],
		['/docs/v2/upgrade/', null],
		['/llms.txt', null],
	];

	for (const [route, family] of cases) {
		it(`${route} → ${family ?? 'no family'}`, () => {
			assert.equal(familyOf(route), family);
		});
	}
});
