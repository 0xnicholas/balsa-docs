---
generated: true
editUrl: false
next: false
prev: false
title: "Schedules"
---

Defined in: .framework/balsats-framework/packages/core/dist/schedules/schedules.d.ts:49

The schedules entry object.

## Methods

### save()

> **save**(`input`): `Promise`\<[`ScheduleRecord`](/docs/reference/api/schedules/interfaces/schedulerecord/)\>

Defined in: .framework/balsats-framework/packages/core/dist/schedules/schedules.d.ts:57

Upserts one schedule: validates the target, mints `id` when absent, computes
`nextFireAt = next(now)`, registers `next` in-process under the id (replacing a previous
registration), persists the record and returns it. Re-saving an id re-anchors `nextFireAt` at
now — the definition just saved is authoritative, which is what re-registering schedules at
boot wants.

#### Parameters

##### input

[`ScheduleSaveInput`](/docs/reference/api/schedules/interfaces/schedulesaveinput/)

#### Returns

`Promise`\<[`ScheduleRecord`](/docs/reference/api/schedules/interfaces/schedulerecord/)\>

***

### startTicker()

> **startTicker**(`options`): [`ScheduleTicker`](/docs/reference/api/schedules/interfaces/scheduleticker/)

Defined in: .framework/balsats-framework/packages/core/dist/schedules/schedules.d.ts:75

Starts an in-process ticker: one `tick()` per `intervalMs` (the first beat after one interval,
not at start), single-process semantics. A beat whose previous tick is still running is skipped
— a slow trigger never stacks. Beat errors are swallowed (call `tick()` directly to observe
them): the convenient form exists for hosts that would otherwise forget a `.catch`.

#### Parameters

##### options

[`ScheduleTickerOptions`](/docs/reference/api/schedules/interfaces/scheduletickeroptions/)

#### Returns

[`ScheduleTicker`](/docs/reference/api/schedules/interfaces/scheduleticker/)

***

### tick()

> **tick**(`options?`): `Promise`\<`void`\>

Defined in: .framework/balsats-framework/packages/core/dist/schedules/schedules.d.ts:68

One tick: every due record (enabled, next occurrence at or before `now`) fires in order —
threadless through `agent.generate`, threaded through `signals.sendSignal` — and its
`nextFireAt` advances to `next(now)`. A target failure never rejects the tick: it is caught,
and the record advances anyway (the occurrence is spent, exactly as a failed platform-cron
invocation is; the run's own trace carries the failure). A due record with no in-process `next`
registration is skipped — it cannot be rescheduled, so firing it would repeat on every tick.
No catch-up: a late tick fires each due record once and schedules it after `now`; occurrences
the delay skipped are not replayed.

#### Parameters

##### options?

[`ScheduleTickOptions`](/docs/reference/api/schedules/interfaces/scheduletickoptions/)

#### Returns

`Promise`\<`void`\>
