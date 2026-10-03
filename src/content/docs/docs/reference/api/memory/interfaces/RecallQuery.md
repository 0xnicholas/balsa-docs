---
generated: true
editUrl: false
next: false
prev: false
title: "RecallQuery"
---

Defined in: .framework/balsats-framework/packages/core/dist/memory/memory.d.ts:48

The `recall` query: the thread plus the port's paging knobs.

## Properties

### before?

> `readonly` `optional` **before?**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/memory/memory.d.ts:54

Cursor: only messages strictly older than the referenced message id are returned.

***

### limit?

> `readonly` `optional` **limit?**: `number`

Defined in: .framework/balsats-framework/packages/core/dist/memory/memory.d.ts:52

Page size; absent = this instance's `lastMessages` window.

***

### order?

> `readonly` `optional` **order?**: `"asc"` \| `"desc"`

Defined in: .framework/balsats-framework/packages/core/dist/memory/memory.d.ts:56

Presentation order; absent = `'asc'` (chronological, ready to feed the model).

***

### threadId

> `readonly` **threadId**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/memory/memory.d.ts:50

The thread to read history from.
