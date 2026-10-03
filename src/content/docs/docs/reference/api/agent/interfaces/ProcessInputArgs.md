---
generated: true
editUrl: false
next: false
prev: false
title: "ProcessInputArgs"
---

Defined in: .framework/oribos-framework/packages/core/dist/agent/processors.d.ts:39

What `processInput` sees: the run's prompt as built from the resolved instructions plus input.

## Properties

### messages

> `readonly` **messages**: [`ModelPrompt`](/docs/reference/api/model/type-aliases/modelprompt/)

Defined in: .framework/oribos-framework/packages/core/dist/agent/processors.d.ts:45

The run's initial prompt — a system message with the resolved `instructions`, then the input
messages (`string` input becomes one user text message). What the model sees is the prompt
this hook chain returns: `processInput` runs after dynamic resolution, before the first call.

***

### requestContext

> `readonly` **requestContext**: [`RequestContext`](/docs/reference/api/agent/interfaces/requestcontext/)

Defined in: .framework/oribos-framework/packages/core/dist/agent/processors.d.ts:47

The run's request context — the same object dynamic arguments resolved against.
