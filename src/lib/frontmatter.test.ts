import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { contentFields, frontmatterFields, generatedFields, packageValues } from './frontmatter.ts';

/**
 * The field table as a unit: ia.md §4 / stack.md §5. `pnpm verify` also proves the build
 * rejects violations end to end (`scripts/check-frontmatter.mjs`); these cases pin the
 * value domains that the build-level fixtures do not enumerate.
 *
 * The collection schema is a union of the authored field table and the generated API tree's
 * marker, so the authored cases below parse with `contentFields`; the union itself (which
 * shape a page has to match) is pinned by the last block.
 */

/** Minimal page that satisfies the required fields. */
const page = (overrides: Record<string, unknown> = {}) => ({
	title: 'Quickstart',
	description: 'Build and run a first agent.',
	packages: ['@oribos/core'],
	...overrides,
});

describe('frontmatter field table', () => {
	it('accepts a page with the three required fields', () => {
		const parsed = contentFields.parse(page());
		assert.deepEqual(parsed.packages, ['@oribos/core']);
		assert.equal(parsed.project, 'oribos', 'default project applies when omitted');
		assert.equal(parsed.subtype, undefined);
		assert.equal(parsed.order, undefined);
		assert.equal(parsed.source, undefined);
	});

	for (const field of ['title', 'description', 'packages'] as const) {
		it(`rejects a page without \`${field}\``, () => {
			const omitted = { ...page() };
			delete omitted[field];
			assert.throws(() => contentFields.parse(omitted));
		});
	}

	it('rejects empty title and description strings', () => {
		assert.throws(() => contentFields.parse(page({ title: '' })));
		assert.throws(() => contentFields.parse(page({ description: '' })));
	});

	it('accepts every value of the packages domain', () => {
		for (const value of packageValues) {
			const parsed = contentFields.parse(page({ packages: [value] }));
			assert.deepEqual(parsed.packages, [value]);
		}
	});

	it('rejects package values outside the export surface', () => {
		assert.throws(() => contentFields.parse(page({ packages: ['@oribos/core/nope'] })));
		assert.throws(() => contentFields.parse(page({ packages: ['@oribos/other'] })));
		assert.throws(() => contentFields.parse(page({ packages: [42] })));
	});

	it('accepts both Guides sub-types and rejects anything else', () => {
		for (const subtype of ['walkthrough', 'migration'] as const) {
			assert.equal(contentFields.parse(page({ subtype })).subtype, subtype);
		}
		assert.throws(() => contentFields.parse(page({ subtype: 'guide' })));
	});

	it('accepts only integer family positions', () => {
		assert.equal(contentFields.parse(page({ order: 3 })).order, 3);
		assert.throws(() => contentFields.parse(page({ order: 1.5 })));
		assert.throws(() => contentFields.parse(page({ order: '3' })));
	});

	it('accepts a lowercase project slug and rejects anything else (ia.md §5)', () => {
		assert.equal(contentFields.parse(page({ project: 'studio' })).project, 'studio');
		assert.equal(contentFields.parse(page({ project: 'my-proj-2' })).project, 'my-proj-2');
		assert.throws(() => contentFields.parse(page({ project: 'Studio' })));
		assert.throws(() => contentFields.parse(page({ project: 'my proj' })));
		assert.throws(() => contentFields.parse(page({ project: '-studio' })));
		assert.throws(() => contentFields.parse(page({ project: 'studio-' })));
		assert.throws(() => contentFields.parse(page({ project: 'my--proj' })));
	});

	it('accepts source pointers with and without a commit pin', () => {
		const file = 'docs/architecture/agents.md';
		const ref = '0f3d1b2a4c5d6e7f8091a2b3c4d5e6f70819a2b3';
		assert.deepEqual(contentFields.parse(page({ source: [{ file }] })).source, [{ file }]);
		assert.deepEqual(contentFields.parse(page({ source: [{ file, ref }] })).source, [
			{ file, ref },
		]);
	});

	it('rejects malformed source pointers', () => {
		assert.throws(() => contentFields.parse(page({ source: [{ ref: '0f3d1b2' }] })));
		assert.throws(() => contentFields.parse(page({ source: [{ file: '' }] })));
		assert.throws(() =>
			contentFields.parse(page({ source: [{ file: 'a.md', ref: '0F3D1B' }] })),
		);
		assert.throws(() => contentFields.parse(page({ source: 'docs/architecture/agents.md' })));
	});
});

describe('generated API tree pages (api-reference.md §2)', () => {
	it('accepts a generated page: title plus the marker, no content fields', () => {
		const parsed = generatedFields.parse({ generated: true });
		assert.deepEqual(parsed, { generated: true });
	});

	it('rejects a marker other than the literal `true`', () => {
		assert.throws(() => generatedFields.parse({ generated: false }));
		assert.throws(() => generatedFields.parse({ generated: 'true' }));
		assert.throws(() => generatedFields.parse({}));
	});

	it('routes each page shape to its branch of the collection schema', () => {
		// Authored page: the content branch applies, `title`/`description` stay required.
		const authored = frontmatterFields.parse(page());
		assert.ok('packages' in authored);
		assert.deepEqual(authored.packages, ['@oribos/core']);
		// Generated page: no description/packages needed, the marker is.
		assert.deepEqual(frontmatterFields.parse({ generated: true }), { generated: true });
	});

	it('still rejects an authored page that is missing a required field', () => {
		const withoutDescription: Record<string, unknown> = { ...page() };
		delete withoutDescription.description;
		assert.throws(() => frontmatterFields.parse(withoutDescription));

		const withoutPackages: Record<string, unknown> = { ...page() };
		delete withoutPackages.packages;
		assert.throws(() => frontmatterFields.parse(withoutPackages));
	});
});
