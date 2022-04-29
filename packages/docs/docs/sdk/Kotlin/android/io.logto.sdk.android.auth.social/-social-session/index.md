# SocialSession


interface [SocialSession](index.md)

## Functions

| Name | Summary |
|---|---|
| [start](start.md) | abstract fun [start](start.md)() |

## Properties

| Name | Summary |
|---|---|
| [callbackUri](callback-uri.md) | abstract val [callbackUri](callback-uri.md): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html) |
| [completion](completion.md) | abstract val [completion](completion.md): [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[SocialException](../-social-exception/index.md), [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)&gt; |
| [context](context.md) | abstract val [context](context.md): [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html) |
| [redirectTo](redirect-to.md) | abstract val [redirectTo](redirect-to.md): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html) |

## Inheritors

| Name |
|---|
| [AlipaySocialSession](../../io.logto.sdk.android.auth.social.alipay/-alipay-social-session/index.md) |
| [WebSocialSession](../../io.logto.sdk.android.auth.social.web/-web-social-session/index.md) |
| [WechatSocialSession](../../io.logto.sdk.android.auth.social.wechat/-wechat-social-session/index.md) |
