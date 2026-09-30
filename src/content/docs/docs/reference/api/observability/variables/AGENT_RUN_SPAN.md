---
generated: true
editUrl: false
next: false
prev: false
title: "AGENT_RUN_SPAN"
---

> `const` **AGENT\_RUN\_SPAN**: `"agent-run"` = `"agent-run"`

Defined in: .framework/balsa-framework/packages/core/dist/observability/span.d.ts:9

The framework's span type constants — kebab-case, one vocabulary with the chunk protocol.

`type` is an open string: users name their own spans freely. The framework writes exactly these
seven, each at its documented automatic-instrumentation boundary
(`docs/architecture/observability.md`「自动埋点」).
