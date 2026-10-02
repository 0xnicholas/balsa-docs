---
generated: true
editUrl: false
next: false
prev: false
title: "WorkflowValidationError"
---

Defined in: .framework/balsats-framework/packages/core/dist/workflows/validate.d.ts:13

The engine's IO validation: the fixed boundaries
every run passes — the start input (`inputData` against the workflow's `inputSchema`), every
step's input (the upstream value against that step's `inputSchema`) and a resume's `resumeData`
(against the suspended step's `resumeSchema`). There is no validation switch: always on.

The schema's validated value replaces the raw data everywhere it is used, so schema defaults and
transforms take effect; a rejected boundary fails with `WorkflowValidationError`, carrying the
schema's issues and — for a step boundary or a resume — the step id.

## Extends

- `Error`

## Constructors

### Constructor

> **new WorkflowValidationError**(`message`, `details`): `WorkflowValidationError`

Defined in: .framework/balsats-framework/packages/core/dist/workflows/validate.d.ts:20

#### Parameters

##### message

`string`

##### details

###### issues

readonly [`Issue`](/docs/reference/api/tools/namespaces/standardschemav1/interfaces/issue/)[]

The issues the boundary's schema reported.

###### stepId?

`string`

The step whose input schema rejected the value; `undefined` at the start boundary.

#### Returns

`WorkflowValidationError`

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

> `readonly` **issues**: readonly [`Issue`](/docs/reference/api/tools/namespaces/standardschemav1/interfaces/issue/)[]

Defined in: .framework/balsats-framework/packages/core/dist/workflows/validate.d.ts:19

The issues the boundary's schema reported.

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

### stepId

> `readonly` **stepId**: `string` \| `undefined`

Defined in: .framework/balsats-framework/packages/core/dist/workflows/validate.d.ts:17

The step whose input schema rejected the value; `undefined` at the start boundary.
