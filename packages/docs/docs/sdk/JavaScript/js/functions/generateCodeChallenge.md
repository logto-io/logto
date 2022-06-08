**generateCodeChallenge**(`codeVerifier`): `Promise`<`string`\>

Calculates the S256 PKCE code challenge for an arbitrary code verifier and encodes it in url safe base64

**`link`** [Client Creates the Code Challenge](https://datatracker.ietf.org/doc/html/rfc7636#section-4.2)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `codeVerifier` | `string` | Code verifier to calculate the S256 code challenge for |

#### Returns

`Promise`<`string`\>

#### Defined in

[packages/js/src/utils/generators.ts:29](https://github.com/logto-io/js/blob/5254dee/packages/js/src/utils/generators.ts#L29)
