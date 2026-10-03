---
generated: true
editUrl: false
next: false
prev: false
title: "ModelSpecificationVersionError"
---

Defined in: .framework/oribos-framework/packages/core/dist/model/resolve.d.ts:20

Thrown when a model implements a different specification version than the core supports.

The message points at the actionable side of the mismatch: either the provider package predates
this framework build (upgrade the provider package or downgrade the framework), or this
framework build predates the provider package (upgrade the framework or downgrade the provider).

## Extends

- [`ModelContractError`](/docs/reference/api/model/classes/modelcontracterror/)

## Constructors

### Constructor

> **new ModelSpecificationVersionError**(`message`, `options?`): `ModelSpecificationVersionError`

Defined in: .framework/oribos-framework/packages/core/dist/model/resolve.d.ts:21

#### Parameters

##### message

`string`

##### options?

`ErrorOptions`

#### Returns

`ModelSpecificationVersionError`

#### Overrides

[`ModelContractError`](/docs/reference/api/model/classes/modelcontracterror/).[`constructor`](/docs/reference/api/model/classes/modelcontracterror/#constructor)

## Properties

### cause?

> `optional` **cause?**: `unknown`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es2022.error.d.ts:24

#### Inherited from

[`ModelContractError`](/docs/reference/api/model/classes/modelcontracterror/).[`cause`](/docs/reference/api/model/classes/modelcontracterror/#cause)

***

### message

> **message**: `string`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1075

#### Inherited from

[`ModelContractError`](/docs/reference/api/model/classes/modelcontracterror/).[`message`](/docs/reference/api/model/classes/modelcontracterror/#message)

***

### name

> **name**: `string`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1074

#### Inherited from

[`ModelContractError`](/docs/reference/api/model/classes/modelcontracterror/).[`name`](/docs/reference/api/model/classes/modelcontracterror/#name)

***

### stack?

> `optional` **stack?**: `string`

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

[`ModelContractError`](/docs/reference/api/model/classes/modelcontracterror/).[`stack`](/docs/reference/api/model/classes/modelcontracterror/#stack)
