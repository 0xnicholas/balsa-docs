---
title: Agents
description: The Oribos agent in full — the fields you configure, how each run resolves them, the loop that executes tools, and what a run hands back.
packages:
  - '@oribos/core/agent'
  - '@oribos/core/tools'
order: 1
source:
  - file: docs/architecture/agent.md
  - file: README.md
  - file: examples/minimal-agent/README.md
---

An agent is Oribos's execution unit: a name, instructions, a model and a set of tools wrapped into
one object you can `generate()` or `stream()`. It carries no conversation state and no hidden
configuration — the fields you set are its whole surface, and everything a run needs is either on
the agent or passed to the call.

## The fields you configure

| Field | Required | What it is |
| --- | --- | --- |
| `name` | yes | The agent's identity. |
| `instructions` | yes | The system instructions for every run — a plain string. |
| `model` | yes | The model to run: an instance, a fallback chain, or a resolver that picks one per call ([Models](/docs/concepts/models/) covers the shapes). |
| `tools` | no | The tool container; each key is the tool's name. |
| `description` | no | One line about the agent, shown to an upstream model when the agent is composed as a tool. |
| `memory` | no | The memory instance this agent's runs read from and write to, when a run names a thread. |

`tracer` and `processors` are wiring rather than definition: they attach subsystem behavior
(traces, cross-cutting hooks) without adding concepts to the surface.

With a tool in hand, an agent is a handful of fields:

<!-- oribos:verbatim file="README.md" lines="65-78" -->
```ts
const weather = createTool({
  description: 'Looks up the current weather for a city.',
  inputSchema: z.object({ city: z.string() }),
  execute: ({ city }) => ({ city, celsius: 18 }),
});

// The agent surface: name, instructions, model, tools (plus optional memory / processors).
// The model instance comes straight from an AI SDK provider package.
const agent = new Agent({
  name: 'assistant',
  instructions: 'You are concise. Use the weather tool for weather questions.',
  model: openai.chat('gpt-4o-mini'),
  tools: { weather },
});
```

Three imports are in play: `Agent` from `@oribos/core/agent`, `createTool` from
`@oribos/core/tools`, and the model instance from a provider package. The
[Quickstart](/docs/get-started/quickstart/) has the file in full.

At run time, `instructions` becomes the system message and the run's input becomes the user
message. A [tool](/docs/concepts/tools/) is a plain object, and its name is its key in the `tools` record.

## Behavior fields resolve per run

`instructions`, `model`, `tools`, `description` and `memory` are **dynamic arguments**: each takes
a value, or a function that receives the request context and returns the value. The function runs
again for every execution, so one agent serves every tenant, locale or plan without being rebuilt.
The context carries the run's `signal`, `runId`, and whatever per-call properties your application
passes along. `name` is the exception — an ordinary string, fixed when the agent is constructed.

<!-- oribos:adapted file="docs/architecture/agent.md" -->
```ts
const agent = new Agent({
  name: 'assistant',
  // Resolved on every run against the request context — one agent serves every tenant.
  instructions: (ctx) => `You are the assistant for ${ctx.tenantId}.`,
  // The model field takes a value, a resolver, or a fallback array.
  model: (ctx) => (ctx.plan === 'pro' ? proModel : fastModel),
  tools: { weather },
});
```

A function value is always read as a resolver, so none of these fields can hold a function as its
static value.

## Run it: one stream, two ways to read it

`stream()` returns the run's output object, and the object has two consumption styles. `for await`
yields Oribos's own chunk protocol as the run happens; the terminal values are promises on the same
object. `generate()` is the same run collapsed to its terminal values — literally `stream()` plus
awaiting them, one code path, so the two always agree.

<!-- oribos:verbatim file="README.md" lines="80-88" -->
```ts
// One run, two consumption styles on the same object: `for await` streams Oribos's own chunk
// protocol; the terminal values (text, usage, steps, finishReason) are awaited on it.
const result = agent.stream('What is the weather in Paris right now?');

for await (const chunk of result) {
  if (chunk.type === 'text-delta') process.stdout.write(chunk.textDelta);
}

console.log(await result.finishReason, await result.usage);
```

A run starts at its first consumption — the first `for await` step or the first terminal read.
Leaving the loop early does not cancel it; passing a per-call `signal` does.

The terminal values are:

| Value | What it holds |
| --- | --- |
| `text` | The final step's text. Intermediate steps' text is in their step records. |
| `object` | The run's structured output — set only when the run asked for one. |
| `toolCalls` / `toolResults` | Every tool call the model requested over the whole run, and what came back, in step order. |
| `usage` | Token usage summed over the run. |
| `steps` | One record per step: its text, tool calls, tool results and usage. |
| `finishReason` | Why the last step stopped: `'stop'`, `'length'`, `'tool-calls'`, `'error'`, or `'suspended'` when a step boundary suspended the run, as the durable approval gate does. |

## The loop

A **run** is one `generate()` / `stream()` call; a **step** is one model call plus the tool
execution that follows it. The built-in loop ties the steps together:

- The run continues while the model asks for tools, up to `maxSteps` (default 5). When the cap is
  reached while the model still asks for tools, that final step runs in full but its result is not
  fed back, and the terminal `finishReason` is `'tool-calls'` — the truncation signal.
- Tool calls made in the same step run **in order**, one after another, and their results join the
  step in that order. A tool the provider already executed is not executed again.
- A failing tool never aborts the run. A throw, input that fails validation, output that does not
  match the tool's schema — each becomes an error result fed back to the model, which recovers or
  gives up on its own. A processor is where you put a hard stop if you need one.
- Suspension is not part of this loop: a bare agent run never ends suspended. The step-boundary
  check that approval gates use is an extension the durable wrapper turns on; absent it, the loop
  runs untouched.

## Structured output

Passing `structuredOutput: { schema }` turns the run into a structured-output run: the schema goes
to the model as JSON Schema on every call of the run, and the final text is parsed as JSON and
validated against it. The validated value lands in `object`.

<!-- oribos:adapted file="docs/architecture/agent.md" -->
```ts
const { object } = await agent.generate('Summarize this ticket.', {
  structuredOutput: { schema: ticketSummary },
});
```

Validation is strict, and it is the only strategy: an answer that is not JSON, or does not match
the schema, fails the run with `StructuredOutputError`, which keeps the model's raw text and the
validation issues so you can see what it actually said. Without the option there is no
`responseFormat`, the answer is plain text, and `object` is `undefined`.

Any Standard Schema works — `zod` v4 speaks the interface, and the JSON Schema the provider
receives is derived from the same schema.

## What a run takes

Beyond the input itself, these are the options you are most likely to reach for:

| Option | What it does |
| --- | --- |
| `structuredOutput` | Asks for a structured answer (above). |
| `maxSteps` | Caps the model calls of the run; default 5. |
| `modelSettings` | Passthrough bag for the model call — temperature, output-token limit and the like. |
| `providerOptions` | Provider-specific options, forwarded to the model call untouched. |
| `signal` | Cancels the run; propagated to the model call and to every tool. |
| `memory` | Names the thread and resource for memory I/O; both are required, and neither is defaulted. |
| `traceId` / `parentSpanId` | Continue an existing trace instead of starting a new one. |
| `hideInput` / `hideOutput` | Erase the run's input or output from its exported trace events. |

The tracing options only matter when a tracer is attached, and cancelling a run is the `signal`'s
job — leaving a `for await` loop early is not a cancellation.

## Cross-cutting behavior: processors

Guardrails, redaction, rate limiting and evals are not agent fields. They are **processors**, the
one place such behavior belongs: a small object with up to three ordered hooks that can rewrite the
prompt the model sees, the record a step settles on, and the errors at either boundary.
[Processors](/docs/concepts/processors/) is the full story.

## Agents in composition

An agent carries no conversation state. History lives in a [memory](/docs/concepts/memory/) instance handed to the agent,
and each run names the thread and resource it belongs to — so one agent serves every conversation,
and a run that names no thread does no memory I/O at all.

Multi-agent setups need no new concept: wrap one agent into a tool and hang it on another agent's
`tools` record. Delegation is then an ordinary tool call — the core has no supervisor protocol —
and the parent run's context is not passed to the delegate unless the wrapper passes it
explicitly.

`createApp()` is the optional assembly point: it builds an agent (and the other subsystems) with
cross-cutting dependencies — a tracer, storage — wired once, and stays out of the way otherwise. A
standalone `new Agent({ … })` is fully supported and pays for nothing it does not use.

## Next steps

- [Quickstart](/docs/get-started/quickstart/) — build and run this agent end to end.
- [Models](/docs/concepts/models/) — the model field in depth.
- [Processors](/docs/concepts/processors/) — the cross-cutting hooks around every run.
- [Concepts overview](/docs/get-started/concepts-overview/) — how the pieces fit together.
