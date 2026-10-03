---
generated: true
editUrl: false
next: false
prev: false
title: "Tracer"
---

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:63

The tracer.

## Methods

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:67

Awaits the exports already in flight, then every exporter's own `flush`.

#### Returns

`Promise`\<`void`\>

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:69

`flush()`, then every exporter's `shutdown`.

#### Returns

`Promise`\<`void`\>

***

### startSpan()

> **startSpan**(`options`): [`Span`](/docs/reference/api/observability/interfaces/span/)

Defined in: .framework/balsats-framework/packages/core/dist/observability/tracer.d.ts:65

Starts a span and returns its live handle.

#### Parameters

##### options

[`StartSpanOptions`](/docs/reference/api/observability/interfaces/startspanoptions/)

#### Returns

[`Span`](/docs/reference/api/observability/interfaces/span/)
