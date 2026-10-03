---
generated: true
editUrl: false
next: false
prev: false
title: "TracingEvent"
---

> **TracingEvent** = \{ `kind`: `"span_started"`; `span`: [`ExportedSpan`](/docs/reference/api/observability/type-aliases/exportedspan/); \} \| \{ `kind`: `"span_updated"`; `span`: [`ExportedSpan`](/docs/reference/api/observability/type-aliases/exportedspan/); \} \| \{ `kind`: `"span_ended"`; `span`: [`ExportedSpan`](/docs/reference/api/observability/type-aliases/exportedspan/); \}

Defined in: .framework/oribos-framework/packages/core/dist/observability/events.d.ts:6

The three lifecycle events of the tracing bus (events and export).
Each carries the span's exported form at the moment of the event.
