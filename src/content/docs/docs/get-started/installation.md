---
title: Installation
description: What Balsa requires, and how to install it from its repository while the npm packages are pending.
packages:
  - '@balsa/core'
order: 1
source:
  - file: README.md
  - file: packages/core/package.json
---

## Requirements

- **Node.js 22.13 or later.** Balsa ships as ESM only.
- **A model provider package** for your model, such as `@ai-sdk/openai`. Model instances come
  straight from the provider ecosystem, so there is nothing else to install for a model.
- **A schema library** for tool input and output. `zod` v4 is the common choice; schemas use the
  Standard Schema interface.
- **pnpm**, if you work with the repository itself — it is a pnpm workspace.

The core package has no runtime dependencies of its own.

## Install

**Balsa is not on npm yet.** The packages are still at version `0.0.0` and the registry has nothing
published under `@balsa`. The first release is planned as `0.1.0`; this page gains the
package-manager command when it lands. Until then, use Balsa from its repository.

### Clone and build

<!-- balsa:adapted file="README.md" -->
```bash
git clone https://github.com/0xnicholas/balsa-framework.git
cd balsa-framework
pnpm install
pnpm build
```

`pnpm build` compiles every entry point into `dist/`. The examples — and any local dependency —
consume the package through those compiled entry points rather than from source.

### Run it

The repository ships runnable examples next to the framework itself. The
[Quickstart](/docs/get-started/quickstart/) runs the smallest of them, end to end.

### Use it from your own project

With the checkout built, point your own project at it:

<!-- balsa:adapted file="packages/core/package.json" -->
```bash
# from your project directory, with the framework checked out at /path/to/balsa-framework
pnpm add /path/to/balsa-framework/packages/core
```

pnpm links the directory into your project (a `link:` entry in your `package.json`), so the entry
points import exactly as they will once the package is published:

<!-- balsa:adapted file="README.md" -->
```ts
import { Agent } from '@balsa/core/agent';
import { createTool } from '@balsa/core/tools';
```

Re-run `pnpm build` in the framework checkout after pulling changes: the link resolves to the
compiled output.

## Entry points

`@balsa/core` is a single ESM package that you import from subpaths, and type declarations ship
with it. Each subsystem has its own entry point (`@balsa/core/agent`, `@balsa/core/tools`, …), and
the package root exports `createApp`, the optional composition root.
[Concepts overview](/docs/get-started/concepts-overview/) maps the entry points to the pieces they
carry.
