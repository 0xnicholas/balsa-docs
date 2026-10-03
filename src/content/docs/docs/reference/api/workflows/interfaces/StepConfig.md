---
generated: true
editUrl: false
next: false
prev: false
title: "StepConfig"
---

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:76

The config `createStep` accepts, with the schema type parameters exposed so that `execute`'s
context is derived from them. Annotating with bare `StepConfig` accepts any dual-interface
schema and widens the inferred types to `unknown`.

## Type Parameters

### TId

`TId` *extends* `string` = `string`

### TInputSchema

`TInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

### TOutputSchema

`TOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

### TResumeSchema

`TResumeSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined` = `undefined`

### TSuspendSchema

`TSuspendSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined` = `undefined`

## Properties

### id

> `readonly` **id**: `TId`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:78

The step id: snapshot key and parallel/branch output key.

***

### inputSchema

> `readonly` **inputSchema**: `TInputSchema`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:80

Input schema (Standard Schema dual interface, ADR-0003).

***

### outputSchema

> `readonly` **outputSchema**: `TOutputSchema`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:82

Output schema.

***

### resumeSchema?

> `readonly` `optional` **resumeSchema?**: `TResumeSchema`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:84

Resume data schema; omitted = the step never reads `resumeData`.

***

### retries?

> `readonly` `optional` **retries?**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:88

Fixed-interval retry count; omitted = no retries. See `Step.retries` for the exact semantics.

***

### suspendSchema?

> `readonly` `optional` **suspendSchema?**: `TSuspendSchema`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:86

`suspend(payload)` payload schema; omitted = any payload.

## Methods

### execute()

> **execute**(`ctx`): [`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TOutputSchema`\> \| `Promise`\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TOutputSchema`\>\>

Defined in: .framework/oribos-framework/packages/core/dist/workflows/step.d.ts:90

Runs the step with the schema-validated upstream value and the framework context.

#### Parameters

##### ctx

[`StepContext`](/docs/reference/api/workflows/interfaces/stepcontext/)\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TInputSchema`\>, [`ResumeDataOf`](/docs/reference/api/workflows/type-aliases/resumedataof/)\<`TResumeSchema`\>, [`SuspendPayloadOf`](/docs/reference/api/workflows/type-aliases/suspendpayloadof/)\<`TSuspendSchema`\>\>

#### Returns

[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TOutputSchema`\> \| `Promise`\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TOutputSchema`\>\>
