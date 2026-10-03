---
generated: true
editUrl: false
next: false
prev: false
title: "FailureSite"
---

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:72

Where a failure happened — the part of `ProcessErrorArgs` that is not the error itself. The loop
names the site when it raises the error; `processError` receives it unchanged.

## Extended by

- [`ProcessErrorArgs`](/docs/reference/api/agent/interfaces/processerrorargs/)

## Properties

### source

> `readonly` **source**: `"model"` \| `"tool"`

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:78

Which boundary failed: `'model'` is a provider call that ended the step (chain exhausted,
mid-stream failure, contract violation); `'tool'` is a tool boundary failure — an `execute`
throw, or a failed input/output validation / unknown tool.

***

### stepIndex

> `readonly` **stepIndex**: `number`

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:80

Position of the step the failure happened in, 0-based.

***

### toolCall?

> `readonly` `optional` **toolCall?**: [`ToolCallChunk`](/docs/reference/api/model/type-aliases/toolcallchunk/)

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:82

The call whose tool boundary failed — present exactly when `source` is `'tool'`.
