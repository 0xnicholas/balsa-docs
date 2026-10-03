---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowConfig"
---

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:18

The `createWorkflow` config.

## Type Parameters

### TInputSchema

`TInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

### TOutputSchema

`TOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

## Properties

### id

> `readonly` **id**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:20

Workflow id; also the mental anchor for run ids and spans.

***

### inputSchema

> `readonly` **inputSchema**: `TInputSchema`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:22

The run's start input schema — validated at `start` (always on).

***

### outputSchema

> `readonly` **outputSchema**: `TOutputSchema`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:24

The workflow's declared output schema.

***

### storage?

> `readonly` `optional` **storage?**: [`WorkflowSnapshotStore`](/docs/reference/api/workflows/interfaces/workflowsnapshotstore/)

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:34

Snapshot store for suspend/resume; absent = the run is purely in memory (the core's in-memory
default keeps the snapshots for this process only).

***

### tracer?

> `readonly` `optional` **tracer?**: [`Tracer`](/docs/reference/api/observability/interfaces/tracer/)

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:29

Tracer the run and its step spans hang under; absent =
no span object is ever created.
