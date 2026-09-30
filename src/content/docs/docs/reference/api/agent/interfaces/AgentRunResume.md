---
generated: true
editUrl: false
next: false
prev: false
title: "AgentRunResume"
---

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:275

The continue-from-snapshot seed (`AgentRunOptions.resume`): how a harness wrapper re-enters a
suspended run (`docs/architecture/harness.md`「Durable agents」— the durable wrapper's `resume`).
The run's message list carries everything the suspended run saw; this seed replays the one thing
a message list cannot reconstruct — the calls the suspended step held back, and how each of them
is answered.

Step numbering continues across a resume: `stepCount` is where the suspended run stopped, so the
resumed segment's steps, the `maxSteps` cap and every seam event that reports a step index all
keep counting one run. The resumed step itself makes no model call — its output already streamed
in the suspended run (its `finish` chunk reached that run's caller) — so it contributes its held
calls' results, not a second round trip.

## Properties

### answers?

> `readonly` `optional` **answers?**: readonly [`ToolResultChunk`](/docs/reference/api/model/type-aliases/toolresultchunk/)[]

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:292

Pre-supplied answers: a call whose id appears here is answered with the given result instead of
executing — the approval gate's「用户拒绝」path. Calls without an answer execute.

***

### stepCount

> `readonly` **stepCount**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:281

How many steps the suspended run had completed when it suspended (`AgentRunSnapshot.stepCount`).
The resumed run's prompt must end with that step's own assistant message — the held calls' text
and calls — which is also where the step's recorded output is read back from.

***

### toolCalls

> `readonly` **toolCalls**: readonly [`ToolCallChunk`](/docs/reference/api/model/type-aliases/toolcallchunk/)[]

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:287

The calls the suspended step held back, in call order (at least one). They execute exactly as
the loop's own calls do — same validation, error tool results, spans — except that the prompt
already ends with their assistant message, so only the resulting `tool` message is appended.
