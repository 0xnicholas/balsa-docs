/**
 * The platform contract (#27) — the repo-side half of delivery.md §2: the three files the
 * host layer reads, with the rules that keep them equal to the spec.
 *
 *   - `.nvmrc` — the Node pin the platform build image and CI both read (§2.4);
 *   - `wrangler.jsonc` — static assets configuration, no Worker script (§2.1);
 *   - `public/_headers` — the `.md` MIME override and the llms site-level headers (§2.1/§2.3),
 *     the fingerprinted-asset cache rule (§2.4), and the Pagefind index (§10.8).
 *
 * Whatever the deployed host does *because* of these files (permanent redirect codes,
 * preview noindex, the platform's own MIME defaults before the override) is platform-side:
 * delivery.md §13 is the checklist for it, not this module.
 */

import { isRecord } from './guards.ts';

// ─── `.nvmrc` (delivery.md §2.4) ───────────────────────────────────────────────────────

/** The pin delivery.md §2.4 fixes; the platform build image and CI both read the file. */
export const nodeVersion = '22.12.0';
/** The file both consumers read it from (the workflow uses `node-version-file`). */
export const nodeVersionFile = '.nvmrc';

const nodePinPattern = /^\d+\.\d+\.\d+$/;

/**
 * The pin is one value the spec fixes, so this gate holds the file to that value rather
 * than to a range: ``.nvmrc`` is read by two hosts (CI and the platform build image), and
 * a silent bump is exactly the drift they would share. Node bumps are spec changes.
 */
export function nodePinIssues(nvmrc: string): string[] {
	const pin = nvmrc.trim();
	if (pin === nodeVersion) return [];

	if (!nodePinPattern.test(pin)) {
		return [
			`${nodeVersionFile}: \`${pin}\` is not a full \`major.minor.patch\` version — the platform build image and \`node-version-file\` both need one (delivery.md §2.4), and the spec fixes ${nodeVersion}`,
		];
	}
	return [
		`${nodeVersionFile} pins ${pin}, but delivery.md §2.4 fixes ${nodeVersion} — the platform build image and CI both read this file, so a Node bump is a spec change (edit §2.4 with the file)`,
	];
}

// ─── `wrangler.jsonc` (delivery.md §2.1) ───────────────────────────────────────────────

export const wranglerConfigFile = 'wrangler.jsonc';

/** The project name delivery.md §2.1 fixes — it is also the deployed Worker's name. */
export const workerName = 'balsa-docs';
/** The compatibility date §2.1 fixes: it dates the runtime behavior, so it moves on purpose. */
export const compatibilityDate = '2026-09-30';
/** The asset directory the build writes and the host serves (delivery.md §2.1). */
export const assetsDirectory = './dist/';
/** `/docs/foo` → 307 `/docs/foo/`; the platform's normalization, not the ledger's (§4.3). */
export const htmlHandling = 'auto-trailing-slash';
/** Without this the platform returns a generic 404 instead of the built `404.html`. */
export const notFoundHandling = '404-page';

/**
 * Wrangler reads JSONC, so the file may carry the reasoning the decisions need. Strict
 * JSON would force those comments into a second document nobody reads.
 */
export function parseJsonc(text: string): { value: unknown } | { error: string } {
	const uncommented = stripJsoncComments(text);
	if (typeof uncommented !== 'string') return { error: uncommented.error };

	try {
		return { value: JSON.parse(stripTrailingCommas(uncommented)) };
	} catch (error) {
		return { error: `${wranglerConfigFile} is not valid JSONC: ${(error as Error).message}` };
	}
}

/** Remove `//` and `/* *\/` comments, leaving string contents untouched. */
function stripJsoncComments(text: string): string | { error: string } {
	let result = '';
	let inString = false;
	let escaped = false;

	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		const next = text[index + 1];

		if (inString) {
			result += char;
			if (escaped) escaped = false;
			else if (char === '\\') escaped = true;
			else if (char === '"') inString = false;
			continue;
		}

		if (char === '"') {
			inString = true;
			result += char;
			continue;
		}
		if (char === '/' && next === '/') {
			const end = text.indexOf('\n', index);
			index = end === -1 ? text.length : end - 1;
			continue;
		}
		if (char === '/' && next === '*') {
			const end = text.indexOf('*/', index + 2);
			if (end === -1) return { error: `${wranglerConfigFile} is not valid JSONC: unterminated comment` };
			index = end + 1;
			continue;
		}
		result += char;
	}

	return result;
}

/** Remove trailing commas the way JSONC allows them — never inside a string. */
function stripTrailingCommas(text: string): string {
	let result = '';
	let inString = false;
	let escaped = false;

	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];

		if (inString) {
			result += char;
			if (escaped) escaped = false;
			else if (char === '\\') escaped = true;
			else if (char === '"') inString = false;
			continue;
		}

		if (char === '"') {
			inString = true;
			result += char;
			continue;
		}
		if (char === ',') {
			let lookahead = index + 1;
			while (lookahead < text.length && /\s/.test(text[lookahead])) lookahead += 1;
			if (text[lookahead] === '}' || text[lookahead] === ']') {
				index = lookahead - 1;
				continue;
			}
		}
		result += char;
	}

	return result;
}

/**
 * Every check is a value the spec fixes (delivery.md §2.1). Unknown keys are left alone —
 * this gate holds the contract, it does not police wrangler's own schema.
 */
export function wranglerConfigIssues(text: string): string[] {
	const parsed = parseJsonc(text);
	if ('error' in parsed) return [parsed.error];

	const value = parsed.value;
	if (!isRecord(value)) return [`${wranglerConfigFile} must be a JSON object`];

	const errors: string[] = [];

	if (value.name !== workerName) {
		errors.push(
			`${wranglerConfigFile}: name must be \`${workerName}\` (delivery.md §2.1) — found ${JSON.stringify(value.name)}`,
		);
	}
	if (value.compatibility_date !== compatibilityDate) {
		errors.push(
			`${wranglerConfigFile}: compatibility_date must be \`${compatibilityDate}\` (delivery.md §2.1) — found ${JSON.stringify(value.compatibility_date)}`,
		);
	}
	for (const key of ['main', 'main_module']) {
		if (key in value) {
			errors.push(
				`${wranglerConfigFile}: \`${key}\` is set — the site is static assets only, with no Worker script (delivery.md §2.1)`,
			);
		}
	}

	const assets = value.assets;
	if (!isRecord(assets)) {
		errors.push(
			`${wranglerConfigFile}: the \`assets\` section is missing — an assets-only Worker needs \`assets.directory\` (delivery.md §2.1)`,
		);
		return errors;
	}

	if (assets.directory !== assetsDirectory) {
		errors.push(
			`${wranglerConfigFile}: assets.directory must be \`${assetsDirectory}\` (delivery.md §2.1) — found ${JSON.stringify(assets.directory)}`,
		);
	}
	if (assets.html_handling !== htmlHandling) {
		errors.push(
			`${wranglerConfigFile}: assets.html_handling must be \`${htmlHandling}\` (delivery.md §2.1/§4.3) — found ${JSON.stringify(assets.html_handling)}`,
		);
	}
	if (assets.not_found_handling !== notFoundHandling) {
		errors.push(
			`${wranglerConfigFile}: assets.not_found_handling must be \`${notFoundHandling}\` (delivery.md §2.1) — found ${JSON.stringify(assets.not_found_handling)}`,
		);
	}
	return errors;
}

// ─── `public/_headers` (delivery.md §2.1/§2.3, agent-surface.md §5) ─────────────────────

/** Authored under `public/`, copied by the build to the asset root (delivery.md §2.1). */
export const headersSource = 'public/_headers';
/** Where the platform expects it inside the asset directory. */
export const headersAsset = '_headers';

/** Platform ceilings: 100 rules (delivery.md §2.3), 2,000 characters per line (§2.2.4). */
export const maxHeaderRules = 100;
export const maxHeaderLineLength = 2000;

/** One header line: a value, or a `! Name` removal of a platform default. */
export type HeaderEntry = { name: string; value: string } | { name: string; remove: true };
export type HeaderRule = { pattern: string; headers: HeaderEntry[] };
export type ParsedHeaders = { rules: HeaderRule[]; errors: string[] };

/**
 * The Cloudflare `_headers` format: `[url]` blocks, indented `[name]: [value]` lines,
 * `#` comments, `!` removals, one splat per pattern. A request inherits *every* matching
 * rule, and a header set twice on one request has its values joined with a comma rather
 * than overridden (delivery.md §2.3) — so the footgun this gate closes is two rules that
 * can both match one request setting one header name: a second `Content-Type` would ship
 * `text/markdown; charset=utf-8, text/markdown; charset=utf-8` to every agent. Rules that
 * cannot both match one request may share a name: `/*.md` and `/llms.txt` each set their
 * own `Content-Type`.
 */
export function parseHeaders(text: string): ParsedHeaders {
	const rules: HeaderRule[] = [];
	const errors: string[] = [];
	const seenPatterns = new Set<string>();
	/** Lower-cased header name → every pattern that sets it (HTTP names are case-insensitive). */
	const seenNames = new Map<string, string[]>();

	const lines = text.split('\n');
	for (const [index, rawLine] of lines.entries()) {
		const line = rawLine.trimEnd();
		const where = `${headersSource}:${index + 1}`;

		if (line.length > maxHeaderLineLength) {
			errors.push(
				`${where}: the line is ${line.length} characters — the platform limit is 2,000 characters per line, spacing included (delivery.md §2.2.4)`,
			);
			continue;
		}

		const trimmed = line.trim();
		if (trimmed === '' || trimmed.startsWith('#')) continue;

		if (trimmed.startsWith('/') || trimmed.startsWith('https://')) {
			if (seenPatterns.has(trimmed)) {
				errors.push(`${where}: \`${trimmed}\` is listed twice — one rule per pattern`);
				continue;
			}
			seenPatterns.add(trimmed);
			rules.push({ pattern: trimmed, headers: [] });
			continue;
		}

		const current = rules.at(-1);
		const separator = trimmed.indexOf(':');
		const name = separator === -1 ? '' : trimmed.slice(0, separator).trim();
		const value = separator === -1 ? '' : trimmed.slice(separator + 1).trim();

		if (trimmed.startsWith('!')) {
			if (current === undefined) {
				errors.push(`${where}: a \`! Name\` removal needs a pattern above it`);
				continue;
			}
			const removed = trimmed.slice(1).trim();
			if (removed === '') {
				errors.push(`${where}: a \`! \` removal needs a header name`);
				continue;
			}
			current.headers.push({ name: removed, remove: true });
			continue;
		}

		if (name === '' || value === '') {
			errors.push(
				`${where}: \`${trimmed}\` is neither a rule pattern (\`/…\` or \`https://…\`) nor a \`[name]: [value]\` header line (delivery.md §2.3)`,
			);
			continue;
		}

		if (current === undefined) {
			errors.push(`${where}: \`${name}: ${value}\` appears before any rule block — a header needs a pattern above it`);
			continue;
		}

		const firstPatterns = seenNames.get(name.toLowerCase()) ?? [];
		const overlapping = firstPatterns.find((pattern) => patternsMayOverlap(pattern, current.pattern));
		if (overlapping !== undefined) {
			errors.push(
				`${where}: \`${name}\` is set more than once (\`${overlapping}\` and \`${current.pattern}\` can both match one request) — the platform joins the values instead of overriding (delivery.md §2.3)`,
			);
			continue;
		}
		seenNames.set(name.toLowerCase(), [...firstPatterns, current.pattern]);
		current.headers.push({ name, value });
	}

	for (const rule of rules) {
		if (rule.headers.length === 0) {
			errors.push(`${headersSource}: the \`${rule.pattern}\` rule has no headers`);
		}
	}
	if (rules.length > maxHeaderRules) {
		errors.push(
			`${headersSource}: ${rules.length} header rules — the platform takes up to 100 (delivery.md §2.3)`,
		);
	}

	return { rules, errors };
}

/** One required header entry, with the spec section that fixes it. */
export type RequiredHeader = { pattern: string; name: string; value: string; spec: string };

/**
 * The five the spec froze (delivery.md §11⑦, agent-surface.md §5.1/§5.3): the `.md` twin
 * MIME, the same override for `/llms.txt`, the immutable cache for fingerprinted assets,
 * and the two site-level llms discovery headers.
 */
export const requiredHeaders: RequiredHeader[] = [
	{ pattern: '/*', name: 'Link', value: '</llms.txt>; rel="llms-txt"', spec: 'agent-surface.md §5.3' },
	{ pattern: '/*', name: 'X-Llms-Txt', value: '/llms.txt', spec: 'agent-surface.md §5.3' },
	{ pattern: '/*.md', name: 'Content-Type', value: 'text/markdown; charset=utf-8', spec: 'agent-surface.md §5.1' },
	{ pattern: '/llms.txt', name: 'Content-Type', value: 'text/plain; charset=utf-8', spec: 'agent-surface.md §5.3' },
	{
		pattern: '/_astro/*',
		name: 'Cache-Control',
		value: 'public, max-age=31556952, immutable',
		spec: 'delivery.md §2.4',
	},
];

/**
 * Could these two patterns match a single request? The platform allows one splat per
 * pattern and matches greedily, so each pattern is a prefix, a `*`, and a suffix; testing
 * each pattern against the other's literal sample answers it in the direction that matters
 * (a false positive costs a rewrite of the file, a false negative ships a broken header).
 */
function patternsMayOverlap(left: string, right: string): boolean {
	return matchesPattern(left, sampleOf(right)) || matchesPattern(right, sampleOf(left));
}

const sampleOf = (pattern: string) => pattern.replace('*', 'sample');

function matchesPattern(pattern: string, path: string): boolean {
	const source = pattern
		.split('*')
		.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.join('.*');
	return new RegExp(`^${source}$`).test(path);
}

/** Every missing or near-miss required entry — an override that is almost right is wrong. */
export function headerContractIssues(rules: readonly HeaderRule[]): string[] {
	return requiredHeaders.flatMap((required) => {
		const patternRules = rules.filter((rule) => rule.pattern === required.pattern);
		const found = patternRules
			.flatMap((rule) => rule.headers)
			.filter((entry): entry is { name: string; value: string } => entry.name === required.name && 'value' in entry)
			.map((entry) => entry.value);

		if (found.includes(required.value)) return [];
		const detail =
			found.length === 0
				? patternRules.length === 0
					? `no \`${required.pattern}\` rule`
					: `the \`${required.pattern}\` rule does not set it`
				: `found \`${found.join('`, `')}\``;
		return [
			`${headersSource}: \`${required.pattern}\` must set ${required.name}: ${required.value} (${required.spec}) — ${detail}`,
		];
	});
}

// ─── The Pagefind index (delivery.md §10.8) ────────────────────────────────────────────

/** Where Pagefind writes its index inside the asset directory. */
export const pagefindOutput = 'pagefind';
/** The index manifest the runtime reads first; carries the page count indexed. */
export const pagefindEntryFile = 'pagefind-entry.json';

/**
 * An index that ships is not yet an index that works: the runtime, the wasm, the word
 * index and the fragments all have to be in the deployment, and the manifest has to say
 * it indexed exactly this version's page set — the failure this catches is a build that
 * quietly stops indexing (a search box that finds nothing).
 *
 * `files` are the paths under the Pagefind output directory; `pages` is the page count of
 * this version (§4.2's page set).
 */
export function pagefindIndexIssues(input: {
	files: readonly string[];
	entry: unknown;
	pages: number;
}): string[] {
	const { files, entry, pages } = input;
	const errors: string[] = [];
	const hasFile = (name: string) => files.some((file) => file === name || file.endsWith(`/${name}`));
	const hasSuffix = (suffix: string) => files.some((file) => file.endsWith(suffix));

	for (const name of [pagefindEntryFile, 'pagefind.js']) {
		if (!hasFile(name)) {
			errors.push(
				`dist/${pagefindOutput}/${name} is missing — the search UI fetches it at runtime (delivery.md §10.8)`,
			);
		}
	}
	if (!hasSuffix('.pf_index')) {
		errors.push(`dist/${pagefindOutput} has no word index (\`*.pf_index\`) — search would find nothing (delivery.md §10.8)`);
	}
	if (!hasSuffix('.pf_fragment')) {
		errors.push(`dist/${pagefindOutput} has no page fragments (\`*.pf_fragment\`) — results would have no content (delivery.md §10.8)`);
	}
	if (!hasSuffix('.pagefind')) {
		errors.push(`dist/${pagefindOutput} has no search wasm (\`*.pagefind\`) — the runtime cannot rank without it (delivery.md §10.8)`);
	}

	if (!isRecord(entry)) {
		errors.push(
			`dist/${pagefindOutput}/${pagefindEntryFile} is missing or unreadable — it is the index manifest (delivery.md §10.8)`,
		);
		return errors;
	}
	if (typeof entry.version !== 'string' || entry.version === '') {
		errors.push(`dist/${pagefindOutput}/${pagefindEntryFile} carries no \`version\``);
	}
	if (!isRecord(entry.languages) || Object.keys(entry.languages).length === 0) {
		errors.push(
			`dist/${pagefindOutput}/${pagefindEntryFile} lists no \`languages\` — nothing was indexed (delivery.md §10.8)`,
		);
		return errors;
	}

	const counts: number[] = [];
	for (const [language, value] of Object.entries(entry.languages)) {
		const count = isRecord(value) ? value.page_count : undefined;
		if (typeof count !== 'number') {
			errors.push(
				`dist/${pagefindOutput}/${pagefindEntryFile}: language \`${language}\` carries no numeric \`page_count\``,
			);
			continue;
		}
		counts.push(count);
	}
	if (counts.length === Object.keys(entry.languages).length) {
		const indexed = counts.reduce((total, count) => total + count, 0);
		if (indexed !== pages) {
			errors.push(
				`the Pagefind index covers ${indexed} page(s) but this version serves ${pages} page(s) — the index is stale or partial (delivery.md §10.8)`,
			);
		}
	}
	return errors;
}

// ─── The search UI (delivery.md §10.8 / handoff S12) ────────────────────────────────────

/** Starlight's search component; the element that actually asks the index for results. */
export const searchElement = '<site-search';
/** A meta-refresh stub is not a page (the ledger's `/` → `/docs/` entry renders one). */
const redirectStubMarker = 'http-equiv="refresh"';

/**
 * An index nobody can query is not search. The index assertions above prove the build
 * emitted it; these check that the built pages mount the UI that fetches it. Redirect
 * stubs have no body and are skipped — every real page, custom 404 included, renders the
 * site header the component lives in.
 */
export function searchUiIssues(pages: readonly { path: string; html: string }[]): string[] {
	const rendered = pages.filter((page) => !page.html.includes(redirectStubMarker));
	if (rendered.length === 0) {
		return ['no rendered HTML page in dist/ — nothing mounts the search UI (delivery.md §10.8)'];
	}

	return rendered
		.filter((page) => !page.html.includes(searchElement))
		.map(
			(page) =>
				`dist/${page.path} carries no \`${searchElement}\` element — the index ships but that page never asks for it (delivery.md §10.8)`,
		);
}
