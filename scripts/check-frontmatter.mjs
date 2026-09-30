#!/usr/bin/env node
/**
 * #17 acceptance: a page missing any required frontmatter field must fail the build —
 * not warn (ia.md §4 / stack.md §5). One fixture page per required field, each built on
 * its own because Astro stops at the first invalid content entry.
 *
 * Usage: node scripts/check-frontmatter.mjs   (wired into `pnpm verify`)
 */
import { spawnSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const fixture = path.join(root, 'src/content/docs/docs/zz-frontmatter-fixture.md');

/** Required fields (ia.md §4); each case is an otherwise-valid page. */
const cases = [
	{
		field: 'title',
		frontmatter: "description: A fixture page with no title.\npackages:\n  - '@balsa/core'",
	},
	{
		field: 'description',
		frontmatter: "title: Fixture\npackages:\n  - '@balsa/core'",
	},
	{
		field: 'packages',
		frontmatter: 'title: Fixture\ndescription: A fixture page with no packages.',
	},
];

let failures = 0;

const cleanup = () => rmSync(fixture, { force: true });
// The fixture is invalid on purpose: never leave it behind, whatever ends the run.
process.on('exit', cleanup);
for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, () => {
		cleanup();
		process.exit(130);
	});
}

try {
	for (const { field, frontmatter } of cases) {
		writeFileSync(fixture, `---\n${frontmatter}\n---\n\nFixture page, built on purpose.\n`);
		const build = spawnSync('pnpm', ['exec', 'astro', 'build'], { cwd: root, encoding: 'utf8' });
		const output = `${build.stdout ?? ''}${build.stderr ?? ''}`;

		if (build.status === 0) {
			failures += 1;
			console.error(`✗ no \`${field}\` → build succeeded; the field is not enforced`);
		} else if (!output.includes(`docs/zz-frontmatter-fixture`) || !output.includes(field)) {
			failures += 1;
			console.error(`✗ no \`${field}\` → build failed, but not on the field itself:`);
			console.error(output.trim().split('\n').slice(-10).join('\n'));
		} else {
			console.log(`✓ no \`${field}\` → build failed (exit ${build.status})`);
		}
	}
} finally {
	// The fixture never reaches the render step (content sync fails first), so `dist/`
	// keeps the last good build; drop the fixture either way.
	cleanup();
}

if (failures > 0) {
	console.error(`\n${failures} required frontmatter field(s) not enforced by the build.`);
	process.exit(1);
}
console.log('\nAll required frontmatter fields fail the build when missing.');
