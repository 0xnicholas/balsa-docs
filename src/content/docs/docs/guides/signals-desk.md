---
title: 'Walkthrough: signals-desk'
description: A guided read of the signals example — one support thread that takes a wake, a message injected into a live run, a queued pair, a typed signal and a scheduled trigger.
packages:
  - '@balsats/core/signals'
  - '@balsats/core/schedules'
subtype: walkthrough
order: 4
source:
  - file: examples/signals-desk/README.md
  - file: examples/signals-desk/src/index.ts
---

`signals-desk` is one support thread that everything lands in. The example drives a small shop's
support desk over a real model and walks the five ways input can reach a conversation: a customer
message that wakes an idle run, a message **injected** into the run while it is still thinking, two
messages queued in arrival order, a typed **system signal**, and a **scheduled trigger** firing into
the same thread.

Like the other examples it is a single file,
[`src/index.ts`](https://github.com/0xnicholas/balsats-framework/blob/f86984d0d775799006db43d0a2a48f197f315f1b/examples/signals-desk/src/index.ts),
with a fixed script and no interactive input. This page reads it as a program:
[Signals and schedules](/docs/concepts/durable-execution/) is the subsystem it walks.

## Four methods, one thread

Every method takes the same target — the conversation and its owner — and none of them requires a
long-running process:

| Method | Live run | Idle thread |
| --- | --- | --- |
| `sendMessage(target, input)` | Injected at the run's next step boundary | Wakes a new run from that input |
| `queueMessage(target, input)` | Held until the live run ends, then delivered | Same, as the input of the next run |
| `sendSignal(target, payload)` | Injected as a typed message | Wakes a new run from it |
| `subscribeToThread(target)` | The chunk stream of every run on the thread | Attach it before the first run — there is no replay |

The identity those calls carry is a thread plus its resource:

<!-- balsats:verbatim file="examples/signals-desk/src/index.ts" lines="65-68" -->
```ts
const THREAD = { id: 'order-4471', title: 'Order 4471 — Lisbon delivery' };
const RESOURCE = 'shop-7';
/** The per-call identity every signal method takes: the thread plus its resource. */
const TARGET = { thread: THREAD, resource: RESOURCE };
```

A thread is the conversation; a resource is who it belongs to. That pair is exactly how
[memory](/docs/concepts/memory/) names a conversation, which is why an injected message is an
ordinary message: signals add no storage of their own.

## What each act shows

1. **An idle thread: `sendMessage` wakes a run.** The subscription is attached *before* the first
   run exists — there is no replay — and every chunk of every run on the thread flows through it,
   the stream a UI would forward. A woken run hands out no output object to await, so the example
   watches it through the subscription and through the run's own span.
2. **A live run: `sendMessage` injects.** The desk pages its supervisor and waits; the script plays
   the supervisor, so the run is *parked mid-tool* when the message arrives. No new run starts: the
   message lands at the loop's next step boundary, at the tail of the run's next model call, and in
   message history as an ordinary message.
3. **`queueMessage` keeps the order.** Two messages sent during that window wait for the live run to
   end, then land as the input of **one** continuation run, in arrival order. A wake per message
   would lose that order.
4. **`sendSignal` injects a typed payload.** Rendered as one `[signal] {…}` user message — the
   receiver's protocol, not the core's — landing in the prompt and in the thread's history, and
   waking the idle thread.
5. **Schedules fire into the same thread.** A stored record names a threaded target plus an injected
   occurrence function; a tick reads what is due, sends the signal, and advances the record.

## The parked window

"Active run" can only be shown while a run really is live, and a script cannot race a fast model for
that window. So the desk's `pageSupervisor` [tool](/docs/concepts/tools/) parks on a promise the
script controls: the script holds the page, sends the message, then answers the page. In a real
deployment the same window is a downstream call's latency — the example just makes it a fact instead
of a race. A page nobody is holding is answered by a standing reply, so a model that pages at an
unexpected moment never wedges the script.

## Watching a thread

A woken run gives you no handle, so the thread's chunk stream is how a script follows it. The
subscription has no replay, which is why it goes up before anything else runs:

<!-- balsats:verbatim file="examples/signals-desk/src/index.ts" lines="239-247" -->
```ts
const traffic = { chunks: 0, textDeltas: 0, toolResults: 0, finishes: 0 };
void (async () => {
  for await (const chunk of signals.subscribeToThread(TARGET)) {
    traffic.chunks += 1;
    if (chunk.type === 'text-delta') traffic.textDeltas += 1;
    if (chunk.type === 'tool-result') traffic.toolResults += 1;
    if (chunk.type === 'finish') traffic.finishes += 1;
  }
})();
```

Waiting is the other half of watching. The example waits on
[spans](/docs/concepts/observability/) rather than timers: a run's span ends when the run does,
carrying the run's terminal text, and the thread is released a few microtasks after that. Every wait
is bounded, so a model that never pages the supervisor fails the act loudly instead of hanging.

What the trace shows, in order of usefulness for a signals setup:

- **One run span per run** — a wake, an injection, a queued continuation and a scheduled trigger
  each end in their own. A woken run has no output object, so its span *is* how a script reads it.
- **One step span per model call, with the exact prompt as its input.** That is where an injected
  message and the rendered `[signal] {…}` are visible, at the tail of the call they land in.
- **One event span of type `signal` per injection**, hung off the live run's span — the same anchor
  the run was already using, no new span type.
- **A scheduled trigger opens no span of its own**: a tick is an in-process primitive, and the run
  it wakes carries its own span.

## Memory is what makes a thread a thread

Signals needs the same memory instance on both sides. The example builds one memory, distributes it
through the app, and the woken runs carry their thread identity as the per-call `memory` option — so
they recall and save history themselves. With no memory, waking starts a history-free run and
injections are not persisted.

One ordering detail is worth knowing before you debug a history: **a message's position is its
arrival order, not the conversation's**. An injection is saved when it is delivered, while a run's
own input messages are saved with the run's first step — so a message injected mid-step appears in
history *before* the input of the run it was injected into. The model's prompt is unaffected: the
injection is appended at the tail of the next call.

## Schedules: a record and a tick

A schedule is a stored record plus an occurrence function you inject — the example passes a plain
`next(from)` function, so cron parsing never enters the core. Firing a threaded record is a
`sendSignal` into that thread:

<!-- balsats:verbatim file="examples/signals-desk/src/index.ts" lines="428-448" -->
```ts
  const record = await schedules.save({
    id: 'morning-sweep',
    next: nextDailyAt(9),
    target: {
      thread: THREAD,
      resource: RESOURCE,
      payload: { type: 'digest', openOrders: 3, note: 'the morning sweep' },
    },
    timezone: 'UTC',
    metadata: { rule: 'daily at 09:00 UTC' },
  });
  if (record.nextFireAt === null) fail('The daily sweep saved without a next occurrence.');
  const DAY_MS = 24 * 60 * 60 * 1000;
  console.log(`  saved        '${record.id}'  nextFireAt=${new Date(record.nextFireAt).toISOString()}  (rule: daily 09:00 UTC)`);

  // A tick before the due instant is a no-op: `listDue` has nothing to hand out.
  await schedules.tick({ now: new Date(record.nextFireAt - 1) });
  if (runSpans().length !== 0) fail('A tick before the due instant fired a target.');
  console.log(`  tick(-1ms)   nothing due — 0 runs`);

  await schedules.tick({ now: new Date(record.nextFireAt) });
```

`tick` is the whole runtime: list what is due, fire it, advance `nextFireAt`. The example calls it
explicitly with a fixed clock, which makes the demo deterministic on any machine; in production the
equivalent is a platform cron hitting a tick endpoint, and the optional
`startTicker({ intervalMs })` is the in-process convenience for setups that prefer a timer.

## Single-process, by design

The registry that maps threads to live runs, the injection buffers and the queues live in the
process, so they do not survive it — and that is a documented position rather than an omission.
Cross-instance signals (a shared transport plus leases) and durable storage behind the memory and
schedule stores are deployment choices: the ports are already there, and the core does not pick a
backend for you.

## Run it

<!-- balsats:adapted file="examples/signals-desk/README.md" -->
```bash
pnpm install
pnpm build
OPENAI_API_KEY=sk-... pnpm --filter @balsats/example-signals-desk start
```

The example is a workspace package, so the filter above is its own command shape. Any
OpenAI-compatible endpoint works the same way — set `OPENAI_BASE_URL` and install the matching
provider package. [Installation](/docs/get-started/installation/) gets you the checkout;
[Examples](/docs/guides/examples/) lists every example and its command.

The script asserts its own payoff: a signal that woke a second run instead of injecting, an injected
message that never reached a model call, queued messages that arrived out of order or in two
continuations, or a tick that fired early — each exits non-zero instead of printing a happy face.

## Next steps

- [Durable execution & background work](/docs/concepts/durable-execution/) — signals and schedules
  in the context of the other two pieces that outlive a request.
- [Memory](/docs/concepts/memory/) — threads, resources and the history an injection lands in.
- [Observability](/docs/concepts/observability/) — the span model the acts wait on.
- [Walkthrough: durable-approval](/docs/guides/durable-approval/) — the other half: a run that stops
  and waits for a human.
