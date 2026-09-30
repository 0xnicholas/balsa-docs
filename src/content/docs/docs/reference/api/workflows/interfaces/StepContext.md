---
generated: true
editUrl: false
next: false
prev: false
title: "StepContext"
---

Defined in: .framework/balsa-framework/packages/core/dist/workflows/step.d.ts:18

The context one step executes with (`docs/architecture/workflows.md`「定义表面」): the seven
pieces the framework guarantees at every step boundary — the same bag the control-flow
conditions receive, read-only in spirit there.

- `inputData`: the validated (schema output, transforms applied) upstream value — the workflow
  input for the first step, the previous step's output otherwise.
- `runId` / `signal`: correlation and cancellation, propagated from the run.
- `requestContext`: the run's open bag, framework-written `signal` / `runId` included.
- `getStepResult(stepId)`: the recorded output of an already-run step (`undefined` when the step
  has no recorded result) — cross-step sharing without a state blackboard.
- `resumeData`: the `resumeSchema`-validated data a resumed run comes back with; `undefined` on
  a normal first pass (and for steps that declare no `resumeSchema`).
- `suspend(payload)`: marks the step suspended and unwinds the run; never returns.

## Type Parameters

### TInputData

`TInputData` = `unknown`

### TResumeData

`TResumeData` = `undefined`

### TSuspendPayload

`TSuspendPayload` = `unknown`

## Properties

### inputData

> `readonly` **inputData**: `TInputData`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/step.d.ts:20

The validated upstream value: workflow input for the first step, previous output otherwise.

***

### requestContext

> `readonly` **requestContext**: [`RequestContext`](/docs/reference/api/agent/interfaces/requestcontext/)

Defined in: .framework/balsa-framework/packages/core/dist/workflows/step.d.ts:26

The run's request context (the user's per-call open bag plus `signal` / `runId`).

***

### resumeData

> `readonly` **resumeData**: `TResumeData` \| `undefined`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/step.d.ts:30

`resumeSchema`-validated resume data; `undefined` on a first pass.

***

### runId

> `readonly` **runId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/step.d.ts:22

Identity of the run this step executes in.

***

### signal

> `readonly` **signal**: `AbortSignal`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/step.d.ts:24

Cancellation, propagated from the run down into the step.

## Methods

### getStepResult()

> **getStepResult**(`stepId`): `unknown`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/step.d.ts:28

The recorded output of an already-run step; `undefined` when it has no recorded result.

#### Parameters

##### stepId

`string`

#### Returns

`unknown`

***

### suspend()

> **suspend**(`payload`): `never`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/step.d.ts:38

Marks the step suspended with this payload and unwinds the run — never returns: it throws the
suspend control signal, which the walker turns into the run's `suspended` outcome when the step
sits in a top-level `then` entry. Suspending from anywhere else (`parallel`, a `branch` arm,
`foreach`, the loops) is an explicit error: a block's iteration site has no snapshot
representation yet. Never catch it as an exception; run it as the step's last act.

#### Parameters

##### payload

`TSuspendPayload`

#### Returns

`never`
