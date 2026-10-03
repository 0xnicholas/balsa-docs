---
title: 'Walkthrough: minimal-agent'
description: A guided read of the smallest Oribos example — one agent, one tool, one streamed run, and the trace it prints on the way.
packages:
  - '@oribos/core'
  - '@oribos/core/observability'
subtype: walkthrough
order: 2
source:
  - file: examples/minimal-agent/README.md
  - file: examples/minimal-agent/src/index.ts
---

`minimal-agent` is the shortest complete Oribos program — one agent, one tool and one streamed run,
with the run's own trace printed to the terminal as it happens. The whole example is a single file,
[`src/index.ts`](https://github.com/0xnicholas/oribos-framework/blob/81483bdcacc9bbcbf8b8c2a037d916e96d4c8bd6/examples/minimal-agent/src/index.ts),
and it needs no service beyond the model: the tool returns a fixed answer on purpose.

[Quickstart](/docs/get-started/quickstart/) runs it, command and all. This page reads the file as a
program: what each part is for, what happens between the run and the terminal, and what to keep when
you write your own.

## The file at a glance

In file order:

- **The imports** — `createApp` from `@oribos/core`, the tracer from `@oribos/core/observability`,
  `createTool` from `@oribos/core/tools`, and the model from an AI SDK provider package.
- **The environment check** — without `OPENAI_API_KEY`, the example prints one line and exits
  before anything else runs.
- **The `weather` tool** — four fields, one deterministic result.
- **The composition root** — one tracer assembled once, handed to every agent built through it.
- **The [agent](/docs/concepts/agents/)** — `name`, `instructions`, `model` and `tools`.
- **The run** — a single `stream()` call, consumed as it happens, then its terminal values.

## What happens between the run and the terminal

`agent.stream(...)` returns the run's output object immediately, but the run starts at its first
consumption — the first `for await` step, or the first terminal promise you read. Consuming it, the
example sees the run in order:

1. The model receives the instructions as a system message and the question as a user message.
2. Text arrives as `text-delta` chunks, and the example writes each one to standard output as it
   lands.
3. The model asks for the `weather` [tool](/docs/concepts/tools/); the built-in loop executes the
   call, feeds the result back, and calls the model again.
4. The second answer needs no tool, so the run finishes and its terminal values settle.

The console exporter writes a line per span event alongside the text — the agent run, each step, the
tool call — so the run's structure is visible in the same terminal output. Once the loop is over,
the example awaits those terminal values and prints its summary:

<!-- oribos:verbatim file="examples/minimal-agent/src/index.ts" lines="85-89" -->
```ts
console.log(`\n\n[steps] ${steps.length}`);
console.log(`[finishReason] ${finishReason}`);
console.log(
  `[usage] input=${usage.inputTokens ?? '-'} output=${usage.outputTokens ?? '-'} total=${usage.totalTokens ?? '-'}`,
);
```

`steps` holds one record per model call and the tool execution that followed it, so a run that used
one tool reports two steps. The terminal values are promises on the same object that streams the
chunks; `generate()` is that run collapsed to its terminal values — one code path, so the two
consumption styles always agree.

## The built-in loop

The loop is what turns the model's tool request into an answer: it executes the tool, appends the
round trip to the conversation in the provider's own prompt format, and calls the model again —
until a step requests no tool call, or `maxSteps` (default 5) is reached. A failure along the way
never aborts the run: the call comes back to the model as an error result it can recover from.
[Tools](/docs/concepts/tools/) documents the failure semantics, and
[Agents](/docs/concepts/agents/) the loop itself.

`execute` can take a second parameter — the call's context, carrying the cancellation signal, the
run and call identities, and the trace ids. The example ignores it.

## The composition root and the tracer

<!-- oribos:verbatim file="examples/minimal-agent/src/index.ts" lines="45-47" -->
```ts
const app = createApp({
  tracer: createTracer({ exporters: [consoleExporter()] }),
});
```

`createApp` is the optional assembly point: the tracer is built once here and handed to every agent
created through the app — `app.agent({ … })` — with nothing passed per agent. A standalone
`new Agent({ … })` is just as complete: with no tracer wired, there are no span objects at all.

The console exporter pretty-prints every span event as it happens. Its test-time counterpart is the
memory exporter — the same tracer, keeping spans in process so tests can assert on them. Swapping
exporters, or dropping the tracer, needs no change to the agent.

## Next steps

- [Quickstart](/docs/get-started/quickstart/) — the checkout, the run commands, and the same code
  as your first agent.
- [Examples](/docs/guides/examples/) — the other four examples and what each one adds.
- [Agents](/docs/concepts/agents/) — the agent surface and its run loop in full.
- [Tools](/docs/concepts/tools/) — the four fields and the context `execute` receives.
