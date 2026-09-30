---
generated: true
editUrl: false
next: false
prev: false
title: "DurableRunOutcome"
---

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:59

What a resumed segment ends with: `stream()`'s terminal values, awaited, plus its identity.

## Extends

- [`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/)\<`TObject`\>

## Type Parameters

### TObject

`TObject` = `unknown`

## Properties

### finishReason

> `readonly` **finishReason**: [`FinishReason`](/docs/reference/api/model/type-aliases/finishreason/)

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:395

Why the model stopped: `'stop'` / `'length'` / `'tool-calls'` / `'error'`; `'suspended'` only
 when a `stepBoundary` gate suspended the run (the durable approval gate — bare runs never).

#### Inherited from

[`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/).[`finishReason`](/docs/reference/api/agent/interfaces/agentgenerateresult/#finishreason)

***

### object

> `readonly` **object**: `TObject`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:386

The run's structured output — the schema's validated value (`structuredOutput.schema`), or
`undefined` when the run was not asked for one. A non-conforming answer never reaches here: it
fails the run with `StructuredOutputError` (strict).

#### Inherited from

[`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/).[`object`](/docs/reference/api/agent/interfaces/agentgenerateresult/#object)

***

### runId

> `readonly` **runId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:61

Identity of the run — the same id the suspended segment ran under.

***

### steps

> `readonly` **steps**: readonly [`AgentStep`](/docs/reference/api/agent/interfaces/agentstep/)[]

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:397

Per-step records: text, tool calls, tool results and usage of each model call.

#### Inherited from

[`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/).[`steps`](/docs/reference/api/agent/interfaces/agentgenerateresult/#steps)

***

### suspendPayload

> `readonly` **suspendPayload**: [`AgentRunSuspendPayload`](/docs/reference/api/durable-agent/interfaces/agentrunsuspendpayload/) \| `undefined`

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:63

The payload of a second suspension, when the resumed segment suspended again; else `undefined`.

***

### text

> `readonly` **text**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:380

Text of the run's final step (intermediate steps' text is in `steps`).

#### Inherited from

[`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/).[`text`](/docs/reference/api/agent/interfaces/agentgenerateresult/#text)

***

### toolCalls

> `readonly` **toolCalls**: readonly [`ToolCallChunk`](/docs/reference/api/model/type-aliases/toolcallchunk/)[]

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:388

Tool calls the model requested over the whole run — `steps` flattened, in step order.

#### Inherited from

[`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/).[`toolCalls`](/docs/reference/api/agent/interfaces/agentgenerateresult/#toolcalls)

***

### toolResults

> `readonly` **toolResults**: readonly [`ToolResultChunk`](/docs/reference/api/model/type-aliases/toolresultchunk/)[]

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:390

Tool results recorded over the whole run (framework- and provider-executed) — `steps` flattened.

#### Inherited from

[`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/).[`toolResults`](/docs/reference/api/agent/interfaces/agentgenerateresult/#toolresults)

***

### usage

> `readonly` **usage**: [`Usage`](/docs/reference/api/model/type-aliases/usage/)

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:392

Usage accumulated over the whole run.

#### Inherited from

[`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/).[`usage`](/docs/reference/api/agent/interfaces/agentgenerateresult/#usage)
