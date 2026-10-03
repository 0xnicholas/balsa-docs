---
generated: true
editUrl: false
next: false
prev: false
title: "AgentStreamResult"
---

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:356

The output object returned by `stream()`: one run, two consumption styles, one chunk pass
(the output object).

- `for await (const chunk of result)` yields the core's own chunk protocol — never an AI SDK
  stream format (ADR-0004). The chunk stream is single-consumption; leaving the loop early
(`break`) does not cancel the run, the terminal values still settle (cancellation is the
  per-call `signal`'s job).
- The terminal promises resolve with the run's final values. Reading one starts the run if it
  has not started yet; terminal values that are never read are never created, so a consumer
  that only iterates cannot be hit by unhandled rejections.

`TObject` is the type of the run's structured output: the schema's output type when the run asks
for one (see the `stream()` overloads), `unknown` otherwise.

## Extends

- `AsyncIterable`\<[`Chunk`](/docs/reference/api/model/type-aliases/chunk/)\>

## Extended by

- [`DurableStreamResult`](/docs/reference/api/durable-agent/interfaces/durablestreamresult/)

## Type Parameters

### TObject

`TObject` = `unknown`

## Properties

### finishReason

> `readonly` **finishReason**: `Promise`\<[`FinishReason`](/docs/reference/api/model/type-aliases/finishreason/)\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:375

Why the last step stopped — the run's terminal reason.

***

### object

> `readonly` **object**: `Promise`\<`TObject`\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:365

The run's structured output: the final step's text parsed as JSON and validated against
`structuredOutput.schema` (execution semantics). Resolves `undefined` when
the run was not asked for one; rejects with `StructuredOutputError` when the answer is not JSON
or does not match the schema (strict), and with the run's own error when the run failed.

***

### steps

> `readonly` **steps**: `Promise`\<readonly [`AgentStep`](/docs/reference/api/agent/interfaces/agentstep/)[]\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:371

Per-step records: text, tool calls, tool results and usage of each model call.

***

### text

> `readonly` **text**: `Promise`\<`string`\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:358

Text of the run's final step (intermediate steps' text is in `steps`).

***

### toolCalls

> `readonly` **toolCalls**: `Promise`\<readonly [`ToolCallChunk`](/docs/reference/api/model/type-aliases/toolcallchunk/)[]\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:367

Tool calls the model requested over the whole run — `steps` flattened, in step order.

***

### toolResults

> `readonly` **toolResults**: `Promise`\<readonly [`ToolResultChunk`](/docs/reference/api/model/type-aliases/toolresultchunk/)[]\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:369

Tool results recorded over the whole run (framework- and provider-executed) — `steps` flattened.

***

### usage

> `readonly` **usage**: `Promise`\<[`Usage`](/docs/reference/api/model/type-aliases/usage/)\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:373

Usage accumulated over the whole run.

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncIterator`\<[`Chunk`](/docs/reference/api/model/type-aliases/chunk/), `any`, `any`\>

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es2018.asynciterable.d.ts:36

#### Returns

`AsyncIterator`\<[`Chunk`](/docs/reference/api/model/type-aliases/chunk/), `any`, `any`\>

#### Inherited from

`AsyncIterable.[asyncIterator]`
