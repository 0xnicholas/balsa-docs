---
generated: true
editUrl: false
next: false
prev: false
title: "ScheduleSignalTarget"
---

Defined in: .framework/oribos-framework/packages/core/dist/schedules/types.d.ts:27

Threaded targets: the trigger injects a signal into a conversation — `signals.sendSignal({ thread,
resource }, payload)` — so the run wakes (or an active one receives it) exactly as any other
signal (reusing the base signals; the facade requires a `signals` instance to accept this
shape). The payload is the caller's, `type` included: the core adds nothing to it.

## Properties

### payload

> `readonly` **payload**: [`SignalPayload`](/docs/reference/api/signals/interfaces/signalpayload/)

Defined in: .framework/oribos-framework/packages/core/dist/schedules/types.d.ts:33

The signal payload to send — open `type` plus the sender's own fields.

***

### resource

> `readonly` **resource**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/schedules/types.d.ts:31

The thread's owner (`resourceId`), as every signals target requires.

***

### thread

> `readonly` **thread**: [`MemoryThreadRef`](/docs/reference/api/memory/type-aliases/memorythreadref/)

Defined in: .framework/oribos-framework/packages/core/dist/schedules/types.d.ts:29

The thread the signal lands in (a `Memory` thread id, or id plus creation fields).
