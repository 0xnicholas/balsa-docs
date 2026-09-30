---
generated: true
editUrl: false
next: false
prev: false
title: "StandardSchema"
---

> **StandardSchema**\<`Input`, `Output`\> = [`StandardSchemaV1`](/docs/reference/api/tools/interfaces/standardschemav1/)\<`Input`, `Output`\> & [`StandardJSONSchemaV1`](/docs/reference/api/tools/interfaces/standardjsonschemav1/)\<`Input`, `Output`\>

Defined in: .framework/balsa-framework/packages/core/dist/standard-schema.d.ts:136

The contract every schema boundary uses (ADR-0003): validation **and** JSON Schema generation.
A schema that only validates (or only emits JSON Schema) is rejected by the type system.

## Type Parameters

### Input

`Input` = `unknown`

### Output

`Output` = `Input`
