---
generated: true
editUrl: false
next: false
prev: false
title: "AgentRunAttributes"
---

> **AgentRunAttributes** = `object`

Defined in: .framework/oribos-framework/packages/core/dist/observability/span.d.ts:23

Attributes of an `agent-run` span. The framework writes `runId` on every run root — fresh or
continued trace — so runId (execution identity) and traceId (observation identity) can look
each other up.

## Properties

### agentName

> `readonly` **agentName**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/observability/span.d.ts:24

***

### runId?

> `readonly` `optional` **runId?**: `string`

Defined in: .framework/oribos-framework/packages/core/dist/observability/span.d.ts:25
