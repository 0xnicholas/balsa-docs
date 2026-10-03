---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowRunOutput"
---

Defined in: .framework/oribos-framework/packages/core/dist/workflows/run.d.ts:90

The output object `start` returns (the run lifecycle and its streaming events): the run's
terminal values and its lifecycle event stream, backed by one execution. `await out.result`
resolves the outcome envelope on success or suspension (rejects when the run fails); `for await`
walks the run / step boundary events as they happen. Reading either starts the run.

## Extends

- `AsyncIterable`\<[`WorkflowEvent`](/docs/reference/api/workflows/type-aliases/workflowevent/)\>

## Type Parameters

### TOutput

`TOutput` = `unknown`

## Properties

### result

> `readonly` **result**: `Promise`\<[`WorkflowRunOutcome`](/docs/reference/api/workflows/type-aliases/workflowrunoutcome/)\<`TOutput`\>\>

Defined in: .framework/oribos-framework/packages/core/dist/workflows/run.d.ts:96

The run's terminal value: resolves the outcome envelope on success or suspension; rejects with
the run's error when it fails (a step's own error, a validation error, or the abort reason).
Reading it starts the run.

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncIterator`\<[`WorkflowEvent`](/docs/reference/api/workflows/type-aliases/workflowevent/), `any`, `any`\>

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es2018.asynciterable.d.ts:36

#### Returns

`AsyncIterator`\<[`WorkflowEvent`](/docs/reference/api/workflows/type-aliases/workflowevent/), `any`, `any`\>

#### Inherited from

`AsyncIterable.[asyncIterator]`
