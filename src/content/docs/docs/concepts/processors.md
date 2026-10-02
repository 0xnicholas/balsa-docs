---
title: Processors
description: The one cross-cutting extension point — three ordered hooks for guardrails, redaction, rate limiting and evals, and the record each one can rewrite.
packages:
  - '@balsats/core/agent'
order: 9
source:
  - file: docs/architecture/agent.md
  - file: docs/adr/0005-agent-core-surface.md
---

Guardrails, redaction, rate limiting, evals — whatever has to happen around **every** run of an
agent — are not fields on the agent. They are **processors**: a small object with up to three hooks,
and the single answer to "where does this behavior go?". Adding a new concern never means adding a
field to the agent.

## One object, up to three hooks

Every hook is optional; declare the ones you need.

| Hook | Runs | May return |
| --- | --- | --- |
| `processInput` | Once per run, before the first model call | `{ messages }` — the prompt the model sees |
| `processOutputStep` | Once per completed step, after its tools have run | `{ step }` — the run's authoritative record of that step |
| `processError` | When a model call or a tool boundary fails | `{ error }` — the error at that boundary from here on |

A processor that only observes declares the hooks it needs and returns nothing:

<!-- balsats:adapted file="packages/core/src/agent/processors.ts" -->
```ts
import type { Processor } from '@balsats/core/agent';

const audit: Processor = {
  // Once per run, before the first model call: whatever prompt a hook returns is what the model sees.
  processInput({ messages, requestContext }) {
    console.log(`run ${requestContext.runId}: ${messages.length} message(s) in`);
    // Returning nothing keeps the prompt as it was.
  },
  // Once per completed step: the record it returns is the run's authoritative one.
  processOutputStep({ step, stepIndex }) {
    console.log(`step ${stepIndex}: ${step.toolCalls.length} tool call(s)`);
  },
  // When a model call or a tool fails: the error it returns replaces the one at that boundary.
  processError({ error, source, toolCall }) {
    console.error(`[${source}] ${toolCall?.toolName ?? 'model'}`, error);
  },
};
```

The hooks of one processor run in the order they are declared, and the processors of an agent run in
the order you list them — each receives the previous one's result, so a chain of rewrites reads top
to bottom. Hooks may be synchronous or asynchronous, and **returning nothing keeps the current
value**: the shortest way to watch a run without changing it.

The array goes on the agent's `processors` field — `new Agent({ …, processors: [audit] })`. Like
`tracer`, it is wiring rather than definition, and one processor instance can be shared by several
agents.

## What each hook can change

### `processInput` — the prompt the model sees

It runs once per run, after dynamic arguments are resolved and after memory recall, so it receives
the assembled prompt: instructions, working memory, recalled history and the run's own input. The
`{ messages }` it returns is exactly what the model is called with, and exactly what the run's span
records as input. Rewriting here is how a guardrail or a redaction layer reaches the model before it
sees anything — and throwing here is how it stops the run before a single token is spent.

### `processOutputStep` — the run's authoritative record

It runs once per completed step, after that step's tools have executed and any error results are in
place. The record it returns is the one the run settles on:

- the output object's `steps`, `text` and `usage` are built from it;
- the run's span reports its text as output;
- the next model call's assistant and tool messages are built from it;
- memory saves it — so a rewrite here is what gets persisted, not a copy.

What it does **not** rewrite is the live stream: chunks and the `agent-step` span stay the model's
raw output. Chunk-level rewriting is not part of the current surface.

### `processError` — the error at its boundary

The hook runs when a model call or a tool boundary fails, and the source tells you which:

| `source` | The failure | The replacement becomes |
| --- | --- | --- |
| `'model'` | The provider call that ended the step: the fallback chain exhausted, a mid-stream failure, a stream contract violation | The run's terminal error |
| `'tool'` | The tool boundary: an `execute` throw, a failed input or output validation, or a call to a tool not in the container | The error the model sees in the error tool result |

For an `execute` throw the framework keeps its `Tool '<name>' failed:` framing and your replacement
supplies the detail after it. Framework-generated lines — an unknown tool, a schema failure — have
no framing to keep, so the replacement is the whole message the model reads.

`processError` decides what an error **says**, not whether the run continues: there is no abort or
retry hook, and a recovered tool failure still goes back to the model as an error result it can work
around. A cancelled run does not raise the hook at all — cancellation is an outcome, not a provider
error.

## Failure and limits

- A hook that **throws** fails the run. That error is not offered to `processError` — a processor is
  not the place to handle another processor's bug.
- The list is fixed on the agent; there is no registry, no priority ordering and no per-run
  override. Ordering is the array's order, and that is the whole ordering model.
- The [`tracer`](/docs/concepts/observability/) is a separate wiring seam — observation is not a
  processor, and it does not consume one of these slots.
- Processors run in the same execution as the run itself. They add no background work, no queue and
  no storage: if a processor needs to send something somewhere, that call happens inline, and its
  failure is the run's failure.

## What they are for

- **Guardrails** — inspect the prompt in `processInput` and throw to refuse a run before the model
  is called.
- **Redaction** — rewrite `processInput`'s messages, `processOutputStep`'s record or both, so what
  reaches a provider, a trace exporter or storage is already sanitized.
- **Rate limiting and budgets** — count per caller in the request context and throw to stop; the
  context is the same bag tools and dynamic arguments receive.
- **Evals** — read step records in `processOutputStep` and model or tool errors in `processError`
  without touching the run, and write the scores wherever your evaluation pipeline lives.

## Next steps

- [Agents](/docs/concepts/agents/) — the run loop these hooks wrap around.
- [Observability](/docs/concepts/observability/) — how what a processor writes becomes what a span exports.
- [Memory](/docs/concepts/memory/) — why a `processOutputStep` rewrite is what a thread remembers.
