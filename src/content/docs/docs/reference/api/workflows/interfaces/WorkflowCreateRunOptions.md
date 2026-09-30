---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowCreateRunOptions"
---

Defined in: .framework/balsa-framework/packages/core/dist/workflows/run.d.ts:47

The `createRun` options.

## Properties

### parentSpanId?

> `readonly` `optional` **parentSpanId?**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/run.d.ts:59

The parent span inside that trace; requires `traceId` (the tracer rejects one without it).

***

### runId?

> `readonly` `optional` **runId?**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/run.d.ts:49

Identity of the run (snapshots, spans and `requestContext.runId`); generated when omitted.

***

### traceId?

> `readonly` `optional` **traceId?**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/run.d.ts:57

The trace the run's first segment continues, for a run that hangs under a trace started
elsewhere (an incoming `traceparent`, a parent run) — the agent's run options' convention
(`docs/architecture/observability.md`「外部 trace 延续」). Empty strings mean "no trace": an
empty `traceId` voids the pair, an empty `parentSpanId` only drops the parent. A resumed
segment continues the trace its snapshot pinned, never this pair.
