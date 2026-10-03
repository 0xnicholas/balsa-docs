---
generated: true
editUrl: false
next: false
prev: false
title: "BranchStepOf"
---

> **BranchStepOf**\<`TBranches`\> = `TBranches`\[`number`\] *extends* readonly \[`unknown`, infer TStep\] ? `TStep` : `never`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:98

The steps of an authored branch list, as a union.

## Type Parameters

### TBranches

`TBranches` *extends* readonly readonly \[[`BranchCondition`](/docs/reference/api/workflows/type-aliases/branchcondition/), [`Step`](/docs/reference/api/workflows/interfaces/step/)\][]
