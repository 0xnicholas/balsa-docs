---
title: 'Suspend & resume'
description: How a run stops at a step boundary and continues later — the suspend signal, the JSON snapshot, the store, and what a resume replays.
packages:
  - '@balsats/core/workflows'
order: 8
source:
  - file: docs/architecture/workflows.md
  - file: docs/adr/0006-workflow-engine-semantics.md
  - file: examples/workflow-approval/README.md
  - file: examples/workflow-approval/src/index.ts
---

A run can stop in the middle and continue later. The stop happens at a step boundary, the state in
between is a JSON snapshot, and a store decides how far that snapshot travels — the same process, the
next request, another machine. Two subsystems produce suspensions: a
[workflow](/docs/concepts/workflows/) step calls `ctx.suspend(payload)`, and a
[durable agent](/docs/concepts/durable-execution/) holds a tool call at its approval gate. Both are
built the same way — a stop decision, a JSON snapshot and a store — and this page is the mechanism,
with the workflow side in depth.

## The three parts

**A signal from inside a step.** Calling `ctx.suspend(payload)` in a step's `execute` marks that step
suspended and unwinds the run; the run's status becomes `suspended`. It is a control signal, not an
error — the step does not retry, no failure is recorded, and the call never returns. Run it as the
step's last act and do not catch it. A step can declare `suspendSchema` to type the payload it
suspends with, and `resumeSchema` to type the value a resume hands back:

<!-- balsats:verbatim file="examples/workflow-approval/src/index.ts" lines="265-279" -->
```ts
const approvalGate = createStep({
  id: 'approval-gate',
  inputSchema: memoOut,
  outputSchema: decision,
  resumeSchema: gateResume,
  suspendSchema: gatePayload,
  execute: (ctx): z.infer<typeof decision> => {
    // suspend() throws the suspend control signal and never comes back — the `return` is what the
    // control flow reads as.
    if (ctx.resumeData === undefined) {
      return ctx.suspend({ question: 'Approve the memo below?', memo: ctx.inputData.memo });
    }
    return { decision: ctx.resumeData.approved ? 'approved' : 'rejected', note: ctx.resumeData.note };
  },
});
```

**A JSON snapshot.** The engine writes what a resume needs, and nothing that is not serializable:

<!-- balsats:adapted file="docs/architecture/workflows.md" -->
```ts
interface WorkflowRunSnapshot {
  runId: string;
  status: 'running' | 'success' | 'failed' | 'suspended';
  input: unknown;                          // the validated start input
  stepResults: Record<string, {            // one record per entry: status, output, suspend payload
    status: 'success' | 'failed' | 'suspended';
    output?: unknown;
    suspendPayload?: unknown;
  }>;
  position: number;                        // the entry a resume re-enters from
  traceId?: string;                        // written when the run is traced
  iterationSite?: unknown;                 // only for a suspension inside a block
}
```

Because the snapshot must be serializable, large data belongs behind a reference: store the file,
keep the path.

**A store.** Any object with two methods — `load(runId)` and `save(runId, snapshot)` — and the
core's default is in memory. Swapping in a persistent adapter is what moves a resume into another
process; nothing above the port changes. The same shape backs the durable agent's approval gate.

## Resuming

`resume({ step, resumeData })` loads the snapshot, validates `resumeData` against the suspended
step's `resumeSchema`, and re-enters the walk. The entries before the recorded position are
**replayed from their records** — not re-executed, and conditions are not re-evaluated — so the tip
is rebuilt and `getStepResult` works exactly as it did before the stop. The step you name must be
the step that suspended, and a step that declares no `resumeSchema` rejects resume data outright.
This is the third fixed validation boundary, alongside the start input and every step boundary.

<!-- balsats:verbatim file="examples/workflow-approval/src/index.ts" lines="449-453" -->
```ts
const continuation = workflow.createRun({ runId });
const outcome = await continuation.resume({
  step: 'approval-gate',
  resumeData: { approved: true, note: 'Approved — the hotel rate is within the offsite allowance.' },
});
```

That example is the durable shape in miniature: the second run object holds no state from the first,
because the store holds all of it. Swap the in-memory store for a persistent adapter and the resume
can happen in another process. `resume` also takes `signal` and `requestContext`; left out, it
continues with the ones the start used — a resume in a fresh process passes its own.

The resumed segment reports through `resume`'s promise, not through the suspended run's event
stream; the stream's `step-end` and `run-end` already reported `suspended`
([Workflows](/docs/concepts/workflows/) has the event vocabulary). Within a process, two resumes of
one run do not race: they are merged into a single call and the second caller receives the first
call's promise. The lock releases when that resume settles, so a run that suspends again can be
resumed again. Across processes, this is the store's business — an adapter may offer a
compare-and-set save.

## Where snapshots are written

With a store attached, the moments are fixed: after every completed entry, on a suspension, and at
the terminal state. There are no hooks to configure. Without a store, snapshots live in the run
object's memory — that same object can be resumed, but a *new* run object over the same run id needs
a real store. A snapshot write failure fails the run; the one exception is the final write of an
already-failed run, which is best effort — the run's own error is what you see.

## Suspending from inside a block

Every block type can suspend — a `parallel` arm, a `branch` arm, a `foreach` body, a loop body — and
a block is a full sync point for it: after a suspension, no new iteration or arm starts, and the
in-flight ones are left to settle before the snapshot is written. The snapshot records the iteration
site, so a resume re-enters mid-block and replays what completed:

| Where it suspended | What a resume does |
| --- | --- |
| `parallel` / `branch` arm | Arms with a success record are replayed from their records; an arm without one runs again; the branch's condition is not re-evaluated — the chosen arm is pinned by the records. |
| `foreach` body | The collected prefix is replayed; the hole and the suspended index run again. |
| loop body | The loop resumes from the recorded value and iteration count. |

When several concurrent executions suspend in the same window, the first to settle is the one the
suspended envelope names; the others stay resumable — a suspended arm is recorded as suspended, and
a suspended `foreach` iteration becomes a hole a later resume re-runs. `resumeData` belongs to the
one execution the envelope named: later iterations and sibling arms receive `undefined`. A condition
is read-only, so suspending from one is rejected.

## The same idea for agent runs

A durable agent's approval gate suspends an agent run at the tool-call boundary — the same three
parts, with a different record: the message list the run stopped at, its step count and the held
calls, in `AgentRunSnapshotStore`. `resume(runId, { approved })` continues the run;
[Durable execution & background work](/docs/concepts/durable-execution/) has the full gate.

## One suspension, one trace

When a run is traced, the snapshot carries its `traceId`, and the resumed segment opens a new run
span under that same trace. A suspension therefore appears as two segments of one observation, not
as two unrelated trees — [Observability](/docs/concepts/observability/) covers the continuity rules.

## Why the shape stays small

One signal, one JSON snapshot and a two-method store are the whole durable machine. Time-travel
APIs, restart-all, boot-time recovery and CAS saves are not in the core: a resume from the recorded
position is the primitive, and anything else is built on top of it. A `sleep()` step, by contrast,
waits inside your process — a timer, not a durable wait — so a wait that must survive a restart is a
suspension plus whatever wakes it: a [schedule](/docs/concepts/durable-execution/), a signal, or a
later call.

## Next steps

- [Workflows](/docs/concepts/workflows/) — the builder, the operators and the event stream around the suspension.
- [Durable execution & background work](/docs/concepts/durable-execution/) — the approval gate and the other pieces built on it.
- [Examples](/docs/guides/examples/) — workflow-approval walks a suspend, a snapshot and a resume.
