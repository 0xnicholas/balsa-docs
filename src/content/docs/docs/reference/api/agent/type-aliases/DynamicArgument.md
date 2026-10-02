---
generated: true
editUrl: false
next: false
prev: false
title: "DynamicArgument"
---

> **DynamicArgument**\<`T`\> = `T` \| ((`ctx`) => `T` \| `Promise`\<`T`\>)

Defined in: .framework/balsats-framework/packages/core/dist/agent/types.d.ts:95

The shape every Agent config field accepts (the definition surface): the value
itself, or a resolver that answers per request context — each run resolves its fields again, so a
per-call context changes behavior without rebuilding the agent.

A `T` that is itself a function cannot be passed as a static value: function values are read as
resolvers. No config field has a function as its static value.

## Type Parameters

### T

`T`
