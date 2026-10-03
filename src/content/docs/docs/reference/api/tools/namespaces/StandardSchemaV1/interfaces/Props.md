---
generated: true
editUrl: false
next: false
prev: false
title: "Props"
---

Defined in: .framework/balsats-framework/packages/core/dist/standard-schema.d.ts:50

The Standard Schema properties interface.

## Extends

- [`Props`](/docs/reference/api/tools/namespaces/standardtypedv1/interfaces/props/)\<`Input`, `Output`\>

## Type Parameters

### Input

`Input` = `unknown`

### Output

`Output` = `Input`

## Properties

### types?

> `readonly` `optional` **types?**: [`Types`](/docs/reference/api/tools/namespaces/standardtypedv1/interfaces/types/)\<`Input`, `Output`\>

Defined in: .framework/balsats-framework/packages/core/dist/standard-schema.d.ts:29

Inferred types associated with the schema.

#### Inherited from

[`Props`](/docs/reference/api/tools/namespaces/standardtypedv1/interfaces/props/).[`types`](/docs/reference/api/tools/namespaces/standardtypedv1/interfaces/props/#types)

***

### validate

> `readonly` **validate**: (`value`, `options?`) => [`Result`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/result/)\<`Output`\> \| `Promise`\<[`Result`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/result/)\<`Output`\>\>

Defined in: .framework/balsats-framework/packages/core/dist/standard-schema.d.ts:52

Validates unknown input values.

#### Parameters

##### value

`unknown`

##### options?

[`Options`](/docs/reference/api/tools/namespaces/standardschemav1/interfaces/options/)

#### Returns

[`Result`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/result/)\<`Output`\> \| `Promise`\<[`Result`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/result/)\<`Output`\>\>

***

### vendor

> `readonly` **vendor**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/standard-schema.d.ts:27

The vendor name of the schema library.

#### Inherited from

[`Props`](/docs/reference/api/tools/namespaces/standardtypedv1/interfaces/props/).[`vendor`](/docs/reference/api/tools/namespaces/standardtypedv1/interfaces/props/#vendor)

***

### version

> `readonly` **version**: `1`

Defined in: .framework/balsats-framework/packages/core/dist/standard-schema.d.ts:25

The version number of the standard.

#### Inherited from

[`Props`](/docs/reference/api/tools/namespaces/standardtypedv1/interfaces/props/).[`version`](/docs/reference/api/tools/namespaces/standardtypedv1/interfaces/props/#version)
