---
generated: true
editUrl: false
next: false
prev: false
title: "ListThreadsQuery"
---

Defined in: .framework/balsats-framework/packages/core/dist/memory/types.d.ts:41

Thread listing: threads of one resource, most-recently-active first (`updatedAt` desc, `id` as
tie-break). `before` is a cursor: only threads strictly older than the referenced thread are
returned; `limit` then anchors at the newest end of what remains.

## Properties

### before?

> `optional` **before?**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/memory/types.d.ts:44

***

### limit?

> `optional` **limit?**: `number`

Defined in: .framework/balsats-framework/packages/core/dist/memory/types.d.ts:43

***

### resourceId

> **resourceId**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/memory/types.d.ts:42
