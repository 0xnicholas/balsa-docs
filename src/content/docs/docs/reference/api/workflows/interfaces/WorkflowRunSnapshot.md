---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowRunSnapshot"
---

Defined in: .framework/oribos-framework/packages/core/dist/workflows/snapshot.d.ts:63

One run's JSON-serializable state (suspend/resume and snapshots):
the run identity, its status, the input it started with, the per-step results and the flat entry
position to re-enter from — the `startIdx` equivalent — plus the trace the run's spans belong to,
so a resumed segment continues the same trace.

## Properties

### input

> `readonly` **input**: `unknown`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/snapshot.d.ts:69

The run's start input (JSON-only; large data by reference).

***

### iterationSite?

> `readonly` `optional` **iterationSite?**: [`WorkflowIterationSite`](/docs/reference/api/workflows/type-aliases/workflowiterationsite/)

Defined in: .framework/oribos-framework/packages/core/dist/workflows/snapshot.d.ts:80

Where inside the block at `position` the run suspended (#54, additive — like `traceId`, a
snapshot written before the field existed simply lacks it). Present only while the run is
suspended inside a block; `resume` re-enters the block from it. A missing site on a suspended
snapshot means the top-level `then` suspension of the earlier shape.

***

### position

> `readonly` **position**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/snapshot.d.ts:73

Position in the flat entry list to re-enter from on resume.

***

### runId

> `readonly` **runId**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/snapshot.d.ts:65

Identity of the run this snapshot belongs to.

***

### status

> `readonly` **status**: [`WorkflowRunStatus`](/docs/reference/api/workflows/type-aliases/workflowrunstatus/)

Defined in: .framework/oribos-framework/packages/core/dist/workflows/snapshot.d.ts:67

Run status at write time (`running` for step-boundary snapshots).

***

### stepResults

> `readonly` **stepResults**: `Readonly`\<`Record`\<`string`, [`WorkflowStepResultSnapshot`](/docs/reference/api/workflows/interfaces/workflowstepresultsnapshot/)\>\>

Defined in: .framework/oribos-framework/packages/core/dist/workflows/snapshot.d.ts:71

Per-step results, keyed by step id.

***

### traceId?

> `readonly` `optional` **traceId?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/snapshot.d.ts:86

The trace the run's spans were exported under (32-hex), written whenever a real span exists —
an untraced run, or one whose trace the sampler rejected, carries no id. A resume starts a new
`workflow-run` span in this trace, so a suspension does not break the observation tree.
