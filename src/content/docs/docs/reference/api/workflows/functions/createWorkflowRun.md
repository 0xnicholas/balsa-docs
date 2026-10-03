---
generated: true
editUrl: false
next: false
prev: false
title: "createWorkflowRun"
---

> **createWorkflowRun**\<`TInputSchema`, `TOutput`\>(`workflow`, `createOptions?`): [`WorkflowRun`](/docs/reference/api/workflows/interfaces/workflowrun/)\<[`InferInput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferinput/)\<`TInputSchema`\>, `TOutput`\>

Defined in: .framework/balsats-framework/packages/core/dist/workflows/run.d.ts:122

Creates a run of the given workflow: an identity now, an execution on `start`. `createRun` does
no I/O and validates no run id beyond its shape — the run only touches anything on first
consumption of its output object (or on `resume`).

## Type Parameters

### TInputSchema

`TInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

### TOutput

`TOutput` = `unknown`

## Parameters

### workflow

[`WorkflowDefinition`](/docs/reference/api/workflows/type-aliases/workflowdefinition/)\<`TInputSchema`\>

### createOptions?

[`WorkflowCreateRunOptions`](/docs/reference/api/workflows/interfaces/workflowcreaterunoptions/)

## Returns

[`WorkflowRun`](/docs/reference/api/workflows/interfaces/workflowrun/)\<[`InferInput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferinput/)\<`TInputSchema`\>, `TOutput`\>
