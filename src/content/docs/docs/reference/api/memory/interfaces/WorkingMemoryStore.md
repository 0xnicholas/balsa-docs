---
generated: true
editUrl: false
next: false
prev: false
title: "WorkingMemoryStore"
---

Defined in: .framework/balsa-framework/packages/core/dist/memory/store.d.ts:29

A `MemoryStore` with the conditional resource pair present (working-memory capable).

## Extends

- [`MemoryStore`](/docs/reference/api/memory/interfaces/memorystore/)

## Methods

### deleteThread()

> **deleteThread**(`id`): `Promise`\<`void`\>

Defined in: .framework/balsa-framework/packages/core/dist/memory/store.d.ts:16

Delete a thread and cascade-delete its messages; resource-level data is untouched.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`MemoryStore`](/docs/reference/api/memory/interfaces/memorystore/).[`deleteThread`](/docs/reference/api/memory/interfaces/memorystore/#deletethread)

***

### getResource()

> **getResource**(`id`): `Promise`\<[`StoredResource`](/docs/reference/api/memory/interfaces/storedresource/) \| `null`\>

Defined in: .framework/balsa-framework/packages/core/dist/memory/store.d.ts:30

Fetch one resource; `null` when absent. Conditional: working-memory capability.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`StoredResource`](/docs/reference/api/memory/interfaces/storedresource/) \| `null`\>

#### Overrides

[`MemoryStore`](/docs/reference/api/memory/interfaces/memorystore/).[`getResource`](/docs/reference/api/memory/interfaces/memorystore/#getresource)

***

### getThreadById()

> **getThreadById**(`id`): `Promise`\<[`StoredThread`](/docs/reference/api/memory/interfaces/storedthread/) \| `null`\>

Defined in: .framework/balsa-framework/packages/core/dist/memory/store.d.ts:12

Fetch one thread; `null` when absent.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`StoredThread`](/docs/reference/api/memory/interfaces/storedthread/) \| `null`\>

#### Inherited from

[`MemoryStore`](/docs/reference/api/memory/interfaces/memorystore/).[`getThreadById`](/docs/reference/api/memory/interfaces/memorystore/#getthreadbyid)

***

### listMessages()

> **listMessages**(`query`): `Promise`\<[`StoredMessage`](/docs/reference/api/memory/type-aliases/storedmessage/)[]\>

Defined in: .framework/balsa-framework/packages/core/dist/memory/store.d.ts:20

List one thread's messages (see `ListMessagesQuery` for ordering/cursor semantics).

#### Parameters

##### query

[`ListMessagesQuery`](/docs/reference/api/memory/interfaces/listmessagesquery/)

#### Returns

`Promise`\<[`StoredMessage`](/docs/reference/api/memory/type-aliases/storedmessage/)[]\>

#### Inherited from

[`MemoryStore`](/docs/reference/api/memory/interfaces/memorystore/).[`listMessages`](/docs/reference/api/memory/interfaces/memorystore/#listmessages)

***

### listThreads()

> **listThreads**(`query`): `Promise`\<[`StoredThread`](/docs/reference/api/memory/interfaces/storedthread/)[]\>

Defined in: .framework/balsa-framework/packages/core/dist/memory/store.d.ts:18

List one resource's threads (see `ListThreadsQuery` for ordering/cursor semantics).

#### Parameters

##### query

[`ListThreadsQuery`](/docs/reference/api/memory/interfaces/listthreadsquery/)

#### Returns

`Promise`\<[`StoredThread`](/docs/reference/api/memory/interfaces/storedthread/)[]\>

#### Inherited from

[`MemoryStore`](/docs/reference/api/memory/interfaces/memorystore/).[`listThreads`](/docs/reference/api/memory/interfaces/memorystore/#listthreads)

***

### saveMessages()

> **saveMessages**(`messages`): `Promise`\<`void`\>

Defined in: .framework/balsa-framework/packages/core/dist/memory/store.d.ts:22

Batch-save messages (upsert by id).

#### Parameters

##### messages

[`StoredMessage`](/docs/reference/api/memory/type-aliases/storedmessage/)[]

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`MemoryStore`](/docs/reference/api/memory/interfaces/memorystore/).[`saveMessages`](/docs/reference/api/memory/interfaces/memorystore/#savemessages)

***

### saveResource()

> **saveResource**(`resource`): `Promise`\<`void`\>

Defined in: .framework/balsa-framework/packages/core/dist/memory/store.d.ts:31

Upsert a full resource record. Conditional: working-memory capability.

#### Parameters

##### resource

[`StoredResource`](/docs/reference/api/memory/interfaces/storedresource/)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`MemoryStore`](/docs/reference/api/memory/interfaces/memorystore/).[`saveResource`](/docs/reference/api/memory/interfaces/memorystore/#saveresource)

***

### saveThread()

> **saveThread**(`thread`): `Promise`\<`void`\>

Defined in: .framework/balsa-framework/packages/core/dist/memory/store.d.ts:14

Upsert a full thread record (create and update share this one entry).

#### Parameters

##### thread

[`StoredThread`](/docs/reference/api/memory/interfaces/storedthread/)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`MemoryStore`](/docs/reference/api/memory/interfaces/memorystore/).[`saveThread`](/docs/reference/api/memory/interfaces/memorystore/#savethread)
