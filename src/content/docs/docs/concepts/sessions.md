---
title: Sessions
description: Grouping agent runs into a conversation with explicit, caller-owned state.
packages:
  - '@balsa/core'
order: 4
source: balsa-framework/docs/architecture/sessions.md
---

A session is an ordered list of messages plus whatever your application attaches to it.

```ts
const session = createSession();

await agent.run('Add a health endpoint', { session });
await agent.run('Now add a test for it', { session });
```

Balsa never writes a session to disk. Pass one to a run, keep it wherever you like.
