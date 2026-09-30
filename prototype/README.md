# Brand & visual prototype (ticket #16)

**Throwaway.** This branch exists to answer three questions from
[决策:品牌与视觉](https://github.com/0xnicholas/balsa-docs/issues/12):

| # | Question | How this answers it |
| --- | --- | --- |
| Q1 | Is **token-only** depth good enough? | `depth` axis: `token-only` → `+ warm neutrals` → `+ 1 override`, switchable live |
| Q2 | Does `template: splash` work for the `/docs` landing? | `/docs` **is** a splash page in this instance |
| Q4 | Which **warm-wood** accent direction? | `palette` axis: A amber (36°) · B bronze (28°) · C clay (18°) |

It is not the site. Nothing here is meant to merge into `main` as-is; the decisions it produces
land in `docs/spec/brand-visual.md`.

> **Decided on this branch (2026-09-30, ticket #16 reactions):** palette **A 琥珀 Amber**,
> depth **+ warm neutrals** (registered overrides stay **0**), `/docs` splash **adopted as-is**.
> The default the instance boots into is now `?palette=a&depth=warm`.

## Run it

```sh
pnpm install
pnpm dev          # http://localhost:4321/docs
pnpm contrast     # WCAG AA audit over all 3×3×2 combinations; exits 1 on any failure
node prototype/shoot.mjs   # re-shoot .screenshots/ (needs `pnpm dev` running)
```

The floating bar at the bottom switches variants; `←` `→` cycle palette, `↑` `↓` cycle depth.
Choice is stored in the URL (`?palette=a&depth=warm`) and in `localStorage`, so it survives
navigation. **The bar renders in dev only** (`import.meta.env.DEV`) and never appears in `astro build`.

## The two axes

**Palette** — hue only. Each candidate sets `--sl-color-accent-low/-/-high` for both themes,
tuned so the hard pairs clear AA in both. Light accents are deliberately close to the AA line
(4.6–5.0:1): a warm accent dark enough to be "safe" is one step from stopping to look amber.

**Depth** — how far the customisation reaches:

| Rung | What it touches | Registered overrides |
| --- | --- | --- |
| `token-only` | `--sl-color-accent*` only; every neutral stays Starlight's | 0 |
| `+ warm neutrals` | accent + the full `--sl-color-gray-*` scale (warm paper / warm charcoal) | 0 |
| `+ 1 override` | the above, plus a registered `components:` override | 1 (`Footer`) |

Everything is CSS custom properties — the whole thing sits inside the
`docs/spec/stack.md` §9 boundary (built-in components, `--sl-*` tokens, cascade layers, no forked
upstream internals).

## What is generated, not hand-written

`src/lib/brand-tokens.mjs` is the single source of truth: HSL triplets per candidate, per depth,
per theme, plus the WCAG contrast maths. From it:

- `astro.config.mjs` injects the token CSS for every combination (unlayered `:root[data-palette][data-depth]`
  rules, so they outrank Starlight's layered defaults);
- `prototype/contrast-audit.mjs` gates the palette values on AA;
- `PaletteSamples.astro` prints the same ratios on `/prototype/palette/`, computed at build time —
  the page cannot drift from the audit.

A real site would hand-write these tokens. The generator is a prototype convenience.

## Pages

| Route | Why it exists |
| --- | --- |
| `/docs` | splash landing (Q2) — hero + two actions + card grid + code block |
| `/docs/concepts/streaming` | docs skeleton: sidebar, prose, aside, table, Expressive Code block |
| `/prototype/palette` | all three candidates × both themes × the upstream reference, side by side |
| `/404` | the acceptance checklist asks for it |

Sidebar is the real five-family IA (`docs/spec/ia.md` §1) with manual ordering; the Reference
family is absent because it has 0 pages at launch.

## Known limits

- Rule 6 of the prototype skill: the answer (which palette, which depth) is recorded on ticket #16;
  this branch keeps the variants as the primary source.
- Splash hero images, per-page OG images, and the real logo mark are out of scope here — the logo
  is the placeholder slot in the footer override.
- Pagefind search is not available under `astro dev`; the built output (`.astro`/`dist`) does index
  it, but the search panel was not screenshotted.
