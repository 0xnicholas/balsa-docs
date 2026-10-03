---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowDefinition"
---

> **WorkflowDefinition**\<`TInputSchema`\> = `Pick`\<[`Workflow`](/docs/reference/api/workflows/interfaces/workflow/)\<`TInputSchema`\>, `"id"` \| `"inputSchema"` \| `"entries"`\> & `object`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/walker.d.ts:36

What a run reads of its workflow: the identity, the start input schema, the tracer slot and the
frozen entries. `tracer` / `storage` are the definition's wiring slots — optional here, so a
hand-built definition (a test, a storeless run) only spells the definition surface itself.

## Type Declaration

### storage?

> `readonly` `optional` **storage?**: [`WorkflowSnapshotStore`](/docs/reference/api/workflows/interfaces/workflowsnapshotstore/)

Snapshot store attached to the definition; absent = the run keeps its snapshots in memory.

### tracer?

> `readonly` `optional` **tracer?**: [`Tracer`](/docs/reference/api/observability/interfaces/tracer/)

Tracer the run's and its steps' spans hang under; absent = no span object is ever created.

## Type Parameters

### TInputSchema

`TInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)
