---
generated: true
editUrl: false
next: false
prev: false
title: "AppStorageConfig"
---

Defined in: .framework/balsa-framework/packages/core/dist/app.d.ts:34

The storage slots of the composition root: one entry per storage port, each handed to the
subsystem that persists through it. A slot left out falls back to the core's in-memory default
(this process only); each slot is independent — no composite store, no domain routing.

## Properties

### durableAgent?

> `readonly` `optional` **durableAgent?**: [`AgentRunSnapshotStore`](/docs/reference/api/durable-agent/interfaces/agentrunsnapshotstore/)

Defined in: .framework/balsa-framework/packages/core/dist/app.d.ts:45

The `AgentRunSnapshotStore` durable agent runs snapshot through (`App.durableAgent`).

***

### memory?

> `readonly` `optional` **memory?**: [`MemoryStore`](/docs/reference/api/memory/interfaces/memorystore/)

Defined in: .framework/balsa-framework/packages/core/dist/app.d.ts:41

The `MemoryStore` this app's agents and signals facades run through. The app builds one shared
`Memory` over it and hands the same instance to both, which is what the signals contract wants
(`App.signals`); users who need a different instance (working memory, another window size) pass
their own `Memory` explicitly.

***

### schedules?

> `readonly` `optional` **schedules?**: [`ScheduleStore`](/docs/reference/api/schedules/interfaces/schedulestore/)

Defined in: .framework/balsa-framework/packages/core/dist/app.d.ts:47

The `ScheduleStore` schedule records live in (`App.schedules`).

***

### workflow?

> `readonly` `optional` **workflow?**: [`WorkflowSnapshotStore`](/docs/reference/api/workflows/interfaces/workflowsnapshotstore/)

Defined in: .framework/balsa-framework/packages/core/dist/app.d.ts:43

The `WorkflowSnapshotStore` workflow runs snapshot through (`App.workflow`).
