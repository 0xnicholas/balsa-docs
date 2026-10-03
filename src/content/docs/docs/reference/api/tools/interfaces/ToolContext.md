---
generated: true
editUrl: false
next: false
prev: false
title: "ToolContext"
---

Defined in: .framework/oribos-framework/packages/core/dist/tools/tool.d.ts:18

The context a tool's `execute` receives (the tool execution context): the
six pieces the framework guarantees inside an agent loop. The model-generated `input` and the
framework-provided `ctx` are two separate parameters on purpose — no in-bag mixing (unlike the
workflow `StepContext`).

- `signal` / `runId`: cancellation and correlation, propagated from the run.
- `toolCallId`: the provider's real id — the idempotency key (a retried call carries the same id).
- `requestContext`: the user's per-call open bag, framework-written `signal` / `runId` included.
- `traceId` / `spanId`: for as-tool composition; the tracer fills them from the call's span —
  empty strings when no tracer is attached or the sampler rejected the trace (NoOpSpan).

Manual direct calls (workflow wrappers, ad-hoc code) provide the same shape themselves; inside
the agent loop the framework guarantees all six.

## Properties

### requestContext

> `readonly` **requestContext**: [`RequestContext`](/docs/reference/api/agent/interfaces/requestcontext/)

Defined in: .framework/oribos-framework/packages/core/dist/tools/tool.d.ts:26

The user's per-call request context (framework-written `signal` / `runId` included).

***

### runId

> `readonly` **runId**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/tools/tool.d.ts:22

Identity of the run this call belongs to.

***

### signal

> `readonly` **signal**: `AbortSignal`

Defined in: .framework/oribos-framework/packages/core/dist/tools/tool.d.ts:20

Cancellation, propagated from the run down to the tool.

***

### spanId

> `readonly` **spanId**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/tools/tool.d.ts:30

Span id of the current tool-call span; empty string when no tracer is attached (or the trace was not sampled).

***

### toolCallId

> `readonly` **toolCallId**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/tools/tool.d.ts:24

The provider-generated tool call id — the idempotency key for side effects.

***

### traceId

> `readonly` **traceId**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/tools/tool.d.ts:28

Trace id of the current run; empty string when no tracer is attached (or the trace was not sampled).
