---
generated: true
editUrl: false
next: false
prev: false
title: "ModelFileData"
---

> **ModelFileData** = \{ `data`: `Uint8Array` \| `string`; `type`: `"data"`; \} \| \{ `originalUrl?`: `string`; `type`: `"url"`; `url`: `URL`; \} \| \{ `reference`: [`ModelProviderReference`](/docs/reference/api/model/type-aliases/modelproviderreference/); `type`: `"reference"`; \} \| \{ `text`: `string`; `type`: `"text"`; \}

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:97

File data as a tagged discriminated union.
