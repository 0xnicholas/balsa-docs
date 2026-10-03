import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import {
	apiSidebarIssues,
	apiTreeEntries,
	apiTreePageFiles,
	apiTreeRoot,
	entryShimOf,
	entryShimSource,
	markGeneratedPage,
	moduleNameOf,
	normalizeApiTree,
} from './api-tree.ts';
import { contentRoot } from './pages.ts';
import { packageValues } from './frontmatter.ts';

/**
 * The generated API tree's rules (api-reference.md §2/§4): the entry shims behind the module
 * names, the normalize step that keeps regeneration byte-stable, and the sidebar snapshot's
 * resolution against the committed tree. The CLI gates add the end-to-end run
 * (`gate-scripts.test.ts`); the Astro side is covered by `pnpm verify`'s build + route gate.
 */

const temporaries: string[] = [];

after(() => {
	for (const directory of temporaries) rmSync(directory, { recursive: true, force: true });
});

const temporaryRepo = (): string => {
	const directory = mkdtempSync(path.join(tmpdir(), 'balsats-api-tree-'));
	temporaries.push(directory);
	return directory;
};

const write = (root: string, relative: string, contents: string): void => {
	const target = path.join(root, relative);
	mkdirSync(path.dirname(target), { recursive: true });
	writeFileSync(target, contents);
};

/** A generated page as the plugin writes it: title + Starlight's own fields, no marker. */
const pluginPage = (title: string): string =>
	`---\neditUrl: false\nnext: false\nprev: false\ntitle: "${title}"\n---\n\nBody of ${title}.\n`;

describe('entry shims (api-reference.md §2)', () => {
	it('maps the export surface onto one shim per value, root last in the path', () => {
		assert.equal(entryShimOf('@balsats/core'), 'api-entry/@balsats/core.d.ts');
		assert.equal(entryShimOf('@balsats/core/agent'), 'api-entry/agent.d.ts');
		assert.equal(entryShimOf('@balsats/core/durable-agent'), 'api-entry/durable-agent.d.ts');
	});

	it('derives the module name TypeDoc shows from the shim file name', () => {
		assert.deepEqual(apiTreeEntries.map(moduleNameOf), [
			'@balsats/core',
			'agent',
			'durable-agent',
			'memory',
			'model',
			'observability',
			'schedules',
			'signals',
			'tools',
			'workflows',
		]);
	});

	it('points every shim at the fixed checkout, one level up per shim directory', () => {
		assert.equal(
			entryShimSource('@balsats/core'),
			"export * from '../../.framework/balsats-framework/packages/core/dist/index.js';",
		);
		assert.equal(
			entryShimSource('@balsats/core/tools'),
			"export * from '../.framework/balsats-framework/packages/core/dist/tools/index.js';",
		);
	});

	it('has one shim per `packages` domain value — the same export surface', () => {
		assert.equal(apiTreeEntries.length, packageValues.length);
	});
});

describe('generated marker (api-reference.md §4 ③)', () => {
	it('inserts the marker as the first frontmatter line', () => {
		const marked = markGeneratedPage(pluginPage('Agent'));
		assert.equal(
			marked,
			`---\ngenerated: true\neditUrl: false\nnext: false\nprev: false\ntitle: "Agent"\n---\n\nBody of Agent.\n`,
		);
	});

	it('is idempotent — regeneration must converge byte-for-byte', () => {
		const once = markGeneratedPage(pluginPage('Agent'));
		assert.equal(markGeneratedPage(once), once);
	});

	it('leaves a page without frontmatter, and the rest of the file, alone', () => {
		assert.equal(markGeneratedPage('No frontmatter here.\n'), 'No frontmatter here.\n');
		const body = '---\ntitle: "x"\n---\n\n```ts\ngenerated: true\n```\n';
		assert.equal(
			markGeneratedPage(body),
			'---\ngenerated: true\ntitle: "x"\n---\n\n```ts\ngenerated: true\n```\n',
		);
	});
});

describe('normalize step (api-reference.md §4 ③)', () => {
	it('deletes the orphan root README and marks every page, once', () => {
		const root = temporaryRepo();
		write(root, `${apiTreeRoot}/README.md`, pluginPage('balsats-docs'));
		write(root, `${apiTreeRoot}/agent/classes/Agent.md`, pluginPage('Agent'));
		write(root, `${apiTreeRoot}/agent/functions/createAgent.md`, pluginPage('createAgent'));

		const first = normalizeApiTree(root);
		assert.deepEqual(first.removed, [`${apiTreeRoot}/README.md`]);
		assert.deepEqual(first.marked, [
			`${apiTreeRoot}/agent/classes/Agent.md`,
			`${apiTreeRoot}/agent/functions/createAgent.md`,
		]);
		assert.ok(!existsSync(path.join(root, `${apiTreeRoot}/README.md`)));

		// The second run is a no-op: no deletions, no rewrites (the byte-stability of F11).
		const before = apiTreePageFiles(root).map((file) => readFileSync(path.join(root, file), 'utf8'));
		const second = normalizeApiTree(root);
		assert.deepEqual(second, { removed: [], marked: [] });
		assert.deepEqual(
			apiTreePageFiles(root).map((file) => readFileSync(path.join(root, file), 'utf8')),
			before,
		);
	});

	it('lists tree pages sorted, and nothing outside the tree', () => {
		const root = temporaryRepo();
		write(root, `${apiTreeRoot}/b/Two.md`, pluginPage('Two'));
		write(root, `${apiTreeRoot}/a/One.md`, pluginPage('One'));
		write(root, `${contentRoot}/docs/get-started/quickstart.md`, '---\ntitle: x\n---\n');

		assert.deepEqual(apiTreePageFiles(root), [
			`${apiTreeRoot}/a/One.md`,
			`${apiTreeRoot}/b/Two.md`,
		]);
	});
});

describe('sidebar snapshot (api-reference.md §3 F7)', () => {
	const treePages = [
		`${apiTreeRoot}/@balsats/core/functions/createApp.md`,
		`${apiTreeRoot}/agent/classes/Agent.md`,
		`${apiTreeRoot}/tools/interfaces/Tool.md`,
	];
	const routes = [
		'/docs/reference/api/agent/classes/agent/',
		'/docs/reference/api/tools/interfaces/tool/',
	];
	const autogenerate = (directory: string) => ({
		collapsed: true,
		items: [{ autogenerate: { collapsed: true, directory } }],
	});
	const snapshot = {
		label: 'API Reference',
		collapsed: true,
		items: [
			{
				label: '@balsats/core',
				collapsed: true,
				items: [autogenerate('docs/reference/api/@balsats/core')],
			},
			{ label: 'agent', collapsed: true, items: [autogenerate('docs/reference/api/agent/classes')] },
			{
				label: 'tools',
				collapsed: true,
				items: [
					autogenerate('docs/reference/api/tools/interfaces'),
					{
						collapsed: true,
						label: 'References',
						items: [
							{ label: 'Tool', link: '/docs/reference/api/tools/interfaces/tool/' },
						],
					},
				],
			},
		],
	};
	/** The snapshot for a surface whose shims are `@balsats/core`, `agent`, `tools`. */
	const modules = ['@balsats/core', 'agent', 'tools'];
	const issues = (value: unknown) => apiSidebarIssues(value, modules, treePages, routes);
	/** The snapshot as the gate sees it: loosely-typed JSON, so a case can break any node. */
	type Node = {
		label?: string;
		collapsed?: boolean;
		items: Node[];
		autogenerate?: { collapsed?: boolean; directory?: string };
		link?: string;
	};
	const mutableSnapshot = (): Node => JSON.parse(JSON.stringify(snapshot)) as Node;

	it('accepts the group the plugin builds', () => {
		assert.deepEqual(issues(snapshot), []);
	});

	it('rejects a snapshot that is not a group', () => {
		assert.deepEqual(issues(null), ['the snapshot is not a sidebar group object']);
		assert.match(issues({ items: [] }).join('\n'), /the group label must be `API Reference`/);
	});

	it('goes red on a stale module set (the export surface moved)', () => {
		const stale = mutableSnapshot();
		stale.items = stale.items.slice(0, 2);
		assert.match(issues(stale).join('\n'), /module groups must be the entry shims/);
		// …and stays red when the shims grew but the committed snapshot did not.
		assert.match(
			apiSidebarIssues(mutableSnapshot(), [...modules, 'signals'], treePages, routes).join('\n'),
			/module groups must be the entry shims/,
		);
	});

	it('goes red on a directory with no pages behind it', () => {
		const broken = mutableSnapshot();
		broken.items[1].items[0].items[0].autogenerate!.directory = 'docs/reference/api/agent/missing';
		assert.match(issues(broken).join('\n'), /`docs\/reference\/api\/agent\/missing` has no pages/);
	});

	it('goes red on a link that is not a page in the tree', () => {
		const broken = mutableSnapshot();
		broken.items[2].items[1].items[0] = {
			label: 'Tool',
			link: '/docs/reference/api/tools/interfaces/tool/missing/',
			items: [],
		};
		assert.match(issues(broken).join('\n'), /is not a page in the tree/);
	});

	it('goes red on an item that is neither an autogenerate group nor a link', () => {
		const broken = mutableSnapshot();
		broken.items[1].items[0].items = [{ label: 'Classes', items: [] }];
		assert.match(issues(broken).join('\n'), /expected an `autogenerate` directory or a `link`/);
	});
});
