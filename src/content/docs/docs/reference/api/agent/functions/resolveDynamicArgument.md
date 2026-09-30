---
generated: true
editUrl: false
next: false
prev: false
title: "resolveDynamicArgument"
---

## Call Signature

> **resolveDynamicArgument**\<`T`\>(`argument`, `ctx`): `Promise`\<`T`\>

Defined in: .framework/balsa-framework/packages/core/dist/agent/dynamic.d.ts:18

Resolves one dynamic argument against a request context (`docs/architecture/agent.md`「定义表面」):
a static value comes back unchanged, a resolver receives the context and may answer
asynchronously.

A run resolves `instructions` / `model` / `tools` through this same primitive, so resolution
behaves identically wherever it happens. It is also the seam for readers that live outside a run:
as-tool composition reads an agent's dynamic `description` with it, because a Tool's `description`
is a plain string fixed when the tool is built (`docs/architecture/tools.md`「组合范式」).

A `T` that is itself a function cannot be passed as a static value — the union reads function
values as resolvers. No config field has a function as its static value.

### Type Parameters

#### T

`T`

### Parameters

#### argument

[`DynamicArgument`](/docs/reference/api/agent/type-aliases/dynamicargument/)\<`T`\>

#### ctx

[`RequestContext`](/docs/reference/api/agent/interfaces/requestcontext/)

### Returns

`Promise`\<`T`\>

### Example

```ts
const description = (await resolveDynamicArgument(agent.description, ctx)) ?? agent.name;
```

## Call Signature

> **resolveDynamicArgument**\<`T`\>(`argument`, `ctx`): `Promise`\<`T` \| `undefined`\>

Defined in: .framework/balsa-framework/packages/core/dist/agent/dynamic.d.ts:19

Resolves one dynamic argument against a request context (`docs/architecture/agent.md`「定义表面」):
a static value comes back unchanged, a resolver receives the context and may answer
asynchronously.

A run resolves `instructions` / `model` / `tools` through this same primitive, so resolution
behaves identically wherever it happens. It is also the seam for readers that live outside a run:
as-tool composition reads an agent's dynamic `description` with it, because a Tool's `description`
is a plain string fixed when the tool is built (`docs/architecture/tools.md`「组合范式」).

A `T` that is itself a function cannot be passed as a static value — the union reads function
values as resolvers. No config field has a function as its static value.

### Type Parameters

#### T

`T`

### Parameters

#### argument

[`DynamicArgument`](/docs/reference/api/agent/type-aliases/dynamicargument/)\<`T`\> \| `undefined`

#### ctx

[`RequestContext`](/docs/reference/api/agent/interfaces/requestcontext/)

### Returns

`Promise`\<`T` \| `undefined`\>

### Example

```ts
const description = (await resolveDynamicArgument(agent.description, ctx)) ?? agent.name;
```
