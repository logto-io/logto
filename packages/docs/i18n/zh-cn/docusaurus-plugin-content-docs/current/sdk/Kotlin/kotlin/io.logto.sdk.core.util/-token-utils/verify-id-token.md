# verifyIdToken


fun verifyIdToken(idToken: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), clientId: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), issuer: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), jwks: JsonWebKeySet)

校验 ID 令牌

## Parameters


| 参数名 | 说明 |
|---|---|
| idToken | 需要校验的纯字符串表示的 ID 令牌 |
| clientId | 该 ID 令牌相关的客户端 ID |
| issuer | ID 令牌的颁发者 |
| jwks | 身份验证服务提供方提供的 JSON Web Key Set |

## Throws

| 异常 |
|---|
| org.jose4j.jwt.consumer.InvalidJwtException |
