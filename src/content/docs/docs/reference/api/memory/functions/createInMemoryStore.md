---
generated: true
editUrl: false
next: false
prev: false
title: "createInMemoryStore"
---

> **createInMemoryStore**(): [`WorkingMemoryStore`](/docs/reference/api/memory/interfaces/workingmemorystore/)

Defined in: .framework/balsats-framework/packages/core/dist/memory/in-memory-store.d.ts:2

`@balsats/core/memory` — memory subsystem.

Thread/resource identity, message history (recall), working memory, the storage port, and its
in-memory default implementation.

Port evolution discipline (additive-only): ADR-0010.

This entry exports the storage port (`MemoryStore`, 6 required + 2 conditional resource
methods), the stored-record types, the capability-flag detection convention, the in-memory
default store, and the `Memory` class (message history: recall/save; working memory: get/update).

## Returns

[`WorkingMemoryStore`](/docs/reference/api/memory/interfaces/workingmemorystore/)
