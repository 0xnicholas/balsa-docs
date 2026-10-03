---
generated: true
editUrl: false
next: false
prev: false
title: "assertModel"
---

> **assertModel**(`model`): [`Model`](/docs/reference/api/model/type-aliases/model/)

Defined in: .framework/oribos-framework/packages/core/dist/model/resolve.d.ts:30

Asserts that a value satisfies the model contract and returns it unchanged.

Runs at model resolution time — before any execution — so a wrong provider package surfaces as
an explicit error instead of failing mid-run. Accepts anything (users pass provider objects
whose static type is only known to the provider package) and narrows it to `Model`.

## Parameters

### model

`unknown`

## Returns

[`Model`](/docs/reference/api/model/type-aliases/model/)
