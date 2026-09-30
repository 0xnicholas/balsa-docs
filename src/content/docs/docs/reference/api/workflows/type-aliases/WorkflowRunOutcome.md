---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowRunOutcome"
---

> **WorkflowRunOutcome**\<`TOutput`\> = [`WorkflowRunSuccessOutcome`](/docs/reference/api/workflows/interfaces/workflowrunsuccessoutcome/)\<`TOutput`\> \| [`WorkflowRunSuspendedOutcome`](/docs/reference/api/workflows/interfaces/workflowrunsuspendedoutcome/)

Defined in: .framework/balsa-framework/packages/core/dist/workflows/run.d.ts:45

The run's outcome: the terminal value `out.result` resolves with (`resume` resolves with the same
envelope). A failed run never reaches here — it rejects with the error that failed it.

## Type Parameters

### TOutput

`TOutput` = `unknown`
