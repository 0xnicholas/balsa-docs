---
generated: true
editUrl: false
next: false
prev: false
title: "ProcessErrorArgs"
---

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:85

What `processError` sees: the failure and where it happened.

## Extends

- [`FailureSite`](/docs/reference/api/agent/interfaces/failuresite/)

## Properties

### error

> `readonly` **error**: `unknown`

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:87

The failure — the original error object, untouched, until a processor replaces it.

***

### requestContext

> `readonly` **requestContext**: [`RequestContext`](/docs/reference/api/agent/interfaces/requestcontext/)

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:89

The run's request context.

***

### source

> `readonly` **source**: `"model"` \| `"tool"`

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:78

Which boundary failed: `'model'` is a provider call that ended the step (chain exhausted,
mid-stream failure, contract violation); `'tool'` is a tool boundary failure — an `execute`
throw, or a failed input/output validation / unknown tool.

#### Inherited from

[`FailureSite`](/docs/reference/api/agent/interfaces/failuresite/).[`source`](/docs/reference/api/agent/interfaces/failuresite/#source)

***

### stepIndex

> `readonly` **stepIndex**: `number`

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:80

Position of the step the failure happened in, 0-based.

#### Inherited from

[`FailureSite`](/docs/reference/api/agent/interfaces/failuresite/).[`stepIndex`](/docs/reference/api/agent/interfaces/failuresite/#stepindex)

***

### toolCall?

> `readonly` `optional` **toolCall?**: [`ToolCallChunk`](/docs/reference/api/model/type-aliases/toolcallchunk/)

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:82

The call whose tool boundary failed — present exactly when `source` is `'tool'`.

#### Inherited from

[`FailureSite`](/docs/reference/api/agent/interfaces/failuresite/).[`toolCall`](/docs/reference/api/agent/interfaces/failuresite/#toolcall)
