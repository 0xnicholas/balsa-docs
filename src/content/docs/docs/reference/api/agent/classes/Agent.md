---
generated: true
editUrl: false
next: false
prev: false
title: "Agent"
---

Defined in: .framework/oribos-framework/packages/core/dist/agent/agent.d.ts:11

The framework's execution unit: the config surface wrapped into an object that can `generate()`
and `stream()`. Independent `new Agent(...)` is first-class; nothing else has to be instantiated
(ADR-0002 / ADR-0005).

## Constructors

### Constructor

> **new Agent**(`config`): `Agent`

Defined in: .framework/oribos-framework/packages/core/dist/agent/agent.d.ts:29

#### Parameters

##### config

[`AgentConfig`](/docs/reference/api/agent/interfaces/agentconfig/)

#### Returns

`Agent`

## Properties

### description

> `readonly` **description**: [`DynamicArgument`](/docs/reference/api/agent/type-aliases/dynamicargument/)\<`string`\> \| `undefined`

Defined in: .framework/oribos-framework/packages/core/dist/agent/agent.d.ts:22

Description shown to an upstream model when composed as a tool (static or per-context).

***

### instructions

> `readonly` **instructions**: [`DynamicArgument`](/docs/reference/api/agent/type-aliases/dynamicargument/)\<`string`\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/agent.d.ts:16

System instructions, static or resolved per request context.

***

### memory

> `readonly` **memory**: [`DynamicArgument`](/docs/reference/api/agent/type-aliases/dynamicargument/)\<[`Memory`](/docs/reference/api/memory/classes/memory/)\> \| `undefined`

Defined in: .framework/oribos-framework/packages/core/dist/agent/agent.d.ts:28

The memory subsystem instance of the agent's runs — static, or resolved per run like every
other field. The per-call `memory` option names the thread/resource; without one the run does
no memory I/O (`AgentConfig.memory`).

***

### model

> `readonly` **model**: [`ModelInput`](/docs/reference/api/agent/type-aliases/modelinput/)

Defined in: .framework/oribos-framework/packages/core/dist/agent/agent.d.ts:18

The model(s) of every run — an instance, a fallback chain, or a resolver that picks either per run.

***

### name

> `readonly` **name**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/agent/agent.d.ts:14

Unique identity of the agent.

***

### tools

> `readonly` **tools**: [`DynamicArgument`](/docs/reference/api/agent/type-aliases/dynamicargument/)\<`Record`\<`string`, [`Tool`](/docs/reference/api/tools/interfaces/tool/)\<`unknown`, `unknown`\>\>\> \| `undefined`

Defined in: .framework/oribos-framework/packages/core/dist/agent/agent.d.ts:20

Tool container (key = tool name) — a static container, a per-run resolver, or `undefined`.

## Methods

### generate()

#### Call Signature

> **generate**\<`TSchema`\>(`input`, `options`): `Promise`\<[`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/)\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TSchema`\>\>\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/agent.d.ts:58

Runs the agent once and returns the terminal result — literally `stream()` awaited to its end.

`generate()` and `stream()` share the single code path, so their terminal values always agree.

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

Defined in: .framework/oribos-framework/packages/core/dist/agent/agent.d.ts:61

Runs the agent once and returns the terminal result — literally `stream()` awaited to its end.

`generate()` and `stream()` share the single code path, so their terminal values always agree.

##### Parameters

###### input

`string` \| [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

###### options?

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/)

##### Returns

`Promise`\<[`AgentGenerateResult`](/docs/reference/api/agent/interfaces/agentgenerateresult/)\<`unknown`\>\>

***

### stream()

#### Call Signature

> **stream**\<`TSchema`\>(`input`, `options`): [`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/)\<[`InferOutput`](/docs/reference/api/tools/namespaces/standardschemav1/type-aliases/inferoutput/)\<`TSchema`\>\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/agent.d.ts:49

Runs the agent once and returns the output object: `for await` consumes the core's own chunk
protocol, while `text` / `toolCalls` / `usage` / `finishReason` / `steps` are awaitable
terminal values on the same object. The run starts on first consumption.

`instructions` / `model` / `tools` are resolved against this run's request context before the
first model call (`AgentConfig` dynamic arguments) — a per-call context changes them without
rebuilding the agent. The resolution context is the very object tools receive as
`ctx.requestContext`. (`description` is not part of a run: as-tool composition resolves it at
wrapping time — `resolveDynamicArgument`.)

The built-in loop executes the tool calls a step requests (in call order), feeds the results
back to the model and repeats until a step requests no tool call or `maxSteps` is reached;
per-call behavior is controlled through `AgentRunOptions`.

`structuredOutput` asks for a structured answer: the model calls carry the schema as JSON
Schema and the run's terminal text must validate against it, strictly — the validated value is
the result's `object` (execution semantics).

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

Defined in: .framework/oribos-framework/packages/core/dist/agent/agent.d.ts:52

Runs the agent once and returns the output object: `for await` consumes the core's own chunk
protocol, while `text` / `toolCalls` / `usage` / `finishReason` / `steps` are awaitable
terminal values on the same object. The run starts on first consumption.

`instructions` / `model` / `tools` are resolved against this run's request context before the
first model call (`AgentConfig` dynamic arguments) — a per-call context changes them without
rebuilding the agent. The resolution context is the very object tools receive as
`ctx.requestContext`. (`description` is not part of a run: as-tool composition resolves it at
wrapping time — `resolveDynamicArgument`.)

The built-in loop executes the tool calls a step requests (in call order), feeds the results
back to the model and repeats until a step requests no tool call or `maxSteps` is reached;
per-call behavior is controlled through `AgentRunOptions`.

`structuredOutput` asks for a structured answer: the model calls carry the schema as JSON
Schema and the run's terminal text must validate against it, strictly — the validated value is
the result's `object` (execution semantics).

##### Parameters

###### input

`string` \| [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]

###### options?

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/)

##### Returns

[`AgentStreamResult`](/docs/reference/api/agent/interfaces/agentstreamresult/)
