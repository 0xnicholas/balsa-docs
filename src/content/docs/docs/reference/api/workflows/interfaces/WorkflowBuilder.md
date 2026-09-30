---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowBuilder"
---

Defined in: .framework/balsa-framework/packages/core/dist/workflows/workflow.d.ts:64

The mutable builder (`createWorkflow`'s return): each operator pushes one entry and returns the
same object re-typed, so chains stay fluent and the tip schema advances.

## Type Parameters

### TInputSchema

`TInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

### TOutputSchema

`TOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

### TPrevSchema

`TPrevSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

## Methods

### branch()

> **branch**\<`TBranches`\>(`branches`): `WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `DataSchema`\<`Partial`\<`KeyedOutputsOf`\<`BranchStepOf`\<`TBranches`\>\>\>\>\>

Defined in: .framework/balsa-framework/packages/core/dist/workflows/workflow.d.ts:77

Ordered condition list; the first truthy condition's step runs; output = a keyed object of
which only the executed branch's key holds a value.

#### Type Parameters

##### TBranches

`TBranches` *extends* readonly readonly \[[`BranchCondition`](/docs/reference/api/workflows/type-aliases/branchcondition/)\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TPrevSchema`\>\>, [`Step`](/docs/reference/api/workflows/interfaces/step/)\<`string`, [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/), [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/), [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`, [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`\>\][]

#### Parameters

##### branches

`TBranches`

#### Returns

`WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `DataSchema`\<`Partial`\<`KeyedOutputsOf`\<`BranchStepOf`\<`TBranches`\>\>\>\>\>

***

### commit()

> **commit**(): [`Workflow`](/docs/reference/api/workflows/interfaces/workflow/)\<`TInputSchema`, `TOutputSchema`\>

Defined in: .framework/balsa-framework/packages/core/dist/workflows/workflow.d.ts:89

Freezes the definition and returns it. Before this call the chain is not runnable.

#### Returns

[`Workflow`](/docs/reference/api/workflows/interfaces/workflow/)\<`TInputSchema`, `TOutputSchema`\>

***

### dountil()

> **dountil**\<`TId`, `TStepInputSchema`, `TStepOutputSchema`\>(`step`, `cond`): `WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `TStepOutputSchema`\>

Defined in: .framework/balsa-framework/packages/core/dist/workflows/workflow.d.ts:85

Checks the condition after each iteration (so the step runs at least once) and loops until it holds; output = the last iteration's output.

#### Type Parameters

##### TId

`TId` *extends* `string`

##### TStepInputSchema

`TStepInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

##### TStepOutputSchema

`TStepOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

#### Parameters

##### step

[`Step`](/docs/reference/api/workflows/interfaces/step/)\<`TId`, `TStepInputSchema`, `TStepOutputSchema`\>

##### cond

[`LoopCondition`](/docs/reference/api/workflows/type-aliases/loopcondition/)\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TStepOutputSchema`\>\>

#### Returns

`WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `TStepOutputSchema`\>

***

### dowhile()

> **dowhile**\<`TId`, `TStepInputSchema`, `TStepOutputSchema`\>(`step`, `cond`): `WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `TStepOutputSchema`\>

Defined in: .framework/balsa-framework/packages/core/dist/workflows/workflow.d.ts:83

Checks the condition before each iteration and loops while it holds; output = the last iteration's output.

#### Type Parameters

##### TId

`TId` *extends* `string`

##### TStepInputSchema

`TStepInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

##### TStepOutputSchema

`TStepOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

#### Parameters

##### step

[`Step`](/docs/reference/api/workflows/interfaces/step/)\<`TId`, `TStepInputSchema`, `TStepOutputSchema`\>

##### cond

[`LoopCondition`](/docs/reference/api/workflows/type-aliases/loopcondition/)\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TStepInputSchema`\>\>

#### Returns

`WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `TStepOutputSchema`\>

***

### foreach()

> **foreach**\<`TId`, `TStepInputSchema`, `TStepOutputSchema`\>(`step`, `options?`): `WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `DataSchema`\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TStepOutputSchema`\>[]\>\>

Defined in: .framework/balsa-framework/packages/core/dist/workflows/workflow.d.ts:79

Runs the step over the input array; `concurrency` defaults to 1; output = the output array.

#### Type Parameters

##### TId

`TId` *extends* `string`

##### TStepInputSchema

`TStepInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

##### TStepOutputSchema

`TStepOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

#### Parameters

##### step

[`Step`](/docs/reference/api/workflows/interfaces/step/)\<`TId`, `TStepInputSchema`, `TStepOutputSchema`\>

##### options?

###### concurrency?

`number`

#### Returns

`WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `DataSchema`\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TStepOutputSchema`\>[]\>\>

***

### parallel()

> **parallel**\<`TSteps`\>(`steps`): `WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `DataSchema`\<`KeyedOutputsOf`\<`TSteps`\[`number`\]\>\>\>

Defined in: .framework/balsa-framework/packages/core/dist/workflows/workflow.d.ts:72

Concurrent block (`Promise.all`, no cap); output = `{ [step.id]: output }`.

#### Type Parameters

##### TSteps

`TSteps` *extends* readonly [`Step`](/docs/reference/api/workflows/interfaces/step/)\<`string`, [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/), [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/), [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`, [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`\>[]

#### Parameters

##### steps

`TSteps`

#### Returns

`WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `DataSchema`\<`KeyedOutputsOf`\<`TSteps`\[`number`\]\>\>\>

***

### sleep()

> **sleep**(`duration`): `WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `TPrevSchema`\>

Defined in: .framework/balsa-framework/packages/core/dist/workflows/workflow.d.ts:87

In-process sleep (`setTimeout` + `AbortSignal`), not durable; the duration is a `DynamicArgument`; the chain tip is unchanged.

#### Parameters

##### duration

[`SleepDuration`](/docs/reference/api/workflows/type-aliases/sleepduration/)

#### Returns

`WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `TPrevSchema`\>

***

### then()

> **then**\<`TId`, `TStepInputSchema`, `TStepOutputSchema`\>(`step`): `WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `TStepOutputSchema`\>

Defined in: .framework/balsa-framework/packages/core/dist/workflows/workflow.d.ts:70

Sequential step: the previous output (validated by this step's input schema) becomes
`inputData`. The only strict axis — a step whose input schema does not accept the previous
output is a compile-time error.

#### Type Parameters

##### TId

`TId` *extends* `string`

##### TStepInputSchema

`TStepInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

##### TStepOutputSchema

`TStepOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

#### Parameters

##### step

[`Step`](/docs/reference/api/workflows/interfaces/step/)\<`TId`, `TStepInputSchema`, `TStepOutputSchema`, [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`, [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`\> & `ThenInputAccepts`\<`TPrevSchema`, `TStepInputSchema`\>

#### Returns

`WorkflowBuilder`\<`TInputSchema`, `TOutputSchema`, `TStepOutputSchema`\>
