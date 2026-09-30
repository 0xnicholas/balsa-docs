---
generated: true
editUrl: false
next: false
prev: false
title: "DurableStreamResult"
---

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:48

The durable run surface: `agent.stream`'s output object, plus the run's durable identity (the key
`resume` takes) and what the approval gate held back when it suspended.

## Extends

- [`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/)\<`TObject`\>

## Type Parameters

### TObject

`TObject` = `unknown`

## Properties

### finishReason

> `readonly` **finishReason**: `Promise`\<[`FinishReason`](/docs/reference/api/model/type-aliases/finishreason/)\>

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:375

Why the last step stopped — the run's terminal reason.

#### Inherited from

[`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/).[`finishReason`](/docs/reference/api/agent/interfaces/agentstreamresult/#finishreason)

***

### object

> `readonly` **object**: `Promise`\<`TObject`\>

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:365

The run's structured output: the final step's text parsed as JSON and validated against
`structuredOutput.schema` (`docs/architecture/agent.md`「执行语义」). Resolves `undefined` when
the run was not asked for one; rejects with `StructuredOutputError` when the answer is not JSON
or does not match the schema (strict), and with the run's own error when the run failed.

#### Inherited from

[`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/).[`object`](/docs/reference/api/agent/interfaces/agentstreamresult/#object)

***

### runId

> `readonly` **runId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:50

Identity of this run — the `runId` its snapshot is stored under and `resume` loads by.

***

### steps

> `readonly` **steps**: `Promise`\<readonly [`AgentStep`](/docs/reference/api/agent/interfaces/agentstep/)[]\>

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:371

Per-step records: text, tool calls, tool results and usage of each model call.

#### Inherited from

[`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/).[`steps`](/docs/reference/api/agent/interfaces/agentstreamresult/#steps)

***

### suspendPayload

> `readonly` **suspendPayload**: `Promise`\<[`AgentRunSuspendPayload`](/docs/reference/api/durable-agent/interfaces/agentrunsuspendpayload/) \| `undefined`\>

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:56

What the run suspended with: the calls the gate held back and the ids awaiting the approval
decision. Resolves `undefined` when the run did not suspend (including when it failed) — read
it after `finishReason`, or together with it.

***

### text

> `readonly` **text**: `Promise`\<`string`\>

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:358

Text of the run's final step (intermediate steps' text is in `steps`).

#### Inherited from

[`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/).[`text`](/docs/reference/api/agent/interfaces/agentstreamresult/#text)

***

### toolCalls

> `readonly` **toolCalls**: `Promise`\<readonly [`ToolCallChunk`](/docs/reference/api/model/type-aliases/toolcallchunk/)[]\>

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:367

Tool calls the model requested over the whole run — `steps` flattened, in step order.

#### Inherited from

[`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/).[`toolCalls`](/docs/reference/api/agent/interfaces/agentstreamresult/#toolcalls)

***

### toolResults

> `readonly` **toolResults**: `Promise`\<readonly [`ToolResultChunk`](/docs/reference/api/model/type-aliases/toolresultchunk/)[]\>

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:369

Tool results recorded over the whole run (framework- and provider-executed) — `steps` flattened.

#### Inherited from

[`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/).[`toolResults`](/docs/reference/api/agent/interfaces/agentstreamresult/#toolresults)

***

### usage

> `readonly` **usage**: `Promise`\<[`Usage`](/docs/reference/api/model/type-aliases/usage/)\>

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:373

Usage accumulated over the whole run.

#### Inherited from

[`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/).[`usage`](/docs/reference/api/agent/interfaces/agentstreamresult/#usage)

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncIterator`\<[`Chunk`](/docs/reference/api/model/type-aliases/chunk/), `any`, `any`\>

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es2018.asynciterable.d.ts:36

#### Returns

`AsyncIterator`\<[`Chunk`](/docs/reference/api/model/type-aliases/chunk/), `any`, `any`\>

#### Inherited from

[`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/).[`[asyncIterator]`](/docs/reference/api/agent/interfaces/agentstreamresult/#asynciterator)
