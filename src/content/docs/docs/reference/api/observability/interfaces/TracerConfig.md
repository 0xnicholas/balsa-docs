---
generated: true
editUrl: false
next: false
prev: false
title: "TracerConfig"
---

Defined in: .framework/balsa-framework/packages/core/dist/observability/tracer.d.ts:72

The `createTracer` config.

## Properties

### exporters

> **exporters**: readonly [`ObservabilityExporter`](/docs/reference/api/observability/interfaces/observabilityexporter/)[]

Defined in: .framework/balsa-framework/packages/core/dist/observability/tracer.d.ts:74

Where tracing events go. An empty list is allowed: the spans stay fully usable.

***

### hideInput?

> `optional` **hideInput?**: `boolean`

Defined in: .framework/balsa-framework/packages/core/dist/observability/tracer.d.ts:83

Erase `input` from every exported event by default (per-span `hideInput` overrides).

***

### hideOutput?

> `optional` **hideOutput?**: `boolean`

Defined in: .framework/balsa-framework/packages/core/dist/observability/tracer.d.ts:85

Erase `output` from every exported event by default (per-span `hideOutput` overrides).

***

### sampler?

> `optional` **sampler?**: [`Sampler`](/docs/reference/api/observability/type-aliases/sampler/)

Defined in: .framework/balsa-framework/packages/core/dist/observability/tracer.d.ts:76

Which roots are traced; `'always'` (the default) traces every run.

***

### spanProcessors?

> `optional` **spanProcessors?**: readonly [`SpanProcessor`](/docs/reference/api/observability/type-aliases/spanprocessor/)[]

Defined in: .framework/balsa-framework/packages/core/dist/observability/tracer.d.ts:81

The synchronous per-event shaping seam, run in order before every export: each processor may
rewrite the event (in place or by returning a replacement) or return `undefined` to drop it.
