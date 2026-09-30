---
generated: true
editUrl: false
next: false
prev: false
title: "ParallelEntry"
---

Defined in: .framework/balsa-framework/packages/core/dist/workflows/entry.d.ts:42

`.parallel([a, b])`: run the steps concurrently (`Promise.all`), collect `{ [step.id]: output }`.

## Properties

### steps

> `readonly` **steps**: readonly [`Step`](/docs/reference/api/workflows/interfaces/step/)\<`string`, [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/), [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/), [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`, [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/) \| `undefined`\>[]

Defined in: .framework/balsa-framework/packages/core/dist/workflows/entry.d.ts:44

***

### type

> `readonly` **type**: `"parallel"`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/entry.d.ts:43
