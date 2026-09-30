---
generated: true
editUrl: false
next: false
prev: false
title: "createStep"
---

> **createStep**\<`TId`, `TInputSchema`, `TOutputSchema`, `TResumeSchema`, `TSuspendSchema`\>(`config`): [`Step`](/docs/reference/api/workflows/interfaces/step/)\<`TId`, `TInputSchema`, `TOutputSchema`, `TResumeSchema`, `TSuspendSchema`\>

Defined in: .framework/balsa-framework/packages/core/dist/workflows/step.d.ts:101

Defines a step — a factory for typing only, returning a frozen plain object. Omitted optional
fields stay absent, like `createTool`; the id is a type-level literal so the builder can key
parallel/branch outputs by it.

## Type Parameters

### TId

`TId` *extends* `string`

### TInputSchema

`TInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

### TOutputSchema

`TOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

### TResumeSchema

`TResumeSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined` = `undefined`

### TSuspendSchema

`TSuspendSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined` = `undefined`

## Parameters

### config

[`StepConfig`](/docs/reference/api/workflows/interfaces/stepconfig/)\<`TId`, `TInputSchema`, `TOutputSchema`, `TResumeSchema`, `TSuspendSchema`\>

## Returns

[`Step`](/docs/reference/api/workflows/interfaces/step/)\<`TId`, `TInputSchema`, `TOutputSchema`, `TResumeSchema`, `TSuspendSchema`\>
