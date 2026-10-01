/**
 * Link integrity (#28) — delivery.md §5 ③: "链接检查（含锚点存活）". The selection was left to
 * implementation by the spec; this module is the self-written half of it (no new dependency,
 * same shape as every other gate in `scripts/`), and it is the piece that reads the *built*
 * site: a link is only checkable once the routes it points at exist as files.
 *
 * The rules, and what they deliberately leave out:
 *
 *   - **Scope = the built HTML pages.** Every `<a href>` in every `dist/**\/*.html` is either
 *     external (skipped — the gate never touches the network), a same-page fragment, or a
 *     root-relative path that has to resolve to a file in the asset directory. Anchors have to
 *     resolve to an `id` (or a legacy `name`) on the target page.
 *   - **`.md` twins are not parsed.** They are the source text verbatim (agent-surface.md §2),
 *     so their links are the same source links the rendered page carries; the twins' own links
 *     (`/llms.txt` → pages) are covered by agent-surface.md §9's assertion ②. Parsing Markdown
 *     a second time would add a fence-aware parser for no extra coverage.
 *   - **External links are not followed.** Reachability of `https://…` is not a repository
 *     property, and a gate that needs the network is a gate that flakes (delivery.md §5 keeps
 *     the red lines in-repo).
 *
 * `targetCandidates` mirrors the host's resolution order (delivery.md §2.3): a directory index
 * for a trailing-slash path, then `…/index.html`, then `….html`, then the file itself — twins
 * (`.md`) and assets (`/favicon.svg`, `/_astro/*`) land in the last case.
 */

/** One anchor as found in a built page: `page` is dist-relative, `href` is the raw value. */
export type PageLink = { page: string; href: string };

/** A classified `href` — see `classifyHref`. */
export type LinkRef =
	| { kind: 'external'; href: string }
	| { kind: 'fragment'; fragment: string }
	| { kind: 'internal'; path: string; fragment: string | null }
	| { kind: 'other'; href: string };

/** What a link resolves against: the asset directory's files and each page's anchors. */
export type DistIndex = {
	/** dist-relative file paths, forward slashes (`docs/index.html`, `favicon.svg`). */
	files: ReadonlySet<string>;
	/** The `id` / legacy `<a name>` anchors of one dist-relative HTML file. */
	idsOf: (file: string) => ReadonlySet<string>;
};

const hrefPattern = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const schemePattern = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
/** `javascript:` is not a link: it is reported rather than skipped as “external”. */
const scriptSchemePattern = /^javascript:/i;

/** Every `<a href>` value in a built page, in document order. */
export function anchorHrefs(html: string): string[] {
	const hrefs: string[] = [];
	for (const match of html.matchAll(hrefPattern)) {
		hrefs.push(match[1] ?? match[2] ?? '');
	}
	return hrefs;
}

/**
 * The anchors of one page: every `id`, plus the legacy `<a name>` form (`<meta name>` and form
 * fields are not anchors). The gate reads this from the built file — it is the only thing the
 * fragment half of `linkIssues` needs to know about a page, so it lives here rather than in the
 * script.
 */
export function anchorsInHtml(html: string): Set<string> {
	const anchors = new Set<string>();
	for (const match of html.matchAll(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
		anchors.add(match[1] ?? match[2] ?? '');
	}
	for (const match of html.matchAll(/<a\b[^>]*?\bname\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
		anchors.add(match[1] ?? match[2] ?? '');
	}
	return anchors;
}

/**
 * Classify one `href`. An empty value and a bare `#` are fragments with no anchor to check;
 * text fragments (`#:~:text=…`) carry no `id` either, so they collapse to the same case.
 * `javascript:` is neither a page nor an outbound link — it is reported; other schemes
 * (`mailto:`, `tel:`, `data:`) are external and skipped.
 */
export function classifyHref(href: string): LinkRef {
	if (href === '' || href.startsWith('#')) return { kind: 'fragment', fragment: anchorOf(href) };
	if (scriptSchemePattern.test(href)) return { kind: 'other', href };
	if (schemePattern.test(href) || href.startsWith('//')) return { kind: 'external', href };
	if (!href.startsWith('/')) return { kind: 'other', href };

	const withoutQuery = href.split('?')[0];
	const [path, hash] = splitFragment(withoutQuery);
	return { kind: 'internal', path: decode(path), fragment: hash === null ? null : anchorOf(`#${hash}`) };
}

/** The anchor part of a fragment, with the text-fragment directive and the `#` removed. */
function anchorOf(fragment: string): string {
	const anchor = decode(fragment.replace(/^#/, ''));
	return anchor.startsWith(':~:') ? '' : anchor;
}

/** Split on the first `#`, keeping whether a fragment was present at all. */
function splitFragment(value: string): [string, string | null] {
	const index = value.indexOf('#');
	return index === -1 ? [value, null] : [value.slice(0, index), value.slice(index + 1)];
}

/** Percent-decode, keeping the raw value when it is not valid encoding (the link is still checked). */
function decode(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

/**
 * The dist-relative files a root-relative path can be served from, in the order the host
 * tries them (delivery.md §2.3 / §4.3). The path is expected to have no query or fragment.
 */
export function targetCandidates(path: string): string[] {
	const relative = path.replace(/^\/+/, '');
	if (relative === '') return ['index.html'];
	if (relative.endsWith('/')) return [`${relative}index.html`];
	return [`${relative}/index.html`, `${relative}.html`, relative];
}

/**
 * Every link problem in one run: relative links (built pages address the site from the root),
 * targets nothing serves, and fragments that match no anchor. External links are skipped.
 */
export function linkIssues(links: readonly PageLink[], index: DistIndex): string[] {
	const issues: string[] = [];

	for (const { page, href } of links) {
		const ref = classifyHref(href);
		if (ref.kind === 'external') continue;

		if (ref.kind === 'other') {
			issues.push(
				`${page}: \`${href}\` is neither root-relative nor external — built pages address the site from the root (delivery.md §4.3)`,
			);
			continue;
		}

		const file = ref.kind === 'fragment' ? page : targetCandidates(ref.path).find((candidate) => index.files.has(candidate));
		if (file === undefined) {
			issues.push(`${page}: \`${href}\` resolves to no file in the asset directory — nothing serves that path`);
			continue;
		}

		const fragment = ref.kind === 'fragment' ? ref.fragment : ref.fragment ?? '';
		if (fragment === '' || file.endsWith('.html') === false) continue;

		if (!index.idsOf(file).has(fragment)) {
			issues.push(`${page}: \`${href}\` has no anchor \`#${fragment}\` on ${file} — the fragment matches no \`id\``);
		}
	}

	return issues;
}
