---
title: 'Walkthrough: durable-approval'
description: A guided read of the durable agent example — a tool call held at the loop's step boundary for a human's decision, the snapshot that survives the wait, and the two ways a resume ends.
packages:
  - '@oribos/core/durable-agent'
subtype: walkthrough
order: 3
source:
  - file: examples/durable-approval/README.md
  - file: examples/durable-approval/src/index.ts
---

`durable-approval` is a refund desk where money moves only after a human says so. The example runs
one [durable agent](/docs/concepts/durable-execution/) through a fixed script against a real model:
a customer asks for a refund, the model calls the refund tool, and the call is **held** instead of
executed — the run stops at its step boundary with `finishReason: 'suspended'`. A decision arrives
later and the run continues from where it stopped: the approved call executes, the rejected one is
answered and the model replans around it.

The whole example is a single file,
[`src/index.ts`](https://github.com/0xnicholas/oribos-framework/blob/81483bdcacc9bbcbf8b8c2a037d916e96d4c8bd6/examples/durable-approval/src/index.ts),
and the session is fixed — no interactive input, no service beyond the model. This page reads it as
a program: where the gate lives, what a suspension writes down, and what a resume is handed.
[Suspend & resume](/docs/concepts/suspend-resume/) is the machinery underneath.

## The five acts

1. **Run A suspends.** The customer asks for a $129 refund on an order charged twice, and the model
   calls `issueRefund`. The tool is on the wrapper's approval list, so the call does not execute:
   the run's loop snapshot is written, `finishReason` settles `'suspended'`, and `suspendPayload`
   reports the held calls and the ids the decision governs. The example's refund ledger is still
   empty — the gate held.
2. **The snapshot.** The store's write log shows the one write a suspension makes, and
   `store.load(runId)` shows what a resume re-enters from: the message list the run stopped at — the
   prompt plus the model's own tool-calling turn — the step count, the held calls, and the `traceId`
   the run was exported under.
3. **Resume, approved.** `resume(runId, { approved: true })` replays the held call as the run's
   first step — no model round trip re-deriving it — the tool executes, the ledger gets its entry,
   and the run finishes on the model's report. The resumed segment opens a fresh run span in the
   *same* trace, so one human interaction stays one trace.
4. **Run B suspends.** A second request, a different order, the same gate and the same shape.
5. **Resume, rejected.** `{ approved: false }` runs nothing: the held call is answered with a
   rejection result, fed back to the model exactly like a
   [tool failure](/docs/concepts/tools/), and the model replans. A refusal does not terminate the
   run, and the ledger is untouched.

## The gate lives on the wrapper

The tool itself declares no permission — its four fields are the ones
[Tools](/docs/concepts/tools/) documents, and the refund's description only tells the model that
executing it is a commitment. What makes a call gated is a list on the durable wrapper:

<!-- oribos:verbatim file="examples/durable-approval/src/index.ts" lines="151-151" -->
```ts
const durable = app.durableAgent({ agent, approval: { tools: ['issueRefund'] } });
```

The wrapper is the [agent's](/docs/concepts/agents/) own run surface plus `resume`. A bare
`agent.generate(...)` never produces `'suspended'` and keeps no snapshot — the durable semantics
exist in this wrapper alone.

## A suspension is one write

A snapshot store is a port: any object with `load(runId)` and `save(runId, snapshot)`, JSON-only, in
memory by default. The example decorates that default with a write log, so the durable ritual is
visible in the output:

<!-- oribos:verbatim file="examples/durable-approval/src/index.ts" lines="107-121" -->
```ts
function recordingStore(): { readonly store: AgentRunSnapshotStore; readonly writes: string[] } {
  const inner = createInMemoryAgentRunSnapshotStore();
  const writes: string[] = [];
  return {
    writes,
    store: {
      load: (id) => inner.load(id),
      save: (id, snapshot) => {
        const held = snapshot.suspendPayload.toolCalls.map((call) => call.toolName).join(', ');
        writes.push(`suspended  stepCount=${snapshot.stepCount}  held=[${held}]  runId=${id}`);
        return inner.save(id, snapshot);
      },
    },
  };
}
```

The log gets one `suspended` snapshot per suspension and nothing else. The snapshot shape has no
terminal status, so dropping a snapshot the application has consumed is the application's call — as
is the choice of where a durable store lives. What the snapshot carries is what a resume needs: the
run's identity and the message list it stopped at, the step count, the held calls, and the
`traceId` the run was exported under.

## Suspending, and resuming with a decision

<!-- oribos:verbatim file="examples/durable-approval/src/index.ts" lines="253-258" -->
```ts
const runA = durable.stream(
  `Customer message: "You charged me twice for order ${REQUEST_A.orderId} — please refund the ` +
    `$${REQUEST_A.amount} overcharge."`,
);
const finishA = await settle(runA);
const suspendA = await runA.suspendPayload;
```

`stream()` returns the run's output object immediately, and the run starts at its first consumption:
`settle` consumes the chunks as they arrive, then reads the terminal values. `suspendPayload`
answers what the run is waiting for — the held calls with their arguments, and `awaitingApproval`,
the ids a decision governs. The resumed segment is one call:

<!-- oribos:verbatim file="examples/durable-approval/src/index.ts" lines="327-330" -->
```ts
const outcomeA = await durable.resume(runA.runId, { approved: true });
if (outcomeA.finishReason !== 'stop') {
  fail(`Expected the resumed run to reach 'stop', but it settled '${outcomeA.finishReason}'.`);
}
```

`resume` loads the snapshot, continues the run under the `runId` it always had, and returns the
continued segment's outcome: its terminal values and the tool results it produced. What it does
with the held calls *is* the decision — execute them, or answer them with a rejection result the
model receives as an ordinary tool failure. Act 5 runs the same pair with `{ approved: false }` and
asserts that the ledger never moved.

Two properties of the call are worth keeping when you write your own. It is addressed by `runId`, so
a run that suspends a second time is resumable under the same id. And it **re-supplies the run
options** — `maxSteps`, `memory`, `signal`, `stepBoundary` — because the snapshot is JSON-only run
*state*, not run *configuration*: a suspended run whose `maxSteps` is not passed again continues
under the default.

## What the trace shows

The example assembles one [tracer](/docs/concepts/observability/) and hands it to the agent, so
every span of both runs lands in the same place, and the suspension keeps the tree intact:

- **One run span per segment** — the suspended one and the resumed one, in the *same* trace because
  the snapshot carries the `traceId`. Suspension is a normal end under an attribute,
  `attributes.status = 'suspended'`, not an error and not a new span type.
- **One step span per model call, one tool span per execution.** The replayed step makes no model
  call — its output already streamed in the suspended run — and a rejected call produces no tool
  span at all: nothing ran.
- **No memory spans**: the desk keeps no conversation state, so a durable run's memory identity is a
  run option rather than snapshot material.

## Run it

<!-- oribos:adapted file="examples/durable-approval/README.md" -->
```bash
pnpm install
pnpm build
OPENAI_API_KEY=sk-... pnpm --filter @oribos/example-durable-approval start
```

The example is a workspace package, so the filter above is its own command shape. Any
OpenAI-compatible endpoint works the same way — set `OPENAI_BASE_URL` and install the matching
provider package. [Installation](/docs/get-started/installation/) gets you the checkout;
[Examples](/docs/guides/examples/) lists every example and its command.

The script asserts its own payoff: a run that does not suspend, money that moves while a run is
suspended, a resume that does not reach `'stop'`, or a rejection that executes exits non-zero
instead of printing a happy face.

## Next steps

- [Durable execution & background work](/docs/concepts/durable-execution/) — the subsystem this
  example walks: durable agents, signals and schedules.
- [Suspend & resume](/docs/concepts/suspend-resume/) — the snapshot-and-resume machine in full.
- [Observability](/docs/concepts/observability/) — the span model, and how a trace survives a
  suspension.
- [Walkthrough: signals-desk](/docs/guides/signals-desk/) — the second half of the durable story:
  input that arrives while a run is live.
