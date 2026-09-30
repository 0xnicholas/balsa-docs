---
generated: true
editUrl: false
next: false
prev: false
title: "ModelCallOptions"
---

> **ModelCallOptions** = `object`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:399

The options of a language model call.

## Properties

### abortSignal?

> `optional` **abortSignal?**: `AbortSignal`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:420

***

### frequencyPenalty?

> `optional` **frequencyPenalty?**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:407

***

### headers?

> `optional` **headers?**: `Record`\<`string`, `string` \| `undefined`\>

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:421

***

### includeRawChunks?

> `optional` **includeRawChunks?**: `boolean`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:419

***

### maxOutputTokens?

> `optional` **maxOutputTokens?**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:401

***

### presencePenalty?

> `optional` **presencePenalty?**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:406

***

### prompt

> **prompt**: [`ModelPrompt`](/docs/reference/api/model/type-aliases/modelprompt/)

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:400

***

### providerOptions?

> `optional` **providerOptions?**: [`ModelProviderOptions`](/docs/reference/api/model/type-aliases/modelprovideroptions/)

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:423

***

### reasoning?

> `optional` **reasoning?**: `"provider-default"` \| `"none"` \| `"minimal"` \| `"low"` \| `"medium"` \| `"high"` \| `"xhigh"`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:422

***

### responseFormat?

> `optional` **responseFormat?**: \{ `type`: `"text"`; \} \| \{ `description?`: `string`; `name?`: `string`; `schema?`: [`JsonSchemaObject`](/docs/reference/api/model/type-aliases/jsonschemaobject/); `type`: `"json"`; \}

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:408

***

### seed?

> `optional` **seed?**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:416

***

### stopSequences?

> `optional` **stopSequences?**: `string`[]

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:403

***

### temperature?

> `optional` **temperature?**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:402

***

### toolChoice?

> `optional` **toolChoice?**: [`ModelToolChoice`](/docs/reference/api/model/type-aliases/modeltoolchoice/)

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:418

***

### tools?

> `optional` **tools?**: ([`ModelFunctionTool`](/docs/reference/api/model/type-aliases/modelfunctiontool/) \| [`ModelProviderTool`](/docs/reference/api/model/type-aliases/modelprovidertool/))[]

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:417

***

### topK?

> `optional` **topK?**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:405

***

### topP?

> `optional` **topP?**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:404
