---
generated: true
editUrl: false
next: false
prev: false
title: "ThenInputAccepts"
---

> **ThenInputAccepts**\<`TPrevSchema`, `TStepInputSchema`\> = [`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TPrevSchema`\> *extends* [`InferInput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferinput/)\<`TStepInputSchema`\> ? `unknown` : `object`

Defined in: .framework/balsats-framework/packages/core/dist/workflows/workflow.d.ts:103

The strict `then` check: the previous output must be accepted by the step's input schema. On a
mismatch the extra parameter member is missing, so the error names the rule.

## Type Parameters

### TPrevSchema

`TPrevSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

### TStepInputSchema

`TStepInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)
