# SocialException


class [SocialException](index.md)(type: [SocialException.Type](-type/index.md)) : [RuntimeException](https://developer.android.com/reference/kotlin/java/lang/RuntimeException.html)

## Constructors

| | |
|---|---|
| [SocialException](-social-exception-constructor) | fun [SocialException](-social-exception-constructor)(type: [SocialException.Type](-type/index.md)) |

## Types

| Name | Summary |
|---|---|
| [Type](-type/index.md) | enum [Type](-type/index.md) : [Enum](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-enum/index.html)&lt;[SocialException.Type](-type/index.md)&gt; |

## Functions

| Name | Summary |
|---|---|
| [addSuppressed](../../io.logto.sdk.android.exception/-logto-exception/index.md#282858770%2FFunctions%2F1239322798) | fun [addSuppressed](../../io.logto.sdk.android.exception/-logto-exception/index.md#282858770%2FFunctions%2F1239322798)(p0: [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html)) |
| [fillInStackTrace](../../io.logto.sdk.android.exception/-logto-exception/index.md#-1102069925%2FFunctions%2F1239322798) | open fun [fillInStackTrace](../../io.logto.sdk.android.exception/-logto-exception/index.md#-1102069925%2FFunctions%2F1239322798)(): [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html) |
| [getLocalizedMessage](../../io.logto.sdk.android.exception/-logto-exception/index.md#1043865560%2FFunctions%2F1239322798) | open fun [getLocalizedMessage](../../io.logto.sdk.android.exception/-logto-exception/index.md#1043865560%2FFunctions%2F1239322798)(): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html) |
| [getStackTrace](../../io.logto.sdk.android.exception/-logto-exception/index.md#2050903719%2FFunctions%2F1239322798) | open fun [getStackTrace](../../io.logto.sdk.android.exception/-logto-exception/index.md#2050903719%2FFunctions%2F1239322798)(): [Array](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/index.html)&lt;[StackTraceElement](https://developer.android.com/reference/kotlin/java/lang/StackTraceElement.html)&gt; |
| [getSuppressed](../../io.logto.sdk.android.exception/-logto-exception/index.md#672492560%2FFunctions%2F1239322798) | fun [getSuppressed](../../io.logto.sdk.android.exception/-logto-exception/index.md#672492560%2FFunctions%2F1239322798)(): [Array](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/index.html)&lt;[Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html)&gt; |
| [initCause](../../io.logto.sdk.android.exception/-logto-exception/index.md#-418225042%2FFunctions%2F1239322798) | open fun [initCause](../../io.logto.sdk.android.exception/-logto-exception/index.md#-418225042%2FFunctions%2F1239322798)(p0: [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html)): [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html) |
| [printStackTrace](../../io.logto.sdk.android.exception/-logto-exception/index.md#-1769529168%2FFunctions%2F1239322798) | open fun [printStackTrace](../../io.logto.sdk.android.exception/-logto-exception/index.md#-1769529168%2FFunctions%2F1239322798)()<br/>open fun [printStackTrace](../../io.logto.sdk.android.exception/-logto-exception/index.md#1841853697%2FFunctions%2F1239322798)(p0: [PrintStream](https://developer.android.com/reference/kotlin/java/io/PrintStream.html))<br/>open fun [printStackTrace](../../io.logto.sdk.android.exception/-logto-exception/index.md#1175535278%2FFunctions%2F1239322798)(p0: [PrintWriter](https://developer.android.com/reference/kotlin/java/io/PrintWriter.html)) |
| [setStackTrace](../../io.logto.sdk.android.exception/-logto-exception/index.md#2135801318%2FFunctions%2F1239322798) | open fun [setStackTrace](../../io.logto.sdk.android.exception/-logto-exception/index.md#2135801318%2FFunctions%2F1239322798)(p0: [Array](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/index.html)&lt;[StackTraceElement](https://developer.android.com/reference/kotlin/java/lang/StackTraceElement.html)&gt;) |

## Properties

| Name | Summary |
|---|---|
| [cause](../../io.logto.sdk.android.exception/-logto-exception/index.md#-654012527%2FProperties%2F1239322798) | open val [cause](../../io.logto.sdk.android.exception/-logto-exception/index.md#-654012527%2FProperties%2F1239322798): [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html)? |
| [code](code.md) | val [code](code.md): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html) |
| [message](../../io.logto.sdk.android.exception/-logto-exception/index.md#1824300659%2FProperties%2F1239322798) | open val [message](../../io.logto.sdk.android.exception/-logto-exception/index.md#1824300659%2FProperties%2F1239322798): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)? |
| [socialCode](social-code.md) | var [socialCode](social-code.md): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)? = null |
| [socialMessage](social-message.md) | var [socialMessage](social-message.md): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)? = null |
