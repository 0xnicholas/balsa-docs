---
generated: true
editUrl: false
next: false
prev: false
title: "ScheduleAgentTarget"
---

Defined in: .framework/balsa-framework/packages/core/dist/schedules/types.d.ts:15

Threadless targets: the trigger runs the named agent once, isolated — `agents[name].generate(input)`,
no memory identity, no thread (the mastra 「threadless」mode). Message history is untouched.

## Properties

### agent

> `readonly` **agent**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/schedules/types.d.ts:17

The agent to run, by name in `createSchedules({ agents })`.

***

### input

> `readonly` **input**: `string` \| [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

Defined in: .framework/balsa-framework/packages/core/dist/schedules/types.d.ts:19

The input the run starts from — the agent's own `generate` input shape.
