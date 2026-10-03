---
generated: true
editUrl: false
next: false
prev: false
title: "AgentRunSnapshot"
---

Defined in: .framework/balsats-framework/packages/core/dist/durable-agent/snapshot.d.ts:48

One run's JSON-serializable state at its suspension point (the snapshot-store port):
the run identity (the key `resume(runId)` loads by), the message list the run stopped at — the
loop's prompt plus the suspended step's own raw assistant message (its text, its calls, any
provider-executed results) — the count of steps the run had completed, the suspension payload,
and the trace the run's spans were exported under, so a resume continues the same trace
(one HITL interaction is several spans on one trace).
The shape is frozen: evolution of the port is additive-only (ADR-0010).

## Properties

### messages

> `readonly` **messages**: readonly [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

Defined in: .framework/balsats-framework/packages/core/dist/durable-agent/snapshot.d.ts:54

The run's message list at the boundary: prompt + the suspended step's raw assistant message.

***

### runId

> `readonly` **runId**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/durable-agent/snapshot.d.ts:50

Identity of the run (snapshots, spans and `resume`); minted by the wrapper per run.

***

### status

> `readonly` **status**: `"suspended"`

Defined in: .framework/balsats-framework/packages/core/dist/durable-agent/snapshot.d.ts:52

The one state the store holds — a run that suspends, resumed or not, is `suspended` here.

***

### stepCount

> `readonly` **stepCount**: `number`

Defined in: .framework/balsats-framework/packages/core/dist/durable-agent/snapshot.d.ts:56

How many steps the run had completed when it suspended — where a resume continues numbering.

***

### suspendPayload

> `readonly` **suspendPayload**: [`AgentRunSuspendPayload`](/docs/reference/api/durable-agent/interfaces/agentrunsuspendpayload/)

Defined in: .framework/balsats-framework/packages/core/dist/durable-agent/snapshot.d.ts:58

What the step held back (see `AgentRunSuspendPayload`).

***

### traceId?

> `readonly` `optional` **traceId?**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/durable-agent/snapshot.d.ts:64

The trace the run's spans were exported under (32-hex), written whenever a real span exists —
an untraced run, or one whose trace the sampler rejected, carries no id. A resume starts a new
`agent-run` span in this trace, so a suspension does not break the observation tree.
