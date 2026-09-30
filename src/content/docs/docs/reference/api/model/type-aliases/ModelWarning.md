---
generated: true
editUrl: false
next: false
prev: false
title: "ModelWarning"
---

> **ModelWarning** = \{ `details?`: `string`; `feature`: `string`; `type`: `"unsupported"`; \} \| \{ `details?`: `string`; `feature`: `string`; `type`: `"compatibility"`; \} \| \{ `message`: `string`; `setting`: `string`; `type`: `"deprecated"`; \} \| \{ `message`: `string`; `type`: `"other"`; \}

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:112

Warning reported by the model, e.g. that a setting is unsupported.
