---
generated: true
editUrl: false
next: false
prev: false
title: "StructuredOutputConfig"
---

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:320

The `structuredOutput` run option (`docs/architecture/agent.md`「执行语义」): the shape the model's
final answer must have, as a Standard Schema dual interface (ADR-0003).

One schema, no other switches: the validation strategy of v1 is fixed at strict (a non-conforming
answer fails the run — there is no `errorStrategy`). The schema's type drives the output object's
`object` wherever it is statically known: `StructuredOutputConfig<TSchema>` makes `object`
`StandardSchemaV1.InferOutput<TSchema>`.

## Type Parameters

### TSchema

`TSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) = [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

## Properties

### schema

> `readonly` **schema**: `TSchema`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:322

The shape the run's final answer must have (Standard Schema: validate + JSON Schema).
