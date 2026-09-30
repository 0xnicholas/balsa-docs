---
title: Agents
description: What an agent is in Balsa, and what it owns.
packages:
  - '@balsa/core'
order: 1
source: balsa-framework/docs/architecture/agents.md
---

An agent is a function over messages with a model, a system prompt and an optional tool set.

```ts
const agent = new Agent({
	model: openai('gpt-4.1-mini'),
	system: 'You are a release assistant.',
	tools: { readFile, runTests },
});
```

## What an agent owns

- **The loop.** Model call, tool execution, and the decision to continue or stop.
- **The transcript.** Messages are appended in order; nothing is hidden.
- **Nothing else.** Retries, telemetry and persistence are caller concerns.
