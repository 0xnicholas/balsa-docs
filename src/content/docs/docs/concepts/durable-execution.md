---
title: 'Durable execution & background work'
description: The three pieces that let work outlive a request — durable agents that wait for approval, signals into a live thread, and schedules driven by a tick.
packages:
  - '@oribos/core/durable-agent'
  - '@oribos/core/signals'
  - '@oribos/core/schedules'
order: 7
source:
  - file: docs/architecture/harness.md
  - file: docs/adr/0011-harness-semantics.md
  - file: README.md
  - file: examples/durable-approval/README.md
  - file: examples/signals-desk/README.md
---

Not all work fits inside one request. A refund needs a human's yes or no. A support thread keeps
receiving messages while its run is still thinking. A report has to be produced every morning at
nine. Oribos covers these with three independent pieces — **durable agents**, **signals** and
**schedules** — sharing one stance: **none of them requires a long-running process**. The defaults
work in-process, and the platform shapes (a cron trigger hitting an endpoint) are first-class, not
fallbacks. Compose the ones you need; each is its own entry point.

## Durable agents: runs that wait for a human

A durable agent wraps an [agent](/docs/concepts/agents/) with an approval list. When the model asks
for a tool whose name is on that list, the call does not execute: the run **suspends** at the step
boundary with a JSON snapshot written to a store, and its `finishReason` settles on `'suspended'`.
A later `resume` — in the same process, or in another one when the store is persistent — carries
the human's decision and continues the run.

<!-- oribos:verbatim file="README.md" lines="198-205" -->
```ts
import { createDurableAgent } from '@oribos/core/durable-agent';

// The agent wrapped so a run can stop and wait for a human: a tool call whose name is on the
// approval list does not execute — the run suspends with its loop snapshot written to a port.
const durable = app.durableAgent({ agent, approval: { tools: ['issueRefund'] } });
const out = durable.stream('Please refund order A-4471.');
// out.finishReason === 'suspended' → out.suspendPayload says what was held
await durable.resume(out.runId, { approved: true }); // executes it... or false: the model replans
```

`createDurableAgent({ agent, approval })` is the same wrapper built directly, without a composition
root. The pieces in play are small and fixed:

- **The gate** sits between the model's output and tool execution. `suspendPayload` names the calls
  that were held and the ids the decision governs.
- **`resume(runId, { approved })`** does one of two things. `approved: true` executes the held call
  and continues the loop; the model is not asked to re-derive the call — its own turn is already in
  the snapshot. `approved: false` answers the call with a rejection result fed back to the model
  exactly like a tool failure, and the run continues: the model replans instead of the run ending.
- **The approval list lives on the wrapper, never on the tool.** A tool keeps its four fields and
  the core stays permission-free. A bare `agent.generate(…)` — no wrapper — never suspends and keeps
  no snapshot.
- **The snapshot** goes through `AgentRunSnapshotStore` — any object with `load(runId)` and
  `save(runId, snapshot)`, JSON-only, in-memory by default. It holds the message list the run stopped
  at, the completed step count, the held calls and the trace id. Resuming does **not** delete it:
  the application owns dropping a snapshot it has consumed, and enumerating suspended runs
  (`listSuspended`) is an optional adapter extension.
- **A resume re-supplies run options, not state.** `maxSteps`, `memory` and the like are
  configuration, not snapshot material, so pass the ones the continued segment should keep.

Crash recovery, resumable streams and multi-replica leases are deliberately not part of this: the
snapshot plus `resume` is the primitive, and durability beyond it is a deployment decision. A run
that suspends again on a second gated call stands under the same `runId` and is resumable again.
The [durable-approval walkthrough](/docs/guides/durable-approval/) walks the whole cycle —
suspension, the snapshot, an approval and a rejection.

## Signals: input for a thread that is already running

`createSignals` is the thread-directed interaction primitive: it puts a message into a conversation
wherever that conversation is — being answered right now, or idle between runs.

<!-- oribos:adapted file="docs/architecture/harness.md" -->
```ts
import { createSignals } from '@oribos/core/signals';

// The facade drives one agent; the same Memory instance is what makes a thread a thread.
const signals = createSignals({ agent, memory });

// A live run: the message lands at its next step boundary. An idle thread: it wakes a new run.
await signals.sendMessage({ thread: 'desk-42', resource: 'user-42' }, 'Any update?');
```

| Call | What it does |
| --- | --- |
| `sendMessage(ref, input)` | A live run: injected at its next step boundary. An idle thread: starts a new run from that input. |
| `queueMessage(ref, input)` | While a run is live: waits for it to finish, then starts one continuation run with the queued messages, in arrival order. |
| `sendSignal(ref, payload)` | Injects a typed payload; its `type` and fields are the sender's, and the receiving side decides what they mean. |
| `subscribeToThread(ref)` | The chunk stream of that thread's runs. Attach it before the first run — there is no replay. |

Injected content becomes an ordinary message in the thread's history, through the same
[memory](/docs/concepts/memory/) store the rest of the conversation uses — signals add no storage of
its own. Without a memory instance, a wake starts a history-free run and injections are not
persisted. The registry that maps threads to live runs is in-process, so these are single-process
semantics by design: dying drops the queues, and cross-instance distribution is a capability-package
shape rather than a core one. Attaching no signals costs the agent loop nothing — the injection
check is a seam that stays closed.

The [signals-desk walkthrough](/docs/guides/signals-desk/) plays a wake, an injection into a live
run, a queued pair, a typed signal and a scheduled trigger into one thread.

## Schedules: stored future runs, driven by a tick

A schedule is a record plus an occurrence function. `tick` is the whole runtime: it lists what is
due, fires each record and advances it.

<!-- oribos:verbatim file="README.md" lines="217-221" -->
```ts
import { createSchedules } from '@oribos/core/schedules';

const schedules = createSchedules({ agents: { desk: agent }, signals });
await schedules.save({ id: 'morning-sweep', next: (from) => nextDailyAt(9, from), target: { … } });
await schedules.tick(); // list what is due → fire it → advance nextFireAt
```

- **The occurrence function is injected**: `next(from)` returns the next `Date` — or `null` for a
  schedule with no occurrences left. Cron parsing never enters the core, so any recurrence you can
  express in code is a valid schedule.
- **`tick` fires what is due.** Calling it from a platform cron trigger that hits an endpoint is the
  first-class shape; `startTicker({ intervalMs })` is an in-process convenience for hosts that want
  one.
- **Two target forms.** Threadless: `{ agent, input }` runs the named agent once, isolated —
  history untouched, the classic background job. Threaded: `{ thread, resource, payload }` goes
  through signals, so the trigger joins a conversation exactly like a message would.
- **Records are JSON-only** through `ScheduleStore` (an in-memory default ships with the core).
  A record holds the next fire time, the target, a timezone name carried through untouched, an
  enabled flag and your own metadata — the expression itself is not persisted, because the
  schedule definition in your code is the source of truth.
- **A scheduled trigger opens no span of its own**; the run it wakes carries its trace
  ([Observability](/docs/concepts/observability/) covers the anchors).

## Where these run

The three pieces share a persistence pattern: every store is a **port** with an in-memory default.
Attach nothing and suspend/resume still works — the snapshot simply does not outlive the process.
Attach an adapter and a run that suspended in one request continues in the next, in another
process, on another machine. Everything that crosses that line is JSON; large data belongs behind a
reference.

What is deliberately absent is as important as what is present, and the restraint is the same
across all three: there is no durable sleep primitive, no boot-time recovery pass, and background
work as a first-class API is not here either — a tool that acknowledges the job and a signal when
it finishes reproduces the shape from the primitives. A long wait is composed too: suspend the run,
and let a schedule or a signal wake it when the moment comes.

## Next steps

- [Suspend & resume](/docs/concepts/suspend-resume/) — the snapshot-and-resume machine in full.
- [Observability](/docs/concepts/observability/) — how a suspension, a signal and a resume appear in a trace.
- [Examples](/docs/guides/examples/) — durable-approval and signals-desk, runnable and annotated.
