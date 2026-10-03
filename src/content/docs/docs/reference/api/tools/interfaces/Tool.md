---
generated: true
editUrl: false
next: false
prev: false
title: "Tool"
---

Defined in: .framework/balsats-framework/packages/core/dist/tools/tool.d.ts:46

The tool definition surface: four fields — `description`,
optional `inputSchema` / `outputSchema`, and `execute` — nothing beyond it (ADR-0008).

Tools carry no id/name: the name of a tool is its key in the Agent's `Record<string, Tool>`
container. Schemas are Standard Schema dual interfaces (ADR-0003); `execute`'s input and output
types are inferred from them, so a hand-written type annotation normally is not needed for tools
built with `createTool`.

This is the container-erased view of a tool: input/output are `unknown` unless a caller
annotates them (`Tool<{ city: string }>`), and `execute` is declared as a method so that
concretely typed tools (schema-derived or annotated) stay assignable into `Record<string, Tool>`
without an `any` hole.

## Type Parameters

### TInput

`TInput` = `unknown`

### TOutput

`TOutput` = `unknown`

## Properties

### description

> `readonly` **description**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/tools/tool.d.ts:48

What the tool does, shown to the model.

***

### inputSchema?

> `readonly` `optional` **inputSchema?**: [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

Defined in: .framework/balsats-framework/packages/core/dist/tools/tool.d.ts:50

Input schema (Standard Schema dual interface) — omitted for tools without arguments.

***

### outputSchema?

> `readonly` `optional` **outputSchema?**: [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

Defined in: .framework/balsats-framework/packages/core/dist/tools/tool.d.ts:52

Output schema — when present, the tool result is validated against it.

## Methods

### execute()

> **execute**(`input`, `ctx`): `TOutput` \| `Promise`\<`TOutput`\>

Defined in: .framework/balsats-framework/packages/core/dist/tools/tool.d.ts:54

Runs the tool with the schema-validated input and the framework context.

#### Parameters

##### input

`TInput`

##### ctx

[`ToolContext`](/docs/reference/api/tools/interfaces/toolcontext/)

#### Returns

`TOutput` \| `Promise`\<`TOutput`\>
