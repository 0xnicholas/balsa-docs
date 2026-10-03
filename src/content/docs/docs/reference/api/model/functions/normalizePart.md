---
generated: true
editUrl: false
next: false
prev: false
title: "normalizePart"
---

> **normalizePart**(`part`): [`Chunk`](/docs/reference/api/model/type-aliases/chunk/)[]

Defined in: .framework/oribos-framework/packages/core/dist/model/normalize.d.ts:24

Normalizes one model-native stream part into chunks.

Returns an empty array for parts outside the minimal protocol (structural markers, reasoning,
partial tool input, sources, files, raw parts, tool approval requests). Tool calls and
provider-executed tool results are carried: what to execute is the tool loop's decision, not the
normalizer's.

Throws the reported error for `'error'` parts — a stream that reports failure must fail, not
silently end.

## Parameters

### part

[`ModelStreamPart`](/docs/reference/api/model/type-aliases/modelstreampart/)

## Returns

[`Chunk`](/docs/reference/api/model/type-aliases/chunk/)[]
