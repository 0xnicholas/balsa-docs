---
generated: true
editUrl: false
next: false
prev: false
title: "Span"
---

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:127

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

- `Readonly`\<`Omit`\<[`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/), `"error"`\>\>

## Properties

### attributes?

> `readonly` `optional` **attributes?**: [`SpanAttributes`](/docs/reference/api/observability/type-aliases/spanattributes/)

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:99

Structured attributes, narrowed by type.

#### Inherited from

[`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/).[`attributes`](/docs/reference/api/observability/interfaces/spanfields/#attributes)

***

### endTime?

> `readonly` `optional` **endTime?**: `Date`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:93

When the span ended; absent while it is open, and absent for an `isEvent` span.

#### Inherited from

[`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/).[`endTime`](/docs/reference/api/observability/interfaces/spanfields/#endtime)

***

### id

> `readonly` **id**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:81

Span id — 16 hex characters.

#### Inherited from

[`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/).[`id`](/docs/reference/api/observability/interfaces/spanfields/#id)

***

### input?

> `readonly` `optional` **input?**: `unknown`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:95

What went in — prompt for a model call, arguments for a tool call.

#### Inherited from

[`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/).[`input`](/docs/reference/api/observability/interfaces/spanfields/#input)

***

### isEvent?

> `readonly` `optional` **isEvent?**: `boolean`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:105

A point-in-time span: no duration, complete at creation (one `span_ended`).

#### Inherited from

[`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/).[`isEvent`](/docs/reference/api/observability/interfaces/spanfields/#isevent)

***

### metadata?

> `readonly` `optional` **metadata?**: `Record`\<`string`, `unknown`\>

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:101

The user's open bag.

#### Inherited from

[`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/).[`metadata`](/docs/reference/api/observability/interfaces/spanfields/#metadata)

***

### name

> `readonly` **name**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:87

Human-readable operation name.

#### Inherited from

[`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/).[`name`](/docs/reference/api/observability/interfaces/spanfields/#name)

***

### output?

> `readonly` `optional` **output?**: `unknown`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:97

What came out — the response, the result.

#### Inherited from

[`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/).[`output`](/docs/reference/api/observability/interfaces/spanfields/#output)

***

### parentSpanId?

> `readonly` `optional` **parentSpanId?**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:85

The parent span this one hangs under; absent for a trace root.

#### Inherited from

[`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/).[`parentSpanId`](/docs/reference/api/observability/interfaces/spanfields/#parentspanid)

***

### startTime

> `readonly` **startTime**: `Date`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:91

When the span started.

#### Inherited from

[`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/).[`startTime`](/docs/reference/api/observability/interfaces/spanfields/#starttime)

***

### traceId

> `readonly` **traceId**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:83

Trace id — 32 hex characters.

#### Inherited from

[`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/).[`traceId`](/docs/reference/api/observability/interfaces/spanfields/#traceid)

***

### type

> `readonly` **type**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:89

Open span type; the framework's seven constants are exported by this entry.

#### Inherited from

[`SpanFields`](/docs/reference/api/observability/interfaces/spanfields/).[`type`](/docs/reference/api/observability/interfaces/spanfields/#type)

## Methods

### end()

> **end**(): `void`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:129

Ends the span and dispatches `span_ended`. Idempotent.

#### Returns

`void`

***

### error()

> **error**(`error`): `void`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:137

Records a failure (`{ message, details }`) and dispatches `span_updated`.

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### update()

> **update**(`patch`): `void`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:135

Updates the span and dispatches `span_updated`: `name` / `input` / `output` are set,
`attributes` / `metadata` are shallow-merged into what is already there. Omitted fields stay
untouched.

#### Parameters

##### patch

[`SpanUpdate`](/docs/reference/api/observability/interfaces/spanupdate/)

#### Returns

`void`
