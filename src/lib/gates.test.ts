import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * The gates themselves, end to end: every case drives the real script in a throwaway repo
 * (and, for the pin-level gates, a throwaway balsa-framework git repo). These are the
 * acceptance runs behind #18 —
 *
 *   - each of the four ledger gates can go red on its own (delivery.md §4.2);
 *   - a deleted page without a ledger entry turns the run red, and registering it fixes it;
 *   - the generator is idempotent and `--check` catches a stale/absent `dist/_redirects`;
 *   - a changed framework source turns an un-re-pinned page red (content-boundary.md §4);
 *   - the frontmatter value domain catches subtype/order/packages/source violations.
 */

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const temporaries: string[] = [];

after(() => {
	for (const directory of temporaries) rmSync(directory, { recursive: true, force: true });
});

const git = (cwd: string, ...args: string[]) => {
	const result = spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });
	assert.equal(result.status, 0, `git ${args.join(' ')}: ${result.stderr}`);
	return result.stdout.trim();
};

const temporaryRepo = (name: string): string => {
	const directory = mkdtempSync(path.join(tmpdir(), `balsa-${name}-`));
	temporaries.push(directory);
	git(directory, 'init', '--quiet');
	git(directory, 'config', 'user.email', 'gates@example.com');
	git(directory, 'config', 'user.name', 'Gate Fixture');
	return directory;
};

const write = (root: string, relative: string, contents: string) => {
	const target = path.join(root, relative);
	mkdirSync(path.dirname(target), { recursive: true });
	writeFileSync(target, contents);
	return relative;
};

const page = (title: string, extra = ''): string =>
	`---\ntitle: ${title}\ndescription: Fixture page.\npackages:\n  - '@balsa/core'\n${extra}---\n\nBody.\n`;

const commit = (root: string, message: string) => {
	git(root, 'add', '--all');
	git(root, 'commit', '--quiet', '--message', message);
	return git(root, 'rev-parse', 'HEAD');
};

/** Run a gate script; the child env is stripped of the framework/baseline overrides. */
const runGate = (script: string, args: string[]) => {
	const env = { ...process.env };
	delete env.BALSA_FRAMEWORK_DIR;
	delete env.BASELINE_REF;
	const result = spawnSync(
		process.execPath,
		['--experimental-strip-types', path.join(repoRoot, 'scripts', script), ...args],
		{ encoding: 'utf8', env },
	);
	return { status: result.status, output: `${result.stdout}${result.stderr}` };
};

/** A docs repo with two pages and the `/` → `/docs/` ledger entry. */
const docsRepo = (ledger = '[]') => {
	const root = temporaryRepo('docs');
	write(root, 'src/content/docs/docs/index.md', page('Introduction'));
	write(root, 'src/content/docs/docs/get-started/quickstart.md', page('Quickstart'));
	write(root, 'redirects.json', ledger);
	commit(root, 'fixture');
	return root;
};

const entry = (from: string, to: string, code = 301) =>
	JSON.stringify([{ from, to, code, note: 'fixture' }], null, '\t');

describe('ledger gates (delivery.md §4.2)', () => {
	it('is green on a legal ledger whose targets resolve', () => {
		const root = docsRepo(entry('/', '/docs/'));
		const result = runGate('check-ledger.mjs', ['--root', root]);
		assert.equal(result.status, 0, result.output);
		assert.match(result.output, /Redirect ledger holds/);
	});

	it('gate 2 goes red on a code outside {301,302,307,308}', () => {
		const root = docsRepo(entry('/', '/docs/', 303));
		const result = runGate('check-ledger.mjs', ['--root', root]);
		assert.equal(result.status, 1);
		assert.match(result.output, /`code`/);
	});

	it('gate 2 goes red on a duplicate `from`', () => {
		const root = docsRepo(
			JSON.stringify([
				{ from: '/docs/old/', to: '/docs/', code: 301 },
				{ from: '/docs/old/', to: '/docs/get-started/quickstart/', code: 301 },
			]),
		);
		const result = runGate('check-ledger.mjs', ['--root', root]);
		assert.equal(result.status, 1);
		assert.match(result.output, /duplicate/);
	});

	it('gate 1 goes red on a target no page serves', () => {
		const root = docsRepo(entry('/docs/old/', '/docs/moved-away/'));
		const result = runGate('check-ledger.mjs', ['--root', root]);
		assert.equal(result.status, 1);
		assert.match(result.output, /no page serves/);
	});

	it('gate 3 goes red when a page disappears without a ledger entry, and green once registered', () => {
		const root = docsRepo();
		rmSync(path.join(root, 'src/content/docs/docs/get-started/quickstart.md'));

		const deleted = runGate('check-ledger.mjs', ['--root', root]);
		assert.equal(deleted.status, 1, deleted.output);
		assert.match(deleted.output, /quickstart/);
		assert.match(deleted.output, /without a ledger entry/);

		write(root, 'redirects.json', entry('/docs/get-started/quickstart/', '/docs/'));
		const registered = runGate('check-ledger.mjs', ['--root', root]);
		assert.equal(registered.status, 0, registered.output);
	});

	it('gate 4 goes red on a handwritten `public/_redirects`', () => {
		const root = docsRepo(entry('/', '/docs/'));
		write(root, 'public/_redirects', '/ /docs/ 301\n');
		const untracked = runGate('check-ledger.mjs', ['--root', root]);
		assert.equal(untracked.status, 1);
		assert.match(untracked.output, /public\/_redirects/);

		commit(root, 'sneak in a handwritten redirect file');
		const tracked = runGate('check-ledger.mjs', ['--root', root]);
		assert.equal(tracked.status, 1);
		assert.match(tracked.output, /public\/_redirects/);
	});

	it('goes red when the baseline ref cannot be read, instead of assuming no removals', () => {
		const root = docsRepo(entry('/', '/docs/'));
		const result = runGate('check-ledger.mjs', ['--root', root, '--baseline', 'origin/nope']);
		assert.equal(result.status, 1);
		assert.match(result.output, /baseline/);
	});
});

describe('_redirects generator (delivery.md §4.1/§4.2.4)', () => {
	it('writes the ledger in order, is idempotent, and `--check` catches drift', () => {
		const root = docsRepo(
			JSON.stringify([
				{ from: '/', to: '/docs/', code: 301 },
				{ from: '/docs/old/', to: '/docs/get-started/quickstart/', code: 308 },
			]),
		);

		const missing = runGate('gen-redirects.mjs', ['--root', root, '--check']);
		assert.equal(missing.status, 1);
		assert.match(missing.output, /run `pnpm build`/);

		assert.equal(runGate('gen-redirects.mjs', ['--root', root]).status, 0);
		const first = runGate('gen-redirects.mjs', ['--root', root, '--check']);
		assert.equal(first.status, 0, first.output);
		assert.match(first.output, /idempotent/);

		assert.equal(runGate('gen-redirects.mjs', ['--root', root]).status, 0, 're-running diffs nothing');
		assert.equal(runGate('gen-redirects.mjs', ['--root', root, '--check']).status, 0);

		// A ledger change that the artifact does not reflect is a red check, not a silent pass.
		write(root, 'redirects.json', entry('/', '/docs/'));
		const stale = runGate('gen-redirects.mjs', ['--root', root, '--check']);
		assert.equal(stale.status, 1);
		assert.match(stale.output, /single source of truth/);
	});

	it('refuses to generate from a schema-illegal ledger', () => {
		const root = docsRepo(entry('/', '/docs/', 200));
		const result = runGate('gen-redirects.mjs', ['--root', root]);
		assert.equal(result.status, 1);
		assert.match(result.output, /not a legal ledger/);
	});
});

/** A balsa-framework-shaped repo; returns the dir plus a commit helper. */
const frameworkRepo = () => {
	const root = temporaryRepo('framework');
	const first = write(
		root,
		'examples/minimal-agent/src/index.ts',
		'const agent = createAgent();\nawait agent.run();\n',
	);
	const pinned = commit(root, 'framework at the pin');
	return { root, file: first, pinned };
};

const driftPage = (body: string, extra = '') => page('Minimal agent', extra) + body;
const verbatim = (file: string, lines: string, code: string) =>
	`<!-- balsa:verbatim file="${file}" lines="${lines}" -->\n\`\`\`ts\n${code}\n\`\`\`\n`;

describe('verbatim drift gate (content-boundary.md §4)', () => {
	it('is green when the marked block matches the pinned source, and red when the framework moved on', () => {
		const framework = frameworkRepo();
		const root = docsRepo();
		write(
			root,
			'src/content/docs/docs/guides/minimal-agent.md',
			driftPage(verbatim('examples/minimal-agent/src/index.ts', '1-2', 'const agent = createAgent();\nawait agent.run();')),
		);
		write(root, 'pinned-ref.json', JSON.stringify({ repo: 'fixture', commit: framework.pinned }));

		const green = runGate('check-drift.mjs', [
			'--root',
			root,
			'--framework',
			framework.root,
			'--pin',
			framework.pinned,
		]);
		assert.equal(green.status, 0, green.output);
		assert.match(green.output, /1 verbatim block\(s\) match/);

		// The framework source changes; the page keeps the old copy and the pin moves on.
		write(
			framework.root,
			'examples/minimal-agent/src/index.ts',
			'const agent = createAgent({ model });\nawait agent.run();\n',
		);
		const moved = commit(framework.root, 'framework moved on');

		const red = runGate('check-drift.mjs', ['--root', root, '--framework', framework.root, '--pin', moved]);
		assert.equal(red.status, 1, red.output);
		assert.match(red.output, /does not match/);
		assert.match(red.output, /line 1 differs/);
	});

	it('goes red on a malformed marker instead of ignoring the block', () => {
		const framework = frameworkRepo();
		const root = docsRepo();
		write(
			root,
			'src/content/docs/docs/guides/minimal-agent.md',
			driftPage('<!-- balsa:verbatim -->\n```ts\nawait agent.run();\n```\n'),
		);

		const result = runGate('check-drift.mjs', [
			'--root',
			root,
			'--framework',
			framework.root,
			'--pin',
			framework.pinned,
		]);
		assert.equal(result.status, 1);
		assert.match(result.output, /`file`/);
	});

	it('goes red when the pinned commit is not in the checkout or the checkout is missing', () => {
		const framework = frameworkRepo();
		const root = docsRepo();
		write(root, 'pinned-ref.json', JSON.stringify({ repo: 'fixture', commit: framework.pinned }));

		const missingCheckout = runGate('check-drift.mjs', [
			'--root',
			root,
			'--framework',
			path.join(framework.root, 'nope'),
		]);
		assert.equal(missingCheckout.status, 1);
		assert.match(missingCheckout.output, /no balsa-framework checkout/);

		const missingCommit = runGate('check-drift.mjs', [
			'--root',
			root,
			'--framework',
			framework.root,
			'--pin',
			'f'.repeat(40),
		]);
		assert.equal(missingCommit.status, 1);
		assert.match(missingCommit.output, /not in/);
	});
});

describe('frontmatter value domain gate (delivery.md §5①)', () => {
	const frameworkRepoWithCore = () => {
		const root = temporaryRepo('framework');
		write(
			root,
			'packages/core/package.json',
			JSON.stringify({
				name: '@balsa/core',
				exports: {
					'.': { types: './dist/index.d.ts' },
					'./agent': { types: './dist/agent/index.d.ts' },
					'./durable-agent': { types: './dist/durable-agent/index.d.ts' },
					'./memory': { types: './dist/memory/index.d.ts' },
					'./model': { types: './dist/model/index.d.ts' },
					'./observability': { types: './dist/observability/index.d.ts' },
					'./schedules': { types: './dist/schedules/index.d.ts' },
					'./signals': { types: './dist/signals/index.d.ts' },
					'./tools': { types: './dist/tools/index.d.ts' },
					'./workflows': { types: './dist/workflows/index.d.ts' },
				},
			}),
		);
		write(root, 'docs/architecture/agents.md', '# Agents\n');
		return { root, pinned: commit(root, 'framework at the pin') };
	};

	it('is green when packages match the export surface and sources resolve', () => {
		const framework = frameworkRepoWithCore();
		const root = docsRepo();
		write(
			root,
			'src/content/docs/docs/concepts/agents.md',
			page('Agents', 'source:\n  - file: docs/architecture/agents.md\n'),
		);
		write(root, 'pinned-ref.json', JSON.stringify({ repo: 'fixture', commit: framework.pinned }));

		const result = runGate('check-content.mjs', [
			'--root',
			root,
			'--framework',
			framework.root,
			'--require-framework',
		]);
		assert.equal(result.status, 0, result.output);
		assert.match(result.output, /export surface/);
		assert.match(result.output, /1 pointer\(s\) resolve/);
	});

	it('goes red on an unresolvable source pointer and on a drifted packages domain', () => {
		const framework = frameworkRepoWithCore();
		const root = docsRepo();
		write(
			root,
			'src/content/docs/docs/concepts/agents.md',
			page('Agents', 'source:\n  - file: docs/architecture/gone.md\n'),
		);

		const pointer = runGate('check-content.mjs', [
			'--root',
			root,
			'--framework',
			framework.root,
			'--pin',
			framework.pinned,
		]);
		assert.equal(pointer.status, 1);
		assert.match(pointer.output, /does not exist at/);

		// Drop an export from the framework: the hardcoded domain is now stale.
		const core = path.join(framework.root, 'packages/core/package.json');
		write(
			framework.root,
			'packages/core/package.json',
			JSON.stringify({ name: '@balsa/core', exports: { '.': { types: './dist/index.d.ts' } } }),
		);
		const narrowed = commit(framework.root, 'narrow the export surface');
		assert.ok(core);

		const domain = runGate('check-content.mjs', [
			'--root',
			root,
			'--framework',
			framework.root,
			'--pin',
			narrowed,
		]);
		assert.equal(domain.status, 1);
		assert.match(domain.output, /frontmatter\.ts/);
	});

	it('goes red on subtype outside Guides and on a duplicate order inside a family', () => {
		const root = docsRepo();
		write(
			root,
			'src/content/docs/docs/concepts/agents.md',
			page('Agents', 'subtype: walkthrough\norder: 1\n'),
		);
		write(root, 'src/content/docs/docs/concepts/tools.md', page('Tools', 'order: 1\n'));

		const result = runGate('check-content.mjs', ['--root', root]);
		assert.equal(result.status, 1);
		assert.match(result.output, /Guides-only/);
		assert.match(result.output, /order 1 is used twice/);
	});

	it('refuses to skip the framework leg when CI says the checkout must be there', () => {
		const root = docsRepo();
		const result = runGate('check-content.mjs', [
			'--root',
			root,
			'--framework',
			path.join(root, 'missing-framework'),
			'--require-framework',
		]);
		assert.equal(result.status, 1);
		assert.match(result.output, /no balsa-framework checkout/);
	});
});
