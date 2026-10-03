---
generated: true
editUrl: false
next: false
prev: false
title: "ForeachEntry"
---

Defined in: .framework/oribos-framework/packages/core/dist/workflows/entry.d.ts:54

`.foreach(step, { concurrency })`: run the step over the input array; `concurrency` defaults to 1.

## Properties

### concurrency

> `readonly` **concurrency**: `number`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/entry.d.ts:61

Concurrency cap (gate width), resolved at definition time — `1` when the options were omitted;
the builder rejects a cap that is not an integer ≥ 1.

***

### step

> `readonly` **step**: [`Step`](/docs/reference/api/workflows/interfaces/step/)

Defined in: .framework/oribos-framework/packages/core/dist/workflows/entry.d.ts:56

***

### type

> `readonly` **type**: `"foreach"`

Defined in: .framework/oribos-framework/packages/core/dist/workflows/entry.d.ts:55
