---
title: Examples
description: The five runnable examples in the Oribos repository — what each one walks through, and where to read its source.
packages:
  - '@oribos/core'
subtype: walkthrough
order: 1
source:
  - file: README.md
---

The Oribos repository ships five runnable examples. Each is a small program — one file with a fixed
script, no interactive input — that drives a real model call and prints what happens along the way.
They are written to be read as much as run: the smallest is the shortest complete Oribos program, and
the others build on it.

[Quickstart](/docs/get-started/quickstart/) has the checkout, build and run commands;
[Installation](/docs/get-started/installation/) gets you the repository in the first place. Every
example is its own workspace package, so one command shape runs any of them — for example
`pnpm --filter @oribos/example-minimal-agent start`.

The source links below point at the exact framework revision this documentation describes, so they
stay valid as the repository moves on.

## minimal-agent

One [agent](/docs/concepts/agents/), one [tool](/docs/concepts/tools/), one streamed run — plus the
run's own trace, printed to the terminal. This is the smallest complete program in the repository,
and the one Quickstart runs. Read the [walkthrough](/docs/guides/minimal-agent/) for a guided tour,
or the [source](https://github.com/0xnicholas/oribos-framework/tree/81483bdcacc9bbcbf8b8c2a037d916e96d4c8bd6/examples/minimal-agent)
directly.

## memory-chat

Two conversations on one resource, interleaved: message history across threads, the `recall()`
query, and working memory that the model maintains through its own tool call.
[Memory](/docs/concepts/memory/) is the subsystem in depth.
[Source](https://github.com/0xnicholas/oribos-framework/tree/81483bdcacc9bbcbf8b8c2a037d916e96d4c8bd6/examples/memory-chat).

## workflow-approval

A [workflow](/docs/concepts/workflows/) with real control flow — `foreach`, `parallel` and
`branch`, with one step that runs an agent — that suspends at an approval gate, writes its JSON
snapshot, and resumes in a fresh run object.
[Source](https://github.com/0xnicholas/oribos-framework/tree/81483bdcacc9bbcbf8b8c2a037d916e96d4c8bd6/examples/workflow-approval).

## durable-approval

The approval gate around an agent: a listed tool call is held at the loop's step boundary instead of
executing, the run lands `finishReason: 'suspended'`, and a `resume` carries the human's decision —
the call executing on approval, answered with a rejection otherwise.
[Agents](/docs/concepts/agents/) covers the loop the gate extends. Read the
[walkthrough](/docs/guides/durable-approval/) for a guided tour, or the
[source](https://github.com/0xnicholas/oribos-framework/tree/81483bdcacc9bbcbf8b8c2a037d916e96d4c8bd6/examples/durable-approval)
directly.

## signals-desk

One support thread that everything lands in: a message that wakes an idle run, a message injected
into a live run at its next step boundary, two messages queued in order, a typed signal, and a
scheduled `tick` firing into the same thread.
[Concepts overview](/docs/get-started/concepts-overview/) maps the pieces. Read the
[walkthrough](/docs/guides/signals-desk/) for a guided tour, or the
[source](https://github.com/0xnicholas/oribos-framework/tree/81483bdcacc9bbcbf8b8c2a037d916e96d4c8bd6/examples/signals-desk)
directly.
