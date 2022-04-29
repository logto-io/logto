# LogtoAuthSession


class [LogtoAuthSession](index.md)(val context: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), val logtoConfig: [LogtoConfig](../../io.logto.sdk.android.type/-logto-config/index.md), val oidcConfig: OidcConfigResponse, val redirectUri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md), CodeTokenResponse&gt;)

## Constructors

| | |
|---|---|
| [LogtoAuthSession](-logto-auth-session-constructor) | fun [LogtoAuthSession](-logto-auth-session-constructor)(context: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), logtoConfig: [LogtoConfig](../../io.logto.sdk.android.type/-logto-config/index.md), oidcConfig: OidcConfigResponse, redirectUri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md), CodeTokenResponse&gt;) |

## Functions

| Name | Summary |
|---|---|
| [handleCallbackUri](handle-callback-uri.md) | fun [handleCallbackUri](handle-callback-uri.md)(callbackUri: [Uri](https://developer.android.com/reference/kotlin/android/net/Uri.html)) |
| [handleUserCancel](handle-user-cancel.md) | fun [handleUserCancel](handle-user-cancel.md)() |
| [start](start.md) | fun [start](start.md)() |

## Properties

| Name | Summary |
|---|---|
| [context](context.md) | val [context](context.md): [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html) |
| [logtoConfig](logto-config.md) | val [logtoConfig](logto-config.md): [LogtoConfig](../../io.logto.sdk.android.type/-logto-config/index.md) |
| [oidcConfig](oidc-config.md) | val [oidcConfig](oidc-config.md): OidcConfigResponse |
| [redirectUri](redirect-uri.md) | val [redirectUri](redirect-uri.md): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html) |
