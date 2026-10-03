---
generated: true
editUrl: false
next: false
prev: false
title: "SpanFields"
---

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:79

The data fields of a span (the span model) — id / traceId are
OTel-compatible hex, input/output are first-class citizens (a prompt is the main subject of LLM
debugging), `attributes` are narrowed by type and `metadata` is the user's open bag.

## Properties

### attributes?

> `optional` **attributes?**: [`SpanAttributes`](/docs/reference/api/observability/type-aliases/spanattributes/)

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:99

Structured attributes, narrowed by type.

***

### endTime?

> `optional` **endTime?**: `Date`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:93

When the span ended; absent while it is open, and absent for an `isEvent` span.

***

### error?

> `optional` **error?**: [`SpanError`](/docs/reference/api/observability/type-aliases/spanerror/)

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:103

How the span failed, when it did.

***

### id

> **id**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:81

Span id — 16 hex characters.

***

### input?

> `optional` **input?**: `unknown`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:95

What went in — prompt for a model call, arguments for a tool call.

***

### isEvent?

> `optional` **isEvent?**: `boolean`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:105

A point-in-time span: no duration, complete at creation (one `span_ended`).

***

### metadata?

> `optional` **metadata?**: `Record`\<`string`, `unknown`\>

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:101

The user's open bag.

***

### name

> **name**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:87

Human-readable operation name.

***

### output?

> `optional` **output?**: `unknown`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:97

What came out — the response, the result.

***

### parentSpanId?

> `optional` **parentSpanId?**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:85

The parent span this one hangs under; absent for a trace root.

***

### startTime

> **startTime**: `Date`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:91

When the span started.

***

### traceId

> **traceId**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:83

Trace id — 32 hex characters.

***

### type

> **type**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:89

Open span type; the framework's seven constants are exported by this entry.
