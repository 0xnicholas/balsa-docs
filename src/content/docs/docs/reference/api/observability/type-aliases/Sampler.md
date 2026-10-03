---
generated: true
editUrl: false
next: false
prev: false
title: "Sampler"
---

> **Sampler** = `"always"` \| `"never"` \| \{ `ratio`: `number`; \} \| ((`parent`) => `boolean`)

Defined in: .framework/oribos-framework/packages/core/dist/observability/tracer.d.ts:18

The sampling modes: which roots are traced. Decided once
when a root span is created; every descendant inherits the decision, and a rejected root yields
`NoOpSpan` for the whole subtree.
