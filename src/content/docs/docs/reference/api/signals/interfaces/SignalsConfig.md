---
generated: true
editUrl: false
next: false
prev: false
title: "SignalsConfig"
---

Defined in: .framework/balsats-framework/packages/core/dist/signals/signals.d.ts:26

The `createSignals` config.

## Properties

### agent

> `readonly` **agent**: [`Agent`](/docs/reference/api/agent/classes/agent/)

Defined in: .framework/balsats-framework/packages/core/dist/signals/signals.d.ts:28

The agent whose runs signals act on.

***

### memory?

> `readonly` `optional` **memory?**: [`Memory`](/docs/reference/api/memory/classes/memory/)

Defined in: .framework/balsats-framework/packages/core/dist/signals/signals.d.ts:37

The memory instance injected/woken content lands in, as ordinary messages of message history
(reusing `MemoryStore`, no new storage). Must be the same instance the agent is configured with
(`AgentConfig.memory`): woken runs carry their thread identity as the per-call `memory`
option, which an agent without a configured memory rejects. Absent = waking starts a new run
with no history at all (documented: nothing is persisted, nothing is recalled) and injections
ride the active run's prompt without landing anywhere.

***

### tracer?

> `readonly` `optional` **tracer?**: [`Tracer`](/docs/reference/api/observability/interfaces/tracer/)

Defined in: .framework/balsats-framework/packages/core/dist/signals/signals.d.ts:45

The tracer injection events report to (the composition root distributes it). Present = each
injection lands as one `isEvent` span on the active run's `agent-run` span — hung through the
boundary event's `traceId` / `spanId` continuation, no loop change. A woken run's own
`agent-run` span comes from the agent itself (`AgentConfig.tracer`). Absent = no span object
is ever created here.
