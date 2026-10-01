/**
 * Zero-telemetry audit (#28) — delivery.md §7 / handoff.md §3.5 O6: "不装任何分析脚本、不引入
 * 同意横幅、不设第三方 cookie"，O6 的完成判据就是这三条。The spec states the ruling; this module
 * is the part of it that can be checked mechanically, against the *built* site:
 *
 *   1. **no third-party subresource** — every `<script src>` / `<iframe src>` / `<img src>` /
 *      `<link href>` / … in the built pages is served from the site's own asset directory. A
 *      hard-coded absolute URL would also smuggle the temporary platform domain into the
 *      output, which delivery.md §3.4 forbids until the real domain lands (#29);
 *   2. **no vendor marker** — no analytics / marketing / consent-vendor signature in the
 *      *code* of the shipped HTML, JS or CSS. Text nodes are stripped first: a page may
 *      legitimately *talk about* a vendor, and that is not a tracker;
 *   3. **no cookie writes and no consent banner** — no `document.cookie` assignment in the
 *      shipped JavaScript, no consent-UI marker (the vendor list in ② covers the banner
 *      libraries; the generic patterns here catch a hand-rolled one).
 *
 * What it cannot see is what the *host* adds (a platform-injected beacon, a header set at the
 * edge). That is platform-side and belongs to the same deployment checklist as delivery.md §10.
 */

/** A built artifact to scan: its dist-relative path and its text. */
export type BuiltFile = { path: string; text: string };

/** Subresource attributes, per tag. `a` is absent on purpose: outbound links are content. */
const subresourceTags = [
	['script', ['src']],
	['iframe', ['src']],
	['img', ['src', 'srcset']],
	['source', ['src', 'srcset']],
	['video', ['src', 'poster']],
	['audio', ['src']],
	['embed', ['src']],
	['object', ['data']],
	['form', ['action']],
] as const;

/**
 * `<link>` relations that load something (or open a connection). `canonical`, `alternate`,
 * `sitemap` and friends are *pointers*: `canonical` becomes an absolute URL the moment the
 * real domain lands (#29, delivery.md §3.4), and that is not a third-party runtime.
 */
const subresourceLinkRels = new Set([
	'stylesheet',
	'preload',
	'modulepreload',
	'prefetch',
	'preconnect',
	'dns-prefetch',
	'icon',
	'apple-touch-icon',
	'manifest',
]);

const absoluteUrlPattern = /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:)?\/\//;
/** Self-contained values that are not a fetch of another resource. */
const inlineUrlPattern = /^(?:data|blob):/i;

/**
 * Known analytics, marketing and consent-vendor signatures. The list is a red gate, not a
 * taxonomy: it names the vendors a docs site would plausibly reach for, and the message it
 * produces says what to do when a real product name has to appear in shipped code.
 */
export const vendorMarkers: readonly { vendor: string; pattern: RegExp }[] = [
	{ vendor: 'Google Analytics / Tag Manager', pattern: /googletagmanager|google-analytics|\bgtag\(|\bga\(\s*['"]|analytics\.js/i },
	{ vendor: 'Plausible', pattern: /plausible\.io/i },
	{ vendor: 'Umami', pattern: /umami\.is/i },
	{ vendor: 'GoatCounter', pattern: /goatcounter/i },
	{ vendor: 'PostHog', pattern: /posthog/i },
	{ vendor: 'Matomo / Piwik', pattern: /matomo|piwik/i },
	{ vendor: 'Mixpanel', pattern: /mixpanel/i },
	{ vendor: 'Amplitude', pattern: /amplitude\.com/i },
	{ vendor: 'Segment', pattern: /segment\.(?:com|io)/i },
	{ vendor: 'Hotjar', pattern: /hotjar/i },
	{ vendor: 'FullStory', pattern: /fullstory/i },
	{ vendor: 'Microsoft Clarity', pattern: /clarity\.ms/i },
	{ vendor: 'Meta Pixel', pattern: /\bfbq\(|fbevents|connect\.facebook\.net/i },
	{ vendor: 'Google Ads', pattern: /adsbygoogle|doubleclick|googlesyndication/i },
	{ vendor: 'Cloudflare Web Analytics', pattern: /cloudflareinsights|beacon\.min\.js/i },
	{ vendor: 'consent banner', pattern: /cookiebot|onetrust|cookieyes|termly|iubenda|cookie-?consent|cookie-?banner|consent-management/i },
];

/** `document.cookie = …` (an assignment, not a read) and the `cookieStore` write API. */
const cookieWritePattern = /document\.cookie\s*(?:=[^=]|\+=)|cookieStore\s*\.\s*(?:set|delete)\s*\(/;

/**
 * The code part of an HTML document: tags and the bodies of inline `<script>` / `<style>`
 * survive, text nodes between tags are dropped. Attribute values are kept — which is what the
 * subresource rule needs — and a `>` inside an attribute value would end the tag early, so
 * this is deliberately a scanner for *our* output, not a general HTML parser.
 */
export function codeContextOf(html: string): string {
	let code = '';
	let index = 0;
	for (const match of html.matchAll(/<(script|style)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)) {
		const block = match[0];
		const openingTag = block.slice(0, block.indexOf('>') + 1);
		code += `${tagsOf(html.slice(index, match.index))} ${openingTag} ${match[2]}`;
		index = (match.index ?? 0) + block.length;
	}
	return `${code} ${tagsOf(html.slice(index))}`;
}

/** Tags only: everything between a `>` and the next `<` is a text node. */
function tagsOf(segment: string): string {
	return segment.replace(/>[^<]*/g, '>');
}

/**
 * Third-party (or otherwise unresolvable) subresources in the built pages. Two shapes are
 * flagged: an **absolute URL** (a third-party runtime, or a hard-coded host — the domain is
 * undecided, delivery.md §3.4) and a **relative path** (the page's own URL decides what it
 * points at, so it is not a site-root reference like every other asset in the output).
 * `data:` / `blob:` values are self-contained and pass.
 */
export function thirdPartySubresourceIssues(pages: readonly BuiltFile[]): string[] {
	const issues: string[] = [];

	for (const { path, text } of pages) {
		for (const [tag, attributes] of subresourceTags) {
			for (const attribute of attributes) {
				const pattern = new RegExp(`<${tag}\\b[^>]*?\\b${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'gi');
				for (const match of text.matchAll(pattern)) {
					for (const url of candidateUrls(match[1] ?? match[2] ?? '', attribute)) {
						const problem = subresourceProblem(url);
						if (problem === null) continue;
						issues.push(`${path}: \`<${tag} ${attribute}="${url}">\` ${problem}`);
					}
				}
			}
		}

		for (const match of text.matchAll(/<link\b[^>]*>/gi)) {
			const tag = match[0];
			const rel = (attributeValue(tag, 'rel') ?? '')
				.toLowerCase()
				.split(/\s+/)
				.filter((token) => subresourceLinkRels.has(token));
			if (rel.length === 0) continue;
			const href = (attributeValue(tag, 'href') ?? '').trim();
			const problem = subresourceProblem(href);
			if (problem === null) continue;
			issues.push(`${path}: \`<link rel="${rel.join(' ')}" href="${href}">\` ${problem}`);
		}
	}

	return issues;
}

/** Why a subresource value cannot ship, or `null` when it is a site-root reference. */
function subresourceProblem(url: string): string | null {
	if (url === '' || url.startsWith('#') || inlineUrlPattern.test(url)) return null;
	// Protocol-relative first: `//host/x` starts with a slash but is not a site-root path.
	if (absoluteUrlPattern.test(url)) {
		return `loads from outside the asset directory — the site ships no third-party runtime (delivery.md §7) and no absolute host until the real domain lands (§3.4)`;
	}
	if (url.startsWith('/')) return null;
	return 'is a relative reference — built pages address their assets from the site root (delivery.md §4.3) like every other link';
}

/** The URLs an attribute value carries: one for `src`, one per candidate for `srcset`. */
function candidateUrls(value: string, attribute: string): string[] {
	const candidates = attribute === 'srcset' ? value.split(',') : [value];
	return candidates.map((candidate) => candidate.trim().split(/\s+/)[0]).filter((url) => url !== '');
}

/** One attribute value from a tag string, or `null` when the tag does not carry it. */
function attributeValue(tag: string, attribute: string): string | null {
	const match = tag.match(new RegExp(`\\b${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
	return match === null ? null : match[1] ?? match[2] ?? '';
}

/**
 * Vendor markers in the code of the shipped files. HTML is reduced to its code context first,
 * so a page that discusses analytics is not a hit; JS and CSS are scanned as they are.
 */
export function telemetryMarkerIssues(files: readonly BuiltFile[]): string[] {
	const issues: string[] = [];

	for (const { path, text } of files) {
		const code = path.endsWith('.html') ? codeContextOf(text) : text;
		for (const { vendor, pattern } of vendorMarkers) {
			const match = code.match(pattern);
			if (match === null) continue;
			issues.push(`${path}: \`${match[0]}\` is a ${vendor} signature in shipped code — the site ships zero telemetry (delivery.md §7)`);
		}
	}

	return issues;
}

/**
 * Cookie writes in shipped code — the `cookieStore` / `document.cookie` assignment shapes.
 * Callers pass the *code* of each shipped file: JavaScript as it is, HTML already reduced by
 * `codeContextOf` so an inline `<script>` counts (a banner can hide there) while prose does not.
 */
export function cookieWriteIssues(scripts: readonly BuiltFile[]): string[] {
	const issues: string[] = [];

	for (const { path, text } of scripts) {
		const match = text.match(cookieWritePattern);
		if (match === null) continue;
		issues.push(`${path}: \`${match[0]}\` writes a cookie — the site sets no cookies, first- or third-party (delivery.md §7)`);
	}

	return issues;
}
