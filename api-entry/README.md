# Entry shims

One shim per `@balsa/core` export subpath, read by TypeDoc (`typedoc.json` → `entryPoints`).
The **file name is the module name** of the generated reference tree (`@balsa/core.d.ts` →
the `@balsa/core` sidebar group, `agent.d.ts` → `agent`), which is how the root entry avoids
the bare `index` name TypeDoc would derive from `dist/index.d.ts`.

Every file is exactly one star re-export of the pinned framework's `dist/` entry, written
through the fixed checkout path `.framework/balsa-framework` (api-reference.md §4 F9: the
entry path is baked into every generated page as `Defined in:`, so it may never move).
TypeDoc follows the re-export: symbols keep their real `Defined in:` source, and the module
groupings stay the framework's.

Generated and checked by the repo, never edited by hand: `scripts/check-api-tree.mjs`
asserts the set equals the `packages` frontmatter domain and that each body is exactly what
`entryShimSource()` in `src/lib/api-tree.ts` produces. Regenerate the tree with
`pnpm regen:api`; docs: `docs/spec/api-reference.md` §2/§4.
