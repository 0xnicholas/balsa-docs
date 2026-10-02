---
generated: true
editUrl: false
next: false
prev: false
title: "Signals"
---

Defined in: .framework/balsats-framework/packages/core/dist/signals/signals.d.ts:58

The signals entry object: the agent's run surface wrapped, plus the four signal methods.

## Methods

### generate()

#### Call Signature

> **generate**\<`TSchema`\>(`input`, `options`): `Promise`\<[`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/)\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TSchema`\>\>\>

Defined in: .framework/balsats-framework/packages/core/dist/signals/signals.d.ts:75

`stream()` awaited to its terminal values, exactly as `agent.generate`.

##### Type Parameters

###### TSchema

`TSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

##### Parameters

###### input

`string` \| [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

###### options

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/) & `object`

##### Returns

`Promise`\<[`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/)\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TSchema`\>\>\>

#### Call Signature

> **generate**(`input`, `options?`): `Promise`\<[`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/)\<`unknown`\>\>

Defined in: .framework/balsats-framework/packages/core/dist/signals/signals.d.ts:78

##### Parameters

###### input

`string` \| [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

###### options?

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/)

##### Returns

`Promise`\<[`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/)\<`unknown`\>\>

***

### queueMessage()

> **queueMessage**(`target`, `input`): `Promise`\<`void`\>

Defined in: .framework/balsats-framework/packages/core/dist/signals/signals.d.ts:93

Queues a message for a thread: it waits for the current run to end, then lands as the input
of one continuation run, in arrival order with everything queued before it. On an
idle thread it is simply a wake. The queue is process memory — the process dying drops it
(documented single-process semantics).

#### Parameters

##### target

[`AgentMemoryOptions`](/docs/reference/api/agent/interfaces/agentmemoryoptions/)

##### input

`string` \| [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

#### Returns

`Promise`\<`void`\>

***

### sendMessage()

> **sendMessage**(`target`, `input`): `Promise`\<`void`\>

Defined in: .framework/balsats-framework/packages/core/dist/signals/signals.d.ts:86

Sends a message to a thread — active = injected into the current run, idle = wakes a new run.
The content lands in message history as an ordinary message — saved here when injected (no run
would ever persist it), saved by the woken run itself when it wakes one. Resolves once the
message is delivered — persisted and buffered for injection, or the run started — never
awaits a woken run's completion.

#### Parameters

##### target

[`AgentMemoryOptions`](/docs/reference/api/agent/interfaces/agentmemoryoptions/)

##### input

`string` \| [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

#### Returns

`Promise`\<`void`\>

***

### sendSignal()

> **sendSignal**(`target`, `payload`): `Promise`\<`void`\>

Defined in: .framework/balsats-framework/packages/core/dist/signals/signals.d.ts:99

Sends a system signal (open `type`): same delivery as `sendMessage` — inject into the active
run, wake an idle thread — with the payload rendered as its message
(`[signal] ${JSON.stringify(payload)}`) instead of the caller's input.

#### Parameters

##### target

[`AgentMemoryOptions`](/docs/reference/api/agent/interfaces/agentmemoryoptions/)

##### payload

[`SignalPayload`](/docs/reference/api/signals/interfaces/signalpayload/)

#### Returns

`Promise`\<`void`\>

***

### stream()

#### Call Signature

> **stream**\<`TSchema`\>(`input`, `options`): [`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/)\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TSchema`\>\>

Defined in: .framework/balsats-framework/packages/core/dist/signals/signals.d.ts:70

Runs the agent once, exactly as `agent.stream` does, with the thread registered while the run
is live: messages sent to the run's thread inject here, `subscribeToThread` listeners receive
this run's chunks. The per-call `memory` identity is what registers the run — a call without
one passes through to the agent untouched, with no registration. A run on a thread that
already has a live run is rejected: one active run per thread is what the three sentences
presuppose (`queueMessage` waits instead).

Registration is eager — the thread is claimed when `stream` is called — while the run itself
stays lazy like the bare agent's: the model call happens on first consumption.

##### Type Parameters

###### TSchema

`TSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

##### Parameters

###### input

`string` \| [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

###### options

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/) & `object`

##### Returns

[`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/)\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TSchema`\>\>

#### Call Signature

> **stream**(`input`, `options?`): [`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/)

Defined in: .framework/balsats-framework/packages/core/dist/signals/signals.d.ts:73

##### Parameters

###### input

`string` \| [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

###### options?

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/)

##### Returns

[`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/)

***

### subscribeToThread()

> **subscribeToThread**(`target`): `AsyncIterable`\<[`Chunk`](/docs/reference/api/model/type-aliases/chunk/)\>

Defined in: .framework/balsats-framework/packages/core/dist/signals/signals.d.ts:106

Subscribes to the chunks of the runs on a thread: every chunk of the thread's current and
future runs flows to the subscription until the consumer breaks out of the loop. No replay —
chunks emitted before subscribing never arrive. An unconsumed subscription buffers without
bound: consume it, or leave the loop.

#### Parameters

##### target

[`AgentMemoryOptions`](/docs/reference/api/agent/interfaces/agentmemoryoptions/)

#### Returns

`AsyncIterable`\<[`Chunk`](/docs/reference/api/model/type-aliases/chunk/)\>
