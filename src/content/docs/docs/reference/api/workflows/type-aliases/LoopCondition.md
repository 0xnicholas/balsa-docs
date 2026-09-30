---
generated: true
editUrl: false
next: false
prev: false
title: "LoopCondition"
---

> **LoopCondition**\<`TInputData`\> = (`ctx`) => `boolean` \| `Promise`\<`boolean`\>

Defined in: .framework/balsa-framework/packages/core/dist/workflows/entry.d.ts:26

A loop condition: the branch-condition bag plus `iterationCount` — the number of iterations
already completed — so a condition can cap the loop by throwing or by counting
(`docs/architecture/workflows.md`「控制流算子」). Its `inputData` is the value of the checkpoint:
the pending input for `dowhile` (checked before each iteration), the last output for `dountil`
(checked after each iteration).

## Type Parameters

### TInputData

`TInputData` = `unknown`

## Parameters

### ctx

[`StepContext`](/docs/reference/api/workflows/interfaces/stepcontext/)\<`TInputData`\> & `object`

## Returns

`boolean` \| `Promise`\<`boolean`\>
