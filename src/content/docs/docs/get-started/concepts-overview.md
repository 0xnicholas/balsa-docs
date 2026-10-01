---
title: Concepts overview
description: How Balsa's pieces fit together — subpath entry points, the agent loop, tools, memory, workflows, observability and durable background work.
packages:
  - '@balsa/core'
order: 3
source:
  - file: README.md
  - file: CONTEXT.md
  - file: docs/architecture/README.md
---

Balsa is a small set of pieces you assemble rather than one large object you configure. Each piece
is its own entry point, each has a default that works in-process, and you can use any of them
without the others.

## One package, many entry points

Every subsystem lives behind its own subpath of `@balsa/core`. Importing that subpath is what puts
the subsystem in your build — there is no registry to configure, and nothing you skip reaches your
dependency tree.

| Piece | Import from | What it gives you |
| --- | --- | --- |
| Agents | `@balsa/core/agent` | `Agent` — a model, instructions and tools, plus the run loop, processors, dynamic configuration and structured output |
| Models | `@balsa/core/model` | The model contract and the chunk protocol types |
| Tools | `@balsa/core/tools` | `createTool` and the tool types |
| Memory | `@balsa/core/memory` | Thread-scoped message history, plus optional working memory |
| Workflows | `@balsa/core/workflows` | A step builder with suspend and resume |
| Observability | `@balsa/core/observability` | A tracer, with console and memory exporters |
| Durable agents | `@balsa/core/durable-agent` | An approval gate: a run can stop and wait for a human |
| Signals | `@balsa/core/signals` | Inject, wake or queue input on a thread |
| Schedules | `@balsa/core/schedules` | Stored future runs, driven by a `tick` |
| Composition root | `@balsa/core` | `createApp` — the optional assembly point |

## The agent is the center

An agent wraps a model, instructions and tools into one object with two ways to run it: `stream()`
consumes the run as it happens, and `generate()` returns the same run collapsed to its terminal
values. The agent itself carries no conversation state, so a single agent serves every
conversation; state belongs to memory, and it is named per call.

When the model asks for a tool, the built-in loop executes it and feeds the result back, up to
`maxSteps` (default 5). Failures — invalid arguments, a throwing `execute`, invalid output — come
back to the model as error results, so a run recovers or gives up on its own instead of aborting.

Cross-cutting behavior (guardrails, redaction, rate limiting, evals) goes through **processors**:
three ordered hooks — `processInput`, `processOutputStep`, `processError` — and the one place such
concerns belong. Multi-agent setups use the same building block: wrap an agent in a tool and hang it
on another agent. Delegation is an ordinary tool call, and no supervisor protocol sits between the
two agents.

Every behavior field is a **dynamic argument**: `instructions`, `model`, `tools`, `memory` and
`description` accept a value, or a function that receives the request context, so behavior can vary
per call — tenant, user, locale — without rebuilding anything.

## Tools

A tool is a plain object: a description, optional `inputSchema` and `outputSchema`, and an
`execute`. Its name is its key in the tools container. Schemas are Standard Schema interfaces, so
`zod` v4 works as-is: the framework validates the model's arguments before `execute` runs and sends
the JSON Schema to the provider. The second `execute` parameter carries the call's context — the
abort signal, the run and tool-call identifiers, and the per-call request context.

## Models

Balsa ships no provider registry and no adapter layer. A model instance is whatever your provider
package returns, and it satisfies the core's model contract structurally. Output is a stream in
Balsa's own chunk protocol — `text-delta`, `tool-call`, `finish`, `usage` and friends — which is the
single vocabulary shared by streaming, processors, workflow snapshots and observability.

## Memory

Memory is scoped by **thread** and **resource**: you name both per call, so one agent serves every
conversation and storage stays keyed by who is talking and in which conversation. Message history is
on by default — each run's messages are saved to its thread and the recent window is injected into
the next prompt, with `recall()` as the query entry. Working memory is opt-in: a small schema the
model updates through a tool, injected as a system message, so that user's next conversation starts
already knowing their profile. All of it goes through a storage port with an in-memory default.

## Workflows

A workflow is a builder that composes steps — `then`, `parallel`, `branch`, `foreach`, the loop
methods (`dowhile` / `dountil`) and `sleep` — into a flat sequence that a walker interprets. A step
whose `execute` calls an agent is how agents join a workflow. A run can suspend at a step boundary
with a JSON snapshot, and `resume` continues it later — in the same process or another one, once the
snapshot store is persistent.

## Observability

Every agent run, model step, tool call, workflow run and step, and every memory recall or save can
be traced through Balsa's own minimal span model: a tracer with console and memory exporters,
assembled once at the composition root. Without a tracer there are no span objects at all, and a
standalone agent remains fully first-class.

## Durable execution and background work

Three pieces cover work that outlives a request. **Durable agents** wrap an agent with an approval
list: a tool call whose name is on that list does not execute — the run suspends with its loop
snapshot, and a `resume` carries the decision. **Signals** inject input into an active run, wake an
idle thread, or queue input in order against a thread. **Schedules** store future runs and expose a
single `tick` primitive that fires whatever is due; the occurrence function is injected, so a
platform cron hitting an endpoint is a first-class shape and no scheduler loop runs in your process.

## How the pieces connect

Two conventions tie the pieces together. Storage is always a **port** with an in-memory default:
message history, workflow snapshots, durable run snapshots and schedules each persist through a
small interface you can swap for your own adapter. And the **composition root** (`createApp`) is
where cross-cutting dependencies — a tracer, a store — are assembled once and handed to everything
built through it; it stays optional, and `new Agent({ … })` on its own is fully supported.

## Next steps

- [Quickstart](/docs/get-started/quickstart/) — run an agent end to end.
- [Installation](/docs/get-started/installation/) — requirements and the repository route.
