---
generated: true
editUrl: false
next: false
prev: false
title: "Step"
---

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:51

A workflow step (the step shape): id + input/output schemas + optional
resume/suspend schemas and `retries`, plus `execute`. The id is the key snapshots and
parallel/branch output objects use.

This is the container-erased view of a step: with no type arguments a step's IO is `unknown`
(`Step`), while `createStep` narrows the inference (`Step<'fetch', TIn, TOut, …>`). `execute` is
declared as a method so that concretely typed steps stay assignable into `readonly Step[]`
without an `any` hole; the resume/suspend schema parameters default to the erased
`StandardSchema | undefined` so a step declaring them stays assignable too.

## Type Parameters

### TId

`TId` *extends* `string` = `string`

### TInputSchema

`TInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

### TOutputSchema

`TOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

### TResumeSchema

`TResumeSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined` = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`

### TSuspendSchema

`TSuspendSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined` = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`

## Properties

### id

> `readonly` **id**: `TId`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:53

The step id: snapshot key and parallel/branch output key.

***

### inputSchema

> `readonly` **inputSchema**: `TInputSchema`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:55

Input schema (Standard Schema dual interface, ADR-0003).

***

### outputSchema

> `readonly` **outputSchema**: `TOutputSchema`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:57

Output schema.

***

### resumeSchema?

> `readonly` `optional` **resumeSchema?**: `TResumeSchema`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:59

Resume data schema — `resume({ step, resumeData })` validates against it.

***

### retries?

> `readonly` `optional` **retries?**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:67

Fixed-interval retry count (errors, retries and the state machine): `n` buys
up to `n` extra attempts at the one fixed interval (`retry.ts`), the last error surfacing
verbatim when they run out. A non-negative integer; anything else is a definition error.

***

### suspendSchema?

> `readonly` `optional` **suspendSchema?**: `TSuspendSchema`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:61

`suspend(payload)` payload schema.

## Methods

### execute()

> **execute**(`ctx`): [`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TOutputSchema`\> \| `Promise`\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TOutputSchema`\>\>

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:69

Runs the step with the schema-validated upstream value and the framework context.

#### Parameters

##### ctx

[`StepContext`](/docs/reference/api/workflows/interfaces/stepcontext/)\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TInputSchema`\>, [`ResumeDataOf`](/docs/reference/api/workflows/type-aliases/resumedataof/)\<`TResumeSchema`\>, [`SuspendPayloadOf`](/docs/reference/api/workflows/type-aliases/suspendpayloadof/)\<`TSuspendSchema`\>\>

#### Returns

[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TOutputSchema`\> \| `Promise`\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TOutputSchema`\>\>
