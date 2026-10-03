---
generated: true
editUrl: false
next: false
prev: false
title: "SpanAttributes"
---

> **SpanAttributes** = [`AgentRunAttributes`](/docs/reference/api/observability/type-aliases/agentrunattributes/) \| [`AgentStepAttributes`](/docs/reference/api/observability/type-aliases/agentstepattributes/) \| [`ToolCallAttributes`](/docs/reference/api/observability/type-aliases/toolcallattributes/) \| [`WorkflowRunAttributes`](/docs/reference/api/observability/type-aliases/workflowrunattributes/) \| [`MemoryRecallAttributes`](/docs/reference/api/observability/type-aliases/memoryrecallattributes/) \| [`MemorySaveAttributes`](/docs/reference/api/observability/type-aliases/memorysaveattributes/) \| `Record`\<`string`, `unknown`\>

Defined in: .framework/oribos-framework/packages/core/dist/observability/span.d.ts:68

Span attributes, narrowed by type at the type level (zero runtime cost — the OTLP mapping
capability package reads them with type safety). `Record<string, unknown>` keeps the bag open
for user spans and for `workflow-step` (`{}` — its name is the step id).
