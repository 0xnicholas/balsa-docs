---
generated: true
editUrl: false
next: false
prev: false
title: "ModelGenerateResult"
---

> **ModelGenerateResult** = `object`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:354

The result of a `doGenerate` call.

## Properties

### content

> **content**: [`ModelContent`](/docs/reference/api/model/type-aliases/modelcontent/)[]

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:355

***

### finishReason

> **finishReason**: [`ModelFinishReason`](/docs/reference/api/model/type-aliases/modelfinishreason/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:356

***

### providerMetadata?

> `optional` **providerMetadata?**: [`ModelProviderMetadata`](/docs/reference/api/model/type-aliases/modelprovidermetadata/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:358

***

### request?

> `optional` **request?**: `object`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:359

#### body?

> `optional` **body?**: `unknown`

***

### response?

> `optional` **response?**: [`ModelResponseMetadata`](/docs/reference/api/model/type-aliases/modelresponsemetadata/) & `object`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:362

#### Type Declaration

##### body?

> `optional` **body?**: `unknown`

##### headers?

> `optional` **headers?**: `Record`\<`string`, `string`\>

***

### usage

> **usage**: [`ModelUsage`](/docs/reference/api/model/type-aliases/modelusage/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:357

***

### warnings

> **warnings**: [`ModelWarning`](/docs/reference/api/model/type-aliases/modelwarning/)[]

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:366
