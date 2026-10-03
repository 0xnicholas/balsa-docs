---
generated: true
editUrl: false
next: false
prev: false
title: "ScheduleTarget"
---

> **ScheduleTarget** = [`ScheduleAgentTarget`](/docs/reference/api/schedules/interfaces/scheduleagenttarget/) \| [`ScheduleSignalTarget`](/docs/reference/api/schedules/interfaces/schedulesignaltarget/)

Defined in: .framework/oribos-framework/packages/core/dist/schedules/types.d.ts:39

What a trigger does (schedules: the two target forms). The two forms are distinguished by
their fields: a `thread` selects the threaded (signals) form, `agent` the threadless one.
