---
generated: true
editUrl: false
next: false
prev: false
title: "AgentStepBoundaryEvent"
---

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:231

What both step-boundary phases observe: the run's message list at the boundary (a copy —
mutating it does not touch the run), the 0-based index of the step the boundary belongs to (=
the count of completed steps at that moment), and the run's trace continuation — the
`agent-run` span's ids, empty strings when the run is untraced (the same encoding `ToolContext`
carries: no tracer / `NoOpSpan`). The durable snapshot persists `traceId`; an injector hangs its
`isEvent` span under the live run span through the `traceId` + `spanId` pair.

## Extended by

- [`AgentToolCallsBoundaryEvent`](/docs/reference/api/agent/interfaces/agenttoolcallsboundaryevent/)

## Properties

### messages

> `readonly` **messages**: readonly [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:233

The run's vendor-shaped message list at the boundary — pre-injection for `beforeNextStep`.

***

### spanId

> `readonly` **spanId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:239

The `agent-run` span's id — where an injected event span hangs — or `''` when untraced.

***

### stepIndex

> `readonly` **stepIndex**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:235

The 0-based index of the step the boundary belongs to.

***

### traceId

> `readonly` **traceId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:237

The run's trace id — the `agent-run` span's, or `''` when the run is untraced.
