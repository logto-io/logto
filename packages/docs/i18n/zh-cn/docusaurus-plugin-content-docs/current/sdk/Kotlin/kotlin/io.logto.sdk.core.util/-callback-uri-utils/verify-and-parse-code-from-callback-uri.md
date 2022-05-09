# verifyAndParseCodeFromCallbackUri


fun verifyAndParseCodeFromCallbackUri(callbackUri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), redirectUri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), state: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)

校验 Callback URI 并从中提取授权码

#### Return

授权码

## Parameters


| 参数名 | 说明 |
|---|---|
| callbackUri | 需要校验的 Callback URI |
| redirectUri | 登录时使用的重定向 URI |
| state | 登录时使用的 state 参数值 |

## Throws

| 异常 |
|---|
| [io.logto.sdk.core.exception.CallbackUriVerificationException](../../io.logto.sdk.core.exception/-callback-uri-verification-exception/index.md) |
