---
generated: true
editUrl: false
next: false
prev: false
title: "createTool"
---

> **createTool**\<`TInputSchema`, `TOutputSchema`\>(`config`): [`Tool`](/docs/reference/api/tools/interfaces/tool/)\<[`SchemaInput`](/docs/reference/api/tools/type-aliases/schemainput/)\<`TInputSchema`\>, [`SchemaOutput`](/docs/reference/api/tools/type-aliases/schemaoutput/)\<`TOutputSchema`\>\>

Defined in: .framework/oribos-framework/packages/core/dist/tools/tool.d.ts:84

Defines a tool — a factory for typing only, returning a frozen plain object. Hand-written
literals are equally valid, but only the factory infers
`execute`'s input/output from the schemas: with it, an object literal in `inputSchema`
determines the type of `input`.

A tool without `inputSchema` gets `input: undefined`; a tool without `outputSchema` may return
anything.

## Type Parameters

### TInputSchema

`TInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined` = `undefined`

### TOutputSchema

`TOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined` = `undefined`

## Parameters

### config

[`ToolConfig`](/docs/reference/api/tools/interfaces/toolconfig/)\<`TInputSchema`, `TOutputSchema`\>

## Returns

[`Tool`](/docs/reference/api/tools/interfaces/tool/)\<[`SchemaInput`](/docs/reference/api/tools/type-aliases/schemainput/)\<`TInputSchema`\>, [`SchemaOutput`](/docs/reference/api/tools/type-aliases/schemaoutput/)\<`TOutputSchema`\>\>
