---
generated: true
editUrl: false
next: false
prev: false
title: "ToolConfig"
---

Defined in: .framework/balsa-framework/packages/core/dist/tools/tool.d.ts:61

The four-field config accepted by `createTool`, with the schema type parameters exposed so that
`execute`'s input/output types are derived from the schemas. Annotating with bare `ToolConfig`
accepts any dual-interface schema and widens the schemas' inferred types to `unknown`.

## Type Parameters

### TInputSchema

`TInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined` = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`

### TOutputSchema

`TOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined` = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`

## Properties

### description

> `readonly` **description**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/tools/tool.d.ts:63

What the tool does, shown to the model.

***

### inputSchema?

> `readonly` `optional` **inputSchema?**: `TInputSchema`

Defined in: .framework/balsa-framework/packages/core/dist/tools/tool.d.ts:65

Input schema — omitted for tools without arguments (`input` is then `undefined`).

***

### outputSchema?

> `readonly` `optional` **outputSchema?**: `TOutputSchema`

Defined in: .framework/balsa-framework/packages/core/dist/tools/tool.d.ts:67

Output schema — when present, the tool result is validated against it.

## Methods

### execute()

> **execute**(`input`, `ctx`): `SchemaOutput`\<`TOutputSchema`\> \| `Promise`\<`SchemaOutput`\<`TOutputSchema`\>\>

Defined in: .framework/balsa-framework/packages/core/dist/tools/tool.d.ts:69

Runs the tool with the schema-validated input.

#### Parameters

##### input

`SchemaInput`\<`TInputSchema`\>

##### ctx

[`ToolContext`](/docs/reference/api/tools/interfaces/toolcontext/)

#### Returns

`SchemaOutput`\<`TOutputSchema`\> \| `Promise`\<`SchemaOutput`\<`TOutputSchema`\>\>
