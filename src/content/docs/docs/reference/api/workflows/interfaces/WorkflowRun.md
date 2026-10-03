---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowRun"
---

Defined in: .framework/oribos-framework/packages/core/dist/workflows/run.d.ts:105

One execution lifecycle of a committed workflow (the run lifecycle):
`createRun` mints its identity, `start` begins the single execution, and `resume` continues a run
that suspended — the run it was started on, or (the durable path) a fresh run object over the same
`runId` and store. A run executes once: `start` refuses a second call, and `resume` continues the
same execution as often as the run suspends again.

## Type Parameters

### TInputData

`TInputData` = `unknown`

### TOutput

`TOutput` = `unknown`

## Properties

### runId

> `readonly` **runId**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/run.d.ts:107

Identity of this run — correlation for snapshots, spans and the request context.

## Methods

### resume()

> **resume**(`options`): `Promise`\<[`WorkflowRunOutcome`](/docs/reference/api/workflows/type-aliases/workflowrunoutcome/)\<`TOutput`\>\>

Defined in: .framework/oribos-framework/packages/core/dist/workflows/run.d.ts:116

Resumes a suspended run: loads its snapshot, validates `resumeData` against the suspended step's
`resumeSchema`, and re-enters the walk from the snapshot's position. Concurrent resumes of one
snapshot — the same store and run id — are deduplicated: the later call joins the one in
flight.

#### Parameters

##### options

[`WorkflowResumeOptions`](/docs/reference/api/workflows/interfaces/workflowresumeoptions/)

#### Returns

`Promise`\<[`WorkflowRunOutcome`](/docs/reference/api/workflows/type-aliases/workflowrunoutcome/)\<`TOutput`\>\>

***

### start()

> **start**(`options`): [`WorkflowRunOutput`](/docs/reference/api/workflows/interfaces/workflowrunoutput/)\<`TOutput`\>

Defined in: .framework/oribos-framework/packages/core/dist/workflows/run.d.ts:109

Starts the run once, returning its output object.

#### Parameters

##### options

[`WorkflowStartOptions`](/docs/reference/api/workflows/interfaces/workflowstartoptions/)\<`TInputData`\>

#### Returns

[`WorkflowRunOutput`](/docs/reference/api/workflows/interfaces/workflowrunoutput/)\<`TOutput`\>
