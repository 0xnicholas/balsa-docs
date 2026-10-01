---
title: Workflows
description: How Balsa orchestrates steps — the builder, the seven control-flow operators, runs and their events, and the JSON snapshot that lets a run stop and be resumed.
packages:
  - '@balsa/core/workflows'
order: 5
source:
  - file: docs/architecture/workflows.md
  - file: docs/adr/0006-workflow-engine-semantics.md
  - file: examples/workflow-approval/README.md
  - file: examples/workflow-approval/src/index.ts
---

An [agent](/docs/concepts/agents/) handles one question and the [tool calls](/docs/concepts/tools/)
that answer it. A workflow is for everything with a shape around it: work with a fixed order, a branch, a loop over a
list of items, or a step that must wait for a human before the rest can continue. A workflow composes
**steps** into a definition you can run, watch, and — when a step suspends — resume.

## Steps are the unit of work

A step is a small object: an id, the schemas of what flows in and out, and an `execute` function.

| Field | Required | What it is |
| --- | --- | --- |
| `id` | yes | The step's name — the key its result is recorded and reported under. |
| `inputSchema` | yes | A Standard Schema for the value arriving at the step. |
| `outputSchema` | yes | A Standard Schema for the value the step returns. |
| `resumeSchema` | no | Only for a step that may suspend: the schema the resume data is validated against. |
| `suspendSchema` | no | The schema of the payload the step suspends with. |
| `retries` | no | Extra attempts if `execute` throws. |
| `execute` | yes | Receives the step context, returns the output. |

<!-- balsa:verbatim file="examples/workflow-approval/src/index.ts" lines="176-182" -->
```ts
/** Entry 1 — `foreach`: check each item against the per-item cap, flagging the over-cap ones. */
const checkItem = createStep({
  id: 'check-item',
  inputSchema: expenseItem,
  outputSchema: checkedItem,
  execute: ({ inputData }) => ({ ...inputData, flagged: inputData.amount > ITEM_CAP }),
});
```

`createStep` infers the input and output types from the schemas, so `execute` is typed without an
annotation, and returns a frozen object — the definition is data, not a class. Steps are shared by
reference: one step can appear in several places, and in a loop or a `foreach` it executes once per
iteration, which is why what you observe is per execution while what is recorded is per entry.

## The context a step receives

Step input arrives in a single bag, `StepContext`, rather than the tool's two-parameter split: a
step's input is data piped from upstream, and the bag also carries everything the framework knows
about the run.

| On the context | What it is |
| --- | --- |
| `inputData` | The validated upstream value: the workflow input for the first step, the previous step's output otherwise. |
| `runId` | Identity of the run. |
| `signal` | The run's abort signal, propagated into the step. |
| `requestContext` | Your per-call bag, with the framework-written `signal` and `runId` on it. |
| `getStepResult(stepId)` | The recorded output of an already-run step. |
| `resumeData` | The validated resume data on the pass that follows a suspension; `undefined` on the first pass. |
| `suspend(payload)` | Marks the step suspended and unwinds the run — covered below. |

There is no state blackboard. When a later step needs something an earlier one produced, it reads
that step's recorded output by id and narrows it itself — the same call that makes a resumed run
work, since the records are what replay hands back.

<!-- balsa:adapted file="docs/architecture/workflows.md" -->
```ts
execute: (ctx) => {
  // Cross-step sharing is explicit: read the recorded output by step id and narrow it.
  const items = checkedReport.parse(ctx.getStepResult('check-item'));
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return { total, lane: total > BUDGET_LIMIT ? 'manager' : 'auto' };
};
```

## Building the definition

`createWorkflow` returns a chain: every operator appends one **entry** to a flat list, and `commit()`
freezes the list. Runs start from the committed definition and nowhere else. Each operator takes the
current tip forward, so the chain reads in execution order.

<!-- balsa:verbatim file="examples/workflow-approval/src/index.ts" lines="293-317" -->
```ts
/**
 * The definition. Each operator pushes one flat `{ type, … }` entry; `.commit()` freezes the list
 * — execution is a `for` loop over it, not a DAG.
 */
const workflow = createWorkflow({
  id: 'expense-approval',
  inputSchema: expenseReport,
  outputSchema: receipt,
  tracer,
  storage: store,
})
  .foreach(checkItem, { concurrency: 2 })
  .parallel([policyCheck, budgetCheck])
  .branch([
    [
      (ctx) => ctx.inputData['budget-check'].budget === 'over' || ctx.inputData['policy-check'].policy === 'flag',
      routeManager,
    ],
    [() => true, routeAuto],
  ])
  .then(pickLane)
  .then(draftMemo)
  .then(approvalGate)
  .then(finalize)
  .commit();
```

An agent joins a workflow the same way any other code does: a step whose `execute` calls the agent
and returns what it produced. There is no `createStep(agent)` overload — the one-line wrapper is the
documented shape, which keeps the definition surface free of special cases.

## The seven operators

| Operator | What it does | Its output |
| --- | --- | --- |
| `.then(step)` | Runs the step on the tip. | The step's output. |
| `.parallel([a, b])` | Runs every arm at once, with no concurrency cap, and waits for all of them before the block leaves. | An object keyed by step id. |
| `.branch([[cond, step], …])` | Evaluates conditions in definition order and runs the first true one; every arm must accept the same input and produce the same output. | An object with only the chosen arm's key — or `{}` when no condition is true, in which case the tip value does not pass through. |
| `.foreach(step, { concurrency })` | Runs the step once per element of the input array, collecting results in input order; `concurrency` defaults to 1 and must be a positive integer. | An array. |
| `.dowhile(step, cond)` | Runs the step while the condition holds; the condition is evaluated **before** each iteration, so the body may run zero times and the block's output is then the input unchanged. | The last iteration's output. |
| `.dountil(step, cond)` | Runs the step until the condition holds; the condition is evaluated **after** each iteration, so the body runs at least once. | The last iteration's output. |
| `.sleep(ms \| fn)` | Waits inside the running process — a timer, not a durable wait. | Nothing; it is not a step. |

The two loops hand their condition the same context the step gets, plus `iterationCount`; throwing
from inside the condition is how you put a hard cap on a loop. A block records one result under its
step's id — for a loop, the last iteration's output — while the events below report every iteration.

Failures inside a block follow one rule: a block leaves only when its in-flight work is settled. A
`foreach` whose iteration fails starts no further iterations and fails once the running ones are
done; a `parallel` fails when any arm fails; the same applies to a suspension, except that a
suspension wins over a sibling's failure in the same window, because the run is unwinding into a
snapshot rather than ending.

`.sleep()` is worth a warning of its own. It is a timer in your process: restart the process and the
wait is gone. It takes a duration or a function of the request context, where a non-finite value is
an error and a negative one counts as zero. For a wait that must survive a restart — a delay of
hours, a retry next week — suspend the run and resume it when the moment comes; the snapshot is what
makes that possible.

## Runs and their events

A run begins at `createRun()` and executes on `start()`. `start` returns one object with two
consumption styles: `for await` walks the lifecycle events as they happen, and `result` settles on the
outcome envelope. It is a single execution either way — the same code path, so the events and the
envelope always agree.

<!-- balsa:verbatim file="examples/workflow-approval/src/index.ts" lines="387-395" -->
```ts
act('Act 1 — start: the front runs, the memo is drafted, the gate suspends');
// `start` returns the output object: `for await` walks the lifecycle events as they happen and
// `result` settles on the outcome envelope — one execution, two consumptions.
const run = workflow.createRun({ runId });
const out = run.start({ inputData: REPORT });
for await (const event of out) {
  console.log(eventLine(event));
}
const firstSegment = await out.result;
```

The envelope reports `success` or `suspended` — along with the run's output for a success or the
suspended step's id for a suspension. A failed run does not resolve to an envelope at all: it rejects
with the error that failed it, exactly as the event iterator does. The events are the execution view
of the same run:

| Event | Payload |
| --- | --- |
| `run-start` | `{ runId, workflowId, input }`, with the validated start input. |
| `step-start` | `{ stepId, input }`, with the value as it arrived — before that boundary's validation. |
| `step-end` | `{ stepId, status, output? }`, where status is `success`, `failed` or `suspended` and output is present only on success. |
| `run-end` | `{ status, output? }` — emitted for success and for suspension. |

Every execution of a step inside a block crosses the boundary on its own: a `foreach` iteration and a
`parallel` arm each produce their own `step-start` / `step-end` pair, while the run's records stay
aggregated per entry. Events are how you observe progress; records are how the run remembers.

A failure ends the run without a `run-end`: the failing step's `step-end` reports `failed`, then the
event iterator rejects with the run's error — and `result` rejects with the same error, from the same
execution. A suspension is not a failure: its `step-end` reports `suspended`, `run-end` reports the
same, and the continuation after a resume reports through the resume's promise rather than
continuing the original event stream. Leaving the event loop early stops delivery, not the run.

**Traces survive a suspension.** `createRun` takes an optional `traceId` and `parentSpanId`, so a run
can continue a trace opened elsewhere — an incoming request, a parent run. The trace id travels in
the snapshot, and the resumed segment opens a new run span under that same trace, so a suspension
does not split the observation tree in two. An empty `traceId` means "no trace" and voids the pair;
an empty `parentSpanId` only drops the parent link.

## Validation at every boundary

Every boundary a value crosses is validated against its Standard Schema, and there is no switch to
turn that off:

1. the start input, before anything runs — a failure throws without starting;
2. every step boundary — the value handed to the next step's `execute`;
3. resume data, against the suspended step's `resumeSchema`.

The schema's parsed value **replaces** the raw one, so defaults and transforms apply before your code
sees anything. A failure at a step boundary fails that step, and the step's failure ends the run.

## Retries

`retries` belongs to the step and counts **extra** attempts: a step with `retries: 2` runs at most
three times. Attempts are spaced by a fixed one-second interval, and the wait is interruptible by the
run's `signal`. Only `execute` is retried — the boundary check happens once, so a schema failure is
never retried — and if the last attempt fails, its error is thrown as it is.

## Suspend and resume

A run can stop mid-walk and continue later. A step calls `ctx.suspend(payload)`; the run unwinds
with a JSON snapshot, and a `resume` re-enters from the recorded position — replaying the entries
before it from their records rather than re-executing them. Suspension is a control signal, not a
failure: the step does not retry, no failed record is written, and `resumeData` is validated against
the step's `resumeSchema` at the third fixed validation boundary. Suspending works at the top level
and from inside every block — a `parallel` arm, a `branch` arm, a `foreach` body, a loop body.

[Suspend & resume](/docs/concepts/suspend-resume/) is that mechanism's own page: the snapshot's
fields, where snapshots are written, what a resume replays inside a block, and the approval gate
that suspends an agent run the same way.

## Why the engine is shaped this way

The builder compiles to a flat list of entries, and execution is a `for` loop over that list. There is
no DAG, no scheduler and no engine object: the shapes workflows actually take — a sequence, a fan-out,
a choice, a loop — are all entries, and a definition that is data is easy to freeze, snapshot and
explain. Everything durable rests on the smallest set that makes waiting for a human possible: a
suspend signal, a JSON snapshot, and a store you can swap.

That is also why some things you might look for are not there. A step has no state blackboard —
records plus explicit piping cover the same ground. There is no nested workflow, no `bail` shortcut,
no switch to turn validation off, no chunk-level passthrough from an agent inside a step, and no
time-travel or restart-all APIs: a resume from the recorded position is the primitive, and anything
else is built on top of it.

## Next steps

- [Agents](/docs/concepts/agents/) — the loops a step can wrap, and the run options they take.
- [Suspend & resume](/docs/concepts/suspend-resume/) — the snapshot-and-resume machine in full.
- [Tools](/docs/concepts/tools/) — what a tool call hands back to a workflow step.
- [Concepts overview](/docs/get-started/concepts-overview/) — how the pieces fit together.
