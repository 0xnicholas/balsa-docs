---
generated: true
editUrl: false
next: false
prev: false
title: "createWorkflow"
---

> **createWorkflow**\<`TInputSchema`, `TOutputSchema`\>(`config`): [`WorkflowBuilder`](/docs/reference/api/workflows/interfaces/workflowbuilder/)\<`TInputSchema`, `TOutputSchema`, `TInputSchema`\>

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:111

Creates a workflow builder. The chain tip starts as the workflow's `inputSchema` — the first
`.then` step consumes the run's input — and advances entry by entry until `.commit()` freezes
the definition.

## Type Parameters

### TInputSchema

`TInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

### TOutputSchema

`TOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

## Parameters

### config

[`WorkflowConfig`](/docs/reference/api/workflows/interfaces/workflowconfig/)\<`TInputSchema`, `TOutputSchema`\>

## Returns

[`WorkflowBuilder`](/docs/reference/api/workflows/interfaces/workflowbuilder/)\<`TInputSchema`, `TOutputSchema`, `TInputSchema`\>
