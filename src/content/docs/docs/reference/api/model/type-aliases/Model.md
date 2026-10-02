---
generated: true
editUrl: false
next: false
prev: false
title: "Model"
---

> **Model** = `object`

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:502

The model contract: the subset of the AI SDK provider specification that the core consumes.

Users pass the language model instance produced by an AI SDK provider package directly; the
instance satisfies this contract structurally, without any adapter or registration.

## Properties

### modelId

> `readonly` **modelId**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:508

Provider-specific model ID, e.g. `'gpt-4o'`.

***

### provider

> `readonly` **provider**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:506

Provider ID, e.g. `'openai'`.

***

### specificationVersion

> `readonly` **specificationVersion**: `"v4"`

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:504

The language model interface version this model implements (locked: `'v4'`).

## Methods

### doGenerate()

> **doGenerate**(`options`): `PromiseLike`\<[`ModelGenerateResult`](/docs/reference/api/model/type-aliases/modelgenerateresult/)\>

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:510

Generates a language model output (non-streaming).

#### Parameters

##### options

[`ModelCallOptions`](/docs/reference/api/model/type-aliases/modelcalloptions/)

#### Returns

`PromiseLike`\<[`ModelGenerateResult`](/docs/reference/api/model/type-aliases/modelgenerateresult/)\>

***

### doStream()

> **doStream**(`options`): `PromiseLike`\<[`ModelStreamResult`](/docs/reference/api/model/type-aliases/modelstreamresult/)\>

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:512

Generates a language model output (streaming).

#### Parameters

##### options

[`ModelCallOptions`](/docs/reference/api/model/type-aliases/modelcalloptions/)

#### Returns

`PromiseLike`\<[`ModelStreamResult`](/docs/reference/api/model/type-aliases/modelstreamresult/)\>
