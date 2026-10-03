---
generated: true
editUrl: false
next: false
prev: false
title: "AppConfig"
---

Defined in: .framework/balsats-framework/packages/core/dist/app.d.ts:49

The `createApp` config — every entry is optional; an app without cross-cutting dependencies is valid.

## Properties

### storage?

> `readonly` `optional` **storage?**: [`AppStorageConfig`](/docs/reference/api/balsats/core/interfaces/appstorageconfig/)

Defined in: .framework/balsats-framework/packages/core/dist/app.d.ts:57

The storage slots, one per port; absent slots fall back to the core's in-memory defaults.

***

### tracer?

> `readonly` `optional` **tracer?**: [`Tracer`](/docs/reference/api/observability/interfaces/tracer/)

Defined in: .framework/balsats-framework/packages/core/dist/app.d.ts:55

The tracer distributed to the agents, workflows and signals facades built through this app
(`App.agent` / `App.workflow` / `App.signals`). Absent = those agents are built exactly as a
standalone `new Agent(...)`: no span object is ever created.
