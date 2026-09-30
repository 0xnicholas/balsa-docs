---
generated: true
editUrl: false
next: false
prev: false
title: "RequestContext"
---

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:79

The context of one run, resolved per call (`docs/architecture/agent.md`「定义表面」): the
framework writes `signal` and `runId`, everything else is the user's per-call open bag. A plain
object — no `Map` class, no generic context parameter.

Dynamic argument resolution and tool `ctx.requestContext` both read the same object; the
framework-written fields come last, so a per-call property cannot hijack them.

## Indexable

> \[`key`: `string`\]: `unknown`

User per-call properties, passed through untouched.

## Properties

### runId

> `readonly` **runId**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:83

Identity of this run (generated per run).

***

### signal

> `readonly` **signal**: `AbortSignal`

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:81

Cancellation of this run — the per-call `signal`, or a never-aborting signal when none was passed.
