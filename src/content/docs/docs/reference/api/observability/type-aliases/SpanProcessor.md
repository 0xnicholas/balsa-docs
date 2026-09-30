---
generated: true
editUrl: false
next: false
prev: false
title: "SpanProcessor"
---

> **SpanProcessor** = (`event`) => [`TracingEvent`](/docs/reference/api/observability/type-aliases/tracingevent/) \| `undefined`

Defined in: .framework/balsa-framework/packages/core/dist/observability/events.d.ts:37

The synchronous per-event shaping seam (`docs/architecture/observability.md`): every event passes
through the processors in order before it reaches the exporters. A processor rewrites the event
in place (or returns a replacement) and returns it, or returns `undefined` to drop the event —
a processor that rewrites in place must therefore return the event, not fall through.

## Parameters

### event

[`TracingEvent`](/docs/reference/api/observability/type-aliases/tracingevent/)

## Returns

[`TracingEvent`](/docs/reference/api/observability/type-aliases/tracingevent/) \| `undefined`
