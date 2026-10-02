---
generated: true
editUrl: false
next: false
prev: false
title: "ModelInput"
---

> **ModelInput** = [`DynamicArgument`](/docs/reference/api/agent/type-aliases/dynamicargument/)\<[`Model`](/docs/reference/api/model/type-aliases/model/) \| readonly [`Model`](/docs/reference/api/model/type-aliases/model/)[]\>

Defined in: .framework/balsats-framework/packages/core/dist/agent/types.d.ts:107

The `model` field's accepted shapes: a model
instance satisfying the contract, an array of instances forming a fallback chain, or a resolver
that picks either per request context.

A chain is tried in array order on every model call (`agent/loop.ts`): the call moves on to the
next candidate only while the current one has produced no chunk yet. A failure mid-stream
propagates — partial output has already reached the caller, and switching would splice two
models' answers together. When every candidate failed, the run fails with the original error if
there was only one, or with `ModelFallbackError` carrying the whole chain.
