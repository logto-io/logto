# WebSocialSession


class [WebSocialSession](index.md)(val context: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), val redirectTo: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), val callbackUri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), val completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[SocialException](../../io.logto.sdk.android.auth.social/-social-exception/index.md), [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)&gt;) : [SocialSession](../../io.logto.sdk.android.auth.social/-social-session/index.md)

## Constructors

| | |
|---|---|
| [WebSocialSession](-web-social-session-constructor) | fun [WebSocialSession](-web-social-session-constructor)(context: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), redirectTo: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), callbackUri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), completion: [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[SocialException](../../io.logto.sdk.android.auth.social/-social-exception/index.md), [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)&gt;) |

## Functions

| Name | Summary |
|---|---|
| [handleResult](handle-result.md) | fun [handleResult](handle-result.md)(data: [Uri](https://developer.android.com/reference/kotlin/android/net/Uri.html)) |
| [start](start.md) | open override fun [start](start.md)() |

## Properties

| Name | Summary |
|---|---|
| [callbackUri](callback-uri.md) | open override val [callbackUri](callback-uri.md): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html) |
| [completion](completion.md) | open override val [completion](completion.md): [Completion](../../io.logto.sdk.android.completion/-completion/index.md)&lt;[SocialException](../../io.logto.sdk.android.auth.social/-social-exception/index.md), [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)&gt; |
| [context](context.md) | open override val [context](context.md): [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html) |
| [redirectTo](redirect-to.md) | open override val [redirectTo](redirect-to.md): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html) |
