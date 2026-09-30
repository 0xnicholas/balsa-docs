---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowRunSuccessOutcome"
---

Defined in: .framework/balsa-framework/packages/core/dist/workflows/run.d.ts:20

The outcome of a run that completed: the workflow's terminal value and the per-step records.

## Type Parameters

### TOutput

`TOutput` = `unknown`

## Properties

### output

> `readonly` **output**: `TOutput`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/run.d.ts:24

The workflow's terminal value: the last entry's output, or the start input when it has no entries.

***

### status

> `readonly` **status**: `"success"`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/run.d.ts:22

The run's terminal status.

***

### stepResults

> `readonly` **stepResults**: `Readonly`\<`Record`\<`string`, [`WorkflowStepResultSnapshot`](/docs/reference/api/workflows/interfaces/workflowstepresultsnapshot/)\>\>

Defined in: .framework/balsa-framework/packages/core/dist/workflows/run.d.ts:26

Per-step records, keyed by step id — status, output and boundary timestamps.
