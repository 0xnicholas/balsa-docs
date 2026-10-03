---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowResumeOptions"
---

Defined in: .framework/balsats-framework/packages/core/dist/workflows/run.d.ts:71

The `resume` options.

## Properties

### requestContext?

> `readonly` `optional` **requestContext?**: `Readonly`\<`Record`\<`string`, `unknown`\>\>

Defined in: .framework/balsats-framework/packages/core/dist/workflows/run.d.ts:82

The resumed segment's open bag, laid over the start call's bag; framework writes `signal`/`runId`.

***

### resumeData?

> `readonly` `optional` **resumeData?**: `unknown`

Defined in: .framework/balsats-framework/packages/core/dist/workflows/run.d.ts:78

What the suspended step comes back with; validated against that step's `resumeSchema` (the
third fixed IO boundary). Absent for a step that declares no `resumeSchema`.

***

### signal?

> `readonly` `optional` **signal?**: `AbortSignal`

Defined in: .framework/balsats-framework/packages/core/dist/workflows/run.d.ts:80

Cancels the resumed segment; defaults to the run's start signal when there was one.

***

### step

> `readonly` **step**: `string` \| [`Step`](/docs/reference/api/workflows/interfaces/step/)\<`string`, [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/), [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/), [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`, [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`\>

Defined in: .framework/balsats-framework/packages/core/dist/workflows/run.d.ts:73

The run's suspended step: the step object, or its id — only the id matters.
