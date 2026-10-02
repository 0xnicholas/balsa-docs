---
generated: true
editUrl: false
next: false
prev: false
title: "StartSpanOptions"
---

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:26

What one manual span is started with. `parent` is explicit context propagation: the framework
passes the live parent span down the execution tree — no AsyncLocalStorage, and a user-created
span inside a tool does the same.

## Properties

### attributes?

> `optional` **attributes?**: [`SpanAttributes`](/docs/reference/api/observability/type-aliases/spanattributes/)

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:51

Structured attributes, narrowed by type.

***

### hideInput?

> `optional` **hideInput?**: `boolean`

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:58

Erase `input` from every event of this span's trace. Trace-level: only a root span may set it
(usually the M1-09 run option); descendants always inherit their parent's decision.

***

### hideOutput?

> `optional` **hideOutput?**: `boolean`

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:60

Erase `output` from every event of this span's trace (root-only, inherited by descendants).

***

### input?

> `optional` **input?**: `unknown`

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:47

What went in (prompt, tool arguments, …) — first-class, exported as-is.

***

### isEvent?

> `optional` **isEvent?**: `boolean`

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:45

A point-in-time span: complete at creation, dispatched as a single `span_ended` (no duration).

***

### metadata?

> `optional` **metadata?**: `Record`\<`string`, `unknown`\>

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:53

The user's open bag.

***

### name

> **name**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:28

Human-readable operation name.

***

### output?

> `optional` **output?**: `unknown`

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:49

What came out (response, result, …) — first-class, exported as-is.

***

### parent?

> `optional` **parent?**: [`Span`](/docs/reference/api/observability/interfaces/span/)

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:32

The live parent span, when this span hangs under another one.

***

### parentSpanId?

> `optional` **parentSpanId?**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:43

The parent span inside the continued trace (`traceId` is required with it). Mutually exclusive
with `parent`.

***

### traceId?

> `optional` **traceId?**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:38

The trace to continue, for a root span that attaches to a trace started elsewhere (an incoming
`traceparent`, a run option). Mutually exclusive with `parent`; absent on a fresh root the
tracer generates one. Descendants inherit it from their parent and cannot override it.

***

### type

> **type**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:30

Open span type; the framework's seven constants are exported by this entry.
