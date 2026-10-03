---
generated: true
editUrl: false
next: false
prev: false
title: "ObservabilityExporter"
---

Defined in: .framework/oribos-framework/packages/core/dist/observability/events.d.ts:23

The observability exporter — the minimal surface a tracing destination implements: one event in,
optionally flush/shutdown. No `name`, no `init` (constructing the exporter is initializing it).

`flush` / `shutdown` live on the exporter because batching transports need them; the tracer
forwards both. `export` may be async; a rejected export never breaks the traced code.

## Extended by

- [`MemoryExporter`](/docs/reference/api/observability/interfaces/memoryexporter/)

## Methods

### export()

> **export**(`event`): `void` \| `Promise`\<`void`\>

Defined in: .framework/oribos-framework/packages/core/dist/observability/events.d.ts:25

Sends one tracing event out.

#### Parameters

##### event

[`TracingEvent`](/docs/reference/api/observability/type-aliases/tracingevent/)

#### Returns

`void` \| `Promise`\<`void`\>

***

### flush()?

> `optional` **flush**(): `Promise`\<`void`\>

Defined in: .framework/oribos-framework/packages/core/dist/observability/events.d.ts:27

Optional: awaits whatever the exporter has buffered.

#### Returns

`Promise`\<`void`\>

***

### shutdown()?

> `optional` **shutdown**(): `Promise`\<`void`\>

Defined in: .framework/oribos-framework/packages/core/dist/observability/events.d.ts:29

Optional: flushes and releases the exporter's resources.

#### Returns

`Promise`\<`void`\>
