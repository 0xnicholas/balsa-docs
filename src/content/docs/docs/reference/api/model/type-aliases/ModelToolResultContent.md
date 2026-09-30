---
generated: true
editUrl: false
next: false
prev: false
title: "ModelToolResultContent"
---

> **ModelToolResultContent** = `object`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:315

Result of a tool call that has been executed by the provider.

## Properties

### dynamic?

> `optional` **dynamic?**: `boolean`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:322

***

### isError?

> `optional` **isError?**: `boolean`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:320

***

### preliminary?

> `optional` **preliminary?**: `boolean`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:321

***

### providerMetadata?

> `optional` **providerMetadata?**: [`ModelProviderMetadata`](/docs/reference/api/model/type-aliases/modelprovidermetadata/)

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:323

***

### result

> **result**: `NonNullable`\<[`JsonValue`](/docs/reference/api/model/type-aliases/jsonvalue/)\>

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:319

***

### toolCallId

> **toolCallId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:317

***

### toolName

> **toolName**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:318

***

### type

> **type**: `"tool-result"`

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:316
