---
generated: true
editUrl: false
next: false
prev: false
title: "consoleExporter"
---

> **consoleExporter**(`options?`): [`ObservabilityExporter`](/docs/reference/api/observability/interfaces/observabilityexporter/)

Defined in: .framework/balsats-framework/packages/core/dist/observability/exporters/console.d.ts:12

The console exporter (the exporter inventory): pretty-prints every
event for development debugging — one header line per event (kind, type, name, ids, duration,
error flag) plus indented detail lines for input / output / attributes / metadata / error.

## Parameters

### options?

[`ConsoleExporterOptions`](/docs/reference/api/observability/interfaces/consoleexporteroptions/)

## Returns

[`ObservabilityExporter`](/docs/reference/api/observability/interfaces/observabilityexporter/)
