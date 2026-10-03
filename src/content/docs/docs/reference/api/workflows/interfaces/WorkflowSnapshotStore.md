---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowSnapshotStore"
---

Defined in: .framework/oribos-framework/packages/core/dist/workflows/snapshot.d.ts:94

The workflow snapshot storage port: two
methods, JSON-only snapshots. Core ships an in-memory default — a workflow without storage runs
purely in memory. Evolution is additive-only (ADR-0010): new capabilities arrive as optional
methods plus capability flags, never by changing these signatures.

## Methods

### load()

> **load**(`runId`): `Promise`\<[`WorkflowRunSnapshot`](/docs/reference/api/workflows/interfaces/workflowrunsnapshot/) \| `null`\>

Defined in: .framework/oribos-framework/packages/core/dist/workflows/snapshot.d.ts:96

Fetch the latest snapshot of a run; `null` when the store has none.

#### Parameters

##### runId

`string`

#### Returns

`Promise`\<[`WorkflowRunSnapshot`](/docs/reference/api/workflows/interfaces/workflowrunsnapshot/) \| `null`\>

***

### save()

> **save**(`runId`, `snapshot`): `Promise`\<`void`\>

Defined in: .framework/oribos-framework/packages/core/dist/workflows/snapshot.d.ts:98

Write the run's snapshot, replacing the previous one.

#### Parameters

##### runId

`string`

##### snapshot

[`WorkflowRunSnapshot`](/docs/reference/api/workflows/interfaces/workflowrunsnapshot/)

#### Returns

`Promise`\<`void`\>
