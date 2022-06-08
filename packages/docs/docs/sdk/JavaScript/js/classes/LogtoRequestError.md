## Hierarchy

- `Error`

  ↳ **`LogtoRequestError`**

## Table of contents

### Constructors

- [constructor](LogtoRequestError.md#constructor)

### Properties

- [code](LogtoRequestError.md#code)
- [message](LogtoRequestError.md#message)
- [name](LogtoRequestError.md#name)
- [stack](LogtoRequestError.md#stack)
- [prepareStackTrace](LogtoRequestError.md#preparestacktrace)
- [stackTraceLimit](LogtoRequestError.md#stacktracelimit)

### Methods

- [captureStackTrace](LogtoRequestError.md#capturestacktrace)

## Constructors

### constructor

**new LogtoRequestError**(`code`, `message`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `code` | `string` |
| `message` | `string` |

#### Overrides

Error.constructor

#### Defined in

[packages/js/src/utils/errors.ts:49](https://github.com/logto-io/js/blob/5254dee/packages/js/src/utils/errors.ts#L49)

## Properties

### code

 **code**: `string`

#### Defined in

[packages/js/src/utils/errors.ts:47](https://github.com/logto-io/js/blob/5254dee/packages/js/src/utils/errors.ts#L47)

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
