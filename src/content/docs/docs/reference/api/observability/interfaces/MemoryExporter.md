---
generated: true
editUrl: false
next: false
prev: false
title: "MemoryExporter"
---

Defined in: .framework/balsa-framework/packages/core/dist/observability/exporters/memory.d.ts:13

The memory exporter: keeps the tracing events in a bounded ring buffer, for tests and in-process
assertions (`docs/architecture/observability.md`「Exporter 清单」). It is the specified assertion
surface for the observability kernel — tests assert event order, span trees and lifetimes here.

## Extends

- [`ObservabilityExporter`](/docs/reference/api/observability/interfaces/observabilityexporter/)

## Properties

### events

> `readonly` **events**: readonly [`TracingEvent`](/docs/reference/api/observability/type-aliases/tracingevent/)[]

Defined in: .framework/balsa-framework/packages/core/dist/observability/exporters/memory.d.ts:15

The retained events, oldest first.

## Methods

### clear()

> **clear**(): `void`

Defined in: .framework/balsa-framework/packages/core/dist/observability/exporters/memory.d.ts:22

Drops everything recorded so far.

#### Returns

`void`

***

### export()

> **export**(`event`): `void` \| `Promise`\<`void`\>

Defined in: .framework/balsa-framework/packages/core/dist/observability/events.d.ts:25

Sends one tracing event out.

#### Parameters

##### event

[`TracingEvent`](/docs/reference/api/observability/type-aliases/tracingevent/)

#### Returns

`void` \| `Promise`\<`void`\>

#### Inherited from

[`ObservabilityExporter`](/docs/reference/api/observability/interfaces/observabilityexporter/).[`export`](/docs/reference/api/observability/interfaces/observabilityexporter/#export)

***

### flush()?

> `optional` **flush**(): `Promise`\<`void`\>

Defined in: .framework/balsa-framework/packages/core/dist/observability/events.d.ts:27

Optional: awaits whatever the exporter has buffered.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`ObservabilityExporter`](/docs/reference/api/observability/interfaces/observabilityexporter/).[`flush`](/docs/reference/api/observability/interfaces/observabilityexporter/#flush)

***

### shutdown()?

> `optional` **shutdown**(): `Promise`\<`void`\>

Defined in: .framework/balsa-framework/packages/core/dist/observability/events.d.ts:29

Optional: flushes and releases the exporter's resources.

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`ObservabilityExporter`](/docs/reference/api/observability/interfaces/observabilityexporter/).[`shutdown`](/docs/reference/api/observability/interfaces/observabilityexporter/#shutdown)

***

### spans()

> **spans**(): readonly `SpanFields`[]

Defined in: .framework/balsa-framework/packages/core/dist/observability/exporters/memory.d.ts:20

The latest snapshot of every retained span, in first-seen order. A span that appears in several
events (started → updated → ended) is one entry carrying its newest state.

#### Returns

readonly `SpanFields`[]
