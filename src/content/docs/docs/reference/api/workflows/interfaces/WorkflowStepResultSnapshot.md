---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowStepResultSnapshot"
---

Defined in: .framework/balsa-framework/packages/core/dist/workflows/snapshot.d.ts:21

One step's recorded result inside a snapshot: status, output, boundary timestamps and the
suspend payload when the step suspended.

## Properties

### endedAt?

> `readonly` `optional` **endedAt?**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/snapshot.d.ts:28

When the step ended, milliseconds since epoch.

***

### output?

> `readonly` `optional` **output?**: `unknown`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/snapshot.d.ts:24

The step's validated output; absent when it suspended or failed.

***

### startedAt?

> `readonly` `optional` **startedAt?**: `number`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/snapshot.d.ts:26

When the step started, milliseconds since epoch.

***

### status

> `readonly` **status**: [`StepStatus`](/docs/reference/api/workflows/type-aliases/stepstatus/)

Defined in: .framework/balsa-framework/packages/core/dist/workflows/snapshot.d.ts:22

***

### suspendPayload?

> `readonly` `optional` **suspendPayload?**: `unknown`

Defined in: .framework/balsa-framework/packages/core/dist/workflows/snapshot.d.ts:30

The payload `suspend(payload)` carried; present only on a suspended step.
