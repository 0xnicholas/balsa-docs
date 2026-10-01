---
title: Import map / package surface
description: The package surface of Balsa — every @balsa/core entry point, what it gives you, and where to read on for exact signatures.
packages:
  - '@balsa/core'
order: 1
source:
  - file: README.md
  - file: packages/core/package.json
  - file: docs/adr/0002-package-structure.md
---

Balsa's core is one package with ten entry points, and importing an entry point is what puts that
subsystem in your build. This page is the selection layer: what each entry point is for, and where
to read on. Exact signatures are the generated API reference's job — one page per symbol, linked
from the row.

## The ten entry points

| Import path | What it gives you | In depth | Signatures |
| --- | --- | --- | --- |
| `@balsa/core` | `createApp` — the optional composition root | [Concepts overview](/docs/get-started/concepts-overview/) | [`createApp`](/docs/reference/api/balsa/core/functions/createapp/) |
| `@balsa/core/agent` | `Agent`, dynamic arguments, structured output, processors | [Agents](/docs/concepts/agents/) | [`Agent`](/docs/reference/api/agent/classes/agent/) |
| `@balsa/core/model` | The model contract and the chunk protocol types | [Models](/docs/concepts/models/) | [`Chunk`](/docs/reference/api/model/type-aliases/chunk/) |
| `@balsa/core/tools` | `createTool` and the tool types | [Tools](/docs/concepts/tools/) | [`createTool`](/docs/reference/api/tools/functions/createtool/) |
| `@balsa/core/memory` | `Memory`, `createInMemoryStore`, the memory storage ports | [Memory](/docs/concepts/memory/) | [`Memory`](/docs/reference/api/memory/classes/memory/) |
| `@balsa/core/workflows` | `createWorkflow`, `createStep`, the snapshot store | [Workflows](/docs/concepts/workflows/) | [`createWorkflow`](/docs/reference/api/workflows/functions/createworkflow/) |
| `@balsa/core/observability` | `createTracer`, the console and memory exporters, span types | [Observability](/docs/concepts/observability/) | [`createTracer`](/docs/reference/api/observability/functions/createtracer/) |
| `@balsa/core/signals` | `createSignals` — inject, wake and queue input on a thread | [Durable execution & background work](/docs/concepts/durable-execution/) | [`createSignals`](/docs/reference/api/signals/functions/createsignals/) |
| `@balsa/core/durable-agent` | `createDurableAgent`, the approval gate, `AgentRunSnapshotStore` | [Durable execution & background work](/docs/concepts/durable-execution/) | [`createDurableAgent`](/docs/reference/api/durable-agent/functions/createdurableagent/) |
| `@balsa/core/schedules` | `createSchedules`, `tick`, `ScheduleStore` | [Durable execution & background work](/docs/concepts/durable-execution/) | [`createSchedules`](/docs/reference/api/schedules/functions/createschedules/) |

## How to choose

Each entry point is independent. `@balsa/core/agent` does not pull in memory, workflows or
observability; the core has zero runtime dependencies, and what you do not import costs you nothing
— not in the dependency tree, not in concept space. There is no registry to configure and no
central object you must build: the pieces meet through the values you pass between them, and a
standalone `new Agent({ … })` is a complete program.

The [composition root](/docs/get-started/concepts-overview/) is the one entry point you may never
need. `createApp({ tracer, storage })` is an optional thin assembly point: cross-cutting
dependencies are wired once there and handed to everything built through it — `app.agent(…)`,
`app.workflow(…)` and the rest — while skipping it changes nothing about how a subsystem behaves on
its own.

## What the paths promise

- The core is **ESM only**, with `types` and `default` conditions on every entry point, and it
  requires Node.js 22.13 or later ([Installation](/docs/get-started/installation/) has the details).
- An import path is a **contract**. New subpaths appear as the framework grows; existing ones do not
  move, so an import that works today keeps working.
- The subpath decides what ships. A capability that needs dependencies of its own cannot ride along
  a subpath — that is exactly what keeps the core at zero runtime dependencies.

## Beyond the core

Capabilities with dependencies of their own are planned as separate `@balsa/*` packages: an OTLP
exporter for traces, an MCP server and client for tools, a SQLite adapter for the storage ports, AI
SDK stream interop, and cron expressions for schedules. None is part of the core, and none is
published yet — when one lands, its import path appears in the table above.

## Next steps

- [Concepts overview](/docs/get-started/concepts-overview/) — how the pieces connect.
- [Quickstart](/docs/get-started/quickstart/) — the smallest complete program, end to end.
- [Docs for AI agents](/docs/project/docs-for-agents/) — the manifest that maps each package to its pages.
