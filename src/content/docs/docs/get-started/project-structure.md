---
title: Project structure
description: How a Balsa project is laid out, and which files the framework reads.
packages:
  - '@balsa/core'
order: 3
source: balsa-framework/docs/architecture/project-layout.md
---

A Balsa project is ordinary TypeScript. The framework reads no files you did not tell it about.

```text
my-project/
├── src/
│   ├── agent.ts        # agent definition and entry point
│   └── tools/          # tool definitions
├── package.json
└── tsconfig.json
```

<Aside type="note">
	Nothing is compiled ahead of time. Balsa imports your entry point and runs it.
</Aside>

## Conventions

- **One agent per entry point.** Agents compose by calling each other, not by config.
- **Tools are modules.** Export them; pass the ones an agent may use.
- **No hidden state.** Sessions and memory are passed explicitly (see [Sessions](/docs/concepts/sessions/)).
