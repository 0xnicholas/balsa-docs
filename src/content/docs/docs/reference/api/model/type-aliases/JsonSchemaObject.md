---
generated: true
editUrl: false
next: false
prev: false
title: "JsonSchemaObject"
---

> **JsonSchemaObject** = `object`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:39

A JSON Schema (draft-07) object.

## Properties

### $comment?

> `optional` **$comment?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:43

***

### $defs?

> `optional` **$defs?**: `Record`\<`string`, [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)\>

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:44

***

### $id?

> `optional` **$id?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:40

***

### $ref?

> `optional` **$ref?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:41

***

### $schema?

> `optional` **$schema?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:42

***

### additionalItems?

> `optional` **additionalItems?**: [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:57

***

### additionalProperties?

> `optional` **additionalProperties?**: [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:67

***

### allOf?

> `optional` **allOf?**: [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)[]

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:73

***

### anyOf?

> `optional` **anyOf?**: [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)[]

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:74

***

### const?

> `optional` **const?**: [`JsonSchemaValue`](/docs/reference/api/model/type-aliases/jsonschemavalue/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:47

***

### contains?

> `optional` **contains?**: [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:61

***

### contentEncoding?

> `optional` **contentEncoding?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:79

***

### contentMediaType?

> `optional` **contentMediaType?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:78

***

### default?

> `optional` **default?**: [`JsonSchemaValue`](/docs/reference/api/model/type-aliases/jsonschemavalue/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:83

***

### definitions?

> `optional` **definitions?**: `Record`\<`string`, [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)\>

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:80

***

### dependencies?

> `optional` **dependencies?**: `Record`\<`string`, [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/) \| `string`[]\>

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:68

***

### description?

> `optional` **description?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:82

***

### else?

> `optional` **else?**: [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:72

***

### enum?

> `optional` **enum?**: [`JsonSchemaValue`](/docs/reference/api/model/type-aliases/jsonschemavalue/)[]

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:46

***

### examples?

> `optional` **examples?**: [`JsonSchemaValue`](/docs/reference/api/model/type-aliases/jsonschemavalue/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:86

***

### exclusiveMaximum?

> `optional` **exclusiveMaximum?**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:50

***

### exclusiveMinimum?

> `optional` **exclusiveMinimum?**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:52

***

### format?

> `optional` **format?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:77

***

### if?

> `optional` **if?**: [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:70

***

### items?

> `optional` **items?**: [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/) \| [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)[]

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:56

***

### maximum?

> `optional` **maximum?**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:49

***

### maxItems?

> `optional` **maxItems?**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:58

***

### maxLength?

> `optional` **maxLength?**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:53

***

### maxProperties?

> `optional` **maxProperties?**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:62

***

### minimum?

> `optional` **minimum?**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:51

***

### minItems?

> `optional` **minItems?**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:59

***

### minLength?

> `optional` **minLength?**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:54

***

### minProperties?

> `optional` **minProperties?**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:63

***

### multipleOf?

> `optional` **multipleOf?**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:48

***

### not?

> `optional` **not?**: [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:76

***

### oneOf?

> `optional` **oneOf?**: [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)[]

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:75

***

### pattern?

> `optional` **pattern?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:55

***

### patternProperties?

> `optional` **patternProperties?**: `Record`\<`string`, [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)\>

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:66

***

### properties?

> `optional` **properties?**: `Record`\<`string`, [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)\>

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:65

***

### propertyNames?

> `optional` **propertyNames?**: [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:69

***

### readOnly?

> `optional` **readOnly?**: `boolean`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:84

***

### required?

> `optional` **required?**: `string`[]

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:64

***

### then?

> `optional` **then?**: [`JsonSchema`](/docs/reference/api/model/type-aliases/jsonschema/)

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:71

***

### title?

> `optional` **title?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:81

***

### type?

> `optional` **type?**: [`JsonSchemaTypeName`](/docs/reference/api/model/type-aliases/jsonschematypename/) \| [`JsonSchemaTypeName`](/docs/reference/api/model/type-aliases/jsonschematypename/)[]

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:45

***

### uniqueItems?

> `optional` **uniqueItems?**: `boolean`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:60

***

### writeOnly?

> `optional` **writeOnly?**: `boolean`

Defined in: .framework/oribos-framework/packages/core/dist/model/contract.d.ts:85
