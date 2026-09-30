---
generated: true
editUrl: false
next: false
prev: false
title: "MemoryThreadRef"
---

> **MemoryThreadRef** = `string` \| \{ `id`: `string`; `metadata?`: `Record`\<`string`, `unknown`\>; `title?`: `string`; \}

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:9

A reference to a thread: the id alone, or the id plus the `title` / `metadata` a missing thread
is created with (and `save` applies to an existing thread when provided).
