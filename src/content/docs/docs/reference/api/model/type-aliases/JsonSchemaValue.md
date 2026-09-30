---
generated: true
editUrl: false
next: false
prev: false
title: "JsonSchemaValue"
---

> **JsonSchemaValue** = `null` \| `string` \| `number` \| `boolean` \| \{\[`key`: `string`\]: `JsonSchemaValue`; \} \| `JsonSchemaValue`[]

Defined in: .framework/balsa-framework/packages/core/dist/model/contract.d.ts:26

A JSON value as used inside a JSON Schema (`JSONSchema7Type` in draft-07 tooling).

Separate from `JsonValue`: schema values are plain JSON without `undefined` members and with
mutable arrays, which is what the provider spec's `JSONSchema7` tool schemas use.
