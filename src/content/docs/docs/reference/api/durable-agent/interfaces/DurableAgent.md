---
generated: true
editUrl: false
next: false
prev: false
title: "DurableAgent"
---

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:76

The durable agent: the agent's run surface wrapped, plus `resume`.

## Methods

### resume()

> **resume**(`runId`, `options`): `Promise`\<[`DurableRunOutcome`](/docs/reference/api/durable-agent/interfaces/durablerunoutcome/)\<`unknown`\>\>

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:94

Continues a suspended run: loads its snapshot, replays the held calls under the approval
decision and drives the run to its next stop. Resolves with the segment's outcome (a run that
suspended again resolves `'suspended'` and is resumable under the same id). Concurrent resumes
of one run are joined into the one in flight.

#### Parameters

##### runId

`string`

##### options

[`DurableResumeOptions`](/docs/reference/api/durable-agent/interfaces/durableresumeoptions/)

#### Returns

`Promise`\<[`DurableRunOutcome`](/docs/reference/api/durable-agent/interfaces/durablerunoutcome/)\<`unknown`\>\>

***

### stream()

#### Call Signature

> **stream**\<`TSchema`\>(`input`, `options`): [`DurableStreamResult`](/docs/reference/api/durable-agent/interfaces/durablestreamresult/)\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TSchema`\>\>

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:84

Runs the agent once, exactly as `agent.stream` does, with the approval gate attached: a step
whose pending calls hit the approval list suspends the run (snapshot written, `finishReason`
`'suspended'`) instead of executing them. The run's chunks, terminal values and memory behavior
are the agent's own — the wrapper only adds the gate, the snapshot and `runId` /
`suspendPayload`.

##### Type Parameters

###### TSchema

`TSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

##### Parameters

###### input

`string` \| [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

###### options

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/) & `object`

##### Returns

[`DurableStreamResult`](/docs/reference/api/durable-agent/interfaces/durablestreamresult/)\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TSchema`\>\>

#### Call Signature

> **stream**(`input`, `options?`): [`DurableStreamResult`](/docs/reference/api/durable-agent/interfaces/durablestreamresult/)

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:87

##### Parameters

###### input

`string` \| [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

###### options?

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/)

##### Returns

[`DurableStreamResult`](/docs/reference/api/durable-agent/interfaces/durablestreamresult/)
