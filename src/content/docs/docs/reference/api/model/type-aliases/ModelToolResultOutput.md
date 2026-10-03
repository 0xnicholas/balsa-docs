---
generated: true
editUrl: false
next: false
prev: false
title: "ModelToolResultOutput"
---

> **ModelToolResultOutput** = \{ `providerOptions?`: [`ModelProviderOptions`](/docs/reference/api/model/type-aliases/modelprovideroptions/); `type`: `"text"`; `value`: `string`; \} \| \{ `providerOptions?`: [`ModelProviderOptions`](/docs/reference/api/model/type-aliases/modelprovideroptions/); `type`: `"json"`; `value`: [`JsonValue`](/docs/reference/api/model/type-aliases/jsonvalue/); \} \| \{ `providerOptions?`: [`ModelProviderOptions`](/docs/reference/api/model/type-aliases/modelprovideroptions/); `reason?`: `string`; `type`: `"execution-denied"`; \} \| \{ `providerOptions?`: [`ModelProviderOptions`](/docs/reference/api/model/type-aliases/modelprovideroptions/); `type`: `"error-text"`; `value`: `string`; \} \| \{ `providerOptions?`: [`ModelProviderOptions`](/docs/reference/api/model/type-aliases/modelprovideroptions/); `type`: `"error-json"`; `value`: [`JsonValue`](/docs/reference/api/model/type-aliases/jsonvalue/); \} \| \{ `type`: `"content"`; `value`: (\{ `providerOptions?`: [`ModelProviderOptions`](/docs/reference/api/model/type-aliases/modelprovideroptions/); `text`: `string`; `type`: `"text"`; \} \| \{ `data`: [`ModelFileData`](/docs/reference/api/model/type-aliases/modelfiledata/); `filename?`: `string`; `mediaType`: `string`; `providerOptions?`: [`ModelProviderOptions`](/docs/reference/api/model/type-aliases/modelprovideroptions/); `type`: `"file"`; \} \| \{ `providerOptions?`: [`ModelProviderOptions`](/docs/reference/api/model/type-aliases/modelprovideroptions/); `type`: `"custom"`; \})[]; \}

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:189

Result of a tool call, as it is sent back to the provider.
