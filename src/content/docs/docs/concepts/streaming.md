---
title: Streaming
description: How streamed model output flows through an agent, and what each chunk carries.
packages:
  - '@balsa/core'
order: 3
source: balsa-framework/docs/architecture/streaming.md
---

Every model call in Balsa returns a stream. There is no blocking API to fall back to.

## Consuming a stream

```ts title="src/stream.ts" ins={6-8} "chunk.text"
import { Agent, anthropic } from '@balsa/core';

const agent = new Agent({ model: anthropic('claude-sonnet-4') });
const stream = agent.stream('Summarise the changelog');

for await (const chunk of stream) {
	if (chunk.type === 'text') process.stdout.write(chunk.text);
}
```

## Chunk types

| Type | Payload | Emitted when |
| --- | --- | --- |
| `text` | `text` | The model produces visible output |
| `tool-call` | `name`, `args` | The model requests a tool |
| `tool-result` | `name`, `result` | Your tool returned |
| `done` | `usage` | The run finished |

<Aside type="caution">
	Tool calls arrive before their results. Buffer them if you render incrementally.
</Aside>

## Backpressure

Streams are async iterables, so a slow consumer slows the producer. If you need to detach,
collect into an array or pipe into a queue.
