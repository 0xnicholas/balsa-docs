import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { apiModuleEntries, htmlPath, twinPath } from './agent-surface.ts';
import { apiTreeRoot } from './api-tree.ts';
import { contentRoot, routeFromContentPath } from './pages.ts';
import { site as siteOrigin } from './site.ts';

/**
 * The agent-surface gates, end to end (#26): the real generator and the real assertions
 * script, driven against a throwaway repository whose `dist/` is a stand-in build. These are
 * the acceptance runs behind agent-surface.md §9 —
 *
 *   - the generator writes both files and is byte-stable across runs;
 *   - assertion ① goes red when a page loses its twin, its HTML, or its head link;
 *   - assertion ② goes red on a missing page and on a dead link;
 *   - assertion ③ goes red on an unlabelled fence;
 *   - the generator fails loudly on a page outside the five families or a module group whose
 *     representative page moved.
 */

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const temporaries: string[] = [];

/**
 * The origin the two site-root files are written against (`src/lib/site.ts`). The fixture
 * bakes it into its expectations while the generator and `check-agent-surface.mjs` both read
 * the real constant — which is why the two can only agree by actually agreeing (#29).
 */
const origin = siteOrigin ?? '';
assert.ok(origin !== '', 'the agent-surface fixtures need a configured origin (#29, src/lib/site.ts)');

after(() => {
	for (const directory of temporaries) rmSync(directory, { recursive: true, force: true });
});

const write = (root: string, relative: string, contents: string) => {
	const target = path.join(root, relative);
	mkdirSync(path.dirname(target), { recursive: true });
	writeFileSync(target, contents);
	return relative;
};

const runScript = (script: string, args: string[]) => {
	const result = spawnSync(
		process.execPath,
		['--experimental-strip-types', path.join(repoRoot, 'scripts', script), ...args],
		{ encoding: 'utf8' },
	);
	return { status: result.status, output: `${result.stdout}${result.stderr}` };
};

const generate = (root: string) =>
	runScript('gen-agent-surface.mjs', ['--root', root, '--generated-at', '2026-10-03T00:00:00.000Z']);
const check = (root: string) => runScript('check-agent-surface.mjs', ['--root', root]);

/** Authored fixture pages: one per family that matters here, with the fields the surface reads. */
const authoredPages = [
	{ route: '/docs/', title: 'Introduction', order: 0, packages: ['@balsats/core'], body: 'Body.\n' },
	{
		route: '/docs/concepts/agents/',
		title: 'Agents',
		order: 1,
		packages: ['@balsats/core/agent'],
		body: '## Section\n\nBody.\n',
	},
];

/** The generated tree's stand-in: one page per module group, marked the way the pipeline marks
 * them (src/lib/frontmatter.ts). The file keeps the module's own directory name (`@balsats/core`),
 * which is what makes the whole tree partitionable by module group. */
const generatedPageOf = (entry: ReturnType<typeof apiModuleEntries>[number]): string => {
	const directory = `${apiTreeRoot}/${entry.module}`;
	const namespace = routeFromContentPath(`${directory}/index.md`.slice(contentRoot.length + 1));
	assert.ok(namespace !== null);
	return `${directory}/${entry.route.slice(namespace.length).replace(/\/$/, '')}.md`;
};

/** Every route the fake build serves: the authored pages, then each module group's page. */
const surfaceRoutes = () => [
	...authoredPages.map((page) => page.route),
	...apiModuleEntries().map((entry) => entry.route),
];

/** A throwaway docs repo: content tree, pinned ref, and a `dist/` looking like a real build. */
const surfaceRepo = () => {
	const root = mkdtempSync(path.join(tmpdir(), 'balsats-agent-surface-'));
	temporaries.push(root);

	write(
		root,
		'pinned-ref.json',
		`${JSON.stringify({ repo: '0xnicholas/balsats-framework', commit: 'a'.repeat(40) }, null, '\t')}\n`,
	);

	for (const { route, title, order, packages, body } of authoredPages) {
		const file = `${contentRoot}/${route.replace(/^\//, '').replace(/\/$/, '')}/index.md`;
		write(
			root,
			file,
			`---\ntitle: ${title}\ndescription: ${title} fixture page.\norder: ${order}\npackages:\n${packages
				.map((value) => `  - '${value}'`)
				.join('\n')}\n---\n\n${body}`,
		);
	}

	// One generated page per module group, marked the way the pipeline marks them.
	for (const entry of apiModuleEntries()) {
		write(
			root,
			generatedPageOf(entry),
			`---\ngenerated: true\ntitle: ${entry.title}\n---\n\n${entry.title}.\n`,
		);
	}

	buildDist(root);
	return root;
};

/** The twins are the sources; the HTML carries the head link the middleware injects. */
const buildDist = (root: string) => {
	for (const route of surfaceRoutes()) {
		write(
			root,
			`dist/${htmlPath(route)}`,
			`<!doctype html><html><head><link rel="alternate" type="text/markdown" href="${twinPath(
				route,
			)}"/></head><body></body></html>\n`,
		);
		write(root, `dist/${twinPath(route).slice(1)}`, '---\ntitle: Twin\n---\n\nBody.\n');
	}
};

describe('the generator (#26, agent-surface.md §3/§4)', () => {
	it('writes both files, and the assertions are green on the result', () => {
		const root = surfaceRepo();
		const generated = generate(root);
		assert.equal(generated.status, 0, generated.output);
		assert.match(generated.output, /dist\/llms\.txt written/);
		assert.match(generated.output, /dist\/llms-manifest\.json written/);

		const llms = readFileSync(path.join(root, 'dist/llms.txt'), 'utf8');
		assert.match(llms, /^# Balsats\n\n> /);
		assert.match(llms, /## Get started\n\n- \[Introduction\]\(https:\/\/docs\.balsats\.com\/docs\/\)/);
		assert.match(
			llms,
			/## Reference\n\n- \[@balsats\/core\]\(https:\/\/docs\.balsats\.com\/docs\/reference\/api\/balsats\/core\/functions\/createapp\/\)/,
		);
		assert.match(
			llms,
			/- \[agent\]\(https:\/\/docs\.balsats\.com\/docs\/reference\/api\/agent\/classes\/agent\/\): API reference module for `@balsats\/core\/agent` — its pages start at Agent/,
		);
		assert.match(llms, /## Optional\n\n- \[\/llms-manifest\.json\]\(https:\/\/docs\.balsats\.com\/llms-manifest\.json\)/);

		const manifest = JSON.parse(readFileSync(path.join(root, 'dist/llms-manifest.json'), 'utf8'));
		assert.equal(manifest.site, origin);
		assert.equal(manifest.framework.pin, 'a'.repeat(40));
		assert.equal(manifest.framework.version, '0.5.0');
		assert.equal(manifest.generatedAt, '2026-10-03T00:00:00.000Z');
		assert.deepEqual(manifest.packages['@balsats/core'], [
			{
				path: '/docs',
				title: 'Introduction',
				description: 'Introduction fixture page.',
				family: 'get-started',
			},
		]);

		const result = check(root);
		assert.equal(result.status, 0, result.output);
		assert.match(result.output, /Agent surface holds/);
	});

	it('is byte-stable: a second run writes the same two files', () => {
		const root = surfaceRepo();
		generate(root);
		const first = [
			readFileSync(path.join(root, 'dist/llms.txt'), 'utf8'),
			readFileSync(path.join(root, 'dist/llms-manifest.json'), 'utf8'),
		];
		generate(root);
		const second = [
			readFileSync(path.join(root, 'dist/llms.txt'), 'utf8'),
			readFileSync(path.join(root, 'dist/llms-manifest.json'), 'utf8'),
		];
		assert.deepEqual(second, first);
	});

	it('fails loudly on a page outside the five families', () => {
		const root = surfaceRepo();
		write(
			root,
			`${contentRoot}/docs/v2/upgrade.md`,
			"---\ntitle: Upgrade\ndescription: Fixture page.\npackages: []\n---\n\nBody.\n",
		);
		const result = generate(root);
		assert.equal(result.status, 1);
		assert.match(result.output, /is not inside one of the five families/);
	});

	it('fails loudly when a module group’s representative page is gone', () => {
		const root = surfaceRepo();
		const agent = apiModuleEntries().find((entry) => entry.module === 'agent');
		assert.ok(agent !== undefined);
		// Remove the page a module group links to: the entry must not silently point at nothing.
		rmSync(path.join(root, generatedPageOf(agent)));
		const result = generate(root);
		assert.equal(result.status, 1);
		assert.match(
			result.output,
			new RegExp(`apiModulePages\\['@balsats/core/agent'\\] → ${agent.route} is not a page`),
		);
	});
});

describe('assertion ① — twins and the head link (agent-surface.md §9.1/§5.2)', () => {
	it('goes red when a page loses its twin', () => {
		const root = surfaceRepo();
		rmSync(path.join(root, 'dist/docs/concepts/agents.md'));
		const result = check(root);
		assert.equal(result.status, 1);
		assert.match(result.output, /\/docs\/concepts\/agents\/: no Markdown twin at docs\/concepts\/agents\.md/);
	});

	it('goes red when a page’s HTML is gone', () => {
		const root = surfaceRepo();
		rmSync(path.join(root, 'dist/docs/index.html'));
		const result = check(root);
		assert.equal(result.status, 1);
		assert.match(result.output, /\/docs\/: docs\/index\.html is not in the build output/);
	});

	it('goes red when the head link is missing', () => {
		const root = surfaceRepo();
		write(root, 'dist/docs/concepts/agents/index.html', '<!doctype html><html><head></head><body></body></html>\n');
		const result = check(root);
		assert.equal(result.status, 1);
		assert.match(
			result.output,
			/docs\/concepts\/agents\/index\.html: no <link rel="alternate" type="text\/markdown"> pointing at \/docs\/concepts\/agents\.md/,
		);
	});
});

describe('assertion ② — the index and the content set (agent-surface.md §9.2)', () => {
	it('goes red when a page is missing from /llms.txt', () => {
		const root = surfaceRepo();
		generate(root);
		const file = path.join(root, 'dist/llms.txt');
		writeFileSync(file, readFileSync(file, 'utf8').replace(`- [Agents](${origin}/docs/concepts/agents/)\n`, ''));
		const result = check(root);
		assert.equal(result.status, 1);
		assert.match(result.output, /\/docs\/concepts\/agents\/ is missing from \/llms\.txt/);
	});

	it('goes red when /llms.txt links a page that does not exist', () => {
		const root = surfaceRepo();
		generate(root);
		const file = path.join(root, 'dist/llms.txt');
		writeFileSync(file, `${readFileSync(file, 'utf8')}- [Gone](${origin}/docs/concepts/gone/)\n`);
		const result = check(root);
		assert.equal(result.status, 1);
		assert.match(result.output, /\/docs\/concepts\/gone\/ is not part of the content set/);
	});

	it('goes red when the generator never ran', () => {
		const root = surfaceRepo();
		const result = check(root);
		assert.equal(result.status, 1);
		assert.match(result.output, /llms\.txt is missing from the build output/);
		assert.match(result.output, /llms-manifest\.json is missing from the build output/);
	});

	it('goes red when the manifest drifts from the content tree', () => {
		const root = surfaceRepo();
		generate(root);
		const file = path.join(root, 'dist/llms-manifest.json');
		const manifest = JSON.parse(readFileSync(file, 'utf8'));
		delete manifest.packages['@balsats/core/agent'];
		writeFileSync(file, `${JSON.stringify(manifest, null, '\t')}\n`);
		const result = check(root);
		assert.equal(result.status, 1);
		assert.match(result.output, /`packages` keys must be the export surface/);
		assert.match(result.output, /`packages\.@balsats\/core\/agent` does not match the pages that document it/);
	});
});

describe('assertion ③ — writing rules (agent-surface.md §9.3)', () => {
	it('goes red on an unlabelled fence, naming the twin and line', () => {
		const root = surfaceRepo();
		write(root, 'dist/docs/concepts/agents.md', '---\ntitle: Agents\n---\n\n## Section\n\n```\nconst x = 1;\n```\n');
		const result = check(root);
		assert.equal(result.status, 1);
		assert.match(result.output, /docs\/concepts\/agents\.md:7: fenced code block without a language/);
	});
});
