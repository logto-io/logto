# decodeIdToken


fun decodeIdToken(token: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)): [IdTokenClaims](../../io.logto.sdk.core.type/-id-token-claims/index.md)

Decode ID token without verification

#### Return

[IdTokenClaims](../../io.logto.sdk.core.type/-id-token-claims/index.md)

## Parameters


| Name | Description |
|---|---|
| token | the row string ID token to be decoded |

## Throws

| Exception |
|---|
| org.jose4j.jwt.consumer.InvalidJwtException |
