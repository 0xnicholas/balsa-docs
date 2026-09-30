---
generated: true
editUrl: false
next: false
prev: false
title: "ListMessagesQuery"
---

Defined in: .framework/balsa-framework/packages/core/dist/memory/types.d.ts:52

Message listing: messages of one thread. `limit` anchors at the newest end (the recent-window
semantic of message history — never the oldest N); `order` flips presentation only and defaults
to `'desc'`. `before` is a cursor: only messages strictly older than the referenced message are
returned. Ordering key is `createdAt` (`id` as tie-break).

## Properties

### before?

> `optional` **before?**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/memory/types.d.ts:55

***

### limit?

> `optional` **limit?**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/memory/types.d.ts:54

***

### order?

> `optional` **order?**: `"asc"` \| `"desc"`

Defined in: .framework/balsa-framework/packages/core/dist/memory/types.d.ts:56

***

### threadId

> **threadId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/memory/types.d.ts:53
