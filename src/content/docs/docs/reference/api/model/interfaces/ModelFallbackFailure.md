---
generated: true
editUrl: false
next: false
prev: false
title: "ModelFallbackFailure"
---

Defined in: .framework/balsats-framework/packages/core/dist/model/fallback.d.ts:20

One failed model attempt of a fallback chain: which candidate failed, and what it raised.

## Properties

### error

> `readonly` **error**: `unknown`

Defined in: .framework/balsats-framework/packages/core/dist/model/fallback.d.ts:24

The candidate's own error, untouched — its `cause` chain stays intact.

***

### model

> `readonly` **model**: [`Model`](/docs/reference/api/model/type-aliases/model/)

Defined in: .framework/balsats-framework/packages/core/dist/model/fallback.d.ts:22

The candidate that failed; `provider` / `modelId` identify it in the chain error's message.
