---
generated: true
editUrl: false
next: false
prev: false
title: "Converter"
---

Defined in: .framework/balsats-framework/packages/core/dist/standard-schema.d.ts:104

The Standard JSON Schema converter interface.

## Properties

### input

> `readonly` **input**: (`options`) => `Record`\<`string`, `unknown`\>

Defined in: .framework/balsats-framework/packages/core/dist/standard-schema.d.ts:106

Converts the input type to JSON Schema. May throw if conversion is not supported.

#### Parameters

##### options

[`Options`](/docs/reference/api/tools/namespaces/standardjsonschemav1/interfaces/options/)

#### Returns

`Record`\<`string`, `unknown`\>

***

### output

> `readonly` **output**: (`options`) => `Record`\<`string`, `unknown`\>

Defined in: .framework/balsats-framework/packages/core/dist/standard-schema.d.ts:108

Converts the output type to JSON Schema. May throw if conversion is not supported.

#### Parameters

##### options

[`Options`](/docs/reference/api/tools/namespaces/standardjsonschemav1/interfaces/options/)

#### Returns

`Record`\<`string`, `unknown`\>
