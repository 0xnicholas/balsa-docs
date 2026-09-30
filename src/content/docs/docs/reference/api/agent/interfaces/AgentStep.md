---
generated: true
editUrl: false
next: false
prev: false
title: "AgentStep"
---

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:331

One step of a run: a single model call and the chunks the chunk protocol carried for it
(`docs/architecture/agent.md`「steps[]」). The step's tool calls are recorded as the protocol
saw them; the built-in loop executes the client-side ones and appends their results to this same
step (results belong to the step whose calls they answer, even though they arrive after its
`finish` chunk).

## Properties

### text

> `readonly` **text**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:333

The text the step produced, concatenated across its text deltas.

***

### toolCalls

> `readonly` **toolCalls**: readonly [`ToolCallChunk`](/docs/reference/api/model/type-aliases/toolcallchunk/)[]

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:335

Tool calls the model requested in this step, with their inputs parsed to JSON.

***

### toolResults

> `readonly` **toolResults**: readonly [`ToolResultChunk`](/docs/reference/api/model/type-aliases/toolresultchunk/)[]

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:337

Tool results reported for this step — provider-executed ones plus the framework-executed ones.

***

### usage

> `readonly` **usage**: [`Usage`](/docs/reference/api/model/type-aliases/usage/)

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:339

Token usage the model reported for this step.
