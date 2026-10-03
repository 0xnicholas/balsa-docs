---
generated: true
editUrl: false
next: false
prev: false
title: "MODEL_SPECIFICATION_VERSION"
---

> `const` **MODEL\_SPECIFICATION\_VERSION**: [`Model`](/docs/reference/api/model/type-aliases/model/)\[`"specificationVersion"`\]

Defined in: .framework/oribos-framework/packages/core/dist/model/resolve.d.ts:8

The AI SDK provider specification version this build of `@oribos/core` supports.

A single version is supported and locked: models of other generations are rejected by
`assertModel` — never adapted (ADR-0004).
