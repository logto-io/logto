# decodeIdToken


fun decodeIdToken(token: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)): [IdTokenClaims](../../io.logto.sdk.core.type/-id-token-claims/index.md)

在不进行校验的前提下解码 ID 令牌

#### Return

[IdTokenClaims](../../io.logto.sdk.core.type/-id-token-claims/index.md)

## Parameters


| 参数名 | 说明 |
|---|---|
| token | 需要进行解码的字符串形式表示的 ID 令牌 |

## Throws

| 异常 |
|---|
| org.jose4j.jwt.consumer.InvalidJwtException |
