import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	assetsDirectory,
	headerContractIssues,
	maxHeaderLineLength,
	maxHeaderRules,
	nodePinIssues,
	nodeVersion,
	pagefindIndexIssues,
	parseHeaders,
	parseJsonc,
	searchUiIssues,
	wranglerConfigIssues,
	type HeaderRule,
} from './platform.ts';

/**
 * The platform-facing artifacts of the repo (#27): `.nvmrc` (the Node pin both the
 * platform build image and CI read — delivery.md §2.4), `wrangler.jsonc` (the static
 * assets configuration — §2.1) and `public/_headers` (the MIME/cache/llms headers —
 * §2.3, agent-surface.md §5.1/§5.3). These cases pin the contract each file has to keep,
 * so the files can only change by changing the spec (and the gate that encodes it).
 *
 * The deployed behaviours themselves (§4.3 permanent redirects, §6 preview noindex,
 * §10.8 index publication) are platform-side and are *not* testable here; the checklist
 * for them lives in delivery.md §13.
 */

const specWrangler = `{
	// Static assets only — no Worker script (delivery.md §2.1).
	"name": "oribos-docs",
	"compatibility_date": "2026-09-30",
	"assets": {
		"directory": "./dist/",
		"html_handling": "auto-trailing-slash",
		"not_found_handling": "404-page",
	},
}`;

const wranglerErrors = (text: string) => wranglerConfigIssues(text).join('\n');

describe('the Node pin (.nvmrc, delivery.md §2.4)', () => {
	it('accepts the pin the spec fixes, newline included', () => {
		assert.deepEqual(nodePinIssues(`${nodeVersion}\n`), []);
	});

	it('rejects a pin that is not a full version', () => {
		for (const pin of ['22', '22.12', 'node', 'v22.12.0', 'lts/*']) {
			assert.match(nodePinIssues(pin).join('\n'), /full `major\.minor\.patch`/);
		}
	});

	it('rejects any other version — a bump is a spec change, not a silent edit', () => {
		for (const pin of ['22.11.0', '22.12.1', '24.1.0']) {
			assert.match(nodePinIssues(pin).join('\n'), /delivery\.md §2\.4 fixes 22\.12\.0/);
		}
	});
});

describe('wrangler.jsonc (delivery.md §2.1)', () => {
	it('reads JSONC: comments and trailing commas', () => {
		const parsed = parseJsonc(specWrangler);
		assert.equal('value' in parsed, true);
		const value = (parsed as { value: { name: string } }).value;
		assert.equal(value.name, 'oribos-docs');
	});

	it('leaves `//` inside a string alone', () => {
		const parsed = parseJsonc('{ "name": "a//b", /* c */ "compatibility_date": "2026-09-30" }');
		assert.deepEqual(parsed, { value: { name: 'a//b', compatibility_date: '2026-09-30' } });
	});

	it('leaves commas and braces inside a string alone', () => {
		assert.deepEqual(parseJsonc('{ "name": "a,}" }'), { value: { name: 'a,}' } });
		assert.deepEqual(parseJsonc('{ "name": "a,\\"}" }'), { value: { name: 'a,"}' } });
	});

	it('drops a trailing comma even with a comment after it', () => {
		assert.deepEqual(parseJsonc('{ "name": "oribos-docs", /* date below */ }'), {
			value: { name: 'oribos-docs' },
		});
		assert.deepEqual(parseJsonc('[1, 2,]'), { value: [1, 2] });
	});

	it('reports unreadable JSONC instead of throwing', () => {
		assert.match(String((parseJsonc('{ /* unclosed') as { error: string }).error), /not valid JSONC/);
		assert.match(String((parseJsonc('') as { error: string }).error), /not valid JSONC/);
	});

	it('accepts the documented shape', () => {
		assert.deepEqual(wranglerConfigIssues(specWrangler), []);
	});

	it('rejects an unreadable config outright', () => {
		assert.match(wranglerErrors('{ nope'), /not valid JSONC/);
	});

	it('rejects a config where the assets section does not match the spec', () => {
		assert.match(wranglerErrors('{ "name": "oribos-docs" }'), /`assets` section is missing/);
		assert.match(
			wranglerErrors(`{ "name": "oribos-docs", "compatibility_date": "2026-09-30", "assets": { "directory": "./public/" } }`),
			new RegExp(`assets\\.directory must be \`${assetsDirectory}\``),
		);
		assert.match(
			wranglerErrors(`{ "name": "oribos-docs", "compatibility_date": "2026-09-30", "assets": { "directory": "${assetsDirectory}", "html_handling": "force-trailing-slash" } }`),
			/html_handling must be `auto-trailing-slash`/,
		);
		assert.match(
			wranglerErrors(`{ "name": "oribos-docs", "compatibility_date": "2026-09-30", "assets": { "directory": "${assetsDirectory}", "html_handling": "auto-trailing-slash" } }`),
			/not_found_handling must be `404-page`/,
		);
	});

	it('rejects a Worker script — the site is static assets only', () => {
		const withMain = `{ "name": "oribos-docs", "compatibility_date": "2026-09-30", "main": "src/worker.ts", "assets": { "directory": "${assetsDirectory}", "html_handling": "auto-trailing-slash", "not_found_handling": "404-page" } }`;
		assert.match(wranglerErrors(withMain), /no Worker script/);
	});

	it('rejects a name that is not the project name, or a compatibility date that is not the fixed one', () => {
		assert.match(
			wranglerErrors(specWrangler.replace('"oribos-docs"', '"oribos"')),
			/name must be `oribos-docs`/,
		);
		assert.match(
			wranglerErrors(specWrangler.replace('"2026-09-30"', '"yesterday"')),
			/compatibility_date must be `2026-09-30`/,
		);
		assert.match(
			wranglerErrors(specWrangler.replace('"2026-09-30"', '"2026-10-01"')),
			/compatibility_date must be `2026-09-30`/,
		);
	});
});

describe('public/_headers (delivery.md §2.3, agent-surface.md §5.1/§5.3)', () => {
	const specHeaders = `# Rules are read top to bottom; a request inherits every matching rule.
/*
	Link: </llms.txt>; rel="llms-txt"
	X-Llms-Txt: /llms.txt

/*.md
	Content-Type: text/markdown; charset=utf-8

/llms.txt
	Content-Type: text/plain; charset=utf-8

/_astro/*
	Cache-Control: public, max-age=31556952, immutable
`;

	it('parses the platform block format, comments included', () => {
		const { rules, errors } = parseHeaders(specHeaders);
		assert.deepEqual(errors, []);
		assert.equal(rules.length, 4);
		assert.deepEqual(rules[0].headers, [
			{ name: 'Link', value: '</llms.txt>; rel="llms-txt"' },
			{ name: 'X-Llms-Txt', value: '/llms.txt' },
		]);
	});

	it('parses `! Name` removals as removals, not as values', () => {
		const { rules, errors } = parseHeaders('/*\n  ! X-Robots-Tag\n');
		assert.deepEqual(errors, []);
		assert.deepEqual(rules[0].headers, [{ name: 'X-Robots-Tag', remove: true }]);
	});

	it('rejects headers written outside a rule block', () => {
		assert.match(parseHeaders('Content-Type: text/plain\n').errors.join('\n'), /before any rule/);
	});

	it('rejects a rule with no headers, and a pattern that is not a path', () => {
		assert.match(parseHeaders('/*\n\n/docs/*\n  X-Llms-Txt: /llms.txt\n').errors.join('\n'), /no headers/);
		assert.match(parseHeaders('docs\n  X-Llms-Txt: /llms.txt\n').errors.join('\n'), /neither a rule pattern/);
	});

	it('rejects a header line without a value', () => {
		assert.match(parseHeaders('/*\n  X-Llms-Txt\n').errors.join('\n'), /`\[name\]: \[value\]`/);
		assert.match(parseHeaders('/*\n  X-Llms-Txt:\n').errors.join('\n'), /`\[name\]: \[value\]`/);
	});

	it('rejects the same pattern twice and the same header name on overlapping rules', () => {
		const duplicatePattern = parseHeaders('/*\n  X-Llms-Txt: /llms.txt\n\n/*\n  Link: </llms.txt>\n');
		assert.match(duplicatePattern.errors.join('\n'), /listed twice/);
		const duplicateName = parseHeaders('/*\n  X-Llms-Txt: /llms.txt\n\n/docs/*\n  X-Llms-Txt: /llms.txt\n');
		assert.match(duplicateName.errors.join('\n'), /set more than once/);
	});

	it('sees an overlap even when another rule set the same name in between', () => {
		const three = parseHeaders(
			'/docs/*\n  X-Llms-Txt: /llms.txt\n\n/assets/*\n  X-Llms-Txt: /llms.txt\n\n/docs/get*\n  X-Llms-Txt: /llms.txt\n',
		);
		assert.match(three.errors.join('\n'), /`\/docs\/\*` and `\/docs\/get\*` can both match one request/);
	});

	it('treats header names as case-insensitive, the way HTTP does', () => {
		const mixedCase = parseHeaders('/*\n  Content-Type: text/plain\n\n/docs/*\n  content-type: text/plain\n');
		assert.match(mixedCase.errors.join('\n'), /is set more than once/);
	});

	it('rejects more than 100 rules and a line over the platform limit', () => {
		const many = Array.from({ length: maxHeaderRules + 1 }, (_, index) => `/rule-${index}/*\n  X-Llms-Txt: /llms.txt\n`).join('');
		assert.match(parseHeaders(many).errors.join('\n'), /101 header rules — the platform takes up to 100/);
		const long = `/*\n  X-Llms-Txt: /${'a'.repeat(maxHeaderLineLength)}\n`;
		assert.match(parseHeaders(long).errors.join('\n'), /2,000 character/);
	});

	it('accepts the five required entries and reports each missing one', () => {
		assert.deepEqual(headerContractIssues(parseHeaders(specHeaders).rules), []);

		const without = (needle: string) => specHeaders.replace(needle, '');
		assert.match(
			headerContractIssues(parseHeaders(without('/*.md\n\tContent-Type: text/markdown; charset=utf-8\n')).rules).join('\n'),
			/`\/\*\.md` must set Content-Type: text\/markdown; charset=utf-8/,
		);
		assert.match(
			headerContractIssues(parseHeaders(without('/llms.txt\n\tContent-Type: text/plain; charset=utf-8\n')).rules).join('\n'),
			/`\/llms.txt` must set Content-Type/,
		);
		assert.match(
			headerContractIssues(parseHeaders(without('/_astro/*\n\tCache-Control: public, max-age=31556952, immutable\n')).rules).join('\n'),
			/`\/_astro\/\*` must set Cache-Control/,
		);
		assert.match(
			headerContractIssues(parseHeaders(specHeaders.replace('</llms.txt>; rel="llms-txt"', '</llms.txt>')).rules).join('\n'),
			/`\/\*` must set Link: <\/llms\.txt>; rel="llms-txt"/,
		);
		assert.match(
			headerContractIssues(parseHeaders(specHeaders.replace('\tX-Llms-Txt: /llms.txt\n', '')).rules).join('\n'),
			/`\/\*` must set X-Llms-Txt: \/llms\.txt/,
		);
	});

	it('rejects a near-miss value — the header is a contract, not a suggestion', () => {
		const rules: HeaderRule[] = [
			{ pattern: '/*.md', headers: [{ name: 'Content-Type', value: 'text/markdown' }] },
		];
		assert.match(headerContractIssues(rules).join('\n'), /text\/markdown; charset=utf-8/);
	});
});

describe('the Pagefind index (delivery.md §10.8)', () => {
	const entry = {
		version: '1.5.2',
		languages: { en: { hash: 'en_baf9863385', wasm: 'en', page_count: 255 } },
	};
	const files = [
		'fragment/en_118154e.pf_fragment',
		'index/en_554acca.pf_index',
		'pagefind-entry.json',
		'pagefind-ui.js',
		'pagefind.js',
		'wasm.en.pagefind',
	];

	it('accepts an index that covers exactly this version`s page set', () => {
		assert.deepEqual(pagefindIndexIssues({ files, entry, pages: 255 }), []);
	});

	it('rejects an index that does not cover the page set', () => {
		assert.match(
			pagefindIndexIssues({ files, entry, pages: 254 }).join('\n'),
			/255 page\(s\).*254 page\(s\)|indexes 255 page\(s\)/,
		);
	});

	it('rejects a runtime the browser cannot fetch, or an index with no content', () => {
		assert.match(
			pagefindIndexIssues({ files: files.filter((file) => file !== 'pagefind.js'), entry, pages: 255 }).join('\n'),
			/pagefind\.js/,
		);
		assert.match(
			pagefindIndexIssues({ files: files.filter((file) => !file.startsWith('fragment/')), entry, pages: 255 }).join('\n'),
			/no page fragments/,
		);
		assert.match(
			pagefindIndexIssues({ files: files.filter((file) => !file.startsWith('index/')), entry, pages: 255 }).join('\n'),
			/no word index/,
		);
		assert.match(
			pagefindIndexIssues({ files: files.filter((file) => !file.endsWith('.pagefind')), entry, pages: 255 }).join('\n'),
			/no search wasm/,
		);
	});

	it('rejects an entry file that is not a Pagefind entry', () => {
		assert.match(pagefindIndexIssues({ files, entry: null, pages: 255 }).join('\n'), /pagefind-entry\.json/);
		assert.match(pagefindIndexIssues({ files, entry: { version: '1.5.2' }, pages: 255 }).join('\n'), /languages/);
		assert.match(
			pagefindIndexIssues({ files, entry: { version: '1.5.2', languages: { en: {} } }, pages: 255 }).join('\n'),
			/page_count/,
		);
	});
});

describe('the search UI on the built pages (delivery.md §10.8)', () => {
	const page = (path: string, body = '<site-search></site-search>') => ({ path, html: `<html><body>${body}</body></html>` });

	it('accepts pages that mount the UI, redirect stubs aside', () => {
		const issues = searchUiIssues([
			page('docs/index.html'),
			page('index.html', '<meta http-equiv="refresh" content="0;url=/docs/">'),
		]);
		assert.deepEqual(issues, []);
	});

	it('reports a page that never asks the index for results', () => {
		const issues = searchUiIssues([page('docs/index.html'), page('404.html', '<html></html>')]);
		assert.equal(issues.length, 1);
		assert.match(issues[0], /dist\/404\.html carries no `<site-search`/);
	});

	it('refuses to pass when there is no rendered page at all', () => {
		assert.match(
			searchUiIssues([page('index.html', '<meta http-equiv="refresh">')]).join('\n'),
			/no rendered HTML page/,
		);
	});
});
