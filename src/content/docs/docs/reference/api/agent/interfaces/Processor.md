---
generated: true
editUrl: false
next: false
prev: false
title: "Processor"
---

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:30

The Processor surface (the Processor extension point, ADR-0005): the Agent's
only cross-cutting extension point. Guardrails, evals, redaction, rate limiting and the like are
processors — never fields of the Agent class.

One processor declares up to three hooks, all optional; the ones it declares run in declaration
order, each receiving the previous one's output (`AgentConfig.processors`). A hook may be
synchronous or asynchronous, and returning nothing keeps the current value:

- `processInput` — once per run, before the first model call: `{ messages }` replaces the run's
  prompt (instructions plus input), which is what the model then sees.
- `processOutputStep` — once per completed step, after that step's tools have run: `{ step }`
  replaces the step record. The replacement is the run's authoritative record — it lands in the
  output object's `steps` / `text` / `usage`, in the run span's output, and is what the next
  prompt (and memory) is built from. The chunk stream and the step span stay the
  model's own output: chunk-level rewriting is cut from v1 (`processOutputStream`-style hooks
  keep their seat).
- `processError` — when a provider call or a tool's `execute` fails: `{ error }` replaces the
  error. A replaced provider error becomes the run's error; a replaced tool error is the error
  the model sees in the error tool result. No abort/retry mechanics — a cancelled model call
  surfaces its own reason untouched, never as a `processError` event.

Processor failures are the run's failure: an error thrown by a hook propagates out of the run and
is not offered to `processError` (a processor is not the place to handle another processor's
bug).

## Methods

### processError()?

> `optional` **processError**(`args`): `void` \| [`ProcessErrorResult`](/docs/reference/api/agent/interfaces/processerrorresult/) \| `Promise`\<`void` \| [`ProcessErrorResult`](/docs/reference/api/agent/interfaces/processerrorresult/)\>

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:36

On a provider or tool error: replace the error, or observe it untouched.

#### Parameters

##### args

[`ProcessErrorArgs`](/docs/reference/api/agent/interfaces/processerrorargs/)

#### Returns

`void` \| [`ProcessErrorResult`](/docs/reference/api/agent/interfaces/processerrorresult/) \| `Promise`\<`void` \| [`ProcessErrorResult`](/docs/reference/api/agent/interfaces/processerrorresult/)\>

***

### processInput()?

> `optional` **processInput**(`args`): `void` \| [`ProcessInputResult`](/docs/reference/api/agent/interfaces/processinputresult/) \| `Promise`\<`void` \| [`ProcessInputResult`](/docs/reference/api/agent/interfaces/processinputresult/)\>

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:32

Run start, once: rewrite the initial prompt, or observe it untouched.

#### Parameters

##### args

[`ProcessInputArgs`](/docs/reference/api/agent/interfaces/processinputargs/)

#### Returns

`void` \| [`ProcessInputResult`](/docs/reference/api/agent/interfaces/processinputresult/) \| `Promise`\<`void` \| [`ProcessInputResult`](/docs/reference/api/agent/interfaces/processinputresult/)\>

***

### processOutputStep()?

> `optional` **processOutputStep**(`args`): `void` \| [`ProcessOutputStepResult`](/docs/reference/api/agent/interfaces/processoutputstepresult/) \| `Promise`\<`void` \| [`ProcessOutputStepResult`](/docs/reference/api/agent/interfaces/processoutputstepresult/)\>

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:34

After each completed step: rewrite its record, or observe it untouched.

#### Parameters

##### args

[`ProcessOutputStepArgs`](/docs/reference/api/agent/interfaces/processoutputstepargs/)

#### Returns

`void` \| [`ProcessOutputStepResult`](/docs/reference/api/agent/interfaces/processoutputstepresult/) \| `Promise`\<`void` \| [`ProcessOutputStepResult`](/docs/reference/api/agent/interfaces/processoutputstepresult/)\>
