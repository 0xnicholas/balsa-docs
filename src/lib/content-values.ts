/**
 * Cross-file frontmatter rules (delivery.md §5①, stack.md §5/§13.1). The Zod schema in
 * `src/lib/frontmatter.ts` owns per-page shape; the rules here need the whole content
 * tree, or the balsa-framework export surface, so they live in a repo gate instead:
 *
 * - `subtype` only on Guides pages, `order` unique inside a family (ia.md §4);
 * - `generated: true` exactly on the generated API tree's pages (api-reference.md §2);
 * - `packages` agrees with `@balsa/core`'s real `exports` at the pinned ref, and the
 *   hardcoded `packages` domain equals that surface (content-boundary.md §6);
 * - `source` pointers are well-formed, with the effective ref (page lag or the pin).
 *
 * Resolving pointers against the framework checkout is the CLI's job
 * (`scripts/check-content.mjs`); this module stays pure.
 */

import { apiTreeRoute, isApiTreeRoute } from './api-tree.ts';
import { familyOf } from './pages.ts';
import { isRecord } from './guards.ts';
import { commitShaPattern } from './frontmatter.ts';

export type ContentPage = {
	/** Repo-relative path, for messages. */
	path: string;
	route: string;
	frontmatter: Record<string, unknown>;
};

export type ValueIssue = { page: string; message: string };
export type SourcePointer = { page: string; file: string; ref: string };

/** `subtype` drives Guides sub-grouping only (ia.md §4). */
export function subtypeIssues(pages: readonly ContentPage[]): ValueIssue[] {
	const issues: ValueIssue[] = [];
	for (const page of pages) {
		const subtype = page.frontmatter.subtype;
		if (subtype === undefined) continue;
		const family = familyOf(page.route);
		if (family === 'guides') continue;
		issues.push({
			page: page.path,
			message: `\`subtype: ${String(subtype)}\` is Guides-only (ia.md §4) — ${page.route} is ${
				family === null ? 'not inside one of the five families' : `in family \`${family}\``
			}`,
		});
	}
	return issues;
}

/** `order` positions a page inside its family and must be unique there (ia.md §4). */
export function orderIssues(pages: readonly ContentPage[]): ValueIssue[] {
	const issues: ValueIssue[] = [];
	const seen = new Map<string, Map<number, string>>();

	for (const page of pages) {
		const order = page.frontmatter.order;
		if (typeof order !== 'number' || !Number.isInteger(order)) continue;

		const family = familyOf(page.route);
		if (family === null) {
			issues.push({
				page: page.path,
				message: `\`order\` positions a page inside a family (ia.md §4) — ${page.route} is not in one`,
			});
			continue;
		}

		const byOrder = seen.get(family) ?? new Map<number, string>();
		const previous = byOrder.get(order);
		if (previous !== undefined) {
			issues.push({
				page: page.path,
				message: `order ${order} is used twice in family \`${family}\`: ${previous} and ${page.path}`,
			});
			continue;
		}
		byOrder.set(order, page.path);
		seen.set(family, byOrder);
	}

	return issues;
}

/**
 * The generated marker belongs to the generated tree and to nothing else (api-reference.md
 * §2): a page under `/docs/reference/api/**` must carry it — that is what exempts it from
 * the authored field table — and no authored page may, since the marker would let it skip
 * `description`/`packages` at build time.
 */
export function generatedIssues(pages: readonly ContentPage[]): ValueIssue[] {
	const issues: ValueIssue[] = [];

	for (const page of pages) {
		const inTree = isApiTreeRoute(page.route);
		const marked = page.frontmatter.generated === true;
		if (inTree && !marked) {
			issues.push({
				page: page.path,
				message: `a generated page must carry \`generated: true\` (the pipeline's normalize step writes it, api-reference.md §4)`,
			});
		} else if (!inTree && marked) {
			issues.push({
				page: page.path,
				message: `\`generated: true\` is reserved for ${apiTreeRoute}** (api-reference.md §2) — authored pages carry the field table instead`,
			});
		}
	}

	return issues;
}

/** `{ '.': …, './agent': … }` → `['@balsa/core', '@balsa/core/agent']` (content-boundary §6). */
export function packageValuesFromExports(
	exports: Record<string, unknown>,
	packageName: string,
): string[] {
	return Object.keys(exports).map((key) =>
		key === '.' ? packageName : `${packageName}/${key.replace(/^\.\//, '')}`,
	);
}

/**
 * The `packages` domain must equal the pin's export surface — the check that keeps
 * `src/lib/frontmatter.ts` honest — and every page value must sit inside it.
 */
export function exportSurfaceIssues(
	pages: readonly ContentPage[],
	input: { exports: Record<string, unknown>; packageName: string; domain: readonly string[] },
): ValueIssue[] {
	const issues: ValueIssue[] = [];
	const surface = packageValuesFromExports(input.exports, input.packageName);

	const missingFromDomain = surface.filter((value) => !input.domain.includes(value));
	const notExported = input.domain.filter((value) => !surface.includes(value));
	if (missingFromDomain.length > 0 || notExported.length > 0) {
		issues.push({
			page: 'src/lib/frontmatter.ts',
			message: [
				`the \`packages\` domain in src/lib/frontmatter.ts must equal ${input.packageName}'s export surface at the pinned ref (content-boundary.md §6)`,
				missingFromDomain.length > 0 ? `missing: ${missingFromDomain.join(', ')}` : null,
				notExported.length > 0 ? `not exported: ${notExported.join(', ')}` : null,
			]
				.filter(Boolean)
				.join(' — '),
		});
	}

	for (const page of pages) {
		// Generated API pages are not authored content: they carry the marker instead of the
		// field table, and they are not part of the package-to-page map (api-reference.md §2).
		if (page.frontmatter.generated === true) continue;

		const packages = page.frontmatter.packages;
		if (!Array.isArray(packages)) {
			issues.push({
				page: page.path,
				message: '`packages` must be an array of export-surface values (content-boundary.md §6)',
			});
			continue;
		}
		for (const value of packages) {
			if (typeof value !== 'string' || !surface.includes(value)) {
				issues.push({
					page: page.path,
					message: `\`packages\` value ${JSON.stringify(value)} is not part of ${input.packageName}'s export surface at the pinned ref`,
				});
			}
		}
	}

	return issues;
}

/** Well-formed `source` pointers, each with the ref it must resolve at. */
export function sourcePointerIssues(
	pages: readonly ContentPage[],
	pin: string,
): { pointers: SourcePointer[]; issues: ValueIssue[] } {
	const pointers: SourcePointer[] = [];
	const issues: ValueIssue[] = [];

	for (const page of pages) {
		const source = page.frontmatter.source;
		if (source === undefined) continue;
		if (!Array.isArray(source)) {
			issues.push({
				page: page.path,
				message: '`source` must be an array of `{ file }` pointers (ia.md §4)',
			});
			continue;
		}

		for (const pointer of source) {
			const file = isRecord(pointer) ? pointer.file : undefined;
			const ref = isRecord(pointer) ? pointer.ref : undefined;
			if (typeof file !== 'string' || file === '') {
				issues.push({
					page: page.path,
					message: 'every `source` pointer needs a non-empty `file` path inside balsa-framework',
				});
				continue;
			}
			if (ref !== undefined && (typeof ref !== 'string' || !commitShaPattern.test(ref))) {
				issues.push({
					page: page.path,
					message: `\`source.ref\` for ${file} must be a full 40-character lowercase commit SHA`,
				});
				continue;
			}
			pointers.push({ page: page.path, file, ref: ref ?? pin });
		}
	}

	return { pointers, issues };
}
