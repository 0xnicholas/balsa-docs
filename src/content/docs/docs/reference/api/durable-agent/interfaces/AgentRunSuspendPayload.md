---
generated: true
editUrl: false
next: false
prev: false
title: "AgentRunSuspendPayload"
---

Defined in: .framework/oribos-framework/packages/core/dist/durable-agent/snapshot.d.ts:24

What a suspended run held back at its suspension point — the wrapper's own state, persisted
alongside the message list (the suspension point). It is what `resume` reads: the held calls
are the ones the loop executes (or answers) when the run continues, no model round trip spent
re-deriving them from the assistant message the prompt already ends with.

## Properties

### awaitingApproval

> `readonly` **awaitingApproval**: readonly `string`[]

Defined in: .framework/oribos-framework/packages/core/dist/durable-agent/snapshot.d.ts:37

Ids of the held calls whose execution the approval decision governs — the subset a resume's
`approved` decides. A gate that fired on the approval list holds its hits; a suspension
decided elsewhere (a caller's own `beforeToolCalls` hook) leaves the whole step's calls to the
decision. Held calls outside this list execute on either decision.

***

### toolCalls

> `readonly` **toolCalls**: readonly [`ToolCallChunk`](/docs/reference/api/model/type-aliases/toolcallchunk/)[]

Defined in: .framework/oribos-framework/packages/core/dist/durable-agent/snapshot.d.ts:30

The calls the suspended step held back, in call order — the pending (framework-executed) calls
of the boundary, provider-executed ones excluded (they already carry their results in
`messages`). A resume either executes one or answers it with a pre-supplied result.
