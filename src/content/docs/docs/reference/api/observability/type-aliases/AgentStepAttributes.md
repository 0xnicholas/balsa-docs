---
generated: true
editUrl: false
next: false
prev: false
title: "AgentStepAttributes"
---

> **AgentStepAttributes** = `object`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:28

Attributes of an `agent-step` span — one model call of a run.

## Properties

### finishReason?

> `readonly` `optional` **finishReason?**: [`FinishReason`](/docs/reference/api/model/type-aliases/finishreason/)

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:34

***

### model

> `readonly` **model**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:29

***

### parameters?

> `readonly` `optional` **parameters?**: `Record`\<`string`, `unknown`\>

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:32

The model call settings the framework forwarded (temperature, maxOutputTokens, …).

***

### provider

> `readonly` **provider**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:30

***

### timeToFirstChunk?

> `readonly` `optional` **timeToFirstChunk?**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:36

Milliseconds from the step's start to its first chunk.

***

### usage?

> `readonly` `optional` **usage?**: [`Usage`](/docs/reference/api/model/type-aliases/usage/)

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:33
