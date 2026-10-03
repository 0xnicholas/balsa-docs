---
generated: true
editUrl: false
next: false
prev: false
title: "AgentConfig"
---

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:22

The Agent surface: the five definition fields — `name`,
`instructions`, `model`, optional `tools`, optional `description` — plus the optional `memory`
subsystem (a first-class optional field of the same surface), and
the `tracer` / `processors` seams. Nothing beyond them.

`tracer` is not a sixth definition field: it is the observability injection seam — a
cross-cutting dependency the composition root hands to the subsystem (`createApp({ tracer })`),
which a standalone `new` may also pass
explicitly. Not attaching it leaves the whole observability subsystem at zero overhead.

Every config field accepts a static value or a resolver (`DynamicArgument`), resolved again for
each run. Widening a field is additive.

## Properties

### description?

> `readonly` `optional` **description?**: [`DynamicArgument`](/docs/reference/api/agent/type-aliases/dynamicargument/)\<`string`\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:38

Shown to an upstream model when the agent is composed as a tool (`resolveDynamicArgument`).

***

### instructions

> `readonly` **instructions**: [`DynamicArgument`](/docs/reference/api/agent/type-aliases/dynamicargument/)\<`string`\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:26

System instructions for every run — a plain string (no message-union passthrough).

***

### memory?

> `readonly` `optional` **memory?**: [`DynamicArgument`](/docs/reference/api/agent/type-aliases/dynamicargument/)\<[`Memory`](/docs/reference/api/memory/classes/memory/)\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:47

The memory subsystem instance this agent's runs read and write through (the configuration
surface): message history lands in the thread/resource named by the per-call `memory`
option — recalled once per run before `processInput`, saved once per step after
`processOutputStep`. A run that passes no per-call `memory` performs no memory I/O, so a
memory-configured agent keeps stateless runs available; the same instance may be shared by
several agents.

***

### model

> `readonly` **model**: [`ModelInput`](/docs/reference/api/agent/type-aliases/modelinput/)

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:34

The language model(s) to run — an instance, an array of instances forming a fallback chain
(`ModelInput`), or a resolver that picks either per request context. Any AI SDK provider
package instance satisfies the contract structurally; a wrong specification version fails
loudly when the field is resolved (at construction for a static value, at resolution time for
a resolver's pick).

***

### name

> `readonly` **name**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:24

Unique identity of the agent.

***

### processors?

> `readonly` `optional` **processors?**: readonly [`Processor`](/docs/reference/api/agent/interfaces/processor/)[]

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:62

The processors of this agent's runs — the cross-cutting extension point (ADR-0005). Guardrails,
evals, redaction and
rate limiting live here, never in Agent fields. Hooks run in declaration order, each seeing the
previous one's rewrite; absent = no processor runs.

Not a definition field: like `tracer`, this is cross-cutting wiring the composition root (or an
explicit `new`) hands in — the attachment point of the extension point itself.

***

### tools?

> `readonly` `optional` **tools?**: [`DynamicArgument`](/docs/reference/api/agent/type-aliases/dynamicargument/)\<`Record`\<`string`, [`Tool`](/docs/reference/api/tools/interfaces/tool/)\<`unknown`, `unknown`\>\>\>

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:36

Tool container — the Record key is the tool name. Static, or resolved per request context.

***

### tracer?

> `readonly` `optional` **tracer?**: [`Tracer`](/docs/reference/api/observability/interfaces/tracer/)

Defined in: .framework/oribos-framework/packages/core/dist/agent/types.d.ts:52

The tracer this agent reports to, when one is attached (the composition root distributes it;
a standalone `new` may pass it explicitly). Absent = no span is ever created for its runs.
