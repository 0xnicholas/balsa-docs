---
title: Observability
description: The tracer and the span model behind it — the seven things traced automatically, the three events exporters receive, and how a trace survives a suspension.
packages:
  - '@oribos/core/observability'
  - '@oribos/core'
order: 6
source:
  - file: docs/architecture/observability.md
  - file: docs/adr/0009-observability-tracing.md
  - file: README.md
  - file: examples/minimal-agent/README.md
  - file: examples/memory-chat/README.md
  - file: examples/workflow-approval/README.md
  - file: examples/durable-approval/README.md
  - file: examples/signals-desk/README.md
---

An agent run is a lot of things happening in sequence: a model call, the tool calls it asks for,
the memory it reads and writes, the workflow step wrapping it. Observability answers one question
about that — what happened inside the run — with a small span model of Oribos's own. It is opt-in:
with no tracer attached, no span object is created and a standalone agent pays nothing.

## Attaching a tracer

One tracer per application, assembled once and handed to the subsystems that instrument it:

<!-- oribos:verbatim file="README.md" lines="173-179" -->
```ts
import { createApp } from '@oribos/core';
import { consoleExporter, createTracer } from '@oribos/core/observability';

// The composition root is an optional thin assembly point: one tracer assembled here is
// handed to every agent built through the app — no per-agent wiring.
const app = createApp({ tracer: createTracer({ exporters: [consoleExporter()] }) });
const agent = app.agent({ name, instructions, model, tools });
```

Agents built through the app accept the tracer passively — no per-agent wiring — while a standalone
`new Agent({ … })` takes one explicitly through its `tracer` field, and
`createWorkflow({ tracer })` does the same for a workflow. It is always the same kind of object;
nothing reaches for a global, and a run that was handed no tracer creates no spans at all.

Two exporters ship with the core. `consoleExporter()` pretty-prints every event as it happens — the
development view. `memoryExporter()` keeps events in a bounded ring buffer in process, with
`events` and `spans()` to read and `clear()` to reset: the assertion surface for tests.

## What a span is

A span is one record of one thing that happened. Its fields are the whole vocabulary:

| Field | What it holds |
| --- | --- |
| `id` / `traceId` | OTel-compatible 16- and 32-hex identifiers. |
| `parentSpanId` | The span this one hangs under, when there is one. |
| `name` | What the span is: an agent, a model, a tool, a step, a workflow, a thread. |
| `type` | An open string. The framework writes one of seven constants; your own spans may use any name. |
| `startTime` / `endTime` | The span's lifetime. `isEvent` spans have no end — they are created complete. |
| `input` / `output` | First-class on purpose: the prompt a model saw, the text it produced, a tool's arguments and result. |
| `attributes` | Details narrowed by `type` — model, provider, usage, finish reason, ids. |
| `metadata` | Your own open bag, carried through untouched. |
| `error` | Records a failure on the span. |

A live span handle offers `end()`, `update(patch)` and `error(err)`. What is exported is the
`ExportedSpan`: the same data with the methods stripped and no cyclic references.

The seven constants cover the framework's own work:

| `type` | One span per | Attributes | `input` → `output` |
| --- | --- | --- | --- |
| `agent-run` | `generate()` / `stream()` call | `agentName`, `runId` | the prompt as the model sees it → the run's terminal text (or structured result) |
| `agent-step` | model call inside the run | `model`, `provider`, optional `parameters`, `usage`, `finishReason`, `timeToFirstChunk` | the prompt messages → the model's response |
| `tool-call` | tool execution inside the loop | `toolCallId` | the arguments → the result; a failure lands on `error` |
| `workflow-run` | workflow start or resume segment | `workflowId`, `runId` | the validated trigger input → the outcome envelope |
| `workflow-step` | step boundary execution | — (the name is the step id) | the step input after boundary validation → its output |
| `memory-recall` | run's history recall | `threadId` (the name is the thread id) | the recall query → the recalled messages, storage envelope included |
| `memory-save` | step's history save | `threadId` and `resourceId` | the messages being saved → the persisted messages |

## What is traced automatically

When a tracer is attached, the framework opens spans at seven boundaries, and nothing else:

1. **Agent run** — the whole `generate()` / `stream()` call.
2. **Agent step** — each model call of that run. A fallback chain's failed attempts each get their
   own span, so a switch between models is visible; the attempt that serves the step carries its
   usage and finish reason.
3. **Tool call** — each tool execution in the loop.
4. **Workflow run** — a start or a resume, through to its terminal state.
5. **Workflow step** — each step boundary. A block's iteration and arm executions each get their own
   span even though the run's records stay aggregated per entry.
6. **Memory recall** — once per run, before the run's input processors, under the run's span.
7. **Memory save** — once per completed step, under that step's span.

Chunks are not traced: they are already the stream. Sub-agents are not a span type either — an
agent wrapped as a tool lands as an ordinary `tool-call` span, and the
[Tools](/docs/concepts/tools/) page shows the wrapper that keeps the delegate's spans in the same
trace.

## Events and exporters

Exporters do not see the live spans; they see three lifecycle events, each carrying the span's
exported form:

| Event | When |
| --- | --- |
| `span_started` | The span was created. |
| `span_updated` | Its output or attributes changed. |
| `span_ended` | It finished — or, for an `isEvent` span, the single event it ever produces. |

An exporter is one small object: `export(event)`, plus optional `flush()` and `shutdown()`. The
tracer's own `flush()` waits for exports already in flight and then forwards to every exporter;
`shutdown()` flushes and releases. Write one of those objects and you have a destination — that
interface is the whole seam.

`createTracer` wraps the bus with these controls:

- **`sampler`** — `'always'` (the default), `'never'`, `{ ratio }`, or your own
  `(parent) => boolean`. The decision is made once, at the root; a run that is not sampled hands out
  a no-op span whose descendants are no-ops too, so instrumented code needs no branches.
- **`spanProcessors`** — synchronous functions that run on every event before it is exported. They
  may rewrite the event in place or return a replacement, and returning `undefined` drops the event.
  This is the shaping seam: PII rules and payload trimming are application knowledge and belong
  here, not in the core.
- **`hideInput` / `hideOutput`** — erase those fields from every exported event of the trace. A run
  can override them per call. Erasure happens **after** the span processors, so a processor can
  still read the original value while exporters never see it.

## Context and identity

Spans follow the execution tree explicitly — the agent loop and the workflow walker pass the parent
span down — and a span you create inside a tool takes its parent explicitly too. There is no hidden
context: the framework does not use ambient storage, and neither should the code around it.

Two identifiers are in play, and they answer different questions:

- **`runId`** is the execution's identity — the key snapshots and memory use.
- **`traceId`** is the observation's identity. The root span carries `runId` so one can find the
  other.

A root span either starts a trace or continues one that began elsewhere (an incoming request, a
parent run). `createTracer`'s `startSpan` takes `{ parent }` for descendants, or
`{ traceId, parentSpanId }` for a continuation — the two are mutually exclusive, and a
`parentSpanId` needs its `traceId`. The same pair is accepted as a run option by agent runs and by
`createRun`; parsing an incoming `traceparent` header is the application's job, and the framework
carries the result from there.

Empty strings are meaningful: `traceId: ''` voids the pair, so the run starts a fresh trace rather
than producing spans under an empty trace id; `parentSpanId: ''` drops only the parent link. Tools
receive `traceId` and `spanId` in their context — empty when there is no tracer or the trace was
not sampled — which is what makes as-tool delegation hang the delegate's run under the calling
tool's span.

Two behaviors are worth knowing because they keep a longer story in one trace:

- **A suspension does not split the trace.** The `traceId` travels inside the
  [snapshot](/docs/concepts/suspend-resume/), and the resumed segment opens a new run span in the
  same trace — the suspended segment and its continuation are two spans, one observation.
- **Injections are events, triggers are runs.** A [signal](/docs/concepts/durable-execution/)
  delivered into a live run is an `isEvent` span hung off that run's span, and a scheduled `tick`
  opens no span of its own: the run it wakes carries one.

## Sending spans to a backend

The three-event interface above is the extension point, and it is enough to ship traces anywhere: an
exporter translates Oribos spans into the destination's shape. An OTLP exporter — Oribos spans mapped
to the GenAI semantic conventions OpenTelemetry defines — ships as a separate capability package,
[`@oribos/otlp`](https://www.npmjs.com/package/@oribos/otlp); it is not part of the core, and the
console and memory exporters that are show both a minimal and a buffered implementation of the same
interface.

## Next steps

- [Agents](/docs/concepts/agents/) — the run options that continue a trace and hide payloads.
- [Suspend & resume](/docs/concepts/suspend-resume/) — why a resumed run lands in the same trace.
- [Durable execution & background work](/docs/concepts/durable-execution/) — the signals and schedules spans above.
