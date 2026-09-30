---
generated: true
editUrl: false
next: false
prev: false
title: "StructuredOutputError"
---

Defined in: .framework/balsa-framework/packages/core/dist/agent/structured-output.d.ts:27

Thrown when a run asked for `structuredOutput` and its terminal text did not become the schema's
value — strict, the only validation strategy (`docs/architecture/agent.md`「执行语义」): a model
that ignores the requested shape fails the run instead of silently answering something else.

The run's terminal text is kept unparsed (`text`), so the caller can see what the model actually
answered; `issues` carries the schema's issues when the text was JSON but did not match, and is
`undefined` when the text was not JSON at all (`cause` then holds the parse error).

## Extends

- `Error`

## Constructors

### Constructor

> **new StructuredOutputError**(`message`, `details`): `StructuredOutputError`

Defined in: .framework/balsa-framework/packages/core/dist/agent/structured-output.d.ts:32

#### Parameters

##### message

`string`

##### details

###### cause?

`unknown`

The parse error, when the text was not JSON at all.

###### issues?

readonly [`Issue`](/docs/reference/api/tools/namespaces/standardschemav1/interfaces/issue/)[]

The schema's issues of a text that was JSON but did not match.

###### text

`string`

The run's terminal text the validation rejected.

#### Returns

`StructuredOutputError`

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:24

#### Inherited from

`Error.cause`

***

### issues

> `readonly` **issues**: readonly [`Issue`](/docs/reference/api/tools/namespaces/standardschemav1/interfaces/issue/)[] \| `undefined`

Defined in: .framework/balsa-framework/packages/core/dist/agent/structured-output.d.ts:31

The schema's issues, when the text was valid JSON that did not match; else `undefined`.

***

### message

> **message**: `string`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1075

#### Inherited from

`Error.message`

***

### name

> **name**: `string`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1074

#### Inherited from

`Error.name`

***

### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

`Error.stack`

***

### text

> `readonly` **text**: `string`

Defined in: .framework/balsa-framework/packages/core/dist/agent/structured-output.d.ts:29

The run's terminal text, unparsed — what the model actually answered.
