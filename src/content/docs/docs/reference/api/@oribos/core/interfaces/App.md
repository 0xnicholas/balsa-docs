---
generated: true
editUrl: false
next: false
prev: false
title: "App"
---

Defined in: .framework/oribos-framework/packages/core/dist/app.d.ts:60

The composition root (`createApp`): the factories that build subsystems with the distributed dependencies.

## Methods

### agent()

> **agent**(`config`): [`Agent`](/docs/reference/api/agent/classes/agent/)

Defined in: .framework/oribos-framework/packages/core/dist/app.d.ts:70

Builds an agent with the app's tracer and shared memory distributed to it — an agent hung on
the composition root receives them without the caller passing either per agent.

`AgentConfig.tracer` / `AgentConfig.memory` win when the config brings their own: explicit
assembly is never taken over. Without an app tracer the agent is built exactly as
`new Agent(config)`; nothing is activated by the distributed memory alone (a run with no
per-call thread identity performs no memory I/O).

#### Parameters

##### config

[`AgentConfig`](/docs/reference/api/agent/interfaces/agentconfig/)

#### Returns

[`Agent`](/docs/reference/api/agent/classes/agent/)

***

### durableAgent()

> **durableAgent**(`config`): [`DurableAgent`](/docs/reference/api/durable-agent/interfaces/durableagent/)

Defined in: .framework/oribos-framework/packages/core/dist/app.d.ts:83

Wraps an agent with the app's agent run snapshot store distributed to it — a run that hits the
approval gate snapshots through the `storage.durableAgent` slot without the caller passing one.
`DurableAgentConfig.storage` wins when the config brings its own.

#### Parameters

##### config

[`DurableAgentConfig`](/docs/reference/api/durable-agent/interfaces/durableagentconfig/)

#### Returns

[`DurableAgent`](/docs/reference/api/durable-agent/interfaces/durableagent/)

***

### schedules()

> **schedules**(`config`): [`Schedules`](/docs/reference/api/schedules/interfaces/schedules/)

Defined in: .framework/oribos-framework/packages/core/dist/app.d.ts:96

Creates the schedules facade with the app's schedule store distributed to it — records persist
through the `storage.schedules` slot without the caller passing one. `SchedulesConfig.storage`
wins when the config brings its own.

#### Parameters

##### config

[`SchedulesConfig`](/docs/reference/api/schedules/interfaces/schedulesconfig/)

#### Returns

[`Schedules`](/docs/reference/api/schedules/interfaces/schedules/)

***

### signals()

> **signals**(`config`): [`Signals`](/docs/reference/api/signals/interfaces/signals/)

Defined in: .framework/oribos-framework/packages/core/dist/app.d.ts:90

Creates the signals facade with the app's shared memory and tracer distributed to it — for an
agent built by this app (`app.agent(...)`) the thread's history lands in the `storage.memory`
slot without the caller passing a memory. `SignalsConfig.memory` / `SignalsConfig.tracer` win
when the config brings their own; an agent that carries a different memory is left as given.

#### Parameters

##### config

[`SignalsConfig`](/docs/reference/api/signals/interfaces/signalsconfig/)

#### Returns

[`Signals`](/docs/reference/api/signals/interfaces/signals/)

***

### workflow()

> **workflow**\<`TInputSchema`, `TOutputSchema`\>(`config`): [`WorkflowBuilder`](/docs/reference/api/workflows/interfaces/workflowbuilder/)\<`TInputSchema`, `TOutputSchema`, `TInputSchema`\>

Defined in: .framework/oribos-framework/packages/core/dist/app.d.ts:77

Opens a workflow builder with the app's tracer and workflow snapshot store distributed to it —
the committed definition snapshots through the `storage.workflow` slot without the caller
passing one. `WorkflowConfig.tracer` / `WorkflowConfig.storage` win when the config brings
their own: explicit assembly is never taken over.

#### Type Parameters

##### TInputSchema

`TInputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

##### TOutputSchema

`TOutputSchema` *extends* [`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)

#### Parameters

##### config

[`WorkflowConfig`](/docs/reference/api/workflows/interfaces/workflowconfig/)\<`TInputSchema`, `TOutputSchema`\>

#### Returns

[`WorkflowBuilder`](/docs/reference/api/workflows/interfaces/workflowbuilder/)\<`TInputSchema`, `TOutputSchema`, `TInputSchema`\>
