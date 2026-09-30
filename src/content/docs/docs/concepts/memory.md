---
title: Memory
description: Recalling facts across sessions without a hosted service.
packages:
  - '@balsa/core'
order: 5
source: balsa-framework/docs/architecture/memory.md
---

Memory is a store you provide, queried before a run and written after it.

```ts
const memory = new Memory({ store: new SqliteStore('./memory.db') });

await agent.run('What did we decide about retries?', { memory });
```

<Aside type="note">
	Retrieval happens once per run, before the first model call. There is no background indexer.
</Aside>
