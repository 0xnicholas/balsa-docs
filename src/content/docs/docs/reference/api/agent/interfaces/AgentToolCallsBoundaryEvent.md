---
generated: true
editUrl: false
next: false
prev: false
title: "AgentToolCallsBoundaryEvent"
---

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:242

The `beforeToolCalls` event: the boundary snapshot plus the calls the loop is about to execute.

## Extends

- [`AgentStepBoundaryEvent`](/docs/reference/api/agent/interfaces/agentstepboundaryevent/)

## Properties

### messages

> `readonly` **messages**: readonly [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:233

The run's vendor-shaped message list at the boundary — pre-injection for `beforeNextStep`.

#### Inherited from

[`AgentStepBoundaryEvent`](/docs/reference/api/agent/interfaces/agentstepboundaryevent/).[`messages`](/docs/reference/api/agent/interfaces/agentstepboundaryevent/#messages)

***

### pendingCalls

> `readonly` **pendingCalls**: readonly [`ToolCallChunk`](/docs/reference/api/model/type-aliases/toolcallchunk/)[]

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:247

The step's pending tool calls — the ones the framework is about to execute, in call order.
Provider-executed calls are not here: they already carry their results in `messages`.

***

### spanId

> `readonly` **spanId**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:239

The `agent-run` span's id — where an injected event span hangs — or `''` when untraced.

#### Inherited from

[`AgentStepBoundaryEvent`](/docs/reference/api/agent/interfaces/agentstepboundaryevent/).[`spanId`](/docs/reference/api/agent/interfaces/agentstepboundaryevent/#spanid)

***

### stepIndex

> `readonly` **stepIndex**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:235

The 0-based index of the step the boundary belongs to.

#### Inherited from

[`AgentStepBoundaryEvent`](/docs/reference/api/agent/interfaces/agentstepboundaryevent/).[`stepIndex`](/docs/reference/api/agent/interfaces/agentstepboundaryevent/#stepindex)

***

### traceId

> `readonly` **traceId**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:237

The run's trace id — the `agent-run` span's, or `''` when the run is untraced.

#### Inherited from

[`AgentStepBoundaryEvent`](/docs/reference/api/agent/interfaces/agentstepboundaryevent/).[`traceId`](/docs/reference/api/agent/interfaces/agentstepboundaryevent/#traceid)
