---
generated: true
editUrl: false
next: false
prev: false
title: "createInMemorySnapshotStore"
---

> **createInMemorySnapshotStore**(): [`WorkflowSnapshotStore`](/docs/reference/api/workflows/interfaces/workflowsnapshotstore/)

Defined in: .framework/balsats-framework/packages/core/dist/workflows/in-memory-snapshot-store.d.ts:15

The core's in-memory default `WorkflowSnapshotStore` (Map-backed, zero runtime burden): a workflow
without attached storage keeps its snapshots in process memory, so suspend/resume still runs — the
snapshot simply does not outlive the process. One store per run holds every snapshot of that run,
keyed by run id; later writes replace earlier ones.

It doubles as the reference for adapter authors: reads and writes cross the port as deep copies
(`structuredClone`), so stored state changes only through the port, exactly like a serializing
backend. What that enforces is isolation, not the JSON-only rule: `structuredClone` rejects
functions but happily carries values JSON cannot (Map / Set / Date, cycles), so a snapshot the
core accepts here could still fail an adapter with a JSON backend. The JSON-only constraint stays
the port's contract, not something this default checks.

## Returns

[`WorkflowSnapshotStore`](/docs/reference/api/workflows/interfaces/workflowsnapshotstore/)
