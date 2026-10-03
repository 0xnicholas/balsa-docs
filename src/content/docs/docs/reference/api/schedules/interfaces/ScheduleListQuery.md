---
generated: true
editUrl: false
next: false
prev: false
title: "ScheduleListQuery"
---

Defined in: .framework/balsats-framework/packages/core/dist/schedules/types.d.ts:90

The `ScheduleStore.list()` query. Listing runs soonest-first (`nextFireAt` ascending, records with
`nextFireAt: null` last, `id` as tie-break), and `before` is the port family's cursor convention
(as in `MemoryStore.listThreads`): a record id, and the page continues strictly *past* the
referenced record in that order — here that means later fire times.

## Properties

### before?

> `optional` **before?**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/schedules/types.d.ts:94

Cursor record id; a dangling cursor is a caller bug and throws.

***

### limit?

> `optional` **limit?**: `number`

Defined in: .framework/balsats-framework/packages/core/dist/schedules/types.d.ts:92

Page size, anchored at the head of the order. Positive integer.
