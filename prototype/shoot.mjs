/**
 * PROTOTYPE (#16) — screenshot sweep for the design review.
 * Uses the globally installed Playwright (browsers already cached).
 *
 * Usage: pnpm dev   (in another shell)
 *        node prototype/shoot.mjs
 */
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

// Resolve Playwright from the global install so the prototype keeps a tiny dependency set.
const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
const require = createRequire(`${globalRoot}/`);
const { chromium } = require('playwright');

const BASE = process.env.BASE ?? 'http://localhost:4321';
const OUT = new URL('../.screenshots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

/** @type {{name:string,path:string,query:string,theme:'light'|'dark',full?:boolean}[]} */
const shots = [
	// Q2 — splash landing at /docs
	{ name: 'splash-a-light', path: '/docs/', query: 'palette=a&depth=warm', theme: 'light', full: true },
	{ name: 'splash-a-dark', path: '/docs/', query: 'palette=a&depth=warm', theme: 'dark', full: true },
	// Q1 — docs skeleton: sidebar + prose + Expressive Code block
	{ name: 'docs-a-warm-light', path: '/docs/concepts/streaming/', query: 'palette=a&depth=warm', theme: 'light' },
	{ name: 'docs-a-warm-dark', path: '/docs/concepts/streaming/', query: 'palette=a&depth=warm', theme: 'dark' },
	{ name: 'docs-a-tokenonly-light', path: '/docs/concepts/streaming/', query: 'palette=a&depth=accent', theme: 'light' },
	{ name: 'docs-a-tokenonly-dark', path: '/docs/concepts/streaming/', query: 'palette=a&depth=accent', theme: 'dark' },
	{ name: 'docs-a-override-light', path: '/docs/concepts/streaming/', query: 'palette=a&depth=override', theme: 'light', full: true },
	// Q4 — hue comparison on a real page
	{ name: 'docs-b-warm-light', path: '/docs/concepts/streaming/', query: 'palette=b&depth=warm', theme: 'light' },
	{ name: 'docs-b-warm-dark', path: '/docs/concepts/streaming/', query: 'palette=b&depth=warm', theme: 'dark' },
	{ name: 'docs-c-warm-light', path: '/docs/concepts/streaming/', query: 'palette=c&depth=warm', theme: 'light' },
	{ name: 'docs-c-warm-dark', path: '/docs/concepts/streaming/', query: 'palette=c&depth=warm', theme: 'dark' },
	// Q1 + Q4 together — all candidates side by side, real chrome, real ratios
	{ name: 'palette-compare-light', path: '/prototype/palette/', query: '', theme: 'light', full: true },
	{ name: 'palette-compare-dark', path: '/prototype/palette/', query: '', theme: 'dark', full: true },
	// Acceptance checklist item: 404 page
	{ name: 'notfound-light', path: '/no-such-page/', query: 'palette=a&depth=warm', theme: 'light' },
	{ name: 'notfound-dark', path: '/no-such-page/', query: 'palette=a&depth=warm', theme: 'dark' },
];

const browser = await chromium.launch();
for (const shot of shots) {
	const context = await browser.newContext({
		colorScheme: shot.theme,
		viewport: { width: 1440, height: 900 },
		deviceScaleFactor: 2,
	});
	const page = await context.newPage();
	const url = `${BASE}${shot.path}${shot.query ? `?${shot.query}` : ''}`;
	await page.goto(url, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(250);
	await page.screenshot({ path: `${OUT}${shot.name}.png`, fullPage: Boolean(shot.full) });
	await context.close();
	console.log(`  ${shot.name}.png  <- ${url} (${shot.theme})`);
}
await browser.close();
console.log(`\n${shots.length} screenshots -> ${OUT}`);
