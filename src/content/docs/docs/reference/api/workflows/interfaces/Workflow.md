---
generated: true
editUrl: false
next: false
prev: false
title: "Workflow"
---

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:41

The committed workflow — what `.commit()` returns: the frozen definition the walker reads. A
builder is not runnable; `createRun` can only ever exist here (the type-state enforces "no run
before commit").

## Type Parameters

### TInputSchema

`TInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

### TOutputSchema

`TOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

## Properties

### entries

> `readonly` **entries**: readonly [`WorkflowEntry`](/docs/reference/api/workflows/type-aliases/workflowentry/)[]

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:53

The frozen, flat entry list the walker interprets.

***

### id

> `readonly` **id**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:43

Workflow id.

***

### inputSchema

> `readonly` **inputSchema**: `TInputSchema`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:45

The run's start input schema.

***

### outputSchema

> `readonly` **outputSchema**: `TOutputSchema`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:47

The workflow's declared output schema.

***

### storage

> `readonly` **storage**: [`WorkflowSnapshotStore`](/docs/reference/api/workflows/interfaces/workflowsnapshotstore/) \| `undefined`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:51

The snapshot store; `undefined` when none was attached (the run then defaults to in-memory).

***

### tracer

> `readonly` **tracer**: [`Tracer`](/docs/reference/api/observability/interfaces/tracer/) \| `undefined`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:49

The distributed tracer; `undefined` when none was attached.

## Methods

### createRun()

> **createRun**(`options?`): [`WorkflowRun`](/docs/reference/api/workflows/interfaces/workflowrun/)\<[`InferInput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferinput/)\<`TInputSchema`\>, [`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TOutputSchema`\>\>

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:58

Creates a run of this workflow (the run lifecycle): identity now, execution
on `start`. The workflow's declared IO schemas type the run's input and output.

#### Parameters

##### options?

[`WorkflowCreateRunOptions`](/docs/reference/api/workflows/interfaces/workflowcreaterunoptions/)

#### Returns

[`WorkflowRun`](/docs/reference/api/workflows/interfaces/workflowrun/)\<[`InferInput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferinput/)\<`TInputSchema`\>, [`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TOutputSchema`\>\>
