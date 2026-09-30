---
generated: true
editUrl: false
next: false
prev: false
title: "WorkingMemoryConfig"
---

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:29

Working-memory configuration (spec「配置表面」): enabled by its presence, shaped by the schema.
The schema is the contract of the memory's value — a Standard Schema dual interface (ADR-0003),
so the core neither reads nor rewrites it beyond validation and the JSON Schema it emits.

## Properties

### schema

> **schema**: [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

Defined in: .framework/balsa-framework/packages/core/dist/memory/memory.d.ts:31

The shape the working memory must have; also what the model sees as the update tool's schema.
