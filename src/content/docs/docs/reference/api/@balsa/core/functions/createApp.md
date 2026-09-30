---
generated: true
editUrl: false
next: false
prev: false
title: "createApp"
---

> **createApp**(`config?`): [`App`](/docs/reference/api/balsa/core/interfaces/app/)

Defined in: .framework/balsa-framework/packages/core/dist/app.d.ts:105

Creates the composition root (`docs/architecture/observability.md`「组合根分发」): the optional
thin assembly point that distributes cross-cutting dependencies to the subsystems attached to
it. Distributing does not replace any subsystem's standalone surface — the same objects remain
fully usable via explicit `new` without an app.

## Parameters

### config?

[`AppConfig`](/docs/reference/api/balsa/core/interfaces/appconfig/)

## Returns

[`App`](/docs/reference/api/balsa/core/interfaces/app/)
