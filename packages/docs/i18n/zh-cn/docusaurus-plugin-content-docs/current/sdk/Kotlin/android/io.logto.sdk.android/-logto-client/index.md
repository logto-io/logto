# LogtoClient


open class LogtoClient(val logtoConfig: [LogtoConfig](../../io.logto.sdk.android.type/-logto-config/index.md), application: [Application](https://developer.android.com/reference/kotlin/android/app/Application.html))

## Constructors

| 名称 | 概要 |
|---|---|
| LogtoClient | fun LogtoClient(logtoConfig: [LogtoConfig](../../io.logto.sdk.android.type/-logto-config/index.md), application: [Application](https://developer.android.com/reference/kotlin/android/app/Application.html)) |

## Functions

| 名称 | 概要 |
|---|---|
| [fetchUserInfo](fetch-user-info.md) | fun [fetchUserInfo](fetch-user-info.md)(completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md), UserInfoResponse&gt;)<br/>获取用户信息 |
| [getAccessToken](get-access-token-constructor) | fun [getAccessToken](get-access-token-constructor)(completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md), [AccessToken](../../io.logto.sdk.android.type/-access-token/index.md)&gt;)<br/>fun [getAccessToken](get-access-token-constructor)(resource: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)?, completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md), [AccessToken](../../io.logto.sdk.android.type/-access-token/index.md)&gt;)<br/>获取访问令牌 |
| [getIdTokenClaims](get-id-token-claims.md) | fun [getIdTokenClaims](get-id-token-claims.md)(completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md), IdTokenClaims&gt;)<br/>获取 ID 令牌中所包含的信息 |
| [signIn](sign-in.md) | fun [signIn](sign-in.md)(context: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), redirectUri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), completion: [EmptyCompletion](../../io.logto.sdk.android.completion/-empty-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md)&gt;)<br/>登录 |
| [signOut](sign-out.md) | fun [signOut](sign-out.md)(completion: [EmptyCompletion](../../io.logto.sdk.android.completion/-empty-completion/index.md)&lt;[LogtoException](../../io.logto.sdk.android.exception/-logto-exception/index.md)&gt;? = null)<br/>登出 |

## Properties

| 名称 | 概要 |
|---|---|
| [isAuthenticated](is-authenticated.md) | val [isAuthenticated](is-authenticated.md): [Boolean](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean/index.html)<br/>用户是否已认证 |
| [logtoConfig](logto-config.md) | val [logtoConfig](logto-config.md): [LogtoConfig](../../io.logto.sdk.android.type/-logto-config/index.md)<br/>Logto 客户端配置 |
