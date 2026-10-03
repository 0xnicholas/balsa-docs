---
title: Installation
description: What Oribos requires, and how to install it from npm.
packages:
  - '@oribos/core'
order: 1
source:
  - file: README.md
  - file: packages/core/package.json
---

## Requirements

- **Node.js 22.13 or later.** Oribos ships as ESM only.
- **A model provider package** for your model, such as `@ai-sdk/openai`. Model instances come
  straight from the provider ecosystem, so there is nothing else to install for a model.
- **A schema library** for tool input and output. `zod` v4 is the common choice; schemas use the
  Standard Schema interface.
- **pnpm**, if you work with the repository itself — it is a pnpm workspace.

The core package has no runtime dependencies of its own.

## Install

<!-- oribos:adapted file="README.md" -->
```bash
npm install @oribos/core
```

`@oribos/core` is the framework. The other packages under the `@oribos` scope are the
capability packages — `@oribos/mcp-server`, `@oribos/mcp-client`, `@oribos/otlp`,
`@oribos/sqlite`, `@oribos/ai-sdk` and `@oribos/croner` — install the ones your application
needs.

> **Scope window.** `@oribos/*` is the scope from the next release on. Until `@oribos/core`
> ships, the install line is the previous scope's `npm install @balsats/core`; the published
> 0.5.0 packages are what that installs. Everything else on this site — imports, entry
> points, examples — is written in the new scope.

## Entry points

`@oribos/core` is a single ESM package that you import from subpaths, and type declarations ship
with it. Each subsystem has its own entry point (`@oribos/core/agent`, `@oribos/core/tools`, …), and
the package root exports `createApp`, the optional composition root.
[Concepts overview](/docs/get-started/concepts-overview/) maps the entry points to the pieces they
carry.

## Work from the repository

To run the examples, the tests or the framework itself, clone the repository and build it:

<!-- oribos:adapted file="README.md" -->
```bash
git clone https://github.com/0xnicholas/oribos-framework.git
cd oribos-framework
pnpm install
pnpm build
```

`pnpm build` compiles every entry point into `dist/`. The examples — and any local dependency —
consume the package through those compiled entry points rather than from source.

To use the checkout from your own project, point it at the built package:

```bash
# from your project directory, with the framework checked out at /path/to/oribos-framework
pnpm add /path/to/oribos-framework/packages/core
```

pnpm links the directory into your project (a `link:` entry in your `package.json`), so the entry
points import exactly as they do once the package is installed from npm:

<!-- oribos:adapted file="README.md" -->
```ts
import { Agent } from '@oribos/core/agent';
import { createTool } from '@oribos/core/tools';
```

Re-run `pnpm build` in the framework checkout after pulling changes: the link resolves to the
compiled output. The [Quickstart](/docs/get-started/quickstart/) runs the smallest of the
repository's examples, end to end.
