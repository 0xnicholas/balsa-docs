---
generated: true
editUrl: false
next: false
prev: false
title: "SchedulesConfig"
---

Defined in: .framework/balsa-framework/packages/core/dist/schedules/schedules.d.ts:18

The `createSchedules` config.

## Properties

### agents

> `readonly` **agents**: `Readonly`\<`Record`\<`string`, [`Agent`](/docs/reference/api/agent/classes/agent/)\>\>

Defined in: .framework/balsa-framework/packages/core/dist/schedules/schedules.d.ts:25

The agents threadless targets may name (`ScheduleAgentTarget.agent`): the target runs
`agents[name].generate(input)`. `save` rejects a name that is not registered here.

***

### signals?

> `readonly` `optional` **signals?**: [`Signals`](/docs/reference/api/signals/interfaces/signals/)

Defined in: .framework/balsa-framework/packages/core/dist/schedules/schedules.d.ts:31

The signals instance threaded targets ride (`ScheduleSignalTarget`). Required to save a threaded
target at all; the trigger then injects exactly as any other signal — wake the idle thread, or
inject into the active run (`docs/architecture/harness.md`「Signals」).

***

### storage?

> `readonly` `optional` **storage?**: [`ScheduleStore`](/docs/reference/api/schedules/interfaces/schedulestore/)

Defined in: .framework/balsa-framework/packages/core/dist/schedules/schedules.d.ts:20

The records' storage; absent = the core's in-memory default (this process only).
