---
title: Quickstart
description: Build, run and stream a first agent in about five minutes.
packages:
  - '@balsa/core'
order: 2
source: balsa-framework/examples/quickstart
---

This walkthrough builds a single agent with one tool and streams its output.

## 1. Define a tool

```ts title="src/tools.ts"
import { tool } from '@balsa/core';
import { z } from 'zod';

export const readFile = tool({
	description: 'Read a file from the repository',
	input: z.object({ path: z.string() }),
	async run({ path }) {
		return await Bun.file(path).text();
	},
});
```

## 2. Create the agent

```ts title="src/agent.ts"
import { Agent, openai } from '@balsa/core';
import { readFile } from './tools';

export const agent = new Agent({
	model: openai('gpt-4.1-mini'),
	system: 'Answer using the repository contents.',
	tools: { readFile },
});
```

## 3. Run it

```sh
node --experimental-strip-types src/agent.ts
```

The agent calls `readFile`, feeds the result back to the model, and prints the answer.
