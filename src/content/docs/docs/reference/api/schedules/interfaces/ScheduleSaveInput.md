---
generated: true
editUrl: false
next: false
prev: false
title: "ScheduleSaveInput"
---

Defined in: .framework/balsats-framework/packages/core/dist/schedules/types.d.ts:70

The `schedules.save()` input: the record's fields plus the occurrence function. `next(from)`
returns the first occurrence strictly after `from`, or `null` when the schedule has none left —
cron parsing is injected this way, so the core stays zero-dependency (`harness.md`「Schedules」).

## Properties

### enabled?

> `readonly` `optional` **enabled?**: `boolean`

Defined in: .framework/balsats-framework/packages/core/dist/schedules/types.d.ts:80

Paused when `false`; absent = enabled.

***

### id?

> `readonly` `optional` **id?**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/schedules/types.d.ts:72

Explicit identity (the upsert key); absent = the facade mints one.

***

### metadata?

> `readonly` `optional` **metadata?**: `Record`\<`string`, `unknown`\>

Defined in: .framework/balsats-framework/packages/core/dist/schedules/types.d.ts:82

Opaque caller metadata (see `ScheduleRecord.metadata`).

***

### next

> **next**: (`from`) => `Date` \| `null`

Defined in: .framework/balsats-framework/packages/core/dist/schedules/types.d.ts:74

Next occurrence after `from`, or `null` for none (see the interface doc).

#### Parameters

##### from

`Date`

#### Returns

`Date` \| `null`

***

### target

> `readonly` **target**: [`ScheduleTarget`](/docs/reference/api/schedules/type-aliases/scheduletarget/)

Defined in: .framework/balsats-framework/packages/core/dist/schedules/types.d.ts:76

What firing does (see `ScheduleTarget`).

***

### timezone?

> `readonly` `optional` **timezone?**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/schedules/types.d.ts:78

The IANA timezone name, carried through untouched (see `ScheduleRecord.timezone`).
