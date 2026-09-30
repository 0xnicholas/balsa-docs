---
generated: true
editUrl: false
next: false
prev: false
title: "SleepDuration"
---

> **SleepDuration** = [`DynamicArgument`](/docs/reference/api/agent/type-aliases/dynamicargument/)\<`number`\>

Defined in: .framework/balsa-framework/packages/core/dist/workflows/entry.d.ts:35

A sleep duration: milliseconds, or a `DynamicArgument` resolver — the framework's dynamic
argument convention (`CONTEXT.md`「动态参数」), resolved once per sleep entry against the run's
request context so the `signal` reaches it. The tip is not visible to it: a delay consumes and
produces no value.
