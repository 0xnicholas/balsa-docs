/**
 * Retired names (#48, delivery.md §5①): the balsats → oribos rename retired a brand, a
 * set of repository names, an npm scope and two domains. Authored content wears current
 * names only, and this rule is what keeps a stale one from landing silently — the same
 * shape as the site's other cross-file values (content-values.ts).
 *
 * The one deliberate exception is the npm scope window: 0.5.0 is published under
 * `@balsats/*` and that fact may be stated — but only on a line that calls it the
 * previous/old scope, so an accidental stale install line still goes red.
 */

/** One page of authored content, as the scan sees it. */
export type ScannedPage = { path: string; text: string };

export type RetiredIssue = { page: string; line: number; token: string; message: string };

/** `@balsats…` / `balsats…` first, then `balsa…` — the longer name wins the match. */
const retiredPattern = /@?balsats[A-Za-z0-9._-]*|balsa[A-Za-z0-9._-]*/gi;

/** `@balsats/<name>` on a line that names the scope as previous/old is the allowed form. */
const scopeWindowPattern = /(?:previous|old)\s+scope/i;
const scopeTokenPattern = /@balsats\/[A-Za-z0-9._-]*/g;

/** Every line of every page that still carries a retired name. */
export function retiredNameIssues(pages: readonly ScannedPage[]): RetiredIssue[] {
	const issues: RetiredIssue[] = [];

	for (const page of pages) {
		page.text.split('\n').forEach((line, index) => {
			const scannable = scopeWindowPattern.test(line)
				? line.replace(scopeTokenPattern, '')
				: line;
			for (const match of scannable.matchAll(retiredPattern)) {
				const token = match[0].replace(/[._-]+$/, '');
				issues.push({
					page: page.path,
					line: index + 1,
					token,
					message: `retired name \`${token}\` — content wears current names only (balsats → oribos, #48); the published 0.5.0 scope may appear only on a line that names it the previous/old scope`,
				});
			}
		});
	}

	return issues;
}
