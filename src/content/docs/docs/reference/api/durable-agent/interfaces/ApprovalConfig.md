---
generated: true
editUrl: false
next: false
prev: false
title: "ApprovalConfig"
---

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:28

The approval declaration (`harness.md`「Durable agents」): the tool names whose calls must not run
until a resume approves them. Declared on the wrapper, not on the tool — a call whose name is on
the list suspends the run at the boundary where the model's calls are known and none has run.

## Properties

### tools

> `readonly` **tools**: readonly `string`[]

Defined in: .framework/balsa-framework/packages/core/dist/durable-agent/durable-agent.d.ts:30

Tool names awaiting approval; a call to one of them suspends the run instead of executing.
