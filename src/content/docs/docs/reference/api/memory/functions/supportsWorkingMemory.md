---
generated: true
editUrl: false
next: false
prev: false
title: "supportsWorkingMemory"
---

> **supportsWorkingMemory**(`store`): `store is WorkingMemoryStore`

Defined in: .framework/oribos-framework/packages/core/dist/memory/store.d.ts:38

The capability-flag detection convention (the port extension surface): the
conditional resource methods count as a pair — a store declares working-memory support only
when both exist; a half implementation is treated as absent (the caller degrades or throws).

## Parameters

### store

[`MemoryStore`](/docs/reference/api/memory/interfaces/memorystore/)

## Returns

`store is WorkingMemoryStore`
