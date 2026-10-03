---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowIterationSite"
---

> **WorkflowIterationSite** = \{ `kind`: `"parallel"`; \} \| \{ `kind`: `"branch"`; \} \| \{ `collected`: `Readonly`\<`Record`\<`string`, `unknown`\>\>; `kind`: `"foreach"`; `suspendedIndex`: `number`; \} \| \{ `iterationCount`: `number`; `kind`: `"loop"`; `value`: `unknown`; \}

Defined in: .framework/oribos-framework/packages/core/dist/workflows/snapshot.d.ts:40

Where inside a block a run suspended (#54): the iteration-site facts the flat `position` cannot
express — `position` names the block's entry, the site names the execution inside it. A snapshot
carries it only while `suspended` inside a block; a top-level `then` suspension and every
running / terminal snapshot have none. The records carry the rest of the site: a completed arm /
iteration is a `success` record, a suspending parallel arm a `suspended` record, so the kinds
below carry only what records cannot.

## Union Members

### Type Literal

\{ `kind`: `"parallel"`; \}

***

### Type Literal

\{ `kind`: `"branch"`; \}

***

### Type Literal

\{ `collected`: `Readonly`\<`Record`\<`string`, `unknown`\>\>; `kind`: `"foreach"`; `suspendedIndex`: `number`; \}

#### collected

> `readonly` **collected**: `Readonly`\<`Record`\<`string`, `unknown`\>\>

Outputs already collected, keyed by index as a string (JSON-only, holes absent).

#### kind

> `readonly` **kind**: `"foreach"`

The index of the suspended iteration; the one `resumeData` belongs to.

#### suspendedIndex

> `readonly` **suspendedIndex**: `number`

***

### Type Literal

\{ `iterationCount`: `number`; `kind`: `"loop"`; `value`: `unknown`; \}

#### iterationCount

> `readonly` **iterationCount**: `number`

Iterations completed before the suspended one (the condition's counting basis).

#### kind

> `readonly` **kind**: `"loop"`

#### value

> `readonly` **value**: `unknown`

The value the suspended iteration consumed — a mid-block tip no record holds.
