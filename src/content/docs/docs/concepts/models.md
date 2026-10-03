---
title: Models
description: How Balsats consumes models — provider instances passed straight in, fallback chains, the chunk protocol, and why there is no provider registry.
packages:
  - '@balsats/core/model'
  - '@balsats/core/agent'
order: 3
source:
  - file: docs/architecture/model.md
  - file: docs/adr/0004-model-layer-dual-track.md
  - file: README.md
  - file: examples/minimal-agent/README.md
  - file: examples/minimal-agent/src/index.ts
---

A model in Balsats is an instance, not a string. You install a provider package, build a model
instance with it, and hand that instance to an [agent](/docs/concepts/agents/) — no adapter, no
registration, no `'provider/model'` identifier to resolve.

## Models come from the provider ecosystem

Balsats defines the model contract it consumes — the provider and model identifiers, the interface
version the instance implements, and the two calls a language model must answer, `doGenerate()`
and `doStream()` — and an instance from an AI SDK provider package satisfies it structurally.

<!-- balsats:adapted file="README.md" -->
```ts
import { openai } from '@ai-sdk/openai';
import { Agent } from '@balsats/core/agent';

const agent = new Agent({
  name: 'assistant',
  instructions: 'You are concise.',
  model: openai.chat('gpt-4o-mini'),
});
```

The core has no runtime dependency on the provider package, or on anything else. Anything that
meets the contract is a model here: an instance from a provider package, one from a gateway
package, or an object of your own.

## The three shapes of the model field

The `model` field accepts a single instance, an array of instances, or a function that receives
the request context and returns either:

<!-- balsats:adapted file="docs/architecture/model.md" -->
```ts
type ModelInput =
  | Model
  | Model[]
  | ((ctx: RequestContext) => Model | Model[] | Promise<Model | Model[]>);
```

A single instance is the common case. A function is how a per-tenant, per-plan or per-locale
choice is expressed without rebuilding the agent — the [Agents](/docs/concepts/agents/) page
covers the field surface it belongs to. The array form is a fallback chain.

## Fallback chains

An array is tried in order on every model call of a run. The call moves on to the next candidate
only while the current one has failed without producing a chunk — a refused request, a timeout, a
server error. Once a candidate has produced output, a failure mid-stream propagates: part of the
answer has already reached the caller, and switching models would splice two answers together.

Nothing is swallowed. A single-candidate chain surfaces its failure as itself; when every
candidate failed, the error names each candidate with its own error and carries the individual
failures in chain order, with the last attempt's error as its cause.

The array can come from a resolver, so the chain itself may vary per call.

## The chunk protocol

Every model call is normalized into Balsats's own stream vocabulary — the chunks shared by
`stream()`, processors, workflow snapshots and traces. There are four:

| Chunk | Carries |
| --- | --- |
| `text-delta` | A piece of the answer, as it arrives. |
| `tool-call` | A tool the model asked for, with the call's input already parsed. |
| `tool-result` | What the tool returned, or the error result if it failed. |
| `finish` | Why the step ended, and the step's token usage. |

<!-- balsats:adapted file="examples/minimal-agent/src/index.ts" -->
```ts
for await (const chunk of agent.stream('What is the weather in Paris right now?')) {
  switch (chunk.type) {
    case 'text-delta':
      process.stdout.write(chunk.textDelta);
      break;
    case 'tool-call':
      console.log(`[tool-call] ${chunk.toolName}(${JSON.stringify(chunk.input)})`);
      break;
    case 'tool-result':
      console.log(`[tool-result] ${chunk.toolName} -> ${JSON.stringify(chunk.output)}`);
      break;
    case 'finish':
      console.log(`[finish] ${chunk.finishReason}`);
      break;
  }
}
```

Argument deltas and reasoning deltas are deliberately not part of the protocol. The chunks
describe what the run did, not how a provider chose to encode it, and nothing above the protocol
depends on a particular provider's wire format.

The normalization stays thin and honest about failures. A provider error arrives as a thrown
error, not as a chunk; tool input that does not parse keeps its raw string until the tool
boundary, where it becomes a validation failure fed back to the model like any other.

A step also reports a `finishReason`: `'stop'`, `'length'`, `'tool-calls'`, `'error'`, or
`'suspended'` when a step-boundary check suspended the run. Provider-specific stop reasons are
narrowed onto that list — a content filter, for instance, lands on `'stop'` rather than `'error'`,
because reporting a deliberately refused request as an error invites a retry of the same request.

## One interface version, no compatibility layer

The contract tracks a single version of the provider interface, and it checks it. A model declares
the interface version it implements, and Balsats verifies it when the `model` field is resolved —
at construction for a plain value, at resolution time for a resolver's pick. A mismatch fails with
an error naming both sides, so you know whether to move the provider package or the framework.

When the provider ecosystem moves to a new interface version, Balsats moves with a major release and
speaks that one. There is no adapter for the old version and no compatibility mode: an older
provider package works with the framework major that speaks its interface. Keeping two versions
alive at once would put a translation layer between every run and the provider, and that layer is
the thing this design exists to avoid.

## Why there is no provider registry

There is no registry to configure, no `'provider/model'` grammar, and no string that secretly
resolves to a model. The provider packages **are** the mechanism: installing one is how a provider
enters your project, and passing its instance is how you use it. A gateway that aggregates many
providers is a provider package; a self-hosted model server is a provider package too.

Nothing needs to be registered or kept in sync, and model selection stays in your code: the value
you hold is the model, and the fallback or dynamic behavior is the function you wrote. That is the
same stance the rest of the framework takes — pieces you assemble, not a container you configure.

## OpenAI-compatible endpoints

An endpoint that speaks the OpenAI API is one more provider package: install the OpenAI-compatible
one (`@ai-sdk/openai-compatible`), point it at the base URL, and pass the instance. A local model
server, a self-hosted gateway and a hosted aggregator are the same shape — the URL and the
credentials are the provider package's business, and Balsats sees an ordinary model. The minimal
example switches to a local Ollama with nothing but environment variables:

<!-- balsats:verbatim file="examples/minimal-agent/README.md" lines="59-60" -->
```bash
OPENAI_API_KEY=ollama OPENAI_BASE_URL=http://localhost:11434/v1 \
  pnpm --filter @balsats/example-minimal-agent start
```

## Next steps

- [Agents](/docs/concepts/agents/) — the run loop a model powers.
- [Quickstart](/docs/get-started/quickstart/) — a model instance in a running agent.
- [Concepts overview](/docs/get-started/concepts-overview/) — how the pieces fit together.
