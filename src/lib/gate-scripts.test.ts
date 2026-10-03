import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	apiSidebarFile,
	apiTreeEntries,
	apiTreeOutput,
	apiTreeRoot,
	entryShimSource,
	moduleNameOf,
} from './api-tree.ts';
import { hslToHex, parseTokenCss, themeColorValues } from './brand-tokens.ts';
import { packageValues } from './frontmatter.ts';
import {
	ogImageUrl,
	renderRobots,
	robotsFile,
	sitemapIndexFile,
} from './origin.ts';
import { contentRoot } from './pages.ts';
import { site as siteOrigin } from './site.ts';

/**
 * The gates themselves, end to end: every case drives the real script in a throwaway repo
 * (and, for the pin-level gates, a throwaway oribos-framework git repo). These are the
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
	const directory = mkdtempSync(path.join(tmpdir(), `oribos-${name}-`));
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
	`---\ntitle: ${title}\ndescription: Fixture page.\npackages:\n  - '@oribos/core'\n${extra}---\n\nBody.\n`;

const commit = (root: string, message: string) => {
	git(root, 'add', '--all');
	git(root, 'commit', '--quiet', '--message', message);
	return git(root, 'rev-parse', 'HEAD');
};

/** Run a gate script; the child env is stripped of the framework/baseline overrides. */
const runGate = (script: string, args: string[]) => {
	const env = { ...process.env };
	delete env.ORIBOS_FRAMEWORK_DIR;
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

/** A oribos-framework-shaped repo; returns the dir plus a commit helper. */
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
	`<!-- oribos:verbatim file="${file}" lines="${lines}" -->\n\`\`\`ts\n${code}\n\`\`\`\n`;

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

	it('recognizes the MDX wrapper on `.mdx` pages (#19)', () => {
		const framework = frameworkRepo();
		const root = docsRepo();
		write(
			root,
			'src/content/docs/docs/guides/minimal-agent.mdx',
			driftPage(
				'{/* oribos:verbatim file="examples/minimal-agent/src/index.ts" */}\n```ts\nconst agent = createAgent();\nawait agent.run();\n```\n',
			),
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

		// The wrapper is not decorative: a stale copy behind it still goes red.
		write(
			root,
			'src/content/docs/docs/guides/minimal-agent.mdx',
			driftPage(
				'{/* oribos:verbatim file="examples/minimal-agent/src/index.ts" */}\n```ts\nconst agent = createAgent({ model });\nawait agent.run();\n```\n',
			),
		);
		const red = runGate('check-drift.mjs', [
			'--root',
			root,
			'--framework',
			framework.root,
			'--pin',
			framework.pinned,
		]);
		assert.equal(red.status, 1, red.output);
		assert.match(red.output, /does not match/);
	});

	it('lets a page lag the pin, but only behind it', () => {
		const framework = temporaryRepo('framework');
		const trunk = git(framework, 'symbolic-ref', '--short', 'HEAD');
		write(framework, 'README.md', 'hello\n');
		const lag = commit(framework, 'the older text');
		write(framework, 'README.md', 'hello there\n');
		const pin = commit(framework, 'the pin');

		git(framework, 'checkout', '--quiet', '-b', 'side');
		write(framework, 'README.md', 'side text\n');
		const sideways = commit(framework, 'side work');
		git(framework, 'checkout', '--quiet', trunk);

		const root = docsRepo();
		const withLag = (ref: string) =>
			driftPage(
				verbatim('README.md', '1-1', 'hello'),
				`source:\n  - file: README.md\n    ref: ${ref}\n`,
			);

		write(root, 'src/content/docs/docs/guides/minimal-agent.md', withLag(lag));
		const behind = runGate('check-drift.mjs', [
			'--root',
			root,
			'--framework',
			framework,
			'--pin',
			pin,
		]);
		assert.equal(behind.status, 0, behind.output);
		assert.match(behind.output, /1 verbatim block\(s\) match/);

		write(root, 'src/content/docs/docs/guides/minimal-agent.md', withLag(sideways));
		const notBehind = runGate('check-drift.mjs', [
			'--root',
			root,
			'--framework',
			framework,
			'--pin',
			pin,
		]);
		assert.equal(notBehind.status, 1, notBehind.output);
		assert.match(notBehind.output, /is not behind the pin/);
	});

	it('goes red on a malformed marker instead of ignoring the block', () => {
		const framework = frameworkRepo();
		const root = docsRepo();
		write(
			root,
			'src/content/docs/docs/guides/minimal-agent.md',
			driftPage('<!-- oribos:verbatim -->\n```ts\nawait agent.run();\n```\n'),
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
		assert.match(missingCheckout.output, /no oribos-framework checkout/);

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

/** A file whose contents must be exact bytes (the PNG fixture); `write` writes UTF-8. */
const writeBytes = (root: string, relative: string, contents: Buffer) => {
	const target = path.join(root, relative);
	mkdirSync(path.dirname(target), { recursive: true });
	writeFileSync(target, contents);
	return relative;
};

const siteCss = () => readFileSync(path.join(repoRoot, 'src/styles/global.css'), 'utf8');

/** A repo holding the real token stylesheet plus a `dist/` fixture the brand gate accepts. */
const brandRepo = () => {
	const root = temporaryRepo('brand-gates');
	const css = siteCss();
	write(root, 'src/styles/global.css', css);
	write(root, 'astro.config.mjs', 'export default {};\n');

	const { tokens } = parseTokenCss(css);
	const themeColor = themeColorValues(tokens);
	write(
		root,
		'dist/_astro/common.css',
		Object.values(tokens)
			.flatMap((set) => Object.values(set))
			.map((value) => `--token:${hslToHex(value)}`)
			.join(';'),
	);
	write(
		root,
		'dist/favicon.svg',
		'<svg><style>path { fill: #9e630a } @media (prefers-color-scheme: dark) { path { fill: #efd29f } }</style><path/></svg>',
	);
	writeBytes(root, 'dist/og.png', pngBytes(1200, 630));
	write(
		root,
		'dist/docs/index.html',
		[
			`<meta name="theme-color" media="(prefers-color-scheme: light)" content="${themeColor.light}"`,
			`<meta name="theme-color" media="(prefers-color-scheme: dark)" content="${themeColor.dark}"`,
			`<meta property="og:image" content="${ogImageUrl(siteOrigin)}"`,
			'<meta property="og:image:width" content="1200"',
			'<meta property="og:image:height" content="630"',
			'<link rel="shortcut icon" href="/favicon.svg"',
			'<div class="hero">',
			'<div class="card-grid">',
		].join('') + '</div></div>',
	);
	return { root, themeColor };
};

/** A valid-enough PNG: signature + IHDR — all the brand gate reads. */
const pngBytes = (width: number, height: number) => {
	const buffer = Buffer.alloc(24);
	buffer.write('\x89PNG\r\n\x1a\n', 0, 'latin1');
	buffer.writeUInt32BE(width, 16);
	buffer.writeUInt32BE(height, 20);
	return buffer;
};

describe('brand token gates (brand-visual.md §2.2 / §3 / §5①)', () => {
	it('passes on the hand-written token set and fails when an accent drops below AA', () => {
		const root = temporaryRepo('contrast-gate');
		write(root, 'src/styles/global.css', siteCss());
		assert.equal(runGate('check-contrast.mjs', ['--root', root]).status, 0);

		// The light accent lightened towards the paper: the three light accent pairs fail.
		write(
			root,
			'src/styles/global.css',
			siteCss().replace('--sl-color-accent: hsl(36, 88%, 33%)', '--sl-color-accent: hsl(36, 88%, 60%)'),
		);
		const red = runGate('check-contrast.mjs', ['--root', root]);
		assert.equal(red.status, 1, red.output);
		assert.match(red.output, /FAIL/);
		assert.match(red.output, /accent link on page background/);
	});

	it('turns the contrast gate red on an incomplete token block instead of auditing a hole', () => {
		const root = temporaryRepo('contrast-incomplete');
		write(
			root,
			'src/styles/global.css',
			siteCss().replace('\t--sl-color-gray-4: hsl(35, 7%, 38%);\n', ''),
		);
		const result = runGate('check-contrast.mjs', ['--root', root]);
		assert.equal(result.status, 1, result.output);
		assert.match(result.output, /--sl-color-gray-4/);
	});

	it('checks the shipped favicon, OG, head tags, override count and fonts', () => {
		const green = runGate('check-brand.mjs', ['--root', brandRepo().root]);
		assert.equal(green.status, 0, green.output);
		assert.match(green.output, /Brand layer ships as specified/);

		// Each variant starts from a green repo and breaks exactly one promise.
		const variants: Array<[string, RegExp, (root: string) => void]> = [
			[
				'wrong OG size',
				/dist\/og\.png is not a 1200×630 PNG/,
				(root) => writeBytes(root, 'dist/og.png', pngBytes(1200, 600)),
			],
			[
				'single-value favicon',
				/not the dual-value placeholder/,
				(root) => write(root, 'dist/favicon.svg', '<svg><path fill="#9e630a"/></svg>'),
			],
			[
				'theme-color not derived from the tokens',
				/has no light theme-color/,
				(root) =>
					write(
						root,
						'dist/docs/index.html',
						readFileSync(path.join(root, 'dist/docs/index.html'), 'utf8').replace(
							/name="theme-color" media="\(prefers-color-scheme: light\)" content="[^"]*"/,
							'name="theme-color" media="(prefers-color-scheme: light)" content="#000000"',
						),
					),
			],
			[
				'registered component override',
				/registers a `components:` override/,
				(root) => write(root, 'astro.config.mjs', 'export default { components: {} };\n'),
			],
			[
				'OG image left root-relative — the form the temporary-domain stage shipped',
				/has no default OG image/,
				(root) =>
					write(
						root,
						'dist/docs/index.html',
						readFileSync(path.join(root, 'dist/docs/index.html'), 'utf8').replace(
							ogImageUrl(siteOrigin),
							'/og.png',
						),
					),
			],
			[
				'font CDN',
				/references a font CDN/,
				(root) =>
					write(
						root,
						'dist/docs/index.html',
						'<link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet">' +
							readFileSync(path.join(root, 'dist/docs/index.html'), 'utf8'),
					),
			],
			[
				'missing token value in the built CSS',
				/is not in the built CSS/,
				(root) =>
					write(
						root,
						'dist/_astro/common.css',
						readFileSync(path.join(root, 'dist/_astro/common.css'), 'utf8').replace(
							/--token:#[0-9a-f]{6}/,
							'',
						),
					),
			],
		];

		for (const [label, expected, mutate] of variants) {
			const { root } = brandRepo();
			mutate(root);
			const red = runGate('check-brand.mjs', ['--root', root]);
			assert.equal(red.status, 1, `${label}: ${red.output}`);
			assert.match(red.output, expected, label);
		}
	});
});

describe('origin surfaces gate (delivery.md §3.4 / §13.4 — the #29 switch)', () => {
	/** The origin the fixture bakes in — the gate reads the real constant (`src/lib/site.ts`). */
	const origin = siteOrigin ?? '';
	assert.ok(origin !== '', 'this fixture builds the pages an origin is required for');

	const routes = ['/docs/', '/docs/concepts/agents/'];
	const pageWithCanonical = (route: string) =>
		`<html><head><link rel="canonical" href="${origin}${route}"/></head><body></body></html>`;
	const indexXml = (locs: readonly string[]) =>
		`<sitemapindex>${locs.map((loc) => `<sitemap><loc>${loc}</loc></sitemap>`).join('')}</sitemapindex>`;
	const shardXml = (locs: readonly string[]) =>
		`<urlset>${locs.map((loc) => `<url><loc>${loc}</loc></url>`).join('')}</urlset>`;

	/** A throwaway repo holding the content tree plus a built `dist/` the origin gate accepts. */
	const originRepo = (): string => {
		const root = temporaryRepo('origin');
		write(root, `${contentRoot}/docs/index.md`, page('Introduction'));
		write(root, `${contentRoot}/docs/concepts/agents.md`, page('Agents'));

		write(root, 'dist/docs/index.html', pageWithCanonical('/docs/'));
		write(root, 'dist/docs/concepts/agents/index.html', pageWithCanonical('/docs/concepts/agents/'));
		// The two files that are served but are not canonical pages: the redirect stub and the 404.
		write(root, 'dist/index.html', '<html><head><meta http-equiv="refresh" content="0;url=/docs/"></head></html>');
		write(root, 'dist/404.html', '<html><head><link rel="canonical" href="https://example.com/404/"/></head></html>');

		write(root, `dist/${sitemapIndexFile}`, indexXml([`${origin}/sitemap-0.xml`]));
		write(root, 'dist/sitemap-0.xml', shardXml(routes.map((route) => `${origin}${route}`)));
		write(root, `dist/${robotsFile}`, renderRobots(origin));
		return root;
	};

	it('is green on the pages, sitemap and robots file the origin produces', () => {
		const result = runGate('check-origin.mjs', ['--root', originRepo()]);
		assert.equal(result.status, 0, result.output);
		assert.match(result.output, /The origin surfaces hold/);
	});

	it('goes red on a page with no canonical, and on one still naming the temporary domain', () => {
		const root = originRepo();
		write(root, 'dist/docs/index.html', '<html><head></head></html>');
		const missing = runGate('check-origin.mjs', ['--root', root]);
		assert.equal(missing.status, 1);
		assert.match(missing.output, /dist\/docs\/index\.html has no <link rel="canonical">/);

		write(root, 'dist/docs/index.html', pageWithCanonical('/docs/').replace(origin, 'https://oribos-docs.oribos-docs.workers.dev'));
		const temporary = runGate('check-origin.mjs', ['--root', root]);
		assert.equal(temporary.status, 1);
		assert.match(temporary.output, /points at https:\/\/oribos-docs\.oribos-docs\.workers\.dev/);
	});

	it('goes red on a sitemap that names another host, lists a twin, or drops a page', () => {
		const foreign = originRepo();
		write(foreign, 'dist/sitemap-0.xml', shardXml(routes.map((route) => `https://temporary.example${route}`)));
		const otherHost = runGate('check-origin.mjs', ['--root', foreign]);
		assert.equal(otherHost.status, 1);
		assert.match(otherHost.output, /is not on https:\/\/docs\.oribos\.dev/);

		const twin = originRepo();
		write(twin, 'dist/sitemap-0.xml', shardXml([`${origin}/docs/`, `${origin}/docs/concepts/agents.md`]));
		const twinListed = runGate('check-origin.mjs', ['--root', twin]);
		assert.equal(twinListed.status, 1);
		assert.match(twinListed.output, /does not resolve to a page/);

		const dropped = originRepo();
		write(dropped, 'dist/sitemap-0.xml', shardXml([`${origin}/docs/`]));
		const incomplete = runGate('check-origin.mjs', ['--root', dropped]);
		assert.equal(incomplete.status, 1);
		assert.match(incomplete.output, /is missing https:\/\/docs\.oribos\.dev\/docs\/concepts\/agents\//);
	});

	it('goes red on the host\u2019s managed robots text, and on a robots file the build never wrote', () => {
		const root = originRepo();
		write(root, `dist/${robotsFile}`, '# Content Signals\n# Search\nUser-Agent: *\nContent-Signal: search=yes\n');
		const managed = runGate('check-origin.mjs', ['--root', root]);
		assert.equal(managed.status, 1);
		assert.match(managed.output, /Sitemap: https:\/\/docs\.oribos\.dev\/sitemap-index\.xml/);

		rmSync(path.join(root, `dist/${robotsFile}`));
		const absent = runGate('check-origin.mjs', ['--root', root]);
		assert.equal(absent.status, 1);
		assert.match(absent.output, /robots\.txt is missing/);
	});

	it('writes the robots file from the origin, and refuses to check a build that is not there', () => {
		const root = originRepo();
		rmSync(path.join(root, `dist/${robotsFile}`));
		const generated = runGate('gen-robots.mjs', ['--root', root]);
		assert.equal(generated.status, 0, generated.output);
		assert.equal(readFileSync(path.join(root, `dist/${robotsFile}`), 'utf8'), renderRobots(origin));

		rmSync(path.join(root, 'dist'), { recursive: true, force: true });
		const noBuild = runGate('check-origin.mjs', ['--root', root]);
		assert.equal(noBuild.status, 1);
		assert.match(noBuild.output, /is missing — `pnpm build` writes it/);
	});
});

describe('frontmatter value domain gate (delivery.md §5①)', () => {
	const frameworkRepoWithCore = () => {
		const root = temporaryRepo('framework');
		write(
			root,
			'packages/core/package.json',
			JSON.stringify({
				name: '@oribos/core',
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
			JSON.stringify({ name: '@oribos/core', exports: { '.': { types: './dist/index.d.ts' } } }),
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
		assert.match(result.output, /no oribos-framework checkout/);
	});
});

describe('API tree gate (api-reference.md §2/§4)', () => {
	/**
	 * A repo carrying the three committed artifacts the gate reads: the entry shims, a tree
	 * with one page per module group, and the sidebar snapshot the plugin would build for
	 * exactly those shims.
	 */
	const apiTreeRepo = () => {
		const root = temporaryRepo('api-tree');
		for (const [index, entry] of apiTreeEntries.entries()) {
			write(root, entry, `${entryShimSource(packageValues[index])}\n`);
		}
		write(
			root,
			'typedoc.json',
			JSON.stringify({ entryPoints: apiTreeEntries, tsconfig: './typedoc.tsconfig.json' }, null, '\t'),
		);

		const moduleGroups = apiTreeEntries.map((entry) => {
			const module = moduleNameOf(entry);
			const directory = `${apiTreeOutput}/${module}/functions`;
			write(
				root,
				`${contentRoot}/${directory}/createAgent.md`,
				`---\ngenerated: true\ntitle: "createAgent"\n---\n\nBody.\n`,
			);
			return {
				label: module,
				collapsed: true,
				items: [
					{
						collapsed: true,
						label: 'Functions',
						items: [{ autogenerate: { collapsed: true, directory } }],
					},
				],
			};
		});

		write(
			root,
			apiSidebarFile,
			`${JSON.stringify({ label: 'API Reference', collapsed: true, items: moduleGroups }, null, '\t')}\n`,
		);
		return root;
	};

	it('is green on a coherent tree, and red on the orphan root README (裁决 8)', () => {
		const root = apiTreeRepo();
		const green = runGate('check-api-tree.mjs', ['--root', root]);
		assert.equal(green.status, 0, green.output);

		write(root, `${apiTreeRoot}/README.md`, '---\ntitle: "index"\n---\n\nModules.\n');
		const orphan = runGate('check-api-tree.mjs', ['--root', root]);
		assert.equal(orphan.status, 1);
		assert.match(orphan.output, /orphan page/);
	});

	it('goes red on a shim that does not match the export surface', () => {
		const root = apiTreeRepo();
		write(root, 'api-entry/agent.d.ts', "export * from '../elsewhere/index.js';\n");
		const result = runGate('check-api-tree.mjs', ['--root', root]);
		assert.equal(result.status, 1);
		assert.match(result.output, /a shim is exactly/);

		rmSync(path.join(root, 'api-entry/agent.d.ts'));
		const missing = runGate('check-api-tree.mjs', ['--root', root]);
		assert.equal(missing.status, 1);
		assert.match(missing.output, /must hold exactly the export surface's shims/);
	});

	it('goes red on a snapshot that lost a module group or a directory', () => {
		const root = apiTreeRepo();
		const snapshot = JSON.parse(readFileSync(path.join(root, apiSidebarFile), 'utf8'));

		write(
			root,
			apiSidebarFile,
			`${JSON.stringify({ ...snapshot, items: snapshot.items.slice(1) }, null, '\t')}\n`,
		);
		const stale = runGate('check-api-tree.mjs', ['--root', root]);
		assert.equal(stale.status, 1);
		assert.match(stale.output, /module groups must be the entry shims/);

		rmSync(path.join(root, `${apiTreeRoot}/agent`), { recursive: true });
		const gone = runGate('check-api-tree.mjs', ['--root', root]);
		assert.equal(gone.status, 1);
		assert.match(gone.output, /has no pages/);
	});
});

describe('platform contract gate (delivery.md §2 / §10.8)', () => {
	const headers = [
		'/*\n\tLink: </llms.txt>; rel="llms-txt"\n\tX-Llms-Txt: /llms.txt\n',
		'/*.md\n\tContent-Type: text/markdown; charset=utf-8\n',
		'/llms.txt\n\tContent-Type: text/plain; charset=utf-8\n',
		'/_astro/*\n\tCache-Control: public, max-age=31556952, immutable\n',
	].join('\n');
	const wrangler = `{
	"name": "oribos-docs",
	"compatibility_date": "2026-09-30",
	"assets": {
		"directory": "./dist/",
		"html_handling": "auto-trailing-slash",
		"not_found_handling": "404-page"
	}
}
`;

	/** A throwaway repo with the three artifacts and a one-page built `dist/`. */
	const platformRepo = (): string => {
		const root = temporaryRepo('platform');
		write(root, '.nvmrc', '22.12.0\n');
		write(root, 'wrangler.jsonc', wrangler);
		write(root, 'public/_headers', headers);

		write(root, 'src/content/docs/docs/index.md', page('Introduction'));
		write(root, 'dist/_headers', headers);
		write(root, 'dist/docs/index.html', '<html><body><site-search></site-search></body></html>');
		write(
			root,
			'dist/pagefind/pagefind-entry.json',
			`${JSON.stringify({ version: '1.5.2', languages: { en: { page_count: 1 } } })}\n`,
		);
		write(root, 'dist/pagefind/pagefind.js', '');
		write(root, 'dist/pagefind/index/en_x.pf_index', '');
		write(root, 'dist/pagefind/fragment/en_x.pf_fragment', '');
		write(root, 'dist/pagefind/wasm.en.pagefind', '');
		return root;
	};

	it('is green on the four artifacts the spec fixes', () => {
		const result = runGate('check-platform.mjs', ['--root', platformRepo()]);
		assert.equal(result.status, 0, result.output);
	});

	it('goes red on a header value that is almost the target one', () => {
		const root = platformRepo();
		write(root, 'public/_headers', headers.replace('text/markdown; charset=utf-8', 'text/markdown'));
		write(root, 'dist/_headers', readFileSync(path.join(root, 'public/_headers'), 'utf8'));
		const result = runGate('check-platform.mjs', ['--root', root]);
		assert.equal(result.status, 1);
		assert.match(result.output, /must set Content-Type: text\/markdown; charset=utf-8/);
	});

	it('goes red when the rules never reach the asset directory, or arrive changed', () => {
		const root = platformRepo();
		rmSync(path.join(root, 'dist/_headers'));
		const absent = runGate('check-platform.mjs', ['--root', root]);
		assert.equal(absent.status, 1);
		assert.match(absent.output, /dist\/_headers is missing/);

		write(root, 'dist/_headers', `${headers}\n/*\n\tX-Llms-Txt: /llms.txt\n`);
		const drifted = runGate('check-platform.mjs', ['--root', root]);
		assert.equal(drifted.status, 1);
		assert.match(drifted.output, /differs from public\/_headers/);
	});

	it('goes red on a search index that does not cover the page set, or on a missing runtime', () => {
		const root = platformRepo();
		write(
			root,
			'dist/pagefind/pagefind-entry.json',
			`${JSON.stringify({ version: '1.5.2', languages: { en: { page_count: 2 } } })}\n`,
		);
		const stale = runGate('check-platform.mjs', ['--root', root]);
		assert.equal(stale.status, 1);
		assert.match(stale.output, /covers 2 page\(s\).*serves 1 page\(s\)/);

		write(
			root,
			'dist/pagefind/pagefind-entry.json',
			`${JSON.stringify({ version: '1.5.2', languages: { en: { page_count: 1 } } })}\n`,
		);
		rmSync(path.join(root, 'dist/pagefind/pagefind.js'));
		const runtime = runGate('check-platform.mjs', ['--root', root]);
		assert.equal(runtime.status, 1);
		assert.match(runtime.output, /pagefind\.js is missing/);
	});

	it('goes red on a Node pin other than the fixed one, and on a Worker script', () => {
		const root = platformRepo();
		write(root, '.nvmrc', '22.11.0\n');
		const pin = runGate('check-platform.mjs', ['--root', root]);
		assert.equal(pin.status, 1);
		assert.match(pin.output, /delivery\.md §2\.4 fixes 22\.12\.0/);

		write(root, '.nvmrc', '22.12.0\n');
		write(root, 'wrangler.jsonc', wrangler.replace('"name": "oribos-docs",', '"name": "oribos-docs",\n\t"main": "src/worker.ts",'));
		const script = runGate('check-platform.mjs', ['--root', root]);
		assert.equal(script.status, 1);
		assert.match(script.output, /no Worker script/);
	});

	it('goes red on a compatibility date that drifted, and on a page with no search UI', () => {
		const root = platformRepo();
		write(root, 'wrangler.jsonc', wrangler.replace('2026-09-30', '2026-10-01'));
		const date = runGate('check-platform.mjs', ['--root', root]);
		assert.equal(date.status, 1);
		assert.match(date.output, /compatibility_date must be `2026-09-30`/);

		write(root, 'wrangler.jsonc', wrangler);
		write(root, 'dist/404.html', '<html><body>Not found.</body></html>');
		const search = runGate('check-platform.mjs', ['--root', root]);
		assert.equal(search.status, 1);
		assert.match(search.output, /dist\/404\.html carries no `<site-search`/);
	});
});

describe('link gate (delivery.md §5 ③)', () => {
	/** A throwaway repo with a two-page built `dist/` plus the asset/twin shapes links hit. */
	const linksRepo = (): string => {
		const root = temporaryRepo('links');
		write(root, 'dist/index.html', '<a href="/docs/">Oribos</a>');
		write(root, 'dist/docs/index.html', '<h1 id="install">Install</h1>');
		write(
			root,
			'dist/docs/get-started/quickstart/index.html',
			[
				'<h1 id="_top">Quickstart</h1>',
				'<a name="legacy"></a>',
				'<a href="/docs/#install">anchor</a>',
				'<a href="#legacy">legacy anchor</a>',
				'<a href="/docs/get-started/quickstart.md">twin</a>',
				'<a href="/favicon.svg">icon</a>',
				'<a href="https://github.com/0xnicholas/oribos-framework">framework</a>',
				'<a href="#_top">top</a>',
			].join('\n'),
		);
		write(root, 'dist/docs/get-started/quickstart.md', '# Quickstart\n');
		write(root, 'dist/favicon.svg', '<svg/>');
		return root;
	};

	it('is green when pages, twins, assets, fragments and external links all resolve', () => {
		const result = runGate('check-links.mjs', ['--root', linksRepo()]);
		assert.equal(result.status, 0, result.output);
		assert.match(result.output, /7 anchor\(s\) in 3 page\(s\) resolve/);
	});

	it('goes red on a target nothing serves, and names the page it sits on', () => {
		const root = linksRepo();
		write(
			root,
			'dist/docs/index.html',
			'<h1 id="install">Install</h1><a href="/docs/project/deployment/">Deployment</a>',
		);
		const result = runGate('check-links.mjs', ['--root', root]);
		assert.equal(result.status, 1);
		assert.match(result.output, /docs\/index\.html: `\/docs\/project\/deployment\/` resolves to no file/);
	});

	it('goes red on a fragment with no anchor on the target page', () => {
		const root = linksRepo();
		write(
			root,
			'dist/docs/get-started/quickstart/index.html',
			'<h1 id="_top">Quickstart</h1><a href="/docs/#overview">overview</a>',
		);
		const result = runGate('check-links.mjs', ['--root', root]);
		assert.equal(result.status, 1);
		assert.match(result.output, /has no anchor `#overview` on docs\/index\.html/);
	});

	it('goes red on a relative link — built pages address the site from the root', () => {
		const root = linksRepo();
		write(root, 'dist/docs/index.html', '<h1 id="install">Install</h1><a href="../concepts/agents/">Agents</a>');
		const result = runGate('check-links.mjs', ['--root', root]);
		assert.equal(result.status, 1);
		assert.match(result.output, /neither root-relative nor external/);
	});

	it('goes red on a same-page fragment whose target is a legacy `<a name>` anchor that is gone', () => {
		const root = linksRepo();
		write(
			root,
			'dist/docs/get-started/quickstart/index.html',
			'<h1 id="_top">Quickstart</h1><a href="#legacy">legacy anchor</a>',
		);
		const result = runGate('check-links.mjs', ['--root', root]);
		assert.equal(result.status, 1);
		assert.match(result.output, /has no anchor `#legacy`/);
	});
});

describe('zero-telemetry audit (delivery.md §7 / handoff.md O6)', () => {
	/** A throwaway repo with a one-page built `dist/` and its two shipped assets. */
	const telemetryRepo = (): string => {
		const root = temporaryRepo('telemetry');
		write(
			root,
			'dist/docs/index.html',
			'<html><head><script src="/_astro/app.js"></script><link rel="stylesheet" href="/_astro/app.css"></head><body><p>The site runs no analytics and no cookie banner.</p></body></html>',
		);
		write(root, 'dist/_astro/app.js', 'const theme = localStorage.getItem("theme");');
		write(root, 'dist/_astro/app.css', '.token{color:red}');
		return root;
	};

	it('is green when nothing loads from outside and no vendor signature ships', () => {
		const result = runGate('check-telemetry.mjs', ['--root', telemetryRepo()]);
		assert.equal(result.status, 0, result.output);
	});

	it('goes red on a third-party script tag, and on an absolute URL on our own host', () => {
		const root = telemetryRepo();
		write(
			root,
			'dist/docs/index.html',
			'<html><head><script src="https://cdn.example.com/analytics.js"></script></head></html>',
		);
		const thirdParty = runGate('check-telemetry.mjs', ['--root', root]);
		assert.equal(thirdParty.status, 1);
		assert.match(thirdParty.output, /cdn\.example\.com\/analytics\.js/);

		write(
			root,
			'dist/docs/index.html',
			'<html><head><script src="https://temp-host.example/_astro/app.js"></script></head></html>',
		);
		const absolute = runGate('check-telemetry.mjs', ['--root', root]);
		assert.equal(absolute.status, 1);
		assert.match(absolute.output, /subresources are addressed from the site root, not by host/);
	});

	it('goes red on a vendor signature in shipped code, or a consent banner in prose-free script', () => {
		const root = telemetryRepo();
		write(root, 'dist/_astro/app.js', 'window.dataLayer=[];gtag("config","G-XXXX");');
		const marker = runGate('check-telemetry.mjs', ['--root', root]);
		assert.equal(marker.status, 1);
		assert.match(marker.output, /Google Analytics \/ Tag Manager signature/);

		write(root, 'dist/_astro/app.js', 'CookieConsent.init({});');
		const banner = runGate('check-telemetry.mjs', ['--root', root]);
		assert.equal(banner.status, 1);
		assert.match(banner.output, /consent banner signature/);
	});

	it('goes red on a cookie write, including one inside an inline script', () => {
		const root = telemetryRepo();
		write(root, 'dist/_astro/app.js', 'document.cookie = "uid=1; path=/";');
		const result = runGate('check-telemetry.mjs', ['--root', root]);
		assert.equal(result.status, 1);
		assert.match(result.output, /writes a cookie/);

		write(root, 'dist/_astro/app.js', 'const theme = localStorage.getItem("theme");');
		write(
			root,
			'dist/docs/index.html',
			'<html><body><script>document.cookie = "sid=1";</script></body></html>',
		);
		const inline = runGate('check-telemetry.mjs', ['--root', root]);
		assert.equal(inline.status, 1);
		assert.match(inline.output, /docs\/index\.html: `document\.cookie = ` writes a cookie/);
	});

	it('goes red on a relative subresource', () => {
		const root = telemetryRepo();
		write(
			root,
			'dist/docs/index.html',
			'<html><head><script src="_astro/app.js"></script></head></html>',
		);
		const result = runGate('check-telemetry.mjs', ['--root', root]);
		assert.equal(result.status, 1);
		assert.match(result.output, /is a relative reference/);
	});
});
