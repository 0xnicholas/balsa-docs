---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowStartOptions"
---

Defined in: .framework/oribos-framework/packages/core/dist/workflows/run.d.ts:62

The `start` options.

## Type Parameters

### TInputData

`TInputData` = `unknown`

## Properties

### inputData

> `readonly` **inputData**: `TInputData`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/run.d.ts:64

The run's start input, validated against the workflow's `inputSchema` (always on).

***

### requestContext?

> `readonly` `optional` **requestContext?**: `Readonly`\<`Record`\<`string`, `unknown`\>\>

Defined in: .framework/oribos-framework/packages/core/dist/workflows/run.d.ts:66

The user's per-call open bag (`RequestContext` convention); the framework writes `signal`/`runId` last.

***

### signal?

> `readonly` `optional` **signal?**: `AbortSignal`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/run.d.ts:68

Cancels the run; propagated into every step's ctx. Cancellation fails the run (AbortError).
