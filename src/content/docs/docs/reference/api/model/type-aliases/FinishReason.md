---
generated: true
editUrl: false
next: false
prev: false
title: "FinishReason"
---

> **FinishReason** = `"stop"` \| `"length"` \| `"tool-calls"` \| `"error"` \| `"suspended"`

Defined in: .framework/oribos-framework/packages/core/dist/model/chunks.d.ts:17

Why a model step finished.

`'tool-calls'` is also the terminal reason when the agent loop hits its step cap while the model
still asks for tools; `'suspended'` is produced only by the step-boundary seam's suspend
decision (`AgentRunOptions.stepBoundary` — the durable approval gate's mechanism) — a bare
agent run never ends with it.
