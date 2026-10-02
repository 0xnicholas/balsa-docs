---
generated: true
editUrl: false
next: false
prev: false
title: "ModelToolApprovalResponsePart"
---

> **ModelToolApprovalResponsePart** = `object`

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:181

Decision of a user on a provider-executed tool call, as a content part of a prompt message.

## Properties

### approvalId

> **approvalId**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:183

***

### approved

> **approved**: `boolean`

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:184

***

### providerOptions?

> `optional` **providerOptions?**: [`ModelProviderOptions`](/docs/reference/api/model/type-aliases/modelprovideroptions/)

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:186

***

### reason?

> `optional` **reason?**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:185

***

### type

> **type**: `"tool-approval-response"`

Defined in: .framework/balsats-framework/packages/core/dist/model/contract.d.ts:182
