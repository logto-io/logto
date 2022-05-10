# TokenUtils


object TokenUtils

## Functions

| 名称 | 概要 |
|---|---|
| [decodeIdToken](decode-id-token.md) | fun [decodeIdToken](decode-id-token.md)(token: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)): [IdTokenClaims](../../io.logto.sdk.core.type/-id-token-claims/index.md)<br/>在不进行校验的前提下解码 ID 令牌 |
| [verifyIdToken](verify-id-token.md) | fun [verifyIdToken](verify-id-token.md)(idToken: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), clientId: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), issuer: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), jwks: JsonWebKeySet)<br/>校验 ID 令牌 |
