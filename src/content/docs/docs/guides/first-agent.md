---
title: Your first agent
description: Build a tool-using agent and stream it to the terminal, step by step.
subtype: walkthrough
packages:
  - '@balsa/core'
order: 2
source: balsa-framework/examples/first-agent
---

## What you will build

An agent that reads a file on request and explains it.

```ts title="src/index.ts"
import { Agent, tool, openai } from '@balsa/core';
import { z } from 'zod';

const readFile = tool({
	description: 'Read a file from disk',
	input: z.object({ path: z.string() }),
	async run({ path }) {
		return await Bun.file(path).text();
	},
});

const agent = new Agent({ model: openai('gpt-4.1-mini'), tools: { readFile } });

for await (const chunk of agent.stream('Explain src/index.ts')) {
	if (chunk.type === 'text') process.stdout.write(chunk.text);
}
```

## Where to go next

- [Tools](/docs/concepts/tools/) — schemas, validation and error handling.
- [Streaming](/docs/concepts/streaming/) — chunk types and backpressure.
