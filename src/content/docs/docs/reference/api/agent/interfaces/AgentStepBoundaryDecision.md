---
generated: true
editUrl: false
next: false
prev: false
title: "AgentStepBoundaryDecision"
---

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:258

The decision a `beforeToolCalls` hook returns to end the run at that boundary: the pending calls
do not execute, the step never completes (no processor hook, no memory save, nothing appended to
the prompt), and the run settles normally with `finishReason: 'suspended'` — suspension is a
terminal outcome, not an error (`docs/architecture/harness.md`「Durable agents」+「Observability
锚点」: the `agent-run` span ends normal under a `status: 'suspended'` attribute). What is
persisted alongside — the snapshot, its `suspendPayload` — is the wrapper's own state: the hook
and the wrapper share a closure, and the loop keeps no snapshot of its own.

## Properties

### suspend

> `readonly` **suspend**: `true`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:260

Ends the run at this boundary with `finishReason: 'suspended'`.
