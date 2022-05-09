# verifyAndParseCodeFromCallbackUri


fun verifyAndParseCodeFromCallbackUri(callbackUri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), redirectUri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), state: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)

Verify and parse code from callback URI

#### Return

Authorization code

## Parameters


| Name | Description |
|---|---|
| callbackUri | The callback URI to be verified |
| redirectUri | The redirect URI on sign in |
| state | The state on sign in |

## Throws

| Exception |
|---|
| [io.logto.sdk.core.exception.CallbackUriVerificationException](../../io.logto.sdk.core.exception/-callback-uri-verification-exception/index.md) |
