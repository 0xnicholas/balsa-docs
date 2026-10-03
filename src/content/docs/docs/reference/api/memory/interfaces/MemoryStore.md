---
generated: true
editUrl: false
next: false
prev: false
title: "MemoryStore"
---

Defined in: .framework/oribos-framework/packages/core/dist/memory/store.d.ts:10

The memory storage port: six required
methods plus the conditional resource pair, required only when working memory is enabled.

Evolution discipline is additive-only (ADR-0010): required
signatures never change; new capabilities arrive as optional methods whose existence is the
capability declaration — see `supportsWorkingMemory` for the detection convention.

## Extended by

- [`WorkingMemoryStore`](/docs/reference/api/memory/interfaces/workingmemorystore/)

## Methods

### deleteThread()

> **deleteThread**(`id`): `Promise`\<`void`\>

Defined in: .framework/oribos-framework/packages/core/dist/memory/store.d.ts:16

Delete a thread and cascade-delete its messages; resource-level data is untouched.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### getResource()?

> `optional` **getResource**(`id`): `Promise`\<[`StoredResource`](/docs/reference/api/memory/interfaces/storedresource/) \| `null`\>

Defined in: .framework/oribos-framework/packages/core/dist/memory/store.d.ts:24

Fetch one resource; `null` when absent. Conditional: working-memory capability.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`StoredResource`](/docs/reference/api/memory/interfaces/storedresource/) \| `null`\>

***

### getThreadById()

> **getThreadById**(`id`): `Promise`\<[`StoredThread`](/docs/reference/api/memory/interfaces/storedthread/) \| `null`\>

Defined in: .framework/oribos-framework/packages/core/dist/memory/store.d.ts:12

Fetch one thread; `null` when absent.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`StoredThread`](/docs/reference/api/memory/interfaces/storedthread/) \| `null`\>

***

### listMessages()

> **listMessages**(`query`): `Promise`\<[`StoredMessage`](/docs/reference/api/memory/type-aliases/storedmessage/)[]\>

Defined in: .framework/oribos-framework/packages/core/dist/memory/store.d.ts:20

List one thread's messages (see `ListMessagesQuery` for ordering/cursor semantics).

#### Parameters

##### query

[`ListMessagesQuery`](/docs/reference/api/memory/interfaces/listmessagesquery/)

#### Returns

`Promise`\<[`StoredMessage`](/docs/reference/api/memory/type-aliases/storedmessage/)[]\>

***

### listThreads()

> **listThreads**(`query`): `Promise`\<[`StoredThread`](/docs/reference/api/memory/interfaces/storedthread/)[]\>

Defined in: .framework/oribos-framework/packages/core/dist/memory/store.d.ts:18

List one resource's threads (see `ListThreadsQuery` for ordering/cursor semantics).

#### Parameters

##### query

[`ListThreadsQuery`](/docs/reference/api/memory/interfaces/listthreadsquery/)

#### Returns

`Promise`\<[`StoredThread`](/docs/reference/api/memory/interfaces/storedthread/)[]\>

***

### saveMessages()

> **saveMessages**(`messages`): `Promise`\<`void`\>

Defined in: .framework/oribos-framework/packages/core/dist/memory/store.d.ts:22

Batch-save messages (upsert by id).

#### Parameters

##### messages

[`StoredMessage`](/docs/reference/api/memory/type-aliases/storedmessage/)[]

#### Returns

`Promise`\<`void`\>

***

### saveResource()?

> `optional` **saveResource**(`resource`): `Promise`\<`void`\>

Defined in: .framework/oribos-framework/packages/core/dist/memory/store.d.ts:26

Upsert a full resource record. Conditional: working-memory capability.

#### Parameters

##### resource

[`StoredResource`](/docs/reference/api/memory/interfaces/storedresource/)

#### Returns

`Promise`\<`void`\>

***

### saveThread()

> **saveThread**(`thread`): `Promise`\<`void`\>

Defined in: .framework/oribos-framework/packages/core/dist/memory/store.d.ts:14

Upsert a full thread record (create and update share this one entry).

#### Parameters

##### thread

[`StoredThread`](/docs/reference/api/memory/interfaces/storedthread/)

#### Returns

`Promise`\<`void`\>
