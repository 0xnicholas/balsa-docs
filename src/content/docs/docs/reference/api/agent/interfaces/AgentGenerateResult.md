---
generated: true
editUrl: false
next: false
prev: false
title: "AgentGenerateResult"
---

Defined in: .framework/balsats-framework/packages/core/dist/agent/types.d.ts:378

The terminal result of `generate()`: `stream()`'s awaited terminal values.

## Extended by

- [`DurableRunOutcome`](/docs/reference/api/durable-agent/interfaces/durablerunoutcome/)

## Type Parameters

### TObject

`TObject` = `unknown`

## Properties

### finishReason

> `readonly` **finishReason**: [`FinishReason`](/docs/reference/api/model/type-aliases/finishreason/)

Defined in: .framework/balsats-framework/packages/core/dist/agent/types.d.ts:395

Why the model stopped: `'stop'` / `'length'` / `'tool-calls'` / `'error'`; `'suspended'` only
 when a `stepBoundary` gate suspended the run (the durable approval gate — bare runs never).

***

### object

> `readonly` **object**: `TObject`

Defined in: .framework/balsats-framework/packages/core/dist/agent/types.d.ts:386

The run's structured output — the schema's validated value (`structuredOutput.schema`), or
`undefined` when the run was not asked for one. A non-conforming answer never reaches here: it
fails the run with `StructuredOutputError` (strict).

***

### steps

> `readonly` **steps**: readonly [`AgentStep`](/docs/reference/api/agent/interfaces/agentstep/)[]

Defined in: .framework/balsats-framework/packages/core/dist/agent/types.d.ts:397

Per-step records: text, tool calls, tool results and usage of each model call.

***

### text

> `readonly` **text**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/agent/types.d.ts:380

Text of the run's final step (intermediate steps' text is in `steps`).

***

### toolCalls

> `readonly` **toolCalls**: readonly [`ToolCallChunk`](/docs/reference/api/model/type-aliases/toolcallchunk/)[]

Defined in: .framework/balsats-framework/packages/core/dist/agent/types.d.ts:388

Tool calls the model requested over the whole run — `steps` flattened, in step order.

***

### toolResults

> `readonly` **toolResults**: readonly [`ToolResultChunk`](/docs/reference/api/model/type-aliases/toolresultchunk/)[]

Defined in: .framework/balsats-framework/packages/core/dist/agent/types.d.ts:390

Tool results recorded over the whole run (framework- and provider-executed) — `steps` flattened.

***

### usage

> `readonly` **usage**: [`Usage`](/docs/reference/api/model/type-aliases/usage/)

Defined in: .framework/balsats-framework/packages/core/dist/agent/types.d.ts:392

Usage accumulated over the whole run.
