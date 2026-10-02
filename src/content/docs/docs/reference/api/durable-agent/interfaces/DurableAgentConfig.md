---
generated: true
editUrl: false
next: false
prev: false
title: "DurableAgentConfig"
---

Defined in: .framework/balsats-framework/packages/core/dist/durable-agent/durable-agent.d.ts:33

The `createDurableAgent` config.

## Properties

### agent

> `readonly` **agent**: [`Agent`](/docs/reference/api/agent/classes/agent/)

Defined in: .framework/balsats-framework/packages/core/dist/durable-agent/durable-agent.d.ts:35

The agent whose runs this wrapper gates, snapshots and resumes.

***

### approval?

> `readonly` `optional` **approval?**: [`ApprovalConfig`](/docs/reference/api/durable-agent/interfaces/approvalconfig/)

Defined in: .framework/balsats-framework/packages/core/dist/durable-agent/durable-agent.d.ts:42

The approval gate; absent = no call ever suspends (the wrapper is a pass-through).

***

### storage?

> `readonly` `optional` **storage?**: [`AgentRunSnapshotStore`](/docs/reference/api/durable-agent/interfaces/agentrunsnapshotstore/)

Defined in: .framework/balsats-framework/packages/core/dist/durable-agent/durable-agent.d.ts:40

Where a suspended run's snapshot goes. Absent = the core's in-memory default: suspend/resume
still works, the snapshot simply does not outlive the process.
