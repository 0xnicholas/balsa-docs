---
generated: true
editUrl: false
next: false
prev: false
title: "normalizeStream"
---

> **normalizeStream**(`stream`): `AsyncGenerator`\<[`Chunk`](/docs/reference/api/model/type-aliases/chunk/)\>

Defined in: .framework/balsats-framework/packages/core/dist/model/normalize.d.ts:12

Normalizes a model-native stream into the core's chunk protocol.

Thin by design: one chunk (or none) per model part, no buffering, no policy. The core never
surfaces the AI SDK stream format to users; this is the only place the two meet.

The underlying stream is cancelled when the consumer stops early (e.g. `break` out of a
`for await` loop), so providers can release their resources.

## Parameters

### stream

`ReadableStream`\<[`ModelStreamPart`](/docs/reference/api/model/type-aliases/modelstreampart/)\>

## Returns

`AsyncGenerator`\<[`Chunk`](/docs/reference/api/model/type-aliases/chunk/)\>
