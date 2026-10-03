---
generated: true
editUrl: false
next: false
prev: false
title: "BranchCondition"
---

> **BranchCondition**\<`TInputData`\> = (`ctx`) => `boolean` \| `Promise`\<`boolean`\>

Defined in: .framework/balsats-framework/packages/core/dist/workflows/entry.d.ts:18

A branch condition (control-flow operators): the same parameter bag a
step's `execute` receives, read-only in spirit; branches are evaluated in definition order and
the first truthy one runs.

## Type Parameters

### TInputData

`TInputData` = `unknown`

## Parameters

### ctx

[`StepContext`](/docs/reference/api/workflows/interfaces/stepcontext/)\<`TInputData`\>

## Returns

`boolean` \| `Promise`\<`boolean`\>
