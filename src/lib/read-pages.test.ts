import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { parsePageFile, readPages } from './read-pages.ts';

/**
 * Pages as the value-domain gate consumes them: repo path, route, and the raw frontmatter
 * mapping (the Zod schema runs in the build; this reader feeds the cross-file rules that
 * the schema cannot express — stack.md §13.1).
 */

const file = (frontmatter: string, body = '\nBody.\n') => `---\n${frontmatter}\n---\n${body}`;

describe('page files', () => {
	it('reads route and frontmatter, including nested source pointers', () => {
		const result = parsePageFile(
			file(
				[
					'title: Minimal agent',
					'description: Walk through the minimal example.',
					'project: balsats',
					'packages:',
					"  - '@balsats/core/agent'",
					'source:',
					'  - file: examples/minimal-agent/README.md',
					'  - file: docs/architecture/agents.md',
					'    ref: 0f3d1b2a4c5d6e7f8091a2b3c4d5e6f70819a2b3',
				].join('\n'),
			),
			'src/content/docs/docs/guides/minimal-agent.md',
		);
		assert.ok('page' in result, JSON.stringify(result));
		assert.equal(result.page.route, '/docs/guides/minimal-agent/');
		assert.deepEqual(result.page.frontmatter.packages, ['@balsats/core/agent']);
		assert.deepEqual(result.page.frontmatter.source, [
			{ file: 'examples/minimal-agent/README.md' },
			{ file: 'docs/architecture/agents.md', ref: '0f3d1b2a4c5d6e7f8091a2b3c4d5e6f70819a2b3' },
		]);
	});

	it('keeps unrelated frontmatter keys untouched', () => {
		const result = parsePageFile(
			file('title: T\ndescription: D\npackages: []\nsidebar:\n  order: 2'),
			'src/content/docs/docs/index.md',
		);
		assert.ok('page' in result);
		assert.deepEqual(result.page.frontmatter.sidebar, { order: 2 });
	});

	it('rejects a page without a frontmatter block', () => {
		const result = parsePageFile('# No frontmatter\n', 'src/content/docs/docs/index.md');
		assert.ok('errors' in result);
		assert.match(result.errors.join('\n'), /frontmatter/);
	});

	it('rejects invalid YAML and non-mapping frontmatter', () => {
		const broken = parsePageFile(file('title: [unclosed'), 'src/content/docs/docs/index.md');
		assert.ok('errors' in broken);
		assert.match(broken.errors.join('\n'), /YAML/i);

		const list = parsePageFile('---\n- a\n- b\n---\n', 'src/content/docs/docs/index.md');
		assert.ok('errors' in list);
		assert.match(list.errors.join('\n'), /mapping|object/i);
	});

	it('rejects paths outside the content root and files that are not pages', () => {
		for (const repoPath of [
			'src/lib/pages.ts',
			'src/content/docs/404.md',
			'src/content/docs/docs/_partial.md',
		]) {
			const result = parsePageFile(file('title: T'), repoPath);
			assert.ok('errors' in result, repoPath);
		}
	});
});

describe('reading a content tree', () => {
	it('walks the content root, parses every page, and reports broken ones', () => {
		const root = mkdtempSync(path.join(tmpdir(), 'balsats-read-pages-'));
		try {
			const write = (relative: string, contents: string) => {
				const target = path.join(root, relative);
				mkdirSync(path.dirname(target), { recursive: true });
				writeFileSync(target, contents);
			};

			write('src/content/docs/docs/index.md', file('title: Introduction'));
			write(
				'src/content/docs/docs/get-started/quickstart.md',
				file('title: Quickstart\ndescription: D\npackages: []'),
			);
			write('src/content/docs/404.md', file('title: Not found'));
			write('src/content/docs/docs/_partial.md', file('title: Partial'));
			write('src/content/docs/docs/broken.md', '# no frontmatter');
			write('src/content/i18n/en.json', '{}');

			const { pages, errors } = readPages(root);
			assert.deepEqual(
				pages.map((page) => [page.path, page.route]),
				[
					['src/content/docs/docs/get-started/quickstart.md', '/docs/get-started/quickstart/'],
					['src/content/docs/docs/index.md', '/docs/'],
				],
			);
			assert.equal(errors.length, 1);
			assert.match(errors[0], /broken\.md/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
