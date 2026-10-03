---
generated: true
editUrl: false
next: false
prev: false
title: "ExportedSpan"
---

> **ExportedSpan** = [`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/)

Defined in: .framework/oribos-framework/packages/core/dist/observability/span.d.ts:113

The exported form of a span: plain data, no live methods and no references to other spans (the
parent is described by `parentSpanId`, never by an object) — everything an exporter needs to
send the span out. `input` / `output` / `attributes` / `metadata` values are passed through as
they are given.
