---
generated: true
editUrl: false
next: false
prev: false
title: "DurableResumeOptions"
---

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:71

The `resume` options: the approval decision plus the run options the continued segment runs
under. The message list, the suspension point and the trace come from the snapshot, never from
here; `maxSteps` (and everything else the resumed segment should keep, `memory` included) is not
persisted with the snapshot, so pass it again to hold the run's original shape.

## Extends

- [`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/)

## Indexable

> \[`key`: `string`\]: `unknown`

User per-call request context properties.

## Properties

### approved

> `readonly` **approved**: `boolean`

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:73

`true` executes the held calls, `false` answers them with a「用户拒绝」tool result.

***

### hideInput?

> `readonly` `optional` **hideInput?**: `boolean`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:144

Erase `input` from every exported event of this run's trace, overriding the tracer-level
default for this run. Trace-level: decided on the run's root span, inherited by its children.

#### Inherited from

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/).[`hideInput`](/docs/reference/api/agent/interfaces/agentrunoptions/#hideinput)

***

### hideOutput?

> `readonly` `optional` **hideOutput?**: `boolean`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:146

Erase `output` from every exported event of this run's trace (see `hideInput`).

#### Inherited from

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/).[`hideOutput`](/docs/reference/api/agent/interfaces/agentrunoptions/#hideoutput)

***

### maxSteps?

> `readonly` `optional` **maxSteps?**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:125

The step cap: how many model calls one run may make (`docs/architecture/agent.md`「Agent
loop」). When the cap is reached while the model still asks for tools, the terminal
`finishReason` is `'tool-calls'`. Defaults to 5.

#### Inherited from

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/).[`maxSteps`](/docs/reference/api/agent/interfaces/agentrunoptions/#maxsteps)

***

### memory?

> `readonly` `optional` **memory?**: [`AgentMemoryOptions`](/docs/reference/api/agent/interfaces/agentmemoryoptions/)

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:162

The run's memory identity (`docs/architecture/memory.md`「身份模型」): present = the run recalls
from and saves into the agent's `memory` for the named thread/resource; absent = the run does
no memory I/O. Passing the option to an agent that has no configured `memory` is an error, as
is omitting either field — the identity is explicit, never defaulted.

#### Inherited from

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/).[`memory`](/docs/reference/api/agent/interfaces/agentrunoptions/#memory)

***

### modelSettings?

> `readonly` `optional` **modelSettings?**: [`ModelSettings`](/docs/reference/api/agent/type-aliases/modelsettings/)

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:115

Passthrough bag for the model call (temperature, maxOutputTokens, …).

#### Inherited from

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/).[`modelSettings`](/docs/reference/api/agent/interfaces/agentrunoptions/#modelsettings)

***

### parentSpanId?

> `readonly` `optional` **parentSpanId?**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:139

The parent span inside the continued trace; requires `traceId` (the tracer rejects one without
the other). Absent = the run's `agent-run` span hangs directly under the continued trace. An
empty string counts as absent, and so it does when the trace id is empty.

#### Inherited from

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/).[`parentSpanId`](/docs/reference/api/agent/interfaces/agentrunoptions/#parentspanid)

***

### providerOptions?

> `readonly` `optional` **providerOptions?**: [`ModelProviderOptions`](/docs/reference/api/model/type-aliases/modelprovideroptions/)

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:117

Provider-specific options, forwarded to the model call untouched.

#### Inherited from

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/).[`providerOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/#provideroptions)

***

### resume?

> `readonly` `optional` **resume?**: [`AgentRunResume`](/docs/reference/api/agent/interfaces/agentrunresume/)

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:180

Continue a suspended run from its snapshot — the harness wrappers' re-entry (`AgentRunResume`,
`docs/architecture/harness.md`「Durable agents」). With it, `input` is the suspended run's own
message list: the resumed run's prompt, used verbatim, so prompt assembly is skipped — no
instructions, no memory recall, no working memory, no `processInput` (the list already carries
what the suspended run saw, the input processors included). A resumed run's memory identity
therefore only records the continued step; nothing is recalled and no history is re-saved.

#### Inherited from

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/).[`resume`](/docs/reference/api/agent/interfaces/agentrunoptions/#resume)

***

### signal?

> `readonly` `optional` **signal?**: `AbortSignal`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:119

Cancels the run — propagated to the model call, the tool loop and every tool context.

#### Inherited from

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/).[`signal`](/docs/reference/api/agent/interfaces/agentrunoptions/#signal)

***

### stepBoundary?

> `readonly` `optional` **stepBoundary?**: [`AgentStepBoundary`](/docs/reference/api/agent/interfaces/agentstepboundary/)

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:171

The run's step-boundary wiring (`docs/architecture/harness.md`「与其它子系统的关系」): the agent
loop's only harness extension point — the hook surface the durable approval gate
(`beforeToolCalls`) and the signals injector (`beforeNextStep`) hang on. Absent = the loop
runs untouched: no hook is consulted, nothing is copied, the bare agent's behavior is
unchanged (the harness spec's zero-overhead guarantee). Not request context — it is per-run
execution wiring, kept out of the context bag the tools see.

#### Inherited from

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/).[`stepBoundary`](/docs/reference/api/agent/interfaces/agentrunoptions/#stepboundary)

***

### structuredOutput?

> `readonly` `optional` **structuredOutput?**: [`StructuredOutputConfig`](/docs/reference/api/agent/interfaces/structuredoutputconfig/)\<[`StandardSchema`](/docs/reference/api/tools/type-aliases/standardschema/)\>

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:155

Ask for a structured answer: the schema is sent to the model as JSON Schema (`responseFormat`
on every model call of the run), and the run's terminal text is parsed as JSON and validated
against it — strictly: an answer that is not JSON, or does not match the schema, fails the run
with `StructuredOutputError` (`docs/architecture/agent.md`「执行语义」). The validated value
settles the output object's `object`; absent = the run's answer is plain text, `object` is
`undefined`.

#### Inherited from

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/).[`structuredOutput`](/docs/reference/api/agent/interfaces/agentrunoptions/#structuredoutput)

***

### traceId?

> `readonly` `optional` **traceId?**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:133

The trace to continue: the run's `agent-run` span attaches to a trace started elsewhere (an
incoming `traceparent`, a parent run — as-tool composition reads it from the tool context).
Absent = the run starts a fresh trace. An empty string is the tool context's "no trace"
encoding (`NoOpSpan` / no tracer) and counts as absent — the delegated run then starts its own
trace instead of hanging off a nonexistent parent. Only meaningful with an attached tracer.

#### Inherited from

[`AgentRunOptions`](/docs/reference/api/agent/interfaces/agentrunoptions/).[`traceId`](/docs/reference/api/agent/interfaces/agentrunoptions/#traceid)
