---
title: Quickstart
description: Run your first Balsa agent — one tool, one streamed model call — from the framework repository.
packages:
  - '@balsa/core/agent'
  - '@balsa/core/tools'
order: 2
source:
  - file: README.md
  - file: examples/minimal-agent/README.md
  - file: examples/minimal-agent/src/index.ts
---

This page runs the smallest Balsa agent end to end: one tool, one streamed model call, and the
terminal values of that run. It starts from a built checkout — [Installation](/docs/get-started/installation/)
covers getting there.

## Run the example

From the repository root:

<!-- balsa:verbatim file="README.md" lines="265-267" -->
```bash
pnpm install
pnpm build                  # examples consume @balsa/core through its package exports (dist)
OPENAI_API_KEY=sk-... pnpm --filter @balsa/example-minimal-agent start
```

Any OpenAI-compatible endpoint works the same way — the example reads the base URL from the
environment:

<!-- balsa:verbatim file="examples/minimal-agent/README.md" lines="59-60" -->
```bash
OPENAI_API_KEY=ollama OPENAI_BASE_URL=http://localhost:11434/v1 \
  pnpm --filter @balsa/example-minimal-agent start
```

## What the example does

### Import what the run needs

<!-- balsa:verbatim file="examples/minimal-agent/src/index.ts" lines="17-21" -->
```ts
import { openai } from '@ai-sdk/openai';
import { createApp } from '@balsa/core';
import { consoleExporter, createTracer } from '@balsa/core/observability';
import { createTool } from '@balsa/core/tools';
import { z } from 'zod';
```

### Define a tool

<!-- balsa:verbatim file="examples/minimal-agent/src/index.ts" lines="28-38" -->
```ts
// A tool is a four-field plain object — description, optional inputSchema / outputSchema,
// execute — and its name is this Record key. The schemas are Standard Schema dual interfaces
// (zod@4 speaks them): the framework validates the model's arguments with them and sends the
// JSON Schema to the provider.
const weather = createTool({
  description: 'Looks up the current weather for a city.',
  inputSchema: z.object({ city: z.string() }),
  outputSchema: z.object({ city: z.string(), celsius: z.number() }),
  // A deterministic stand-in so the example runs without any extra service.
  execute: ({ city }) => ({ city, celsius: 18 }),
});
```

A tool is a plain object with a description, optional schemas, and `execute`, and its name is its
key in the tools container. The schemas are Standard Schema interfaces: the framework validates the
model's arguments before `execute` runs, and sends the JSON Schema to the provider.

### Create the app and the agent

<!-- balsa:verbatim file="examples/minimal-agent/src/index.ts" lines="45-58" -->
```ts
const app = createApp({
  tracer: createTracer({ exporters: [consoleExporter()] }),
});

const agent = app.agent({
  name: 'assistant',
  instructions:
    'You are concise. Answer in one short sentence. Use the weather tool for weather questions.',
  // Chat Completions is the lowest common denominator: it works against OpenAI and any
  // OpenAI-compatible endpoint (Ollama, LM Studio, gateways). Use `openai('gpt-4o-mini')`
  // for OpenAI's Responses API.
  model: openai.chat('gpt-4o-mini'),
  tools: { weather },
});
```

`createApp` is the optional composition root: the tracer is assembled once here and handed to every
agent built through the app. A standalone `new Agent({ … })` needs no app at all — with no tracer
wired there are no span objects to pay for.

### Stream the run

<!-- balsa:verbatim file="examples/minimal-agent/src/index.ts" lines="60-83" -->
```ts
// One run, two consumption styles on the same object. `for await` yields the core's own chunk
// protocol; the built-in loop turns a `tool-call` into a `tool-result` right after the step's
// `finish` and feeds it back to the model — up to `maxSteps` (default 5). Tool failures (invalid
// input, a throw, invalid output) come back as `isError` results the model can recover from.
const result = agent.stream('What is the weather in Paris right now?');

for await (const chunk of result) {
  if (chunk.type === 'text-delta') {
    process.stdout.write(chunk.textDelta);
  } else if (chunk.type === 'tool-call') {
    console.log(`\n[tool-call] ${chunk.toolName}(${JSON.stringify(chunk.input)})`);
  } else if (chunk.type === 'tool-result') {
    const error = chunk.isError ? ' (error)' : '';
    console.log(`[tool-result] ${chunk.toolName} -> ${JSON.stringify(chunk.output)}${error}`);
  }
}

// `generate()` is this same run collapsed to its terminal values (single code path), e.g.
// `const { text, toolCalls, toolResults, steps, usage } = await agent.generate('…')`.
const [finishReason, usage, steps] = await Promise.all([
  result.finishReason,
  result.usage,
  result.steps,
]);
```

`for await` yields Balsa's own chunk protocol: every `text-delta` as it arrives, and the
`tool-call` / `tool-result` chunks the built-in loop produces. The same object carries the terminal
values — `finishReason`, `usage`, `steps` — so one run has two consumption styles without a second
code path; `agent.generate(input)` is that run collapsed to its terminal values.

## What you should see

The example prints a `[tool-call] …` line and the tool's result from its own loop, while the
console exporter prints a span line per event as the run happens (`agent-run`, then `agent-step`
and `tool-call`). The model's answer streams in as it arrives, followed by a summary of the steps
taken, the finish reason, and token usage.

## Notes

- The example uses `openai.chat(...)` (Chat Completions), which works against OpenAI and any
  OpenAI-compatible endpoint. Use `openai('gpt-4o-mini')` for OpenAI's Responses API.
- The run starts on first consumption, and leaving the `for await` loop early does not cancel it —
  pass a per-call `signal` to cancel.
- `maxSteps` bounds the loop (default 5): when the model still asks for tools at that point, the
  terminal `finishReason` is `'tool-calls'`, which is the truncation signal.

## Next steps

[Concepts overview](/docs/get-started/concepts-overview/) explains how agents, tools, models,
memory, workflows and the rest fit together. The repository's other examples — `memory-chat`,
`workflow-approval`, `durable-approval`, `signals-desk` — take the same code further.
