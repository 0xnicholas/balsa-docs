---
generated: true
editUrl: false
next: false
prev: false
title: "AgentStepBoundary"
---

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:207

The agent loop's step-boundary seam (`docs/architecture/harness.md`「Signals」+「与其它子系统的
关系」): the one loop change the harness spec allows — per-run wiring the harness wrappers
(`createDurableAgent` / `createSignals`) pass as `AgentRunOptions.stepBoundary`. Absent = the loop
runs exactly as before: no hook is consulted, nothing is copied, the bare agent's behavior is
unchanged (the harness spec's「无 signals 挂接时零开销」guarantee, verbatim for the approval gate).

One seam, two phases, because both harness consumers hang the same region of the loop and no
earlier extension point reaches it: the processors' hooks all run after a step's tools have
executed, and wrapping `tool.execute` can only turn a suspension into an error tool result fed
back to the model — a gate has to hold the calls before they execute, an injector has to land
its messages before the next model call.

- `beforeToolCalls` — after the step's model output has fully streamed (the caller has seen its
  finish chunk), before the framework executes the step's pending tool calls. The durable
  approval gate decides here. The event carries the snapshot surface the wrapper persists
  (messages + stepIndex + trace continuation); a suspend decision ends the run at this boundary
  — a normal terminal outcome, never an error. The loop itself keeps no snapshot
  (`docs/architecture/agent.md`:核心 loop 保持无快照) — the wrapper builds one from the event.
- `beforeNextStep` — before every model call of the run, the first included. The signals
  injector drains its queue here; the messages it returns are appended to the prompt and take
  part in that model call (活跃 = 注入当前 run,下一 step 生效).

## Methods

### beforeNextStep()?

> `optional` **beforeNextStep**(`event`): `void` \| readonly [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[] \| `Promise`\<`void` \| readonly [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]\>

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:221

The injection point: before every model call of the run, the first included. The messages
returned are appended to the prompt — after the event's `messages` snapshot — and are what
that model call sees (and what the step span records as its input). Returning nothing injects
nothing. May be synchronous or asynchronous.

#### Parameters

##### event

[`AgentStepBoundaryEvent`](/docs/reference/api/agent/interfaces/agentstepboundaryevent/)

#### Returns

`void` \| readonly [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[] \| `Promise`\<`void` \| readonly [`ModelMessage`](/docs/reference/api/model/type-aliases/modelmessage/)[]\>

***

### beforeToolCalls()?

> `optional` **beforeToolCalls**(`event`): `void` \| [`AgentStepBoundaryDecision`](/docs/reference/api/agent/interfaces/agentstepboundarydecision/) \| `Promise`\<`void` \| [`AgentStepBoundaryDecision`](/docs/reference/api/agent/interfaces/agentstepboundarydecision/)\>

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:214

The approval point: after the step's tool calls are known, before any of them executes.
Called only for steps with at least one pending (framework-executed) call. Returning a
suspend decision ends the run with `finishReason: 'suspended'`; returning nothing lets the
calls execute exactly as before. May be synchronous or asynchronous.

#### Parameters

##### event

[`AgentToolCallsBoundaryEvent`](/docs/reference/api/agent/interfaces/agenttoolcallsboundaryevent/)

#### Returns

`void` \| [`AgentStepBoundaryDecision`](/docs/reference/api/agent/interfaces/agentstepboundarydecision/) \| `Promise`\<`void` \| [`AgentStepBoundaryDecision`](/docs/reference/api/agent/interfaces/agentstepboundarydecision/)\>
