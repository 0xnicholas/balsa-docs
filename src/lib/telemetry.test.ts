import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	codeContextOf,
	cookieWriteIssues,
	telemetryMarkerIssues,
	thirdPartySubresourceIssues,
	type BuiltFile,
} from './telemetry.ts';

/**
 * The zero-telemetry audit (#28, delivery.md §7 / handoff.md O6): no third-party runtime, no
 * analytics / marketing / consent vendor in shipped code, no cookie writes. The gate itself
 * runs over a real `dist/` in `gate-scripts.test.ts`; these cases pin the three rules.
 */

const file = (path: string, text: string): BuiltFile => ({ path, text });

describe('code context (text nodes are not code)', () => {
	it('keeps tags and inline script bodies, drops prose', () => {
		const html = [
			'<body>',
			'<p>We do not use Google Analytics, PostHog or a cookie banner.</p>',
			'<script>window.gtag = undefined;</script>',
			'<style>.x{color:red}</style>',
			'<a href="https://example.com">outbound</a>',
			'</body>',
		].join('');
		const code = codeContextOf(html);
		assert.doesNotMatch(code, /We do not use/);
		assert.match(code, /window\.gtag = undefined;/);
		assert.match(code, /\.x\{color:red\}/);
		assert.match(code, /href="https:\/\/example\.com"/);
	});

	it('keeps attribute values, so a tag that talks about a vendor is still a tag', () => {
		assert.match(codeContextOf('<script src="/matomo.js"></script>'), /src="\/matomo\.js"/);
	});
});

describe('third-party subresources (delivery.md §7 / §3.4)', () => {
	it('accepts same-origin subresources, outbound links and a relative canonical', () => {
		const html = [
			'<script type="module" src="/_astro/app.js"></script>',
			'<link rel="stylesheet" href="/_astro/app.css">',
			'<link rel="canonical" href="/docs/">',
			'<img src="/og.png" srcset="/og.png 1x, /og-2x.png 2x">',
			'<a href="https://github.com/0xnicholas/oribos-framework">framework</a>',
			'<form action="/search/"></form>',
		].join('\n');
		assert.deepEqual(thirdPartySubresourceIssues([file('docs/index.html', html)]), []);
	});

	it('reports a third-party script, a consent vendor preconnect and a pixel', () => {
		const html = [
			'<script src="https://cdn.example.com/analytics.js"></script>',
			'<link rel="preconnect" href="//consent.example.com">',
			'<img src="https://px.example.com/pixel.gif">',
			'<iframe src="https://widget.example.com/"></iframe>',
		].join('\n');
		const issues = thirdPartySubresourceIssues([file('docs/index.html', html)]);
		assert.equal(issues.length, 4);
		assert.match(issues.join('\n'), /cdn\.example\.com\/analytics\.js/);
		assert.match(issues.join('\n'), /consent\.example\.com/);
		assert.match(issues.join('\n'), /px\.example\.com\/pixel\.gif/);
		assert.match(issues.join('\n'), /widget\.example\.com/);
	});

	it('flags an absolute URL on the site\'s own host — the domain is not decided yet', () => {
		const html = '<script src="https://temp-host.example/_astro/app.js"></script>';
		assert.match(
			thirdPartySubresourceIssues([file('docs/index.html', html)]).join('\n'),
			/subresources are addressed from the site root, not by host/,
		);
	});

	it('flags a relative subresource — the page URL decides, not the site root', () => {
		const html = '<script src="_astro/app.js"></script>\n<img src="../og.png">';
		const issues = thirdPartySubresourceIssues([file('docs/index.html', html)]);
		assert.equal(issues.length, 2);
		assert.match(issues.join('\n'), /is a relative reference/);
	});

	it('accepts a self-contained `data:` value', () => {
		assert.deepEqual(
			thirdPartySubresourceIssues([file('docs/index.html', '<img src="data:image/svg+xml,<svg/>">')]),
			[],
		);
	});

	it('leaves an absolute canonical alone once the real domain lands', () => {
		const html = '<link rel="canonical" href="https://docs.oribos.example/docs/">';
		assert.deepEqual(thirdPartySubresourceIssues([file('docs/index.html', html)]), []);
	});
});

describe('vendor markers in shipped code (delivery.md §7)', () => {
	it('accepts our own assets and prose that mentions a vendor', () => {
		const files = [
			file('docs/index.html', '<p>The site runs no PostHog or Google Analytics.</p>'),
			file('_astro/app.js', 'const x = 1; // nothing to see here'),
			file('_astro/app.css', '.katex{color:red}'),
		];
		assert.deepEqual(telemetryMarkerIssues(files), []);
	});

	it('reports a vendor signature in JavaScript, CSS or an inline script', () => {
		const files = [
			file('_astro/legacy.js', 'window.dataLayer=[];gtag("config","G-XXXX");'),
			file('_astro/vendor.css', '@import url(https://cdn.example.com/hotjar.css);'),
			file('docs/index.html', '<script>window.__cfBeacon="/cdn-cgi/beacon.min.js"</script>'),
		];
		const issues = telemetryMarkerIssues(files);
		assert.equal(issues.length, 3);
		assert.match(issues.join('\n'), /Google Analytics \/ Tag Manager signature/);
		assert.match(issues.join('\n'), /Hotjar signature/);
		assert.match(issues.join('\n'), /Cloudflare Web Analytics signature/);
	});

	it('names the consent-banner vendors too', () => {
		const issues = telemetryMarkerIssues([file('_astro/consent.js', 'CookieConsent.init()')]);
		assert.match(issues.join('\n'), /consent banner signature/);
	});
});

describe('cookie writes (delivery.md §7)', () => {
	it('accepts scripts that never touch cookies, and reads', () => {
		assert.deepEqual(cookieWriteIssues([file('_astro/app.js', 'const theme = localStorage.getItem("theme");')]), []);
		assert.deepEqual(cookieWriteIssues([file('_astro/app.js', 'if (document.cookie) console.log("has cookies");')]), []);
	});

	it('reports an assignment, an append and the cookie store API', () => {
		const issues = cookieWriteIssues([
			file('_astro/a.js', 'document.cookie = "uid=1; path=/";'),
			file('_astro/b.js', 'document.cookie += "x=1";'),
			file('_astro/c.js', 'await cookieStore.set("uid", "1");'),
		]);
		assert.equal(issues.length, 3);
		assert.match(issues.join('\n'), /writes a cookie/);
	});

	it('sees a write inside an inline `<script>` of a page (its code context)', () => {
		const html = '<p>Prose that mentions document.cookie = "x".</p><script>document.cookie = "sid=1";</script>';
		const issues = cookieWriteIssues([file('docs/index.html', codeContextOf(html))]);
		assert.equal(issues.length, 1);
		assert.match(issues.join('\n'), /docs\/index\.html: `document\.cookie = ` writes a cookie/);
	});
});
