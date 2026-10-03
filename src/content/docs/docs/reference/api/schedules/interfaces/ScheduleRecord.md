---
generated: true
editUrl: false
next: false
prev: false
title: "ScheduleRecord"
---

Defined in: .framework/oribos-framework/packages/core/dist/schedules/types.d.ts:44

One schedule as the store persists it (the `ScheduleStore` port's unit). JSON-only, like the two
snapshot ports: large data is referenced, never embedded.

## Properties

### enabled

> **enabled**: `boolean`

Defined in: .framework/oribos-framework/packages/core/dist/schedules/types.d.ts:61

A paused record is never due; absent at the facade (`save` defaults to `true`).

***

### id

> **id**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/schedules/types.d.ts:46

Identity of the schedule — the key `get` / `listDue` / `delete` speak, and the `next` pairing key.

***

### metadata?

> `optional` **metadata?**: `Record`\<`string`, `unknown`\>

Defined in: .framework/oribos-framework/packages/core/dist/schedules/types.d.ts:63

Opaque caller metadata, persisted as given.

***

### nextFireAt

> **nextFireAt**: `number` \| `null`

Defined in: .framework/oribos-framework/packages/core/dist/schedules/types.d.ts:52

The next occurrence, milliseconds since epoch (JSON-friendly; `new Date(ms)` converts), or
`null` when the registered `next` said there is none — an exhausted (e.g. one-shot past its
moment) schedule. A due record is one whose `nextFireAt <= tick's now`.

***

### target

> **target**: [`ScheduleTarget`](/docs/reference/api/schedules/type-aliases/scheduletarget/)

Defined in: .framework/oribos-framework/packages/core/dist/schedules/types.d.ts:54

What firing this record does (see `ScheduleTarget`).

***

### timezone?

> `optional` **timezone?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/schedules/types.d.ts:59

The IANA timezone name carried through untouched — the core never interprets it. It is for the
host: the material the `next` function (e.g. a croner wrapper) is built from, or display.
