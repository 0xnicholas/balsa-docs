/**
 * Snippet drift — the contract from content-boundary.md §4: balsats-docs owns the page
 * text, balsa-framework owns the source, and the pinned ref is the single contract point.
 * Code blocks copied from the framework carry a provenance marker immediately above the
 * fence:
 *
 *     <!-- balsa:verbatim file="examples/minimal-agent/src/index.ts" lines="12-34" -->
 *     ```ts
 *     …
 *     ```
 *
 * `verbatim` blocks are diffed line by line against that file at the page's ref (the
 * matching `source` pointer's own `ref`, else the pinned ref) and must match — a
 * declared `lines="A-B"` range is the only allowed truncation. `adapted` blocks record
 * the source path without being diffed. A marker that is malformed or not paired with a
 * fence is an error, never a silent skip: an unchecked copy is the failure this gate
 * exists to catch.
 *
 * The wrapper follows the page language (#19): `.md` pages carry the marker as an HTML
 * comment, `.mdx` pages as an MDX expression comment (see `markerWrappers`) — MDX does
 * not accept HTML comments at all (it reads `<!--` as JSX), so a `.mdx` marker written
 * the `.md` way never reaches the parser; it fails the build instead. The pairing is
 * enforced here in both directions (#21): the *other* wrapper is an error too, because in
 * a `.md` page the MDX form is not a comment at all — it renders as visible text.
 *
 * Pure parsing and comparison only; `scripts/check-drift.mjs` reads files and git blobs.
 */

const markerPrefix = 'balsa:';

type MarkerDialect = 'html' | 'mdx';

/**
 * The two marker wrappers, each tied to the page language that can hold it: an HTML
 * comment (`.md`) and its MDX equivalent (`.mdx`, #19). Both render to nothing in their
 * own language, and both sit on the line immediately above the fence.
 */
// The MDX form, spelled out here because a block comment cannot hold it:
//   {/* balsa:adapted file="examples/minimal-agent/src/index.ts" */}
const markerWrappers = [
	{ dialect: 'html', open: '<!--', close: '-->' },
	{ dialect: 'mdx', open: '{/*', close: '*/}' },
] as const satisfies readonly { dialect: MarkerDialect; open: string; close: string }[];

/**
 * The wrapper a page's language accepts. Neither form is a comment in the other language:
 * in `.md` the MDX expression comment is inert text, and in `.mdx` an HTML comment never
 * reaches the content model — it is a JSX parse error at build time.
 */
export function markerDialectOf(pagePath: string): MarkerDialect {
	return pagePath.endsWith('.mdx') ? 'mdx' : 'html';
}

const kinds = ['verbatim', 'adapted'] as const;
export type MarkerKind = (typeof kinds)[number];

/** Repo-relative POSIX path with no escaping segments. */
const filePattern = /^[A-Za-z0-9._@+-]+(?:\/[A-Za-z0-9._@+-]+)*$/;
const fenceOpenerPattern = /^ {0,3}(`{3,}|~{3,})(.*)$/;

export type LineRange = { start: number; end: number };
export type Marker = { kind: MarkerKind; file: string; lines?: LineRange };

export type MarkerParse = null | { marker: Marker } | { errors: string[] };

/** Parse one line as a Balsa provenance marker; `null` = an ordinary line. */
export function parseMarkerComment(line: string, dialect: MarkerDialect = 'html'): MarkerParse {
	const trimmed = line.trim();
	const wrapper = markerWrappers.find(
		({ open, close }) =>
			trimmed.length >= open.length + close.length &&
			trimmed.startsWith(open) &&
			trimmed.endsWith(close),
	);
	if (!wrapper) return null;
	const inner = trimmed.slice(wrapper.open.length, -wrapper.close.length).trim();
	if (!inner.startsWith(markerPrefix)) return null;
	if (wrapper.dialect !== dialect) {
		return { errors: [wrongWrapper(wrapper.dialect, dialect)] };
	}

	const [kind, ...tokens] = inner.slice(markerPrefix.length).split(/\s+/);
	if (!(kinds as readonly string[]).includes(kind)) {
		return { errors: [`expected \`verbatim\` or \`adapted\` after \`balsa:\`, got \`${kind}\``] };
	}

	const attributes = new Map<string, string>();
	for (const token of tokens) {
		const match = /^([a-z-]+)="([^"]*)"$/.exec(token);
		if (!match) {
			return { errors: [`malformed attribute \`${token}\` (expected key="value")`] };
		}
		const [, key, value] = match;
		if (key !== 'file' && key !== 'lines') {
			return { errors: [`unknown attribute \`${key}\` in a balsa marker`] };
		}
		attributes.set(key, value);
	}

	const file = attributes.get('file');
	if (file === undefined || file === '') {
		return { errors: ['`file` is required: the balsa-framework path this block came from'] };
	}
	if (!filePattern.test(file) || file.split('/').some((segment) => segment === '.' || segment === '..')) {
		return {
			errors: [
				`\`file\` must be a repo-relative POSIX path inside balsa-framework, got ${JSON.stringify(file)}`,
			],
		};
	}

	let lines: LineRange | undefined;
	const rawLines = attributes.get('lines');
	if (rawLines !== undefined) {
		const match = /^(\d+)-(\d+)$/.exec(rawLines);
		const start = match ? Number(match[1]) : 0;
		const end = match ? Number(match[2]) : 0;
		if (!match || start < 1 || end < start) {
			return {
				errors: [
					`\`lines\` must be a 1-based inclusive range like "12-34", got ${JSON.stringify(rawLines)}`,
				],
			};
		}
		lines = { start, end };
	}

	return { marker: { kind: kind as MarkerKind, file, lines } };
}

/** The marker never reaches the parser in one of these directions: say why. */
function wrongWrapper(found: MarkerDialect, expected: MarkerDialect): string {
	const detail =
		found === 'mdx'
			? 'the `.mdx` form `{/* balsa:… */}` is not a comment here and renders as visible text'
			: 'MDX cannot parse the `.md` form `<!-- balsa:… -->`, so the build fails instead';
	const write = expected === 'mdx' ? '`{/* balsa:… */}`' : '`<!-- balsa:… -->`';
	const language = expected === 'mdx' ? '.mdx' : '.md';
	return `this page is \`${language}\`: ${detail} — write ${write} (content-boundary.md §4)`;
}

export type MarkedBlock = { marker: Marker; openingLine: number; code: string };

/** Pair every marker with the fenced block that follows it, fence-aware. */
export function markedBlocks(
	markdown: string,
	dialect: MarkerDialect = 'html',
): { blocks: MarkedBlock[]; errors: string[] } {
	const lines = markdown.split('\n');
	const blocks: MarkedBlock[] = [];
	const errors: string[] = [];

	for (let index = 0; index < lines.length; index += 1) {
		const parsed = parseMarkerComment(lines[index], dialect);
		if (parsed === null) {
			// Skip an unmarked fence wholesale: markers inside a code block are content.
			const opener = fenceOpener(lines[index]);
			if (opener) index = closerIndex(lines, index, opener) ?? lines.length;
			continue;
		}
		if ('errors' in parsed) {
			errors.push(...parsed.errors.map((error) => `line ${index + 1}: ${error}`));
			continue;
		}

		const opener = index + 1 < lines.length ? fenceOpener(lines[index + 1]) : null;
		if (!opener) {
			errors.push(
				`line ${index + 1}: marker is not immediately followed by a fenced code block`,
			);
			continue;
		}
		const closer = closerIndex(lines, index + 1, opener);
		if (closer === null) {
			errors.push(`line ${index + 1}: fenced code block is never closed`);
			continue;
		}
		blocks.push({
			marker: parsed.marker,
			openingLine: index + 2,
			code: lines.slice(index + 2, closer).join('\n'),
		});
		index = closer;
	}

	return { blocks, errors };
}

type Fence = { marker: string; length: number };

function fenceOpener(line: string): Fence | null {
	const match = fenceOpenerPattern.exec(line);
	if (!match) return null;
	const marker = match[1][0];
	return { marker, length: match[1].length };
}

function closerIndex(lines: readonly string[], openerIndex: number, opener: Fence): number | null {
	for (let index = openerIndex + 1; index < lines.length; index += 1) {
		const line = lines[index];
		const trimmed = line.trim();
		if (trimmed.length < opener.length || trimmed.length === 0) continue;
		if ([...trimmed].every((character) => character === opener.marker)) return index;
	}
	return null;
}

/** Split file text into lines, dropping the single empty line a trailing newline leaves. */
export function splitLines(text: string): string[] {
	const lines = text.split('\n');
	if (lines.length > 1 && lines.at(-1) === '') lines.pop();
	return lines;
}

export type Comparison =
	| { ok: true }
	| { ok: false; reason: string; detail: string[] };

/** Compare a marked block with the source file (or the declared line range of it). */
export function compareVerbatim(
	sourceLines: readonly string[],
	blockLines: readonly string[],
	lines?: LineRange,
): Comparison {
	if (lines && lines.end > sourceLines.length) {
		return {
			ok: false,
			reason: `line range ${lines.start}-${lines.end} is outside the source file (${sourceLines.length} lines)`,
			detail: [],
		};
	}
	const expected = lines ? sourceLines.slice(lines.start - 1, lines.end) : sourceLines;

	if (expected.length !== blockLines.length) {
		return {
			ok: false,
			reason: `the source has ${expected.length} lines here, the page has ${blockLines.length}`,
			detail: [
				...expected.slice(0, 3).map((line) => `- source: ${line}`),
				...blockLines.slice(0, 3).map((line) => `+ page:   ${line}`),
			],
		};
	}

	for (let index = 0; index < expected.length; index += 1) {
		if (expected[index] !== blockLines[index]) {
			return {
				ok: false,
				reason: `line ${index + 1} differs from the source`,
				detail: [`- source: ${expected[index]}`, `+ page:   ${blockLines[index]}`],
			};
		}
	}

	return { ok: true };
}

export type DriftPage = {
	/** Repo-relative page path, for the red message. */
	path: string;
	markdown: string;
	/** The page's `source` frontmatter pointers; a matching `ref` is the page's lag. */
	sourceRefs?: readonly { file: string; ref?: string }[];
};

/** `(ref, file) → text | null`; null means the file does not exist at that ref. */
export type SourceReader = (ref: string, file: string) => string | null;

export type DriftIssue = {
	page: string;
	line: number | null;
	file: string | null;
	ref: string;
	message: string;
	detail: string[];
};

export type DriftResult = {
	issues: DriftIssue[];
	stats: { pages: number; verbatim: number; adapted: number };
};

/** Diff every marked block of every page against the pinned (or lagged) ref. */
export function checkVerbatimDrift(input: {
	pin: string;
	pages: readonly DriftPage[];
	readSource: SourceReader;
}): DriftResult {
	const issues: DriftIssue[] = [];
	const stats = { pages: input.pages.length, verbatim: 0, adapted: 0 };

	for (const page of input.pages) {
		const { blocks, errors } = markedBlocks(page.markdown, markerDialectOf(page.path));
		for (const error of errors) {
			issues.push({ page: page.path, line: null, file: null, ref: input.pin, message: error, detail: [] });
		}

		for (const block of blocks) {
			const { kind, file, lines } = block.marker;
			if (kind === 'adapted') stats.adapted += 1;
			else stats.verbatim += 1;

			const ref = page.sourceRefs?.find((pointer) => pointer.file === file)?.ref ?? input.pin;
			const source = input.readSource(ref, file);
			if (source === null) {
				issues.push({
					page: page.path,
					line: block.openingLine,
					file,
					ref,
					message: `${kind} source cannot be read at ${ref} — check the path and the pinned ref`,
					detail: [],
				});
				continue;
			}
			if (kind === 'adapted') continue;

			const comparison = compareVerbatim(splitLines(source), splitLines(block.code), lines);
			if (!comparison.ok) {
				issues.push({
					page: page.path,
					line: block.openingLine,
					file,
					ref,
					message: `verbatim block does not match ${file} at ${ref}: ${comparison.reason}`,
					detail: comparison.detail,
				});
			}
		}
	}

	return { issues, stats };
}
