---
generated: true
editUrl: false
next: false
prev: false
title: "ModelSettings"
---

> **ModelSettings** = `Omit`\<[`ModelCallOptions`](/docs/reference/api/model/type-aliases/modelcalloptions/), `"prompt"` \| `"abortSignal"` \| `"providerOptions"` \| `"tools"` \| `"toolChoice"` \| `"responseFormat"`\>

Defined in: .framework/balsa-framework/packages/core/dist/agent/types.d.ts:70

The model-call settings a run may forward: everything the provider spec's call options accept
except the fields the framework owns — `prompt` (built from instructions + input),
`abortSignal` (from the run's `signal`), `providerOptions` (its own run option), and
`tools` / `toolChoice` / `responseFormat` (owned by their features).
