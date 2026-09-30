/**
 * PROTOTYPE — WCAG AA audit over every (palette x depth x theme) combination.
 * Backs acceptance criterion 1 of the 品牌与视觉 decision: "token 层按规范落地，
 * 亮/暗两色板过 WCAG AA（正文/链接/accent）".
 *
 * Run: pnpm contrast
 * Exit 1 if any pair falls under its threshold.
 */
import { audit, hsl, palettes, depths } from '../src/lib/brand-tokens.mjs';

const rows = audit();
const fails = rows.filter((r) => !r.pass);

const pad = (s, n) => String(s).padEnd(n);
let current = '';
for (const r of rows) {
	const key = `${r.palette}/${r.depth}/${r.theme}`;
	if (key !== current) {
		current = key;
		console.log(
			`\n${palettes[r.palette].nameZh} ${palettes[r.palette].name} · ${depths.find((d) => d.id === r.depth).label} · ${r.theme}`,
		);
	}
	const mark = r.pass ? 'ok  ' : 'FAIL';
	console.log(`  ${mark} ${pad(r.ratio.toFixed(2) + ':1', 8)} ${pad(r.label, 34)} (min ${r.min})`);
}

console.log(
	`\n${rows.length} checks · ${rows.length - fails.length} pass · ${fails.length} fail`,
);
if (fails.length) {
	console.log('\nFailing pairs:');
	for (const f of fails) {
		console.log(`  ${f.palette}/${f.depth}/${f.theme} — ${f.label}: ${f.ratio.toFixed(2)}:1`);
		console.log(`    fg ${hsl(f.fg)} on bg ${hsl(f.bg)}`);
	}
	process.exit(1);
}
