---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowRunSuspendedOutcome"
---

Defined in: .framework/balsa-framework/packages/core/dist/workflows/run.d.ts:33

The outcome of a run that suspended: a step called `suspend(payload)` and the run unwound.
`stepId` names that step — the step `resume` must target; the payload it carried lives in
`stepResults[stepId].suspendPayload`.

## Properties

### status

> `readonly` **status**: `"suspended"`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/run.d.ts:35

The run's terminal status.

***

### stepId

> `readonly` **stepId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/run.d.ts:37

The step that suspended — whose `resumeSchema` a resume's `resumeData` is validated against.

***

### stepResults

> `readonly` **stepResults**: `Readonly`\<`Record`\<`string`, [`WorkflowStepResultSnapshot`](/docs/reference/api/workflows/interfaces/workflowstepresultsnapshot/)\>\>

Defined in: .framework/balsa-framework/packages/core/dist/workflows/run.d.ts:39

Per-step records, keyed by step id — the suspended step's record carries its `suspendPayload`.
