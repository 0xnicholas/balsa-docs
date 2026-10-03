---
generated: true
editUrl: false
next: false
prev: false
title: "NoOpSpan"
---

> `const` **NoOpSpan**: [`Span`](/docs/reference/api/observability/interfaces/span/)

Defined in: .framework/balsats-framework/packages/core/dist/observability/span.d.ts:158

The no-op span: what the tracer returns when the sampler rejects a root, and what every
descendant of a rejected root gets — the whole rejected subtree shares this one frozen object,
so instrumentation code never branches on sampling (ADR-0009). All three methods do nothing and
the ids are empty strings, the same "no tracing here" signal the tool context uses.
