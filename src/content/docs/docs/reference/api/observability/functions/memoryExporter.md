---
generated: true
editUrl: false
next: false
prev: false
title: "memoryExporter"
---

> **memoryExporter**(`options?`): [`MemoryExporter`](/docs/reference/api/observability/interfaces/memoryexporter/)

Defined in: .framework/balsa-framework/packages/core/dist/observability/exporters/memory.d.ts:28

Creates the memory exporter (`docs/architecture/observability.md`「Exporter 清单」): a ring buffer
with `capacity` slots (default 1000). Once full, each new event evicts the oldest.

## Parameters

### options?

[`MemoryExporterOptions`](/docs/reference/api/observability/interfaces/memoryexporteroptions/)

## Returns

[`MemoryExporter`](/docs/reference/api/observability/interfaces/memoryexporter/)
