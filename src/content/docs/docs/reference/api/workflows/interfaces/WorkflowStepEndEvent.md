---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowStepEndEvent"
---

Defined in: .framework/balsa-framework/packages/core/dist/workflows/events.d.ts:47

A step's boundary was left: how it ended, and what it produced when it succeeded. `suspended`
means the step suspended the run; a suspend raised where the run cannot act on it (a block's
iteration site, #51) leaves the run failed and reads `failed` here — the record and the stream
agree about it (neither claims a suspended step on a failed run).

## Properties

### output?

> `readonly` `optional` **output?**: `unknown`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/events.d.ts:54

The step's validated output; present only when `status` is `success`.

***

### status

> `readonly` **status**: [`StepStatus`](/docs/reference/api/workflows/type-aliases/stepstatus/)

Defined in: .framework/balsa-framework/packages/core/dist/workflows/events.d.ts:52

How this execution of the step ended.

***

### stepId

> `readonly` **stepId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/events.d.ts:50

The step's id.

***

### type

> `readonly` **type**: `"step-end"`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/events.d.ts:48
