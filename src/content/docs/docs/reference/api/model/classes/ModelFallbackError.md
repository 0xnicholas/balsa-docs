---
generated: true
editUrl: false
next: false
prev: false
title: "ModelFallbackError"
---

Defined in: .framework/balsa-framework/packages/core/dist/model/fallback.d.ts:34

Thrown when a model call failed on every candidate of the fallback chain, each candidate failing
before it produced any chunk.

The chain's context is preserved twice over: the message names every candidate and its error,
and `failures` carries the original errors in chain order. `cause` is the last attempt's error —
the failure the run ultimately ended with.

## Extends

- `Error`

## Constructors

### Constructor

> **new ModelFallbackError**(`failures`): `ModelFallbackError`

Defined in: .framework/balsa-framework/packages/core/dist/model/fallback.d.ts:37

#### Parameters

##### failures

readonly [`ModelFallbackFailure`](/docs/reference/api/model/interfaces/modelfallbackfailure/)[]

#### Returns

`ModelFallbackError`

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:24

#### Inherited from

`Error.cause`

***

### failures

> `readonly` **failures**: readonly [`ModelFallbackFailure`](/docs/reference/api/model/interfaces/modelfallbackfailure/)[]

Defined in: .framework/balsa-framework/packages/core/dist/model/fallback.d.ts:36

Every failed attempt, in chain order.

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
