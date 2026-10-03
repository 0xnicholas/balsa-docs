---
generated: true
editUrl: false
next: false
prev: false
title: "createApp"
---

> **createApp**(`config?`): [`App`](/docs/reference/api/oribos/core/interfaces/app/)

Defined in: .framework/oribos-framework/packages/core/dist/app.d.ts:104

Creates the composition root: the optional
thin assembly point that distributes cross-cutting dependencies to the subsystems attached to
it. Distributing does not replace any subsystem's standalone surface — the same objects remain
fully usable via explicit `new` without an app.

## Parameters

### config?

[`AppConfig`](/docs/reference/api/oribos/core/interfaces/appconfig/)

## Returns

[`App`](/docs/reference/api/oribos/core/interfaces/app/)
