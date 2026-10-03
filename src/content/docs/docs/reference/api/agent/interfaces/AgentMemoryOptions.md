---
generated: true
editUrl: false
next: false
prev: false
title: "AgentMemoryOptions"
---

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:299

The per-call memory identity of a run (the identity model): the thread the
run reads history from and appends to, plus the resource that owns it. Both fields are required —
an identity missing one fails at call time, before any model call.

## Properties

### resource

> `readonly` **resource**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:309

The thread's owner (`resourceId`) — stamped on every message the run saves. Memory does no
access control: the application authorizes the caller against this resource itself.

***

### thread

> `readonly` **thread**: [`MemoryThreadRef`](/docs/reference/api/memory/type-aliases/memorythreadref/)

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:304

The thread of this run's history: an id, or an id plus the `title` / `metadata` a missing
thread is created with on the run's first save.
