---
generated: true
editUrl: false
next: false
prev: false
title: "SaveInput"
---

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:59

The `save` input: the thread/resource identity plus the messages to append.

## Properties

### messages

> `readonly` **messages**: readonly [`SaveMessage`](/docs/reference/api/memory/type-aliases/savemessage/)[]

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:65

The messages to persist, in order.

***

### resource

> `readonly` **resource**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:63

The thread's owner (and the `resourceId` stamped on every saved message).

***

### thread

> `readonly` **thread**: [`MemoryThreadRef`](/docs/reference/api/memory/type-aliases/memorythreadref/)

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:61

The thread to save into — created when it does not exist yet.
