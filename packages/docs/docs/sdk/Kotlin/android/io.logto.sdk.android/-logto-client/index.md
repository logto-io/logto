# LogtoClient


open class [LogtoClient](index.md)(val logtoConfig: [LogtoConfig](../../io.logto.sdk.android.type/-logto-config/index.md), application: [Application](https://developer.android.com/reference/kotlin/android/app/Application.html))

## Constructors

| | |
|---|---|
| [LogtoClient](-logto-client-constructor) | fun [LogtoClient](-logto-client-constructor)(logtoConfig: [LogtoConfig](../../io.logto.sdk.android.type/-logto-config/index.md), application: [Application](https://developer.android.com/reference/kotlin/android/app/Application.html)) |

## Functions

| Name | Summary |
|---|---|
| [fetchUserInfo](fetch-user-info.md) | fun [fetchUserInfo](fetch-user-info.md)(completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md), UserInfoResponse&gt;) |
| [getAccessToken](get-access-token-constructor) | fun [getAccessToken](get-access-token-constructor)(completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md), [AccessToken](../../io.logto.sdk.android.type/-access-token/index.md)&gt;)<br/>fun [getAccessToken](get-access-token-constructor)(resource: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)?, completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md), [AccessToken](../../io.logto.sdk.android.type/-access-token/index.md)&gt;) |
| [getIdTokenClaims](get-id-token-claims.md) | fun [getIdTokenClaims](get-id-token-claims.md)(completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md), IdTokenClaims&gt;) |
| [signInWithBrowser](sign-in-with-browser.md) | fun [signInWithBrowser](sign-in-with-browser.md)(context: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), redirectUri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), completion: [EmptyCompletion](../../io.logto.sdk.android.completion/-empty-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md)&gt;) |
| [signOut](sign-out.md) | fun [signOut](sign-out.md)(completion: [EmptyCompletion](../../io.logto.sdk.android.completion/-empty-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md)&gt;? = null) |

## Properties

| Name | Summary |
|---|---|
| [isAuthenticated](is-authenticated.md) | val [isAuthenticated](is-authenticated.md): [Boolean](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean/index.html) |
| [logtoConfig](logto-config.md) | val [logtoConfig](logto-config.md): [LogtoConfig](../../io.logto.sdk.android.type/-logto-config/index.md) |
