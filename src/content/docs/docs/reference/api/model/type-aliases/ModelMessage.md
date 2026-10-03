---
generated: true
editUrl: false
next: false
prev: false
title: "ModelMessage"
---

> **ModelMessage** = \{ `content`: `string`; `role`: `"system"`; \} \| \{ `content`: ([`ModelTextPart`](/docs/reference/api/model/type-aliases/modeltextpart/) \| [`ModelFilePart`](/docs/reference/api/model/type-aliases/modelfilepart/))[]; `role`: `"user"`; \} \| \{ `content`: ([`ModelTextPart`](/docs/reference/api/model/type-aliases/modeltextpart/) \| [`ModelFilePart`](/docs/reference/api/model/type-aliases/modelfilepart/) \| [`ModelCustomPart`](/docs/reference/api/model/type-aliases/modelcustompart/) \| [`ModelReasoningPart`](/docs/reference/api/model/type-aliases/modelreasoningpart/) \| [`ModelReasoningFilePart`](/docs/reference/api/model/type-aliases/modelreasoningfilepart/) \| [`ModelToolCallPart`](/docs/reference/api/model/type-aliases/modeltoolcallpart/) \| [`ModelToolResultPart`](/docs/reference/api/model/type-aliases/modeltoolresultpart/))[]; `role`: `"assistant"`; \} \| \{ `content`: ([`ModelToolResultPart`](/docs/reference/api/model/type-aliases/modeltoolresultpart/) \| [`ModelToolApprovalResponsePart`](/docs/reference/api/model/type-aliases/modeltoolapprovalresponsepart/))[]; `role`: `"tool"`; \} & `object`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:227

A prompt message.

## Type Declaration

### providerOptions?

> `optional` **providerOptions?**: [`ModelProviderOptions`](/docs/reference/api/model/type-aliases/modelprovideroptions/)
