---
generated: true
editUrl: false
next: false
prev: false
title: "MemoryConfig"
---

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:34

The `new Memory(...)` config surface (spec 配置表面节): every entry optional.

## Properties

### lastMessages?

> `readonly` `optional` **lastMessages?**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:38

The default `recall` window size; absent = 10.

***

### storage?

> `readonly` `optional` **storage?**: [`MemoryStore`](/docs/reference/api/memory/interfaces/memorystore/)

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:36

The storage port to persist through; absent = the core's in-memory default.

***

### workingMemory?

> `readonly` `optional` **workingMemory?**: [`WorkingMemoryConfig`](/docs/reference/api/memory/interfaces/workingmemoryconfig/)

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:45

Enables working memory for this instance (spec「工作记忆」): the schema-only, resource-scoped
block agents maintain through the `updateWorkingMemory` tool. Requires a store that declares
the conditional resource pair (`getResource` / `saveResource`) — enabling it without that
capability throws here, before any run.
