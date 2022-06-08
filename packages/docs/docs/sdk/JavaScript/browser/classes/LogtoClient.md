## Table of contents

### Constructors

- [constructor](LogtoClient.md#constructor)

### Properties

- [\_idToken](LogtoClient.md#_idtoken)
- [accessTokenMap](LogtoClient.md#accesstokenmap)
- [getAccessTokenPromiseMap](LogtoClient.md#getaccesstokenpromisemap)
- [getJwtVerifyGetKey](LogtoClient.md#getjwtverifygetkey)
- [getOidcConfig](LogtoClient.md#getoidcconfig)
- [logtoConfig](LogtoClient.md#logtoconfig)
- [logtoStorageKey](LogtoClient.md#logtostoragekey)
- [requester](LogtoClient.md#requester)

### Accessors

- [idToken](LogtoClient.md#idtoken)
- [isAuthenticated](LogtoClient.md#isauthenticated)
- [refreshToken](LogtoClient.md#refreshtoken)
- [signInSession](LogtoClient.md#signinsession)

### Methods

- [\_getJwtVerifyGetKey](LogtoClient.md#_getjwtverifygetkey)
- [\_getOidcConfig](LogtoClient.md#_getoidcconfig)
- [fetchUserInfo](LogtoClient.md#fetchuserinfo)
- [getAccessToken](LogtoClient.md#getaccesstoken)
- [getAccessTokenByRefreshToken](LogtoClient.md#getaccesstokenbyrefreshtoken)
- [getIdTokenClaims](LogtoClient.md#getidtokenclaims)
- [handleSignInCallback](LogtoClient.md#handlesignincallback)
- [isSignInRedirected](LogtoClient.md#issigninredirected)
- [saveCodeToken](LogtoClient.md#savecodetoken)
- [signIn](LogtoClient.md#signin)
- [signOut](LogtoClient.md#signout)
- [verifyIdToken](LogtoClient.md#verifyidtoken)

## Constructors

### constructor

**new default**(`logtoConfig`, `requester?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `logtoConfig` | [`LogtoConfig`](../types/LogtoConfig.md) |
| `requester` | <T\>(`input`: `RequestInfo`, `init?`: `RequestInit`) => `Promise`<`T`\> |

#### Defined in

[packages/browser/src/index.ts:75](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L75)

## Properties

### \_idToken

 `Private` **\_idToken**: `Nullable`<`string`\>

#### Defined in

[packages/browser/src/index.ts:73](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L73)

___

### accessTokenMap

 `Protected` `Readonly` **accessTokenMap**: `Map`<`string`, [`AccessToken`](../types/AccessToken.md)\>

#### Defined in

[packages/browser/src/index.ts:70](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L70)

___

### getAccessTokenPromiseMap

 `Private` `Readonly` **getAccessTokenPromiseMap**: `Map`<`string`, `Promise`<`string`\>\>

#### Defined in

[packages/browser/src/index.ts:72](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L72)

___

### getJwtVerifyGetKey

 `Protected` `Readonly` **getJwtVerifyGetKey**: () => `Promise`<`GetKeyFunction`<`JWSHeaderParameters`, `FlattenedJWSInput`\>\>

#### Type declaration

(): `Promise`<`GetKeyFunction`<`JWSHeaderParameters`, `FlattenedJWSInput`\>\>

##### Returns

`Promise`<`GetKeyFunction`<`JWSHeaderParameters`, `FlattenedJWSInput`\>\>

#### Defined in

[packages/browser/src/index.ts:65](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L65)

___

### getOidcConfig

 `Protected` `Readonly` **getOidcConfig**: () => `Promise`<`KeysToCamelCase`<`OidcConfigSnakeCaseResponse`\>\>

#### Type declaration

(): `Promise`<`KeysToCamelCase`<`OidcConfigSnakeCaseResponse`\>\>

##### Returns

`Promise`<`KeysToCamelCase`<`OidcConfigSnakeCaseResponse`\>\>

#### Defined in

[packages/browser/src/index.ts:64](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L64)

___

### logtoConfig

 `Protected` `Readonly` **logtoConfig**: [`LogtoConfig`](../types/LogtoConfig.md)

#### Defined in

[packages/browser/src/index.ts:63](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L63)

___

### logtoStorageKey

 `Protected` `Readonly` **logtoStorageKey**: `string`

#### Defined in

[packages/browser/src/index.ts:67](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L67)

___

### requester

 `Protected` `Readonly` **requester**: <T\>(`input`: `RequestInfo`, `init?`: `RequestInit`) => `Promise`<`T`\>

#### Type declaration

<`T`\>(`input`, `init?`): `Promise`<`T`\>

##### Type parameters

| Name |
| :------ |
| `T` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `RequestInfo` |
| `init?` | `RequestInit` |

##### Returns

`Promise`<`T`\>

#### Defined in

[packages/browser/src/index.ts:68](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L68)

## Accessors

### idToken

`get` **idToken**(): `Nullable`<`string`\>

#### Returns

`Nullable`<`string`\>

#### Defined in

[packages/browser/src/index.ts:130](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L130)

`set` **idToken**(`idToken`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `idToken` | `Nullable`<`string`\> |

#### Returns

`void`

#### Defined in

[packages/browser/src/index.ts:134](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L134)

___

### isAuthenticated

`get` **isAuthenticated**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/browser/src/index.ts:82](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L82)

___

### refreshToken

`get` **refreshToken**(): `Nullable`<`string`\>

#### Returns

`Nullable`<`string`\>

#### Defined in

[packages/browser/src/index.ts:114](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L114)

`set` **refreshToken**(`refreshToken`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `refreshToken` | `Nullable`<`string`\> |

#### Returns

`void`

#### Defined in

[packages/browser/src/index.ts:118](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L118)

___

### signInSession

`Protected` `get` **signInSession**(): `Nullable`<{ `codeVerifier`: `string` ; `redirectUri`: `string` ; `state`: `string`  }\>

#### Returns

`Nullable`<{ `codeVerifier`: `string` ; `redirectUri`: `string` ; `state`: `string`  }\>

#### Defined in

[packages/browser/src/index.ts:86](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L86)

`Protected` `set` **signInSession**(`logtoSignInSessionItem`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `logtoSignInSessionItem` | `Nullable`<{ `codeVerifier`: `string` ; `redirectUri`: `string` ; `state`: `string`  }\> |

#### Returns

`void`

#### Defined in

[packages/browser/src/index.ts:103](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L103)

## Methods

### \_getJwtVerifyGetKey

`Private` **_getJwtVerifyGetKey**(): `Promise`<`GetKeyFunction`<`JWSHeaderParameters`, `FlattenedJWSInput`\>\>

#### Returns

`Promise`<`GetKeyFunction`<`JWSHeaderParameters`, `FlattenedJWSInput`\>\>

#### Defined in

[packages/browser/src/index.ts:346](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L346)

___

### \_getOidcConfig

`Private` **_getOidcConfig**(): `Promise`<`KeysToCamelCase`<`OidcConfigSnakeCaseResponse`\>\>

#### Returns

`Promise`<`KeysToCamelCase`<`OidcConfigSnakeCaseResponse`\>\>

#### Defined in

[packages/browser/src/index.ts:339](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L339)

___

### fetchUserInfo

**fetchUserInfo**(): `Promise`<[`UserInfoResponse`](../types/UserInfoResponse.md)\>

#### Returns

`Promise`<[`UserInfoResponse`](../types/UserInfoResponse.md)\>

#### Defined in

[packages/browser/src/index.ts:198](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L198)

___

### getAccessToken

**getAccessToken**(`resource?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `resource?` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/browser/src/index.ts:149](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L149)

___

### getAccessTokenByRefreshToken

`Private` **getAccessTokenByRefreshToken**(`resource?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `resource?` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/browser/src/index.ts:304](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L304)

___

### getIdTokenClaims

**getIdTokenClaims**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `at_hash?` | `string` |
| `aud` | `string` |
| `exp` | `number` |
| `iat` | `number` |
| `iss` | `string` |
| `sub` | `string` |

#### Defined in

[packages/browser/src/index.ts:190](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L190)

___

### handleSignInCallback

**handleSignInCallback**(`callbackUri`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackUri` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/browser/src/index.ts:246](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L246)

___

### isSignInRedirected

**isSignInRedirected**(`url`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |

#### Returns

`boolean`

#### Defined in

[packages/browser/src/index.ts:234](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L234)

___

### saveCodeToken

`Private` **saveCodeToken**(`__namedParameters`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `KeysToCamelCase`<`SnakeCaseCodeTokenResponse`\> |

#### Returns

`void`

#### Defined in

[packages/browser/src/index.ts:364](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L364)

___

### signIn

**signIn**(`redirectUri`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `redirectUri` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/browser/src/index.ts:209](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L209)

___

### signOut

**signOut**(`postLogoutRedirectUri?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `postLogoutRedirectUri?` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/browser/src/index.ts:275](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L275)

___

### verifyIdToken

`Private` **verifyIdToken**(`idToken`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `idToken` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[packages/browser/src/index.ts:352](https://github.com/logto-io/js/blob/5254dee/packages/browser/src/index.ts#L352)
