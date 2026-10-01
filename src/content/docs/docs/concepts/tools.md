---
title: Tools
description: What a tool is in Balsa — the four fields you write, the context the framework hands your execute, and how a failing call travels back to the model.
packages:
  - '@balsa/core/tools'
  - '@balsa/core/agent'
order: 2
source:
  - file: docs/architecture/tools.md
  - file: docs/adr/0008-tools-mcp-abstraction.md
  - file: README.md
  - file: examples/minimal-agent/src/index.ts
---

A tool is the channel through which a model acts. It is a plain object you write — what the tool
does, the shape of its arguments, and the code that runs when the model calls it. The
[Agents](/docs/concepts/agents/) page covers the loop that calls it and feeds the result back; this
page is the tool itself.

## Four fields, and a name you don't write

| Field | Required | What it is |
| --- | --- | --- |
| `description` | yes | What the tool does, shown to the model — the only thing the model reads when choosing. |
| `inputSchema` | no | A Standard Schema for the arguments; omitted means the tool takes no arguments. |
| `outputSchema` | no | When present, the value `execute` returns is validated against it. |
| `execute` | yes | Runs the tool with the validated input and the call's context. |

There is no `name` field and no id. A tool's name is its key in the `tools` container you hand to an
agent — the same key appears in the tool list sent to the provider and in every trace or tool result
you read back. Nothing can be silently duplicated either: an object literal with the same key twice
is a TypeScript error, not a runtime surprise.

<!-- balsa:verbatim file="examples/minimal-agent/src/index.ts" lines="28-38" -->
```ts
// A tool is a four-field plain object — description, optional inputSchema / outputSchema,
// execute — and its name is this Record key. The schemas are Standard Schema dual interfaces
// (zod@4 speaks them): the framework validates the model's arguments with them and sends the
// JSON Schema to the provider.
const weather = createTool({
  description: 'Looks up the current weather for a city.',
  inputSchema: z.object({ city: z.string() }),
  outputSchema: z.object({ city: z.string(), celsius: z.number() }),
  // A deterministic stand-in so the example runs without any extra service.
  execute: ({ city }) => ({ city, celsius: 18 }),
});
```

`createTool(config)` is a factory for typing: it returns a frozen plain object whose `execute`
input and output types are derived from the schemas, so `weather` above needs no annotation. A
hand-written object literal is equally valid — nothing is lost except that inference, and the
factory is not required.

## Schemas: Standard Schema in, JSON Schema out

Both schemas are Standard Schema interfaces (the dual interface that also exposes JSON Schema), so
`zod` v4 works as-is and no adapter is involved. The same schema does two jobs: the framework
validates the model's arguments with it before `execute` runs, and it derives the JSON Schema that
goes to the provider — targeting draft-07, the version the [model contract](/docs/concepts/models/)
speaks. A converter's output is passed through untouched; the core never rewrites a schema.

A tool without `inputSchema` is an argument-less tool. The provider receives an empty object
schema for it and your `execute` receives `undefined` as its input — the absence of a schema is
what marks it, so there is no separate flag.

## The context your `execute` receives

`execute(input, ctx)` keeps the two sources apart on purpose: `input` is what the model produced
(already validated, and replaced by the schema's parsed value when it transforms), and `ctx` is
what the framework knows about this call. A workflow step receives its inputs in one bag; a tool
call does not, because model-generated arguments and framework facts are not the same kind of thing.

<!-- balsa:adapted file="docs/architecture/tools.md" -->
```ts
interface ToolContext {
  signal: AbortSignal;             // cancellation, propagated from the run down to the tool
  runId: string;                   // identity of the run this call belongs to
  toolCallId: string;              // the provider's call id — the idempotency key
  requestContext: RequestContext;  // your per-call bag (the framework adds signal / runId)
  traceId: string;                 // '' without a tracer, or when the trace is not sampled
  spanId: string;                  // '' under the same rule
}
```

Inside the agent loop the framework guarantees all six. Two of them carry the conventions worth
knowing:

- `toolCallId` is the provider's real id for the call. It is yours to use as an idempotency key, so
  a tool that charges a card, sends a mail or writes a row can tell one attempt from another.
- `traceId` and `spanId` are for composition: when you wrap one agent as a tool of another, passing
  them along makes the delegate's spans hang under the calling tool's span. Without a tracer, both
  are empty strings rather than absent.

What the context deliberately does **not** carry is a permission model or a reference to the agent
that called you. Cancellation is `signal`; a tool call that must wait for a human is the durable
wrapper's concern; and authorization is your application's business — a tool reaches the database,
the file system or nothing at all through a closure you wrote or through `requestContext`. Memory
is reached the same way: by your code, not by an injected handle.

## Dynamic tool sets belong to the container

A tool's own fields are fixed when you write it. Per-request variation — a different set of tools
for a paid plan, a tenant with an extra capability — happens one level up, on the agent's `tools`
field, which is a [dynamic argument](/docs/concepts/agents/): return the whole record from a
function and the run resolves it again on every call.

<!-- balsa:adapted file="docs/architecture/tools.md" -->
```ts
// The tool is defined once; the set of tools is what varies per call.
const agent = new Agent({
  name: 'assistant',
  instructions: 'You are concise.',
  model,
  tools: (ctx) => (ctx.plan === 'pro' ? proTools : freeTools),
});
```

## Failures come back to the model

A tool call can fail in four ways, and the framework treats all four the same way: the failure
becomes an error tool result fed back to the model, and the run keeps going.

| Failure | What happens |
| --- | --- |
| The model's arguments do not pass `inputSchema` — `execute` never runs. | An error result with the validation issues. |
| `execute` throws. | An error result carrying the error. |
| The returned value does not pass `outputSchema`. | An error result — the same strictness the model contract applies to structured output. |
| The model calls a name the container does not have. | An error result: there is no `execute` to run. |

The model sees the failure the way it sees a successful result — on the same tool-result channel —
and decides what to do: fix its arguments, try another tool, or answer without one. `maxSteps`,
the run's cap on model calls, is what ends an unproductive loop; a
[processor](/docs/concepts/agents/) is where you put a hard stop when recovering is not acceptable.

One consequence is worth stating plainly: an `outputSchema` failure happens **after** your side
effect has already run. The framework cannot undo it; `toolCallId` is what makes the retry
distinguishable, and idempotent design is the tool's job.

Validation is the framework's job at the call sites it owns, such as the agent loop. When you call
`execute` yourself — from a script, or from a [workflow step](/docs/concepts/workflows/) — the
validation and the context are yours to supply.

## Composition: a tool can be an agent

Delegation needs no new concept. Wrap one agent in a tool whose `execute` calls it and hang that
tool on another agent's `tools` record: the call is then an ordinary tool call, and the parent run's
context reaches the delegate only if your wrapper passes it. The
[Agents](/docs/concepts/agents/) page shows the wrapper, including how `traceId` and `spanId` keep
the delegate's spans in the same trace.

## MCP is a capability package, not a core concept

The core has no MCP concepts and no MCP dependency: the tool surface above is the whole of it.
Serving your tools over MCP, and turning another MCP server's tools into Balsa tools, are planned
as separate capability packages — they are not part of the core and not available yet.

## Next steps

- [Agents](/docs/concepts/agents/) — the loop that calls tools, and how their results rejoin the model.
- [Workflows](/docs/concepts/workflows/) — steps, which call tools like any other code.
- [Quickstart](/docs/get-started/quickstart/) — a tool in a running agent.
