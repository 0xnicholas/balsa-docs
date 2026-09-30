import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	checkVerbatimDrift,
	compareVerbatim,
	markedBlocks,
	parseMarkerComment,
	splitLines,
	type SourceReader,
} from './drift.ts';

/**
 * The snippet drift contract (content-boundary.md §4): code blocks copied from
 * balsa-framework carry a provenance marker; `verbatim` blocks are diffed block by block
 * against the pinned ref, `adapted` blocks only record their source path. These cases
 * pin the marker grammar, the fence pairing, and the comparison — the CI gate that makes
 * "改框架源文件 → 未升钉页面红" true.
 */

const marker = (body: string) => `<!-- balsa:${body} -->`;
const errorsOf = (line: string) => {
	const parsed = parseMarkerComment(line);
	assert.ok(parsed && 'errors' in parsed, `${line} must be rejected`);
	return parsed.errors.join('\n');
};

describe('provenance marker grammar', () => {
	it('parses a verbatim marker with a truncation range', () => {
		assert.deepEqual(
			parseMarkerComment(marker('verbatim file="examples/minimal-agent/src/index.ts" lines="12-34"')),
			{
				marker: {
					kind: 'verbatim',
					file: 'examples/minimal-agent/src/index.ts',
					lines: { start: 12, end: 34 },
				},
			},
		);
	});

	it('parses a full-file verbatim marker and an adapted marker', () => {
		assert.deepEqual(parseMarkerComment(marker('verbatim file="README.md"')), {
			marker: { kind: 'verbatim', file: 'README.md', lines: undefined },
		});
		assert.deepEqual(parseMarkerComment(marker('adapted file="docs/architecture/agents.md"')), {
			marker: { kind: 'adapted', file: 'docs/architecture/agents.md', lines: undefined },
		});
	});

	it('tolerates surrounding whitespace', () => {
		assert.deepEqual(parseMarkerComment(`\t${marker('verbatim file="a.ts" lines="1-2"')}  `), {
			marker: { kind: 'verbatim', file: 'a.ts', lines: { start: 1, end: 2 } },
		});
	});

	it('ignores ordinary HTML comments and markers embedded in prose', () => {
		assert.equal(parseMarkerComment('<!-- a normal comment -->'), null);
		assert.equal(parseMarkerComment('Some prose with a <!-- balsa:verbatim --> inline'), null);
		assert.equal(parseMarkerComment('```ts'), null);
	});

	it('rejects a marker that is missing its file or carries an unknown attribute', () => {
		assert.match(errorsOf(marker('verbatim')), /file/);
		assert.match(errorsOf(marker('verbatim file="a.ts" ref="deadbeef"')), /ref/);
		assert.match(errorsOf(marker('copied file="a.ts"')), /verbatim|adapted/);
	});

	it('rejects malformed line ranges', () => {
		for (const lines of ['12', '12-', '-12', '0-3', '5-2', 'a-b', '1.5-2']) {
			assert.match(errorsOf(marker(`verbatim file="a.ts" lines="${lines}"`)), /lines/, `lines="${lines}"`);
		}
	});

	it('rejects paths that could escape the framework checkout', () => {
		for (const file of ['/etc/passwd', '../balsa-docs/redirects.json', 'docs/../src/index.ts', 'a b.ts']) {
			assert.match(errorsOf(marker(`verbatim file="${file}"`)), /file/, `file="${file}"`);
		}
	});
});

describe('marked code blocks', () => {
	const page = (body: string) => `---\ntitle: Fixture\n---\n\n${body}\n`;

	it('pairs a marker with the fenced block that follows it', () => {
		const { blocks, errors } = markedBlocks(
			page(
				[
					marker('verbatim file="a.ts" lines="1-2"'),
					'```ts',
					'const a = 1;',
					'const b = 2;',
					'```',
				].join('\n'),
			),
		);
		assert.deepEqual(errors, []);
		assert.equal(blocks.length, 1);
		assert.equal(blocks[0].code, 'const a = 1;\nconst b = 2;');
		assert.equal(blocks[0].openingLine, 6, 'fence line, 1-based, for the red message');
	});

	it('accepts tildes and longer closers, and finds every block', () => {
		const { blocks, errors } = markedBlocks(
			page(
				[
					marker('verbatim file="a.ts"'),
					'~~~ts',
					'const a = 1;',
					'~~~~',
					'',
					marker('adapted file="b.ts"'),
					'```ts',
					'const b = 2;',
					'```',
				].join('\n'),
			),
		);
		assert.deepEqual(errors, []);
		assert.deepEqual(
			blocks.map((block) => [block.marker.kind, block.code]),
			[
				['verbatim', 'const a = 1;'],
				['adapted', 'const b = 2;'],
			],
		);
	});

	it('ignores unmarked fences, and markers that sit inside a fence', () => {
		const { blocks, errors } = markedBlocks(
			page(
				['```md', marker('verbatim file="trap.ts"'), '```', '', '```ts', 'const a = 1;', '```'].join(
					'\n',
				),
			),
		);
		assert.deepEqual(errors, []);
		assert.deepEqual(blocks, []);
	});

	it('refuses a marker that is not immediately followed by a fence', () => {
		const { errors } = markedBlocks(
			page([marker('verbatim file="a.ts"'), '', '```ts', 'x', '```'].join('\n')),
		);
		assert.equal(errors.length, 1);
		assert.match(errors[0], /not immediately followed/);
	});

	it('refuses an unclosed fence', () => {
		const { errors } = markedBlocks(page([marker('verbatim file="a.ts"'), '```ts', 'x'].join('\n')));
		assert.equal(errors.length, 1);
		assert.match(errors[0], /never closed/);
	});

	it('reports marker syntax errors with their line', () => {
		const { errors } = markedBlocks(page([marker('verbatim'), '```ts', 'x', '```'].join('\n')));
		assert.equal(errors.length, 1);
		assert.match(errors[0], /line 5/);
	});
});

describe('verbatim comparison', () => {
	const source = ['// header', 'const a = 1;', 'const b = 2;', '// footer'];

	it('accepts a whole-file match, ignoring one trailing newline', () => {
		assert.deepEqual(splitLines('a\nb\n'), ['a', 'b']);
		assert.equal(compareVerbatim(source, source, undefined).ok, true);
	});

	it('accepts a declared truncation range', () => {
		assert.equal(
			compareVerbatim(source, ['const a = 1;', 'const b = 2;'], { start: 2, end: 3 }).ok,
			true,
		);
	});

	it('rejects changed content and names the first differing line', () => {
		const result = compareVerbatim(source, ['// header', 'const a = 99;', 'const b = 2;', '// footer'], undefined);
		assert.equal(result.ok, false);
		assert.match(result.reason, /line 2/);
		assert.match(result.detail.join('\n'), /const a = 1;/);
		assert.match(result.detail.join('\n'), /const a = 99;/);
	});

	it('rejects a line-count mismatch, e.g. the source grew after the pin', () => {
		const result = compareVerbatim(source, ['// header', 'const a = 1;'], undefined);
		assert.equal(result.ok, false);
		assert.match(result.reason, /4 lines/);
	});

	it('rejects a range that runs past the end of the file', () => {
		const result = compareVerbatim(source, ['// footer'], { start: 4, end: 9 });
		assert.equal(result.ok, false);
		assert.match(result.reason, /outside/);
	});
});

describe('drift check', () => {
	const pinA = 'a'.repeat(40);
	const pinB = 'b'.repeat(40);

	const pageWith = (body: string, sourceRefs?: { file: string; ref?: string }[]) => ({
		path: 'src/content/docs/docs/guides/minimal-agent.md',
		markdown: `---\ntitle: Fixture\n---\n\n${body}`,
		sourceRefs,
	});

	const readFrom =
		(files: Record<string, string>): SourceReader =>
		(ref, file) =>
			Object.hasOwn(files, `${ref}:${file}`) ? files[`${ref}:${file}`] : null;

	it('is green when every verbatim block matches the pinned source', () => {
		const result = checkVerbatimDrift({
			pin: pinA,
			pages: [
				pageWith(
					[
						marker('verbatim file="examples/minimal-agent/src/index.ts" lines="1-2"'),
						'```ts',
						'const a = 1;',
						'const b = 2;',
						'```',
					].join('\n'),
				),
			],
			readSource: readFrom({
				[`${pinA}:examples/minimal-agent/src/index.ts`]: 'const a = 1;\nconst b = 2;\nconst c = 3;\n',
			}),
		});
		assert.deepEqual(result.issues, []);
		assert.deepEqual(result.stats, { pages: 1, verbatim: 1, adapted: 0 });
	});

	it('is red when the framework source moved on and the page was not re-pinned', () => {
		const result = checkVerbatimDrift({
			pin: pinB,
			pages: [
				pageWith(
					[marker('verbatim file="examples/minimal-agent/src/index.ts"'), '```ts', 'const a = 1;', '```'].join(
						'\n',
					),
				),
			],
			readSource: readFrom({ [`${pinB}:examples/minimal-agent/src/index.ts`]: 'const a = 2;\n' }),
		});
		assert.equal(result.issues.length, 1);
		assert.match(result.issues[0].message, /does not match/);
		assert.equal(result.issues[0].file, 'examples/minimal-agent/src/index.ts');
	});

	it('reads a page-level lag through the matching source pointer', () => {
		const calls: string[] = [];
		const lag = 'c'.repeat(40);
		const result = checkVerbatimDrift({
			pin: pinA,
			pages: [
				pageWith([marker('verbatim file="README.md"'), '```md', 'hello', '```'].join('\n'), [
					{ file: 'README.md', ref: lag },
				]),
			],
			readSource: (ref, file) => {
				calls.push(`${ref}:${file}`);
				return ref === lag ? 'hello\n' : null;
			},
		});
		assert.deepEqual(result.issues, []);
		assert.deepEqual(calls, [`${lag}:README.md`]);
	});

	it('does not diff adapted blocks, but still requires their source to exist', () => {
		const adapted = pageWith(
			[marker('adapted file="docs/architecture/agents.md"'), '```md', 'rewritten', '```'].join('\n'),
		);
		const green = checkVerbatimDrift({
			pin: pinA,
			pages: [adapted],
			readSource: readFrom({ [`${pinA}:docs/architecture/agents.md`]: 'original\n' }),
		});
		assert.deepEqual(green.issues, []);
		assert.deepEqual(green.stats, { pages: 1, verbatim: 0, adapted: 1 });

		const red = checkVerbatimDrift({ pin: pinA, pages: [adapted], readSource: () => null });
		assert.equal(red.issues.length, 1);
		assert.match(red.issues[0].message, /cannot be read at/);
	});

	it('reports unresolvable verbatim sources and marker syntax errors', () => {
		const result = checkVerbatimDrift({
			pin: pinA,
			pages: [
				pageWith([marker('verbatim file="gone.ts"'), '```ts', 'x', '```'].join('\n')),
				pageWith([marker('verbatim'), '```ts', 'x', '```'].join('\n')),
			],
			readSource: () => null,
		});
		assert.equal(result.issues.length, 2);
		assert.match(result.issues[0].message, /cannot be read at/);
		assert.match(result.issues[1].message, /file/);
	});
});
