---
generated: true
editUrl: false
next: false
prev: false
title: "ParentSpanRef"
---

Defined in: .framework/oribos-framework/packages/core/dist/observability/tracer.d.ts:7

The parent a root span continues an existing trace from — `undefined` when the span starts a
fresh trace. Sampler functions receive it so a custom sampler can decide by what it continues.

## Properties

### parentSpanId?

> `optional` **parentSpanId?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/observability/tracer.d.ts:11

The parent span within that trace, when the continuer knows it.

***

### traceId

> **traceId**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/observability/tracer.d.ts:9

The trace being continued.
