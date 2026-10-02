---
title: Installation
description: What Balsats requires, and how to install it from npm.
packages:
  - '@balsats/core'
order: 1
source:
  - file: README.md
  - file: packages/core/package.json
---

## Requirements

- **Node.js 22.13 or later.** Balsats ships as ESM only.
- **A model provider package** for your model, such as `@ai-sdk/openai`. Model instances come
  straight from the provider ecosystem, so there is nothing else to install for a model.
- **A schema library** for tool input and output. `zod` v4 is the common choice; schemas use the
  Standard Schema interface.
- **pnpm**, if you work with the repository itself — it is a pnpm workspace.

The core package has no runtime dependencies of its own.

## Install

<!-- balsats:adapted file="README.md" -->
```bash
npm install @balsats/core
```

`@balsats/core` is the framework. The other packages under the `@balsats` scope are the
capability packages — `@balsats/mcp-server`, `@balsats/mcp-client`, `@balsats/otlp`,
`@balsats/sqlite`, `@balsats/ai-sdk` and `@balsats/croner` — install the ones your application
needs.

## Entry points

`@balsats/core` is a single ESM package that you import from subpaths, and type declarations ship
with it. Each subsystem has its own entry point (`@balsats/core/agent`, `@balsats/core/tools`, …), and
the package root exports `createApp`, the optional composition root.
[Concepts overview](/docs/get-started/concepts-overview/) maps the entry points to the pieces they
carry.

## Work from the repository

To run the examples, the tests or the framework itself, clone the repository and build it:

<!-- balsats:adapted file="README.md" -->
```bash
git clone https://github.com/0xnicholas/balsats-framework.git
cd balsats-framework
pnpm install
pnpm build
```

`pnpm build` compiles every entry point into `dist/`. The examples — and any local dependency —
consume the package through those compiled entry points rather than from source.

To use the checkout from your own project, point it at the built package:

```bash
# from your project directory, with the framework checked out at /path/to/balsats-framework
pnpm add /path/to/balsats-framework/packages/core
```

pnpm links the directory into your project (a `link:` entry in your `package.json`), so the entry
points import exactly as they do once the package is installed from npm:

<!-- balsats:adapted file="README.md" -->
```ts
import { Agent } from '@balsats/core/agent';
import { createTool } from '@balsats/core/tools';
```

Re-run `pnpm build` in the framework checkout after pulling changes: the link resolves to the
compiled output. The [Quickstart](/docs/get-started/quickstart/) runs the smallest of the
repository's examples, end to end.
