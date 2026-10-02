---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowRunEndEvent"
---

Defined in: .framework/balsats-framework/packages/core/dist/workflows/events.d.ts:61

The run reached its terminal state — `success` with the workflow's terminal value, or
`suspended` when a step raised the suspend signal. A failed run has no run-end: the stream
rejects with the run's error instead.

## Properties

### output?

> `readonly` `optional` **output?**: `unknown`

Defined in: .framework/balsats-framework/packages/core/dist/workflows/events.d.ts:66

The workflow's terminal value; present only on `success`.

***

### status

> `readonly` **status**: `"suspended"` \| `"success"`

Defined in: .framework/balsats-framework/packages/core/dist/workflows/events.d.ts:64

The run's terminal status.

***

### type

> `readonly` **type**: `"run-end"`

Defined in: .framework/balsats-framework/packages/core/dist/workflows/events.d.ts:62
