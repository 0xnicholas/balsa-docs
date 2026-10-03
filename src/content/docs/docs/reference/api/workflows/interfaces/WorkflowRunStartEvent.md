---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowRunStartEvent"
---

Defined in: .framework/balsats-framework/packages/core/dist/workflows/events.d.ts:18

The run began: the start boundary accepted the input (a rejected start never emits this — the
run did not begin). `input` is the validated value the run consumes, defaults and transforms
applied.

## Properties

### input

> `readonly` **input**: `unknown`

Defined in: .framework/balsats-framework/packages/core/dist/workflows/events.d.ts:25

The run's validated start input.

***

### runId

> `readonly` **runId**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/workflows/events.d.ts:21

Identity of the run (`createRun`'s run id).

***

### type

> `readonly` **type**: `"run-start"`

Defined in: .framework/balsats-framework/packages/core/dist/workflows/events.d.ts:19

***

### workflowId

> `readonly` **workflowId**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/workflows/events.d.ts:23

Identity of the workflow being run.
