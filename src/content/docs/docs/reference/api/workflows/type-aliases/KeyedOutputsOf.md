---
generated: true
editUrl: false
next: false
prev: false
title: "KeyedOutputsOf"
---

> **KeyedOutputsOf**\<`TSteps`\> = `{ [TStep in TSteps as TStep["id"]]: InferOutput<TStep["outputSchema"]> }`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/workflow.d.ts:94

The keyed `{ [step.id]: output }` object a `parallel` block produces.

## Type Parameters

### TSteps

`TSteps` *extends* [`Step`](/docs/reference/api/workflows/interfaces/step/)
