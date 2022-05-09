# verifyIdToken


fun verifyIdToken(idToken: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), clientId: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), issuer: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), jwks: JsonWebKeySet)

Verify ID token

## Parameters


| Name | Description |
|---|---|
| idToken | The raw string ID token to be verified |
| clientId | The client ID related to this ID token |
| issuer | The ID token issuer |
| jwks | The JSON Web Key Set issued by the Idp |

## Throws

| Exception |
|---|
| org.jose4j.jwt.consumer.InvalidJwtException |
