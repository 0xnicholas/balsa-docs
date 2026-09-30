---
generated: true
editUrl: false
next: false
prev: false
title: "AgentRunSnapshotStore"
---

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/snapshot.d.ts:74

The durable run snapshot storage port (`harness.md`「AgentRunSnapshotStore」): two methods,
JSON-only snapshots, isomorphic to `WorkflowSnapshotStore`. Core ships an in-memory default — a
durable agent without storage keeps its snapshots for this process only. Evolution is
additive-only (ADR-0010): new capabilities arrive as optional methods plus capability flags
(the adapter family's `deleteSnapshot` / `listSuspended`), never by changing these signatures.
No CAS — durable does no multi-replica recovery; cross-process safety is the deployer's.

## Methods

### load()

> **load**(`runId`): `Promise`\<[`AgentRunSnapshot`](/docs/reference/api/durable-agent/interfaces/agentrunsnapshot/) \| `null`\>

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/snapshot.d.ts:76

Fetch the latest snapshot of a run; `null` when the store has none.

#### Parameters

##### runId

`string`

#### Returns

`Promise`\<[`AgentRunSnapshot`](/docs/reference/api/durable-agent/interfaces/agentrunsnapshot/) \| `null`\>

***

### save()

> **save**(`runId`, `snapshot`): `Promise`\<`void`\>

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/snapshot.d.ts:78

Write the run's snapshot, replacing the previous one.

#### Parameters

##### runId

`string`

##### snapshot

[`AgentRunSnapshot`](/docs/reference/api/durable-agent/interfaces/agentrunsnapshot/)

#### Returns

`Promise`\<`void`\>
