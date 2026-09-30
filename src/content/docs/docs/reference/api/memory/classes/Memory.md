---
generated: true
editUrl: false
next: false
prev: false
title: "Memory"
---

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:68

The memory subsystem's entry object.

## Constructors

### Constructor

> **new Memory**(`config?`): `Memory`

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:78

#### Parameters

##### config?

[`MemoryConfig`](/docs/reference/api/memory/interfaces/memoryconfig/)

#### Returns

`Memory`

## Properties

### lastMessages

> `readonly` **lastMessages**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:70

The default `recall` window size (spec: message history is truncated by count only).

***

### workingMemory

> `readonly` **workingMemory**: [`WorkingMemoryConfig`](/docs/reference/api/memory/interfaces/workingmemoryconfig/) \| `undefined`

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:72

The working-memory config; `undefined` = this instance carries message history alone.

## Methods

### getWorkingMemory()

> **getWorkingMemory**(`resource`): `Promise`\<`unknown`\>

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:109

The working memory currently stored for a resource (spec「工作记忆」) — schema-validated at
write time, so it is returned as stored; `undefined` when the resource has none yet. Working
memory is resource-scoped: unrelated to threads and untouched by `deleteThread`. Reading does
not re-validate: a record written under another schema (or by another writer) is injected as
it was stored — conformity is the write path's promise.

#### Parameters

##### resource

`string`

#### Returns

`Promise`\<`unknown`\>

***

### recall()

> **recall**(`query`): `Promise`\<[`StoredMessage`](/docs/reference/api/memory/type-aliases/storedmessage/)[]\>

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:85

The single query entry of message history (spec 消息历史节): returns the thread's messages
with the storage envelope, in chronological order by default — directly feedable to a model.
Without an explicit `limit` the instance's `lastMessages` window applies; `before` pages
towards older history. Unknown threads read as an empty history.

#### Parameters

##### query

[`RecallQuery`](/docs/reference/api/memory/interfaces/recallquery/)

#### Returns

`Promise`\<[`StoredMessage`](/docs/reference/api/memory/type-aliases/storedmessage/)[]\>

***

### save()

> **save**(`input`): `Promise`\<[`StoredMessage`](/docs/reference/api/memory/type-aliases/storedmessage/)[]\>

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:96

Persists messages into a thread, creating the thread when it does not exist yet (with the
reference's `title` / `metadata`; applying them to an existing thread when provided, leaving
them untouched otherwise). Fills the parts of the envelope the caller left out (`id` via
`crypto.randomUUID()`, `createdAt` from this instance's stamp sequence) and stamps `threadId`
/ `resourceId` from the call. Returns the messages as persisted, envelope included.

A thread belongs to exactly one resource (no ownership migration, spec 身份模型节): a call
naming an existing thread with a different `resource` throws before anything is written.

#### Parameters

##### input

[`SaveInput`](/docs/reference/api/memory/interfaces/saveinput/)

#### Returns

`Promise`\<[`StoredMessage`](/docs/reference/api/memory/type-aliases/storedmessage/)[]\>

***

### updateWorkingMemory()

> **updateWorkingMemory**(`input`): `Promise`\<`unknown`\>

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:123

Merges a patch into a resource's working memory, validates the result against the configured
schema and persists it (spec「工作记忆」: objects merge deeply, `null` deletes a field, arrays
are replaced whole). Returns the validated value — what was stored, exactly.

This is the semantic path behind the `updateWorkingMemory` tool and the programmatic write
entry: a patch that does not make the merged value conform throws (issues included) and writes
nothing — through the tool, that error is the error tool result the model recovers from. The
resource record is an upsert: `metadata` and `createdAt` of an existing record are preserved.

Read-modify-write is not atomic: concurrent updates of one resource are last-write-wins (the
port's conditional pair has no compare-and-swap; additive-only evolution keeps that seam open).

#### Parameters

##### input

###### patch

`unknown`

###### resource

`string`

#### Returns

`Promise`\<`unknown`\>
