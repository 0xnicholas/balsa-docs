---
generated: true
editUrl: false
next: false
prev: false
title: "SignalPayload"
---

Defined in: .framework/balsa-framework/packages/core/dist/signals/signals.d.ts:50

A signal payload: an open `type` plus whatever fields the sender's protocol carries. Rendered
into the conversation (and message history) as one user text message —
`[signal] ${JSON.stringify(payload)}` — deterministic, and lossless for JSON-serializable values.

## Indexable

> \[`key`: `string`\]: `unknown`

## Properties

### type

> `readonly` **type**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/signals/signals.d.ts:52

What kind of signal this is; an open vocabulary, the receiver's contract.
