---
generated: true
editUrl: false
next: false
prev: false
title: "SaveMessage"
---

> **SaveMessage** = [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/) & `object`

Defined in: .framework/oribos-framework/packages/core/dist/memory/memory.d.ts:20

A message handed to `save`: a model-contract message plus an *optional* storage envelope. The
caller may bring `id` / `createdAt` (explicit values are persisted as given); the rest of the
envelope is always Memory's — `threadId` / `resourceId` come from the call's `thread` /
`resource`, never from the message body.

## Type Declaration

### createdAt?

> `optional` **createdAt?**: `Date`

### id?

> `optional` **id?**: `string`
