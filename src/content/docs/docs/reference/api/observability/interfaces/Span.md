---
generated: true
editUrl: false
next: false
prev: false
title: "Span"
---

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:127

A live span (`tracer.startSpan`): the span's data plus the three lifecycle methods. The data
fields are read-only through this interface — changes go through `update` / `error` / `end`, so
every change is dispatched to exporters.

Lifecycle: creating the span dispatches `span_started`; `update` and `error` dispatch
`span_updated`; `end` dispatches `span_ended` exactly once. After `end`, further calls are
ignored (no second `span_ended`, no late updates).

`error` is the recording method here, so the live handle does not carry the recorded failure as
a data field — the span model names both the field and the method `error`, and one property
cannot be both. The recorded failure is read on the exported form (`ExportedSpan.error`).

## Extends

- `Readonly`\<`Omit`\<`SpanFields`, `"error"`\>\>

## Properties

### attributes?

> `readonly` `optional` **attributes?**: [`SpanAttributes`](/docs/reference/api/observability/type-aliases/spanattributes/)

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:99

Structured attributes, narrowed by type.

#### Inherited from

`Readonly.attributes`

***

### endTime?

> `readonly` `optional` **endTime?**: `Date`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:93

When the span ended; absent while it is open, and absent for an `isEvent` span.

#### Inherited from

`Readonly.endTime`

***

### id

> `readonly` **id**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:81

Span id — 16 hex characters.

#### Inherited from

`Readonly.id`

***

### input?

> `readonly` `optional` **input?**: `unknown`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:95

What went in — prompt for a model call, arguments for a tool call.

#### Inherited from

`Readonly.input`

***

### isEvent?

> `readonly` `optional` **isEvent?**: `boolean`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:105

A point-in-time span: no duration, complete at creation (one `span_ended`).

#### Inherited from

`Readonly.isEvent`

***

### metadata?

> `readonly` `optional` **metadata?**: `Record`\<`string`, `unknown`\>

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:101

The user's open bag.

#### Inherited from

`Readonly.metadata`

***

### name

> `readonly` **name**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:87

Human-readable operation name.

#### Inherited from

`Readonly.name`

***

### output?

> `readonly` `optional` **output?**: `unknown`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:97

What came out — the response, the result.

#### Inherited from

`Readonly.output`

***

### parentSpanId?

> `readonly` `optional` **parentSpanId?**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:85

The parent span this one hangs under; absent for a trace root.

#### Inherited from

`Readonly.parentSpanId`

***

### startTime

> `readonly` **startTime**: `Date`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:91

When the span started.

#### Inherited from

`Readonly.startTime`

***

### traceId

> `readonly` **traceId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:83

Trace id — 32 hex characters.

#### Inherited from

`Readonly.traceId`

***

### type

> `readonly` **type**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:89

Open span type; the framework's seven constants are exported by this entry.

#### Inherited from

`Readonly.type`

## Methods

### end()

> **end**(): `void`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:129

Ends the span and dispatches `span_ended`. Idempotent.

#### Returns

`void`

***

### error()

> **error**(`error`): `void`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:137

Records a failure (`{ message, details }`) and dispatches `span_updated`.

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### update()

> **update**(`patch`): `void`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:135

Updates the span and dispatches `span_updated`: `name` / `input` / `output` are set,
`attributes` / `metadata` are shallow-merged into what is already there. Omitted fields stay
untouched.

#### Parameters

##### patch

[`SpanUpdate`](/docs/reference/api/observability/interfaces/spanupdate/)

#### Returns

`void`
