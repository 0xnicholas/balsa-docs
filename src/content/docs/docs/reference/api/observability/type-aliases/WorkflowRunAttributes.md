---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowRunAttributes"
---

> **WorkflowRunAttributes** = `object`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:43

Attributes of a `workflow-run` span — one run's segment, start or resume to its terminal state.

## Properties

### runId?

> `readonly` `optional` **runId?**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:46

The run's execution identity (the root span carries it so snapshot and span can find each other).

***

### workflowId

> `readonly` **workflowId**: `string`

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:44
