## Hierarchy

- `Error`

  ↳ **`LogtoError`**

## Table of contents

### Constructors

- [constructor](LogtoError.md#constructor)

### Properties

- [code](LogtoError.md#code)
- [data](LogtoError.md#data)
- [message](LogtoError.md#message)
- [name](LogtoError.md#name)
- [stack](LogtoError.md#stack)
- [prepareStackTrace](LogtoError.md#preparestacktrace)
- [stackTraceLimit](LogtoError.md#stacktracelimit)

### Methods

- [captureStackTrace](LogtoError.md#capturestacktrace)

## Constructors

### constructor

**new LogtoError**(`code`, `data?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `code` | [`LogtoErrorCode`](../types/LogtoErrorCode.md) |
| `data?` | `unknown` |

#### Overrides

Error.constructor

#### Defined in

packages/js/lib/utils/errors.d.ts:22

## Properties

### code

 **code**: [`LogtoErrorCode`](../types/LogtoErrorCode.md)

#### Defined in

packages/js/lib/utils/errors.d.ts:20

___

### data

 **data**: `unknown`

#### Defined in

packages/js/lib/utils/errors.d.ts:21

___

### message

 **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/.pnpm/typescript@4.5.5/node_modules/typescript/lib/lib.es5.d.ts:1023

___

### name

 **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/.pnpm/typescript@4.5.5/node_modules/typescript/lib/lib.es5.d.ts:1022

___

### stack

 `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/.pnpm/typescript@4.5.5/node_modules/typescript/lib/lib.es5.d.ts:1024

___

### prepareStackTrace

 `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

#### Type declaration

(`err`, `stackTraces`): `any`

Optional override for formatting stack traces

**`see`** https://v8.dev/docs/stack-trace-api#customizing-stack-traces

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

#### Inherited from

Error.prepareStackTrace

#### Defined in

node_modules/.pnpm/@types+node@17.0.19/node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

 `Static` **stackTraceLimit**: `number`

#### Inherited from

Error.stackTraceLimit

#### Defined in

node_modules/.pnpm/@types+node@17.0.19/node_modules/@types/node/globals.d.ts:13

## Methods

### captureStackTrace

`Static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

Error.captureStackTrace

#### Defined in

node_modules/.pnpm/@types+node@17.0.19/node_modules/@types/node/globals.d.ts:4
