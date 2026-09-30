import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { frontmatterFields, packageValues } from './frontmatter.ts';

/**
 * The field table as a unit: ia.md §4 / stack.md §5. `pnpm verify` also proves the build
 * rejects violations end to end (`scripts/check-frontmatter.mjs`); these cases pin the
 * value domains that the build-level fixtures do not enumerate.
 */

/** Minimal page that satisfies the required fields. */
const page = (overrides: Record<string, unknown> = {}) => ({
	title: 'Quickstart',
	description: 'Build and run a first agent.',
	packages: ['@balsa/core'],
	...overrides,
});

describe('frontmatter field table', () => {
	it('accepts a page with the three required fields', () => {
		const parsed = frontmatterFields.parse(page());
		assert.deepEqual(parsed.packages, ['@balsa/core']);
		assert.equal(parsed.project, 'balsa', 'default project applies when omitted');
		assert.equal(parsed.subtype, undefined);
		assert.equal(parsed.order, undefined);
		assert.equal(parsed.source, undefined);
	});

	for (const field of ['title', 'description', 'packages'] as const) {
		it(`rejects a page without \`${field}\``, () => {
			const omitted = { ...page() };
			delete omitted[field];
			assert.throws(() => frontmatterFields.parse(omitted));
		});
	}

	it('rejects empty title and description strings', () => {
		assert.throws(() => frontmatterFields.parse(page({ title: '' })));
		assert.throws(() => frontmatterFields.parse(page({ description: '' })));
	});

	it('accepts every value of the packages domain', () => {
		for (const value of packageValues) {
			const parsed = frontmatterFields.parse(page({ packages: [value] }));
			assert.deepEqual(parsed.packages, [value]);
		}
	});

	it('rejects package values outside the export surface', () => {
		assert.throws(() => frontmatterFields.parse(page({ packages: ['@balsa/core/nope'] })));
		assert.throws(() => frontmatterFields.parse(page({ packages: ['@balsa/other'] })));
		assert.throws(() => frontmatterFields.parse(page({ packages: [42] })));
	});

	it('accepts both Guides sub-types and rejects anything else', () => {
		for (const subtype of ['walkthrough', 'migration'] as const) {
			assert.equal(frontmatterFields.parse(page({ subtype })).subtype, subtype);
		}
		assert.throws(() => frontmatterFields.parse(page({ subtype: 'guide' })));
	});

	it('accepts only integer family positions', () => {
		assert.equal(frontmatterFields.parse(page({ order: 3 })).order, 3);
		assert.throws(() => frontmatterFields.parse(page({ order: 1.5 })));
		assert.throws(() => frontmatterFields.parse(page({ order: '3' })));
	});

	it('accepts a lowercase project slug and rejects anything else (ia.md §5)', () => {
		assert.equal(frontmatterFields.parse(page({ project: 'studio' })).project, 'studio');
		assert.equal(frontmatterFields.parse(page({ project: 'my-proj-2' })).project, 'my-proj-2');
		assert.throws(() => frontmatterFields.parse(page({ project: 'Studio' })));
		assert.throws(() => frontmatterFields.parse(page({ project: 'my proj' })));
		assert.throws(() => frontmatterFields.parse(page({ project: '-studio' })));
		assert.throws(() => frontmatterFields.parse(page({ project: 'studio-' })));
		assert.throws(() => frontmatterFields.parse(page({ project: 'my--proj' })));
	});

	it('accepts source pointers with and without a commit pin', () => {
		const file = 'docs/architecture/agents.md';
		const ref = '0f3d1b2a4c5d6e7f8091a2b3c4d5e6f70819a2b3';
		assert.deepEqual(frontmatterFields.parse(page({ source: [{ file }] })).source, [{ file }]);
		assert.deepEqual(frontmatterFields.parse(page({ source: [{ file, ref }] })).source, [
			{ file, ref },
		]);
	});

	it('rejects malformed source pointers', () => {
		assert.throws(() => frontmatterFields.parse(page({ source: [{ ref: '0f3d1b2' }] })));
		assert.throws(() => frontmatterFields.parse(page({ source: [{ file: '' }] })));
		assert.throws(() =>
			frontmatterFields.parse(page({ source: [{ file: 'a.md', ref: '0F3D1B' }] })),
		);
		assert.throws(() => frontmatterFields.parse(page({ source: 'docs/architecture/agents.md' })));
	});
});
