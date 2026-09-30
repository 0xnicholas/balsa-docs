---
generated: true
editUrl: false
next: false
prev: false
title: "ScheduleTarget"
---

> **ScheduleTarget** = [`ScheduleAgentTarget`](/docs/reference/api/schedules/interfaces/scheduleagenttarget/) \| [`ScheduleSignalTarget`](/docs/reference/api/schedules/interfaces/schedulesignaltarget/)

Defined in: .framework/balsa-framework/packages/core/dist/schedules/types.d.ts:39

What a trigger does (`harness.md`「Schedules」: target 两形态). The two forms are distinguished by
their fields: a `thread` selects the threaded (signals) form, `agent` the threadless one.
