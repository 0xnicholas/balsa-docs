---
generated: true
editUrl: false
next: false
prev: false
title: "StoredMessage"
---

> **StoredMessage** = [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/) & `object`

Defined in: .framework/balsats-framework/packages/core/dist/memory/types.d.ts:22

A stored message: the model contract's prompt message (`ModelMessage`) plus the storage
envelope. Internal flow and storage share one format; messages are immutable — a repeated `id`
in `saveMessages` replaces, and the memory layer above never does that.

## Type Declaration

### createdAt

> **createdAt**: `Date`

### id

> **id**: `string`

### resourceId

> **resourceId**: `string`

### threadId

> **threadId**: `string`
