#!/usr/bin/env node
/**
 * The acceptance sweep (#28, brand-visual.md §5④ / §5⑤ / §5⑥) — the part of the final
 * sign-off that needs a person's eyes and therefore a browser:
 *
 *   - **page-type spot check** (§5④), light and dark each: documentation page, splash landing,
 *     one generated API page, 404, Pagefind panel;
 *   - **no CLS** (§5⑤) measured per page (layout-shift entries, summed per load);
 *   - **handoff screenshots** (§5⑥) into `.screenshots/`, the same 1440×900 viewport and 2×
 *     device scale factor the prototype baseline used (`prototype/brand-visual` @ `9eab245`,
 *     `prototype/shoot.mjs`) so a zoom between the two sets is a real change;
 *   - plus the runtime half of two rulings that are otherwise only checked on files: no
 *     third-party request ever leaves the page (delivery.md §7 / O6) and the bundled
 *     Pagefind index answers for the *generated* tree (api-reference.md §10).
 *
 * It runs on demand (`pnpm shots`), not in CI: it needs a browser, and CI has none. Playwright
 * is resolved from the global install — the prototype's approach — so the repo dependency set
 * stays as `stack.md` §4 fixed it; `dist/` is served by the ~40-line static server below,
 * which follows the same resolution order as the link gate (directory index → `.html` → file).
 *
 * Usage:
 *   pnpm build && pnpm shots [--dist <dir>] [--out <dir>] [--query <text>]
 */
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/cli.mjs';
import { targetCandidates } from '../src/lib/links.ts';
import { markdownMime, plainTextMime } from '../src/lib/platform.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { options, errors } = parseArgs(process.argv.slice(2), { values: ['dist', 'out', 'query'] });
if (errors.length > 0) {
	for (const error of errors) console.error(`✗ ${error}`);
	process.exit(2);
}

const dist = path.resolve(options.dist ?? path.join(root, 'dist'));
const out = path.resolve(options.out ?? path.join(root, '.screenshots'));
const query = options.query ?? 'createWorkflow';

if (!existsSync(dist)) {
	console.error(`✗ ${dist} is missing — \`pnpm build\` writes it before this sweep runs`);
	process.exit(1);
}

const { chromium } = loadPlaywright();

/** The five page types §5④ names, light and dark each, in the order the spec lists them. */
const shots = [
	{ name: 'docs-page', path: '/docs/get-started/quickstart/', fullPage: false, what: 'documentation page (sidebar + prose + Expressive Code block)' },
	{ name: 'splash', path: '/docs/', fullPage: true, what: 'splash landing (`template: splash`)' },
	{ name: 'api-page', path: '/docs/reference/api/workflows/functions/createworkflow/', fullPage: false, what: 'generated API page (one of the 238)' },
	{ name: 'notfound', path: '/no-such-page/', fullPage: false, what: '404 (built `404.html`, served with status 404)' },
	{ name: 'search-panel', path: '/docs/concepts/agents/', fullPage: false, what: `Pagefind panel, query \`${query}\``, search: true },
];

const clsThreshold = 0.01;
const viewport = { width: 1440, height: 900 };
const deviceScaleFactor = 2;

mkdirSync(out, { recursive: true });

const server = await serve(dist);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const report = {
	generatedAt: new Date().toISOString(),
	base,
	viewport: { ...viewport, deviceScaleFactor },
	clsThreshold,
	query,
	shots: [],
	problems: [],
};
console.log(`Serving ${path.relative(root, dist)} at ${base}\n`);

for (const shot of shots) {
	for (const theme of ['light', 'dark']) {
		const context = await browser.newContext({ colorScheme: theme, viewport, deviceScaleFactor });
		const page = await context.newPage();
		const requests = [];
		const consoleErrors = [];
		// The 404 page is *served* with status 404 (the point of the shot), and the browser logs
		// that as a console error. Only that line is ignored — every other message, and every
		// uncaught exception, still counts.
		const ignoredConsoleError =
			shot.name === 'notfound' ? /Failed to load resource: the server responded with a status of 404/ : null;
		const noteConsoleError = (message) => {
			if (ignoredConsoleError !== null && ignoredConsoleError.test(message)) return;
			consoleErrors.push(message);
		};
		page.on('request', (request) => requests.push(request.url()));
		page.on('pageerror', (error) => noteConsoleError(error.message));
		page.on('console', (message) => {
			if (message.type() === 'error') noteConsoleError(message.text());
		});

		await page.addInitScript(() => {
			window.__shifts = [];
			new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (entry.hadRecentInput) continue;
					// Sources are recorded so a future red line is diagnosable from the evidence file
					// alone: which element moved, and when.
					window.__shifts.push({
						value: entry.value,
						startTime: Math.round(entry.startTime),
						sources: (entry.sources ?? []).map((source) => {
							const node = source.node;
							if (node === null || node === undefined) return '(detached)';
							const className = typeof node.className === 'string' && node.className !== '' ? `.${node.className.split(' ')[0]}` : '';
							return `${node.tagName ?? '?'}${className}`;
						}),
					});
				}
			}).observe({ type: 'layout-shift', buffered: true });
		});

		const response = await page.goto(`${base}${shot.path}`, { waitUntil: 'networkidle' });
		await page.evaluate(() => document.fonts.ready);
		await page.waitForTimeout(400);

		let search = null;
		if (shot.search === true) {
			await page.locator('button[data-open-modal]').first().click();
			const input = page.locator('.pagefind-ui__search-input');
			await input.waitFor({ timeout: 10_000 });
			await input.fill(query);
			// Pagefind renders its result list progressively; wait for the first result, then let the
			// list settle so the recorded count is the query's real answer, not a frame of it.
			await page
				.waitForFunction(() => document.querySelectorAll('.pagefind-ui__result-link').length > 0, undefined, {
					timeout: 10_000,
				})
				.catch(() => {});
			await page.waitForTimeout(1000);
			const results = await page.$$eval('.pagefind-ui__result-link', (links) =>
				links.map((link) => link.getAttribute('href') ?? ''),
			);

			const generated = results.filter((href) => href.startsWith('/docs/reference/api/')).length;
			search = { query, results: results.length, generatedTreeResults: generated, top: results.slice(0, 3) };
			if (results.length === 0) report.problems.push(`${shot.name}-${theme}: Pagefind returned no result for \`${query}\``);
			else if (generated === 0)
				report.problems.push(`${shot.name}-${theme}: no result for \`${query}\` came from the generated tree — the API pages are not in the index (api-reference.md §10)`);
		}

		const file = `${shot.name}-${theme}.png`;
		await page.screenshot({ path: path.join(out, file), fullPage: shot.fullPage });

		const shifts = await page.evaluate(() => window.__shifts);
		const cls = shifts.reduce((total, shift) => total + shift.value, 0);
		const status = response?.status() ?? 0;
		const foreign = [...new Set(requests.filter((url) => new URL(url).origin !== base))];
		const bytes = await page.evaluate(() =>
			performance
				.getEntriesByType('resource')
				.reduce((total, entry) => total + (entry.transferSize ?? 0), 0),
		);

		const expectedStatus = shot.name === 'notfound' ? 404 : 200;
		if (status !== expectedStatus) report.problems.push(`${file}: ${shot.path} answered ${status}, expected ${expectedStatus}`);
		if (cls > clsThreshold) report.problems.push(`${file}: CLS ${cls.toFixed(4)} exceeds ${clsThreshold} (brand-visual.md §5⑤)`);
		if (foreign.length > 0) report.problems.push(`${file}: requests left the origin — ${foreign.join(', ')} (delivery.md §7)`);
		if (consoleErrors.length > 0) report.problems.push(`${file}: console error(s) — ${consoleErrors.join(' | ')}`);

		report.shots.push({
			file,
			theme,
			path: shot.path,
			cls,
			shifts,
			status,
			requests: requests.length,
			foreignRequests: foreign.length,
			bytes,
			search,
		});
		console.log(
			`  ${file.padEnd(26)} ${String(status).padEnd(4)} CLS ${cls.toFixed(5).padEnd(8)} ` +
				`${String(requests.length).padStart(3)} request(s), ${(bytes / 1024).toFixed(0)} KB, ${foreign.length} foreign` +
				(shot.search === true ? `, ${search.results} hit(s) (${search.generatedTreeResults} from the API tree)` : ''),
		);

		await context.close();
	}
}

await browser.close();
server.close();

writeFileSync(path.join(out, 'acceptance.json'), `${JSON.stringify(report, null, '\t')}\n`);
console.log(`\n${report.shots.length} screenshot(s) + acceptance.json -> ${path.relative(root, out)}`);

if (report.problems.length > 0) {
	console.error('');
	for (const problem of report.problems) console.error(`✗ ${problem}`);
	console.error(`\n${report.problems.length} acceptance problem(s) (brand-visual.md §5④/§5⑤).`);
	process.exit(1);
}

console.log(
	`Page types hold in both themes: no CLS above ${clsThreshold}, no request off the origin, ` +
		`and the Pagefind index answers from the generated tree.`,
);

/** Playwright from the global install, with an actionable message when it is absent. */
function loadPlaywright() {
	try {
		const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
		return createRequire(`${globalRoot}/`)('playwright');
	} catch {
		console.error(
			'✗ playwright is not installed globally — `npm i -g playwright && npx playwright install chromium` (the prototype used the same route)',
		);
		process.exit(2);
	}
}

/**
 * A static file server over the asset directory, with the host's resolution order for
 * extension-less paths (`targetCandidates` in `src/lib/links.ts` — the same rule the link gate
 * applies) and the built `404.html` for everything else, so the sweep sees the 404 a visitor
 * would. The `.md` twin endpoints get the §5.1 MIME even though nothing screenshots them.
 */
function serve(directory) {
	const types = new Map(
		Object.entries({
			'.html': 'text/html; charset=utf-8',
			'.js': 'text/javascript; charset=utf-8',
			'.css': 'text/css; charset=utf-8',
			'.json': 'application/json; charset=utf-8',
			'.md': markdownMime,
			'.txt': plainTextMime,
			'.svg': 'image/svg+xml',
			'.png': 'image/png',
			'.jpg': 'image/jpeg',
			'.webp': 'image/webp',
			'.ico': 'image/x-icon',
			'.wasm': 'application/wasm',
			'.xml': 'application/xml',
		}),
	);

	const server = createServer((request, response) => {
		const send = (file, status) => {
			response.writeHead(status, {
				'content-type': types.get(path.extname(file)) ?? 'application/octet-stream',
			});
			createReadStream(file).pipe(response);
		};

		const url = new URL(request.url ?? '/', 'http://localhost');
		let pathname = url.pathname;
		try {
			pathname = decodeURIComponent(pathname);
		} catch {
			// Malformed encoding: fall through with the raw path and let it 404.
		}

		for (const candidate of targetCandidates(pathname)) {
			const file = path.join(directory, candidate);
			// `path.join` normalizes, so a `..` segment cannot land outside the asset directory.
			if (!file.startsWith(directory)) continue;
			if (existsSync(file) && statSync(file).isFile()) return send(file, 200);
		}

		const notFound = path.join(directory, '404.html');
		if (existsSync(notFound)) return send(notFound, 404);
		response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
		response.end('Not found');
	});

	return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}
