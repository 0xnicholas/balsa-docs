---
generated: true
editUrl: false
next: false
prev: false
title: "ProcessOutputStepArgs"
---

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:55

What `processOutputStep` sees: the step's record once the step is complete.

## Properties

### requestContext

> `readonly` **requestContext**: [`RequestContext`](/docs/reference/api/agent/interfaces/requestcontext/)

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:61

The run's request context.

***

### step

> `readonly` **step**: [`AgentStep`](/docs/reference/api/agent/interfaces/agentstep/)

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:57

The completed step: text, tool calls, tool results (provider- and framework-executed), usage.

***

### stepIndex

> `readonly` **stepIndex**: `number`

Defined in: .framework/balsats-framework/packages/core/dist/agent/processors.d.ts:59

Position of the step in the run, 0-based.
