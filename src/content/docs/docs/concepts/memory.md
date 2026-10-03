---
title: Memory
description: How Oribos remembers across runs — the thread and resource identity, the message history that is on by default, and the working memory a model maintains.
packages:
  - '@oribos/core/memory'
  - '@oribos/core/agent'
order: 4
source:
  - file: docs/architecture/memory.md
  - file: docs/adr/0007-memory-semantics.md
  - file: examples/memory-chat/README.md
  - file: examples/memory-chat/src/index.ts
  - file: README.md
---

[An agent](/docs/concepts/agents/) carries no conversation state: the same agent serves one
conversation or ten thousand. Memory is where the state lives — one instance you can share across
agents, and an identity you name on every call that should be remembered.

## A conversation is a thread; a person is a resource

Two identifiers run through the whole subsystem:

- a **thread** is one conversation — a support ticket, a chat window, a planning session;
- a **resource** is who the conversation belongs to — a user, a team, a tenant, whatever your
  application says it is.

Every message and every thread carries both. You name both on the call that should persist, and
neither is defaulted: a run that names no thread does no memory I/O at all, and one that names a
thread without a resource is an error. Nothing is inferred from the agent, so one `Memory` instance
and one agent can serve every conversation in your application.

<!-- oribos:verbatim file="README.md" lines="117-126" -->
```ts
import { Memory, createInMemoryStore } from '@oribos/core/memory';

const memory = new Memory({ storage: createInMemoryStore() });
const agent = new Agent({ name, instructions, model, memory });

// Thread and resource are named per call — the agent itself carries no conversation state,
// so one agent serves every conversation. A missing thread is created on first save.
await agent.generate('Should I bring a rain jacket?', {
  memory: { thread: 'trip-lisbon', resource: 'user-42' },
});
```

A thread reference can be a bare id, or an object that also carries a `title` and `metadata`: they
are applied when the save creates the thread, and update it whenever a later reference provides
them. There is no separate call anywhere — you never create a thread, you just start writing to one.

Two rules keep the identity honest. A thread belongs to exactly one resource: naming an existing
thread with a different resource fails instead of migrating it, and moving a conversation means
deleting and recreating. And memory does **no access control** — it trusts the resource id you hand
it, so checking that the current caller may read that resource is your application's job, to be done
before the query.

## Message history is on by default

Construct a `Memory` and message history is already working: every run that names a thread recalls
that thread's recent messages into the prompt and saves the new ones back.

The mechanics are deliberately plain:

- **Reading**: memory is recalled once per run, before the run's input processors. The window is a
  message count — `lastMessages`, default 10 — not a token budget, so what you inject is predictable.
- **Writing**: messages are saved after every step of the run, the first save carrying the user's
  input. Saves happen after `processOutputStep`, which is what lets a
  [processor](/docs/concepts/agents/) redact or drop content before it is persisted.
- **Querying**: `recall()` is the single entry point for reading history back — the same call the
  run uses. It returns messages oldest first, with their storage envelope (`id`, `threadId`,
  `resourceId`, `createdAt`), ready to feed to a model or to render in your own UI.

<!-- oribos:verbatim file="examples/memory-chat/src/index.ts" lines="153-156" -->
```ts
// recall() is message history's single query entry: the thread's messages in chronological order,
// envelope included, directly feedable to a model. Without a limit the `lastMessages` window
// (default 10) applies; `before` pages towards older history.
const history = await memory.recall({ threadId: threadId(tripThread) });
```

`recall({ threadId })` uses the instance's window; pass `limit` for a bigger or smaller page, and
`before` with a message id to page towards older history. `order: 'desc'` flips the presentation
for a newest-first list, while the default `'asc'` is what a prompt wants.

Messages themselves are immutable. There is no update or delete for a single message — a
conversation is a record, and the way to remove one is to delete the whole thread, which cascades
to its messages and leaves resource-scoped state alone.

All of it goes through a storage port with an in-memory default: naming no store means nothing
leaves the process, and swapping in a persistent adapter changes nothing above that line.

## Working memory is opt-in and resource-scoped

Message history remembers what was said. Working memory remembers *the facts* — a small structured
record that belongs to the resource rather than to any thread, so a user's profile follows them into
the next conversation. It is off until you name a schema:

<!-- oribos:adapted file="docs/architecture/memory.md" -->
```ts
// One schema is the whole contract: it is the shape of the record, the model's update tool
// input, and the validation every update goes through.
const userProfile = z.object({ name: z.string(), homeCity: z.string(), diet: z.string() });

const memory = new Memory({ workingMemory: { schema: userProfile } });
```

Naming it changes three things about memory-enabled runs:

- the framework attaches an `updateWorkingMemory` tool to the run — the model maintains the record
  itself, by tool call, and no other write path exists from the model's side;
- the resource's current record is injected as its own system message, right after the agent's
  instructions, which are left untouched;
- updates are merged and then validated against the schema: objects merge deeply, `null` deletes a
  field, arrays are replaced whole. A patch that does not conform comes back to the model as an
  error tool result, exactly like any other failing tool call.

Your own code can read and write the same record: `getWorkingMemory(resource)` returns what is
stored, and `updateWorkingMemory({ resource, patch })` applies the same merge and validation the
tool uses. Working memory needs a store that can carry resource-scoped records — the in-memory
default can.

## How it attaches to a run

The `memory` field on an agent is a [dynamic argument](/docs/concepts/agents/), so one agent can
even be given a different memory instance per call. The thread and resource are not agent fields at
all — they arrive with the run, as the opening example shows. A standalone
`new Agent({ … })` without a memory field is fully supported and simply never touches the subsystem.

## Why the semantics stay thin

There are exactly two memory mechanisms — message history and working memory — and both are
library-shaped: nothing starts when your process starts, nothing runs between requests, and nothing
is written behind your back. Every write happens inside the request that caused it.

Semantic recall (embeddings, vector search) is not part of the framework. It is a genuinely
different mechanism — a store, an embedder, a retrieval policy — and adding it to the core would
make every user pay for a feature only some need. What the framework does give you is the seam it
belongs on: messages are persisted through a store you can replace, so a retrieval layer can be
built over the same history without forking the memory model. The same reasoning rules out
background compaction: summarizing a conversation between requests is a pipeline with its own
credentials and storage, not a property of a per-call library.

## Next steps

- [Agents](/docs/concepts/agents/) — memory is a field on the agent and an option on the run.
- [Workflows](/docs/concepts/workflows/) — long-running work, and how a step reaches memory.
- [Concepts overview](/docs/get-started/concepts-overview/) — how the pieces fit together.
