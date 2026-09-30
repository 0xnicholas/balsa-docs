---
generated: true
editUrl: false
next: false
prev: false
title: "MemorySaveAttributes"
---

> **MemorySaveAttributes** = `object`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:59

Attributes of a `memory-save` span — one step's save into a thread. The span's `input` carries
the batch handed to `save`, its `output` the messages as persisted (storage envelope included).

## Properties

### resourceId

> `readonly` **resourceId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:61

***

### threadId

> `readonly` **threadId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:60
