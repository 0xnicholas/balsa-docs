---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowStepStartEvent"
---

Defined in: .framework/balsa-framework/packages/core/dist/workflows/events.d.ts:34

A step's boundary was entered: the value that arrived (validated at the boundary; a rejected
input emits the `step-end` with status `failed` and no `step-start` value of its own).

One pair per step execution: a `foreach` iteration, a loop iteration and a `parallel` arm each
cross their step's boundary — the run's records aggregate by step id, the events do not.

## Properties

### input

> `readonly` **input**: `unknown`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/events.d.ts:39

The value that arrived at the step's input boundary.

***

### stepId

> `readonly` **stepId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/events.d.ts:37

The step's id.

***

### type

> `readonly` **type**: `"step-start"`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/events.d.ts:35
