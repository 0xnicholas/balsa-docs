---
generated: true
editUrl: false
next: false
prev: false
title: "createTracer"
---

> **createTracer**(`config`): [`Tracer`](/docs/reference/api/observability/interfaces/tracer/)

Defined in: .framework/oribos-framework/packages/core/dist/observability/tracer.d.ts:92

The observability entry point: one tracer per application
(or per composition root), injected into the subsystems that instrument. Subsystems never reach
for a global.

## Parameters

### config

[`TracerConfig`](/docs/reference/api/observability/interfaces/tracerconfig/)

## Returns

[`Tracer`](/docs/reference/api/observability/interfaces/tracer/)
