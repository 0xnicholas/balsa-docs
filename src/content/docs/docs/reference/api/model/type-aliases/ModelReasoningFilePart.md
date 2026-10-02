---
generated: true
editUrl: false
next: false
prev: false
title: "ModelReasoningFilePart"
---

> **ModelReasoningFilePart** = `object`

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:141

File produced as part of reasoning, as a content part of a prompt message.

## Properties

### data

> **data**: `Extract`\<[`ModelFileData`](/docs/reference/api/model/type-aliases/modelfiledata/), \{ `type`: `"data"` \| `"url"`; \}\>

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:143

***

### mediaType

> **mediaType**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:146

***

### providerOptions?

> `optional` **providerOptions?**: [`ModelProviderOptions`](/docs/reference/api/model/type-aliases/modelprovideroptions/)

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:147

***

### type

> **type**: `"reasoning-file"`

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:142
