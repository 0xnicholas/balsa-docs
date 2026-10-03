import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	exportSurfaceIssues,
	orderIssues,
	packageValuesFromExports,
	sourcePointerIssues,
	subtypeIssues,
	type ContentPage,
} from './content-values.ts';

/**
 * Cross-file frontmatter rules the Zod schema cannot see (stack.md §5 / §13.1): `subtype`
 * is Guides-only, `order` is unique inside a family, `packages` agrees with the real
 * export surface at the pinned ref, and `source` pointers are resolvable. This is the
 * "frontmatter 值域" leg of the Actions workflow (delivery.md §5①).
 */

const page = (route: string, frontmatter: Record<string, unknown> = {}): ContentPage => ({
	path: `src/content/docs${route}index.md`,
	route,
	frontmatter,
});

const surfaces = {
	exports: {
		'.': { types: './dist/index.d.ts' },
		'./agent': { types: './dist/agent/index.d.ts' },
		'./model': { types: './dist/model/index.d.ts' },
	},
	packageName: '@balsats/core',
};

describe('subtype is Guides-only (ia.md §4)', () => {
	it('accepts a walkthrough on a Guides page', () => {
		assert.deepEqual(
			subtypeIssues([page('/docs/guides/minimal-agent/', { subtype: 'walkthrough' })]),
			[],
		);
	});

	it('rejects subtype anywhere else, including the Introduction root', () => {
		for (const route of ['/docs/', '/docs/concepts/agents/', '/docs/project/changelog/']) {
			const issues = subtypeIssues([page(route, { subtype: 'walkthrough' })]);
			assert.equal(issues.length, 1, route);
			assert.match(issues[0].message, /Guides/);
		}
	});

	it('ignores pages without a subtype', () => {
		assert.deepEqual(subtypeIssues([page('/docs/concepts/agents/')]), []);
	});
});

describe('order is unique inside a family (ia.md §4)', () => {
	it('accepts distinct orders in one family and equal orders across families', () => {
		assert.deepEqual(
			orderIssues([
				page('/docs/concepts/agents/', { order: 1 }),
				page('/docs/concepts/tools/', { order: 2 }),
				page('/docs/guides/minimal-agent/', { order: 2 }),
			]),
			[],
		);
	});

	it('rejects a duplicate order inside one family, naming both pages', () => {
		const issues = orderIssues([
			page('/docs/concepts/agents/', { order: 2 }),
			page('/docs/concepts/tools/', { order: 2 }),
		]);
		assert.equal(issues.length, 1);
		assert.match(issues[0].message, /order 2/);
		assert.match(issues[0].message, /concepts\/agents/);
		assert.match(issues[0].message, /concepts\/tools/);
	});

	it('rejects an order on a page that is not in a family', () => {
		const issues = orderIssues([page('/docs/v2/upgrade/', { order: 3 })]);
		assert.equal(issues.length, 1);
		assert.match(issues[0].message, /family/);
	});

	it('ignores non-integer and negative positions defensively', () => {
		assert.deepEqual(orderIssues([page('/docs/concepts/agents/', { order: '2' })]), []);
	});
});

describe('packages agree with the export surface (content-boundary.md §6)', () => {
	it('derives values from package.json exports, root export first', () => {
		assert.deepEqual(packageValuesFromExports(surfaces.exports, surfaces.packageName), [
			'@balsats/core',
			'@balsats/core/agent',
			'@balsats/core/model',
		]);
	});

	it('passes when the frontmatter domain equals the export surface', () => {
		assert.deepEqual(
			exportSurfaceIssues([page('/docs/', { packages: ['@balsats/core'] })], {
				...surfaces,
				domain: ['@balsats/core', '@balsats/core/model', '@balsats/core/agent'],
			}),
			[],
		);
	});

	it('flags a domain that drifted from the pin, and says where to fix it', () => {
		const issues = exportSurfaceIssues([], {
			...surfaces,
			domain: ['@balsats/core', '@balsats/core/agent'],
		});
		assert.equal(issues.length, 1);
		assert.match(issues[0].message, /@balsats\/core\/model/);
		assert.match(issues[0].message, /frontmatter\.ts/);
	});

	it('flags a page that lists a package outside the surface', () => {
		const issues = exportSurfaceIssues(
			[page('/docs/concepts/agents/', { packages: ['@balsats/core/memory'] })],
			{ ...surfaces, domain: ['@balsats/core', '@balsats/core/agent', '@balsats/core/model'] },
		);
		assert.equal(issues.length, 1);
		assert.match(issues[0].page, /concepts\/agents/);
		assert.match(issues[0].message, /@balsats\/core\/memory/);
	});

	it('rejects malformed packages values instead of skipping them', () => {
		const issues = exportSurfaceIssues([page('/docs/', { packages: '@balsats/core' })], {
			...surfaces,
			domain: ['@balsats/core', '@balsats/core/agent', '@balsats/core/model'],
		});
		assert.equal(issues.length, 1);
		assert.match(issues[0].message, /array/);
	});
});

describe('source pointers', () => {
	const pin = 'a'.repeat(40);
	const lag = 'c'.repeat(40);

	it('defaults to the pinned ref and keeps a page-level lag', () => {
		const { pointers, issues } = sourcePointerIssues(
			[
				page('/docs/concepts/agents/', {
					source: [{ file: 'docs/architecture/agents.md' }, { file: 'README.md', ref: lag }],
				}),
			],
			pin,
		);
		assert.deepEqual(issues, []);
		assert.deepEqual(
			pointers.map(({ file, ref }) => [file, ref]),
			[
				['docs/architecture/agents.md', pin],
				['README.md', lag],
			],
		);
	});

	it('reports malformed pointers instead of silently dropping them', () => {
		const { pointers, issues } = sourcePointerIssues(
			[page('/docs/', { source: [{ file: 'a.md' }, { ref: lag }, 'b.md'] })],
			pin,
		);
		assert.equal(pointers.length, 1);
		assert.equal(issues.length, 2);
		assert.match(issues.map((issue) => issue.message).join('\n'), /`file`/);
	});

	it('accepts pages with no source pointers at all (originally written pages)', () => {
		assert.deepEqual(sourcePointerIssues([page('/docs/project/docs-for-agents/')], pin), {
			pointers: [],
			issues: [],
		});
	});
});
