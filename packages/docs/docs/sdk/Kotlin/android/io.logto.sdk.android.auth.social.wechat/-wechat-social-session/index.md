# WechatSocialSession


class [WechatSocialSession](index.md)(val context: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), val redirectTo: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), val callbackUri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), val completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[SocialException](../../io.logto.sdk.android.auth.social/-social-exception/index.md), [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)&gt;) : [SocialSession](../../io.logto.sdk.android.auth.social/-social-session/index.md)

## Constructors

| | |
|---|---|
| [WechatSocialSession](-wechat-social-session-constructor) | fun [WechatSocialSession](-wechat-social-session-constructor)(context: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), redirectTo: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), callbackUri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[SocialException](../../io.logto.sdk.android.auth.social/-social-exception/index.md), [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)&gt;) |

## Types

| Name | Summary |
|---|---|
| [Companion](-companion/index.md) | object [Companion](-companion/index.md) |

## Functions

| Name | Summary |
|---|---|
| [handleMissingAppIdError](handle-missing-app-id-error.md) | fun [handleMissingAppIdError](handle-missing-app-id-error.md)() |
| [handleResult](handle-result.md) | fun [handleResult](handle-result.md)(result: BaseResp?) |
| [start](start.md) | open override fun [start](start.md)() |

## Properties

| Name | Summary |
|---|---|
| [callbackUri](callback-uri.md) | open override val [callbackUri](callback-uri.md): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html) |
| [completion](completion.md) | open override val [completion](completion.md): [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[SocialException](../../io.logto.sdk.android.auth.social/-social-exception/index.md), [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)&gt; |
| [context](context.md) | open override val [context](context.md): [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html) |
| [redirectTo](redirect-to.md) | open override val [redirectTo](redirect-to.md): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html) |
