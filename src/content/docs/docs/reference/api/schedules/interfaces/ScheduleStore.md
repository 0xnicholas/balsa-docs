---
generated: true
editUrl: false
next: false
prev: false
title: "ScheduleStore"
---

Defined in: .framework/oribos-framework/packages/core/dist/schedules/store.d.ts:14

The schedules storage port: the five methods
records live through, JSON-only records, isomorphic to the other three ports. Core ships an
in-memory default (`in-memory-store.ts`); real backends arrive as adapters of the unified family.

Evolution is additive-only (ADR-0010): new capabilities arrive as
optional methods plus capability flags, never by changing these signatures.

The port owns storage, not firing: no CAS, no claim, no lease — `tick` reads due records and the
caller (platform cron is the first-class form) drives it; multi-instance safety is the deployer's
(`harness.md`「Schedules」).

## Methods

### delete()

> **delete**(`id`): `Promise`\<`void`\>

Defined in: .framework/oribos-framework/packages/core/dist/schedules/store.d.ts:22

Delete a record; deleting an absent id is a no-op.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`id`): `Promise`\<[`ScheduleRecord`](/docs/reference/api/schedules/interfaces/schedulerecord/) \| `null`\>

Defined in: .framework/oribos-framework/packages/core/dist/schedules/store.d.ts:18

Fetch one record by id; `null` when the store has none.

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`ScheduleRecord`](/docs/reference/api/schedules/interfaces/schedulerecord/) \| `null`\>

***

### list()

> **list**(`query?`): `Promise`\<[`ScheduleRecord`](/docs/reference/api/schedules/interfaces/schedulerecord/)[]\>

Defined in: .framework/oribos-framework/packages/core/dist/schedules/store.d.ts:20

List records (see `ScheduleListQuery` for order and cursor semantics).

#### Parameters

##### query?

[`ScheduleListQuery`](/docs/reference/api/schedules/interfaces/schedulelistquery/)

#### Returns

`Promise`\<[`ScheduleRecord`](/docs/reference/api/schedules/interfaces/schedulerecord/)[]\>

***

### listDue()

> **listDue**(`now`): `Promise`\<[`ScheduleRecord`](/docs/reference/api/schedules/interfaces/schedulerecord/)[]\>

Defined in: .framework/oribos-framework/packages/core/dist/schedules/store.d.ts:24

The records due at `now`: enabled, with a next occurrence at or before it, soonest first.

#### Parameters

##### now

`Date`

#### Returns

`Promise`\<[`ScheduleRecord`](/docs/reference/api/schedules/interfaces/schedulerecord/)[]\>

***

### save()

> **save**(`schedule`): `Promise`\<`void`\>

Defined in: .framework/oribos-framework/packages/core/dist/schedules/store.d.ts:16

Upsert one record, replacing the previous record under the same id.

#### Parameters

##### schedule

[`ScheduleRecord`](/docs/reference/api/schedules/interfaces/schedulerecord/)

#### Returns

`Promise`\<`void`\>
